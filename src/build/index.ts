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
import { createRequire } from "module";
import { fileURLToPath } from "url";
const systemjsPath = createRequire(fileURLToPath(import.meta.url)).resolve("@mo36924/systemjs/dist/s.js");

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
        module: "ESNext",
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
        presets: [[framework, { env: "production", target: "node" } as FrameworkOptions]],
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
    entryFileNames: "index.js",
    interop: "auto",
    compact: true,
    sourcemap: true,
  });

  for (const type of Object.keys(browserslists)) {
    const build = await rollup({
      input: browser.entry,
      preserveEntrySignatures: false,
      onwarn: warnings.add,
      plugins: [
        typescript({
          target: "ES2020",
        }),
        babel({
          babelrc: false,
          configFile: false,
          babelHelpers: "bundled",
          extensions: [".tsx", ".ts", ".mjs", ".jsx", ".js", ".json"],
          presets: [[framework, { env: "development", target: type } as FrameworkOptions]],
        }),
        resolve({
          exportConditions: ["browser", "import"],
          browser: true,
          mainFields: ["browser", "module", "main"],
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
      format: type === "nomodule" ? "system" : "module",
      entryFileNames: `${type}.js`,
      interop: "auto",
      compact: true,
    });
  }

  const systemjsBuild = await rollup({ input: systemjsPath, onwarn: warnings.add });
  systemjsBuild.write({ dir: browser.outDir, interop: "auto", compact: true });
  warnings.flush();
};
