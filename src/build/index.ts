import framework, { Options as FrameworkOptions } from "~/babel-preset-framework";
import { getConfig, mergeConfig, PartialConfig } from "~/config";
import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import * as browserslists from "~/browserslists";
import { builtinModules } from "module";
import { rollup } from "rollup";
import { terser } from "rollup-plugin-terser";
import { batchWarnings } from "rollup/dist/shared/loadConfigFile";
import { packageName } from "~/constants";

export type Options = Pick<PartialConfig, "node" | "browser">;

export default async (options?: Options) => {
  const config = await getConfig();
  const { node, browser } = mergeConfig(config, options);
  const warnings = batchWarnings();

  const build = await rollup({
    input: node.entry,
    preserveEntrySignatures: false,
    external: builtinModules,
    onwarn: warnings.add,
    plugins: [
      typescript({
        incremental: false,
        target: "ES2020",
        declaration: false,
        declarationMap: false,
        sourceMap: true,
        inlineSourceMap: false,
        inlineSources: true,
        strict: true,
        moduleResolution: "node",
        outDir: node.outDir,
        jsx: "preserve",
        jsxImportSource: packageName,
      }),
      json({
        preferConst: true,
      }),
      babel({
        babelrc: false,
        configFile: false,
        babelHelpers: "bundled",
        extensions: [".tsx", ".ts", ".mjs", ".jsx", ".js", ".json"],
        presets: [[framework, {} as FrameworkOptions]],
      }),
      resolve({
        exportConditions: ["import"],
        browser: false,
        mainFields: ["module", "main"],
      }),
      commonjs({
        ignoreGlobal: true,
      }),
      terser({
        ecma: 2020,
      }),
    ],
  });

  await build.write({
    dir: node.outDir,
    format: "module",
    entryFileNames: "node.js",
    interop: "auto",
    compact: true,
    sourcemap: true,
  });

  warnings.flush();

  // for (const type of Object.keys(browserslists)) {
  //   const build = await rollup({
  //     input: browser.entry,
  //     preserveEntrySignatures: false,
  //     plugins: [
  //       typescript({
  //         target: "ES2020",
  //       }),
  //       babel({
  //         babelrc: false,
  //         configFile: false,
  //         babelHelpers: "bundled",
  //         extensions: [".tsx", ".ts", ".mjs", ".jsx", ".js", ".json"],
  //         presets: [[framework, { env: "production", target: type } as FrameworkOptions]],
  //       }),
  //       commonjs({
  //         ignoreGlobal: true,
  //       }),
  //       terser({
  //         ecma: 2020,
  //       }),
  //     ],
  //   });

  //   await build.write({
  //     dir: browser.outDir,
  //     format: "module",
  //     entryFileNames: `${type}.js`,
  //     interop: "auto",
  //     compact: true,
  //   });
  // }
};
