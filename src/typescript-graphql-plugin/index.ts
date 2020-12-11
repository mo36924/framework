import { createHash } from "crypto";
import { FSWatcher, promises, unwatchFile, watch, watchFile } from "fs";
import { buildSchema, GraphQLSchema, Source } from "graphql";
import {
  getAutocompleteSuggestions,
  getHoverInformation,
  getTokenAtPosition,
} from "graphql-language-service-interface";
import { resolve } from "path";
import { format, resolveConfig } from "prettier";
import type {
  default as ts,
  GetCompletionsAtPositionOptions,
  LanguageService,
  ScriptKind,
  TaggedTemplateExpression,
} from "typescript/lib/tsserverlibrary";
import { CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver-types";
import { encode } from "./base52";
import { getDiagnostics } from "./getDiagnostics";
import { resolveQueryType } from "./resolveQueryType";
import { resolveSchemaType } from "./resolveSchemaType";
import { validate } from "./validate";

const { readFile, writeFile, appendFile } = promises;

type GraphqlTag = "gql" | "useQuery" | "useMutation";

type GraphqlTagKeys = {
  [tag in "gql" | "useQuery" | "useMutation"]: {
    [key: string]: string;
  };
};

const isGraphqlTag = (tag: string): tag is GraphqlTag => tag === "gql" || tag === "useQuery" || tag === "useMutation";

class PluginModule implements ts.server.PluginModule {
  mod: { typescript: typeof ts };
  ts: typeof ts;
  languageService!: LanguageService;
  proxy!: LanguageService;
  getCurrentDirectory!: () => string;
  schema?: GraphQLSchema;
  declaration: string = "";
  declarationPath: string = "";
  watcher?: FSWatcher;
  constructor(mod: { typescript: typeof ts }) {
    this.mod = mod;
    this.ts = mod.typescript;
  }
  create = (info: ts.server.PluginCreateInfo) => {
    info.project.getScriptInfoForNormalizedPath;
    const languageService = info.languageService;
    const proxy: LanguageService = Object.create(null);
    for (const [key, value] of Object.entries(languageService)) {
      (proxy as any)[key] = value.bind(languageService);
    }
    proxy.getQuickInfoAtPosition = this.getQuickInfoAtPosition;
    proxy.getCompletionsAtPosition = this.getCompletionsAtPosition;
    proxy.getSemanticDiagnostics = this.getSemanticDiagnostics;
    this.languageService = languageService;
    this.proxy = proxy;
    this.getCurrentDirectory = info.project.getCurrentDirectory.bind(info.project);
    this.onConfigurationChanged(info.config);
    return proxy;
  };
  onConfigurationChanged = async (config: { schema?: string }) => {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
    const schemaPath = config.schema;
    if (!schemaPath) {
      this.schema = undefined;
      return;
    }
    const _schemaPath = resolve(this.getCurrentDirectory(), schemaPath);
    let schemaCode = "";
    try {
      schemaCode = await readFile(_schemaPath, "utf8");
      schemaCode += "\nscalar Unknown";
    } catch {
      watchFile(_schemaPath, (stat) => {
        if (!stat.isFile()) {
          return;
        }
        unwatchFile(_schemaPath);
        this.onConfigurationChanged(config);
      });
      return;
    }
    try {
      const schema = buildSchema(new Source(schemaCode, _schemaPath));
      let declaration = resolveSchemaType(schema);
      this.schema = schema;
      const declarationPath = _schemaPath + ".d.ts";
      const config = await resolveConfig(declarationPath);
      declaration = format(declaration, { ...config, filepath: declarationPath });
      this.declaration = declaration;
      this.declarationPath = declarationPath;
      await writeFile(declarationPath, declaration);
      const sourceFiles = this.languageService.getProgram()?.getSourceFiles() || [];
      for (const sourceFile of sourceFiles) {
        this.getSemanticDiagnostics(sourceFile.fileName);
      }
    } catch {}

    this.watcher = watch(_schemaPath, () => {
      this.onConfigurationChanged(config);
    });
  };
  diagnosticCategory = (severity?: number) => {
    const ts = this.ts;
    switch (severity) {
      case DiagnosticSeverity.Error:
        return ts.DiagnosticCategory.Error;
      case DiagnosticSeverity.Warning:
        return ts.DiagnosticCategory.Warning;
      case DiagnosticSeverity.Information:
        return ts.DiagnosticCategory.Message;
      case DiagnosticSeverity.Hint:
        return ts.DiagnosticCategory.Suggestion;
      default:
        return ts.DiagnosticCategory.Error;
    }
  };
  getQuickInfoAtPosition = (fileName: string, position: number) => {
    const { schema, languageService, ts } = this;
    if (!schema) {
      return languageService.getQuickInfoAtPosition(fileName, position);
    }
    const sourceFile = languageService.getProgram()?.getSourceFile(fileName);
    if (!sourceFile) {
      return undefined;
    }
    const node = ts.forEachChild(sourceFile, function visitor(node): true | undefined | TaggedTemplateExpression {
      if (position < node.pos) {
        return true;
      }
      if (position >= node.end) {
        return;
      }

      const result = ts.forEachChild(node, visitor);
      if (result !== true && result !== undefined) {
        return result;
      }
      if (
        ts.isTaggedTemplateExpression(node) &&
        ts.isIdentifier(node.tag) &&
        isGraphqlTag(node.tag.getText()) &&
        position >= node.template.getStart()
      ) {
        return node;
      }
    });

    if (node === true || node === undefined) {
      return languageService.getQuickInfoAtPosition(fileName, position);
    }

    const template = node.template;
    let query = "";

    if (ts.isNoSubstitutionTemplateLiteral(template)) {
      if (position < template.getStart() + 1 || position >= template.getEnd() - 1) {
        return languageService.getQuickInfoAtPosition(fileName, position);
      }
      // 2 ``
      const templateWidth = template.getWidth() - 2;
      query = template.text.padStart(templateWidth);
    } else {
      const head = template.head;
      const templateSpans = template.templateSpans;
      const templates = templateSpans.map((templateSpan) => templateSpan.literal);
      const hoverTemplate = [head, ...templates].some(
        (template) =>
          position >= template.getStart() + 1 && position < template.getEnd() - (ts.isTemplateTail(template) ? 1 : 2)
      );
      if (!hoverTemplate) {
        return languageService.getQuickInfoAtPosition(fileName, position);
      }

      // 3 `...${
      const templateWidth = head.getWidth() - 3;
      query = head.text.padStart(templateWidth);
      for (let i = 0, len = templateSpans.length; i < len; i++) {
        const templateSpan = templateSpans[i];
        const templateSpanWidth = templateSpan.getFullWidth();
        const literal = templateSpan.literal;
        const literalWidth = literal.getWidth();
        const expressionWidth = templateSpanWidth - literalWidth;
        const variableName = `$${encode(i)}`;
        const variable = variableName.padStart(expressionWidth + 2).padEnd(expressionWidth + 3);
        const templateWidth = literalWidth - (ts.isTemplateTail(literal) ? 2 : 3);
        const template = literal.text.padStart(templateWidth);
        query += variable + template;
      }
    }

    const tagName = node.tag.getText();
    let offset = template.getStart() + 1;
    query = query.replace(/\n|\r/g, " ");
    if (tagName === "useQuery") {
      query = `{${query}}`;
      offset -= 1;
    } else if (tagName === "useMutation") {
      query = `mutation{${query}}`;
      offset -= 9;
    }

    const cursor = { line: 0, character: position - offset + 1 };
    const token = getTokenAtPosition(query, cursor);
    const result = getHoverInformation(schema, query, cursor, token);
    if (result === "" || typeof result !== "string") {
      return;
    }
    return {
      kind: ts.ScriptElementKind.string,
      textSpan: {
        start: offset + token.start,
        length: token.end - token.start,
      },
      kindModifiers: "",
      displayParts: [{ text: result, kind: "" }],
    };
  };
  getCompletionsAtPosition = (
    fileName: string,
    position: number,
    options: GetCompletionsAtPositionOptions | undefined
  ) => {
    const { schema, languageService, ts } = this;
    if (!schema) {
      return languageService.getCompletionsAtPosition(fileName, position, options);
    }
    const sourceFile = languageService.getProgram()?.getSourceFile(fileName);
    if (!sourceFile) {
      return undefined;
    }
    const node = ts.forEachChild(sourceFile, function visitor(node): true | undefined | TaggedTemplateExpression {
      if (position < node.pos) {
        return true;
      }
      if (position >= node.end) {
        return;
      }

      const result = ts.forEachChild(node, visitor);
      if (result !== true && result !== undefined) {
        return result;
      }

      if (
        ts.isTaggedTemplateExpression(node) &&
        ts.isIdentifier(node.tag) &&
        isGraphqlTag(node.tag.getText()) &&
        position >= node.template.getStart()
      ) {
        return node;
      }
    });

    if (node === true || node === undefined) {
      return languageService.getCompletionsAtPosition(fileName, position, options);
    }

    const template = node.template;
    let query = "";

    if (ts.isNoSubstitutionTemplateLiteral(template)) {
      if (position < template.getStart() + 1 || position >= template.getEnd() - 1) {
        return languageService.getCompletionsAtPosition(fileName, position, options);
      }
      // 2 ``
      const templateWidth = template.getWidth() - 2;
      query = template.text.padStart(templateWidth);
    } else {
      const head = template.head;
      const templateSpans = template.templateSpans;
      const templates = templateSpans.map((templateSpan) => templateSpan.literal);
      const hoverTemplate = [head, ...templates].some(
        (template) =>
          position >= template.getStart() + 1 && position < template.getEnd() - (ts.isTemplateTail(template) ? 1 : 2)
      );
      if (!hoverTemplate) {
        return languageService.getCompletionsAtPosition(fileName, position, options);
      }

      // 3 `...${
      const templateWidth = head.getWidth() - 3;
      query = head.text.padStart(templateWidth);
      for (let i = 0, len = templateSpans.length; i < len; i++) {
        const templateSpan = templateSpans[i];
        const templateSpanWidth = templateSpan.getFullWidth();
        const literal = templateSpan.literal;
        const literalWidth = literal.getWidth();
        const expressionWidth = templateSpanWidth - literalWidth;
        const variableName = `$${encode(i)}`;
        const variable = variableName.padStart(expressionWidth + 2).padEnd(expressionWidth + 3);
        const templateWidth = literalWidth - (ts.isTemplateTail(literal) ? 2 : 3);
        const template = literal.text.padStart(templateWidth);
        query += variable + template;
      }
    }

    const tagName = node.tag.getText();
    let offset = template.getStart() + 1;
    query = query.replace(/\n|\r/g, " ");
    if (tagName === "useQuery") {
      query = `{${query}}`;
      offset -= 1;
    } else if (tagName === "useMutation") {
      query = `mutation{${query}}`;
      offset -= 9;
    }

    const cursor = { line: 0, character: position - offset };
    const token = getTokenAtPosition(query, cursor);
    const items = getAutocompleteSuggestions(schema, query, cursor, token);
    if (!items.length) {
      return;
    }
    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: items.map((item) => {
        let kind: ts.ScriptElementKind;
        switch (item.kind) {
          case CompletionItemKind.Function:
          case CompletionItemKind.Constructor:
            kind = ts.ScriptElementKind.functionElement;
            break;
          case CompletionItemKind.Field:
          case CompletionItemKind.Variable:
            kind = ts.ScriptElementKind.memberVariableElement;
            break;
          default:
            kind = ts.ScriptElementKind.unknown;
            break;
        }
        return {
          name: item.label,
          kindModifiers: "",
          kind,
          sortText: "",
        };
      }),
    };
  };
  getSemanticDiagnostics = (fileName: string) => {
    const { schema, languageService, ts, diagnosticCategory, updateDeclarationFile } = this;
    const diagnostics = languageService.getSemanticDiagnostics(fileName);
    if (!schema) {
      return diagnostics;
    }
    const sourceFile = languageService.getProgram()?.getSourceFile(fileName);
    if (!sourceFile) {
      return diagnostics;
    }
    const scriptKind: ScriptKind = (sourceFile as any).scriptKind;
    if ((scriptKind !== ts.ScriptKind.TS && scriptKind !== ts.ScriptKind.TSX) || sourceFile.isDeclarationFile) {
      return diagnostics;
    }
    const graphqlTagKeys: GraphqlTagKeys = {
      gql: {},
      useQuery: {},
      useMutation: {},
    };
    ts.forEachChild(sourceFile, function visitor(node) {
      if (ts.isTaggedTemplateExpression(node)) {
        const tagNode = node.tag;
        const tagName = tagNode.getText();
        if (isGraphqlTag(tagName)) {
          const template = node.template;
          const texts: string[] = [];
          let query = "";
          let args = "";
          if (ts.isNoSubstitutionTemplateLiteral(template)) {
            // 2 ``
            const templateWidth = template.getWidth() - 2;
            texts.push(template.text);
            query = template.text.padStart(templateWidth);
          } else {
            const head = template.head;
            const templateSpans = template.templateSpans;

            // 3 `...${
            const templateWidth = head.getWidth() - 3;
            texts.push(head.text);
            query = head.text.padStart(templateWidth);
            for (let i = 0, len = templateSpans.length; i < len; i++) {
              const templateSpan = templateSpans[i];
              const templateSpanWidth = templateSpan.getFullWidth();
              const literal = templateSpan.literal;
              const literalWidth = literal.getWidth();
              const expressionWidth = templateSpanWidth - literalWidth;
              const variableName = `$${encode(i)}`;
              const variable = variableName.padStart(expressionWidth + 2).padEnd(expressionWidth + 3);
              const templateWidth = literalWidth - (ts.isTemplateTail(literal) ? 2 : 3);
              const template = literal.text.padStart(templateWidth);
              texts.push(literal.text);
              query += variable + template;
              args += variableName + ":Unknown";
            }
          }
          let offset = template.getStart() + 1;
          query = query.replace(/\n|\r/g, " ");
          if (tagName === "useQuery") {
            if (args.length) {
              query = `query(${args}){${query}}`;
              offset -= args.length + 8;
            } else {
              query = `{${query}}`;
              offset -= 1;
            }
          } else if (tagName === "useMutation") {
            if (args.length) {
              query = `mutation(${args}){${query}}`;
              offset -= args.length + 11;
            } else {
              query = `mutation{${query}}`;
              offset -= 9;
            }
          }
          if (tagName === "useQuery" || tagName === "useMutation") {
            const errors = validate(schema, query);
            for (const error of errors) {
              const match = error.message.match(
                /^Variable ".*?" of type "Unknown" used in position expecting type "(.*?)"\.$/
              );
              if (match) {
                query = query.replace("Unknown", match[1]);
                offset += 7 - match[1].length;
              }
            }
          }
          const graphqlDiagnostics = getDiagnostics(query, schema);
          for (const {
            range: { start, end },
            severity,
            message,
          } of graphqlDiagnostics) {
            diagnostics.push({
              category: diagnosticCategory(severity),
              code: 9999,
              messageText: message,
              file: sourceFile,
              start: start.character + offset,
              length: end.character - start.character,
            });
          }
          graphqlTagKeys[tagName][texts.join(" $_ ")] = query;
        }
      }
      ts.forEachChild(node, visitor);
    });
    updateDeclarationFile(graphqlTagKeys);
    return diagnostics;
  };
  updateDeclarationFile = async (graphqlTagKeys: GraphqlTagKeys) => {
    const { schema, declarationPath, declaration } = this;
    if (!schema) {
      return;
    }
    let _declaration = "";
    for (const [tag, keys] of Object.entries(graphqlTagKeys)) {
      for (const [key, query] of Object.entries(keys)) {
        const queryKey = JSON.stringify(key);
        const comment = `\n// ${queryKey}\n`;
        if (declaration.includes(comment)) {
          continue;
        }
        const { values, returnType } = resolveQueryType(schema, query);
        const typeName = `${tag[0].toUpperCase()}${tag.slice(1)}Types`;
        _declaration += `${comment}declare module "@mo36924/framework/types" { interface ${typeName} { ${queryKey}: [${values}, ${returnType}] } }\n`;
      }
    }
    if (!_declaration) {
      return;
    }
    const config = await resolveConfig(declarationPath);
    _declaration = format(_declaration, { ...config, filepath: declarationPath });
    this.declaration = declaration + _declaration;
    await appendFile(declarationPath, _declaration);
  };
}

const init: ts.server.PluginModuleFactory = (mod) => new PluginModule(mod);

export default init;

if (typeof module !== "undefined" && typeof exports !== "undefined") {
  module.exports = Object.assign(init, exports);
}
