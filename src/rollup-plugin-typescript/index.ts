import typescript from "typescript";
import type { Plugin } from "rollup";

export default (nomodule: boolean): Plugin => {
  return {
    name: "rollup-plugin-typescript",
    transform(code, id) {
      if (id.endsWith(".d.ts") || !/\.(ts|tsx|js|mjs)$/.test(id)) {
        return undefined;
      }
      const { outputText } = typescript.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          allowJs: true,
          jsx: typescript.JsxEmit.Preserve,
          target: nomodule ? typescript.ScriptTarget.ES5 : typescript.ScriptTarget.ES2017,
          module: typescript.ModuleKind.ES2020,
          downlevelIteration: nomodule,
          importHelpers: true,
          sourceMap: false,
          inlineSources: false,
          inlineSourceMap: false,
          strict: true,
          esModuleInterop: true,
          moduleResolution: typescript.ModuleResolutionKind.NodeJs,
          declaration: false,
          declarationMap: false,
        },
      });
      return outputText;
    },
  };
};
