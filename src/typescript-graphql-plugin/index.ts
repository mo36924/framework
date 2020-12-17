import { FSWatcher, readFileSync, unwatchFile, watch, watchFile, writeFileSync } from "fs";
import { buildSchema, Source } from "graphql";
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
  TaggedTemplateExpression,
} from "typescript/lib/tsserverlibrary";
import { CompletionItemKind } from "vscode-languageserver-types";
import { diagnosticCategory } from "./diagnosticCategory";
import { diagnostics as _diagnostics } from "./diagnostics";
import { Checker, hook } from "./hook";
import { hover } from "./hover";
import { isGraphqlTag } from "./isGraphqlTag";
import { query as _query } from "./query";
import { schema as _schema } from "./schema";
import { sourceFile as _sourceFile } from "./sourceFile";

const init: ts.server.PluginModuleFactory = ({ typescript: ts }) => {
  const emptySchema = buildSchema("scalar Unknown");
  let schema = emptySchema;
  (ts as any).taggedTemplateExpressionHook = (node: TaggedTemplateExpression, checker: Checker) =>
    hook(ts, schema, node, checker);

  let watcher: FSWatcher | undefined;
  let currentDirectory = "/";
  const onConfigurationChanged = (config: { schema?: string }) => {
    schema = emptySchema;
    if (watcher) {
      watcher.close();
      watcher = undefined;
    }
    const configSchema = config.schema;
    if (!configSchema) {
      return;
    }
    const schemaPath = resolve(currentDirectory, configSchema);
    let schemaCode = "";
    try {
      schemaCode = readFileSync(schemaPath, "utf8");
      schemaCode += "\nscalar Unknown";
    } catch {
      watchFile(schemaPath, (stat) => {
        if (!stat.isFile()) {
          return;
        }
        unwatchFile(schemaPath);
        onConfigurationChanged(config);
      });
      return;
    }
    try {
      const declarationPath = schemaPath + ".d.ts";
      const config = resolveConfig.sync(declarationPath);
      const __schema = buildSchema(new Source(schemaCode, schemaPath));
      const declaration = format(_schema(__schema), { ...config, filepath: declarationPath });
      writeFileSync(declarationPath, declaration);
      schema = __schema;
    } catch {}

    watcher = watch(schemaPath, () => {
      onConfigurationChanged(config);
    });
  };
  return {
    create(info) {
      currentDirectory = info.project.getCurrentDirectory();
      onConfigurationChanged(info.config);
      const languageService = info.languageService;
      const proxy: LanguageService = Object.create(null);
      for (const [key, value] of Object.entries(languageService)) {
        (proxy as any)[key] = value.bind(languageService);
      }
      proxy.getQuickInfoAtPosition = (fileName: string, position: number) => {
        const sourceFile = _sourceFile(languageService, fileName);
        if (!sourceFile) {
          return;
        }
        const tag = hover(ts, sourceFile, position);
        if (!tag) {
          return languageService.getQuickInfoAtPosition(fileName, position);
        }
        const { query, offset } = _query(ts, schema, tag);
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
      proxy.getCompletionsAtPosition = (
        fileName: string,
        position: number,
        options: GetCompletionsAtPositionOptions | undefined
      ) => {
        const sourceFile = _sourceFile(languageService, fileName);
        if (!sourceFile) {
          return;
        }
        const tag = hover(ts, sourceFile, position);
        if (!tag) {
          return languageService.getCompletionsAtPosition(fileName, position, options);
        }
        const { query, offset } = _query(ts, schema, tag);
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
      proxy.getSemanticDiagnostics = (fileName: string) => {
        const diagnostics = languageService.getSemanticDiagnostics(fileName);
        const sourceFile = _sourceFile(languageService, fileName);
        if (!sourceFile) {
          return diagnostics;
        }
        ts.forEachChild(sourceFile, function visitor(node) {
          if (ts.isTaggedTemplateExpression(node) && ts.isIdentifier(node.tag)) {
            const tagName = node.tag.text;
            if (isGraphqlTag(tagName)) {
              const { query, offset } = _query(ts, schema, node);
              const graphqlDiagnostics = _diagnostics(schema, query);
              for (const {
                range: { start, end },
                severity,
                message,
              } of graphqlDiagnostics) {
                diagnostics.push({
                  category: diagnosticCategory(ts, severity),
                  code: 9999,
                  messageText: message,
                  file: sourceFile,
                  start: start.character + offset,
                  length: end.character - start.character,
                });
              }
            }
          }
          ts.forEachChild(node, visitor);
        });

        return diagnostics;
      };
      return proxy;
    },
    onConfigurationChanged,
  };
};

export default init;

if (typeof module !== "undefined" && typeof exports !== "undefined") {
  module.exports = Object.assign(init, exports);
}
