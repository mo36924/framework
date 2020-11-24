import framework, { Options as FrameworkOptions } from "#babel-preset-framework";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { rollup } from "rollup";
import { terser } from "rollup-plugin-terser";
import { builtinModules } from "module";

export type Options = {
  node?: {
    entry?: string;
    outDir?: string;
  };
  browser?: {
    entry?: string;
    outDir?: string;
  };
};

export default async (options?: Options) => {
  const browser = {
    entry: "browser/index.ts",
    outDir: "dist/browser",
    ...options?.browser,
  };

  const node = {
    entry: "node/index.ts",
    outDir: "dist/browser",
    ...options?.node,
  };

  const build = await rollup({
    input: browser.entry,
    preserveEntrySignatures: false,
    external: builtinModules,
    plugins: [
      typescript({
        target: "ES2020",
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
    dir: browser.outDir,
    format: "module",
    inlineDynamicImports: true,
    interop: "auto",
    compact: true,
  });
};
