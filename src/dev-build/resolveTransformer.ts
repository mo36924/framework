import path from "path";
import type { Node, SourceFile, TransformerFactory, ResolvedModuleFull, StringLiteralLike, Bundle } from "typescript";
import ts from "./typescript";

const { relative, dirname } = path.posix;

type ResolvedModules = Map<string, ResolvedModuleFull>;
type _Node = Node;

declare module "typescript" {
  interface SourceFile {
    resolvedModules: ResolvedModules;
  }
  function isImportKeyword(node: _Node): boolean;
}

function resolveModuleSpecifier(sf: SourceFile, path: string) {
  if (/^[A-Za-z@]/.test(path)) {
    return;
  }
  if (!sf.isDeclarationFile && path[0] === "~/") {
    return;
  }

  const resolvedModule = sf.resolvedModules.get(path);

  if (!resolvedModule) {
    return;
  }

  let moduleSpecifier = relative(dirname(sf.fileName), resolvedModule.resolvedFileName);

  if (!moduleSpecifier.startsWith(".")) {
    moduleSpecifier = `./${moduleSpecifier}`;
  }
  if (sf.isDeclarationFile) {
    moduleSpecifier = moduleSpecifier.replace(/(\/index)?\.tsx?/, "");
  }

  return moduleSpecifier;
}

export const resolveTransformerFactory: TransformerFactory<SourceFile | Bundle> = (ctx) => (sf) => {
  if (ts.isBundle(sf)) {
    return sf;
  }

  return ts.visitNode(sf, function visitor(node): Node {
    let moduleSpecifier;

    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      (moduleSpecifier = resolveModuleSpecifier(sf, node.moduleSpecifier.text))
    ) {
      if (ts.isImportDeclaration(node)) {
        return ctx.factory.updateImportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.importClause,
          ctx.factory.createStringLiteral(moduleSpecifier)
        );
      } else {
        return ctx.factory.updateExportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.isTypeOnly,
          node.exportClause,
          ctx.factory.createStringLiteral(moduleSpecifier)
        );
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isImportKeyword(node.expression) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (moduleSpecifier = resolveModuleSpecifier(sf, (node.arguments[0] as StringLiteralLike).text))
    ) {
      return ctx.factory.updateCallExpression(node, node.expression, node.typeArguments, [
        ctx.factory.createStringLiteral(moduleSpecifier),
      ]);
    }

    return ts.visitEachChild(node, visitor, ctx);
  });
};
