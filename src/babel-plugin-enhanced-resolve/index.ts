import { dirname, relative } from "path";
import type { default as babel, NodePath, PluginObj, types as t } from "@babel/core";
import { builtinModules } from "module";
import enhancedResolve, { ResolveOptions } from "enhanced-resolve";
import fs from "fs";

const { create } = enhancedResolve;

export type Options = {
  ignoreBuiltins?: boolean;
  ignoreBareImport?: boolean;
  ignore?: (string | RegExp)[];
  relative?: boolean;
  cache?: boolean;
} & Partial<ResolveOptions>;
type State = {
  file: { metadata: { deps: string[] } };
  filename?: string;
};

export default ({ types: t }: typeof babel, options: Options): PluginObj<State> => {
  const {
    ignoreBuiltins,
    ignoreBareImport,
    ignore,
    relative: optionRelative = true,
    cache = true,
    ..._resolveOptions
  } = options;

  const ignores = ignore || [];
  if (ignoreBuiltins) {
    ignores.push(...builtinModules);
  }
  if (ignoreBareImport) {
    ignores.push(/^[^\.\/]/);
  }

  if (!cache) {
    _resolveOptions.fileSystem = fs;
  }

  const resolveOptions: Partial<ResolveOptions> = {
    conditionNames: ["import"],
    extensions: [".tsx", ".ts", ".jsx", ".mjs", ".js", ".cjs", ".json", ".node"],
    ..._resolveOptions,
  };

  const enhancedResolve = create.sync(resolveOptions);

  const resolve = (path: string, request: string, deps: string[]) => {
    if (ignores.some((ignore) => (typeof ignore === "string" ? ignore === request : ignore.test(request)))) {
      deps.push(request);
      return request;
    }
    const dir = dirname(path);
    request = enhancedResolve(dir, request) || request;
    deps.push(request);
    if (optionRelative) {
      request = relative(dir, request);
      if (request[0] !== "/" && request[0] !== ".") {
        request = "./" + request;
      }
    }
    return request;
  };

  const transformDeclaration = (
    path: NodePath<t.ImportDeclaration> | NodePath<t.ExportAllDeclaration> | NodePath<t.ExportNamedDeclaration>,
    state: State
  ) => {
    const { source } = path.node;

    if (!state.filename || !source) {
      return;
    }

    let modulePath = source.value;

    try {
      modulePath = resolve(state.filename, modulePath, state.file.metadata.deps);
    } catch (e) {
      console.log(path.buildCodeFrameError(e?.message));
      return;
    }

    const sourcePath = path.get("source");
    if (Array.isArray(sourcePath)) {
      return;
    }

    sourcePath.replaceWith(t.stringLiteral(modulePath));
  };

  const transformImport = (path: NodePath<t.Import>, state: State) => {
    if (!state.filename || !path.parentPath.isCallExpression()) {
      return;
    }

    const arg = path.parentPath.get("arguments.0");
    if (Array.isArray(arg)) {
      return;
    }
    let modulePath: string | undefined;

    if (arg.isTemplateLiteral() && arg.node.expressions.length === 0) {
      modulePath = arg.node.quasis[0].value.cooked;
    }

    if (arg.isStringLiteral()) {
      modulePath = arg.node.value;
    }

    if (!modulePath) {
      return;
    }

    try {
      modulePath = resolve(state.filename, modulePath, state.file.metadata.deps);
    } catch (e) {
      console.log(path.buildCodeFrameError(e?.message));
      return;
    }

    arg.replaceWith(t.stringLiteral(modulePath));
  };

  return {
    name: "enhanced-resolve",
    pre(_state) {
      this.file.metadata.deps = [];
    },
    post() {
      this.file.metadata.deps = [...new Set(this.file.metadata.deps)];
    },
    visitor: {
      ImportDeclaration: transformDeclaration,
      ExportAllDeclaration: transformDeclaration,
      ExportNamedDeclaration: transformDeclaration,
      Import: transformImport,
    },
  };
};
