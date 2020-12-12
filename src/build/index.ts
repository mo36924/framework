import framework, { Options as FrameworkOptions } from "~/babel-preset-framework";
import { getConfig, mergeConfig, PartialConfig } from "~/config";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import * as browserslists from "~/browserslists";
import { builtinModules } from "module";
import { rollup } from "rollup";
import { terser } from "rollup-plugin-terser";

export type Options = Pick<PartialConfig, "node" | "browser">;

export default async (options?: Options) => {
  const config = await getConfig();
  const { node, browser } = mergeConfig(config, options);

  const build = await rollup({
    input: node.entry,
    preserveEntrySignatures: false,
    external: builtinModules,
    plugins: [
      typescript({
        incremental: false,
        target: "ES2020",
        declaration: false,
        declarationMap: false,
      }),
      babel({
        babelrc: false,
        configFile: false,
        babelHelpers: "bundled",
        extensions: [".tsx", ".ts", ".mjs", ".jsx", ".js", ".json"],
        presets: [[framework, {} as FrameworkOptions]],
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
    sourcemap: false,
  });

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
