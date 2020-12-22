import ts, { CompilerOptions } from "typescript";
import type { Plugin } from "rollup";

export default (options: CompilerOptions): Plugin => {
  return {
    name: "rollup-plugin-typescript",
    transform(code, id) {
      if (id.endsWith(".d.ts") || !/\.(ts|tsx|js|mjs)$/.test(id)) {
        return undefined;
      }
      const { outputText } = ts.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          allowJs: true,
          jsx: ts.JsxEmit.Preserve,
          module: ts.ModuleKind.ES2020,
          importHelpers: true,
          sourceMap: false,
          inlineSources: false,
          inlineSourceMap: false,
          strict: true,
          esModuleInterop: true,
          moduleResolution: ts.ModuleResolutionKind.NodeJs,
          declaration: false,
          declarationMap: false,
          ...options,
        },
      });
      return outputText;
    },
  };
};
