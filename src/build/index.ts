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
import rollupPluginTypescript from "~/rollup-plugin-typescript";
import { dirname, join } from "path";
import { mkdir, writeFile } from "fs/promises";
import ts from "typescript";
const systemjsPath = createRequire(fileURLToPath(import.meta.url)).resolve("@mo36924/systemjs/dist/s.min.js");

export type Options = Pick<PartialConfig, "node" | "browser">;

export default async (options?: Options) => {
  const config = await getConfig();
  const { node, browser, outDir, publicDir } = mergeConfig(config, options);
  const warnings = batchWarnings();

  await Promise.all([mkdir(dirname(node), { recursive: true }), mkdir(dirname(browser), { recursive: true })]);
  await Promise.allSettled([writeFile(node, "", { flag: "wx" }), writeFile(browser, "", { flag: "wx" })]);

  const build = await rollup({
    input: node,
    preserveEntrySignatures: false,
    external: builtinModules,
    onwarn: warnings.add,
    plugins: [
      typescript({
        incremental: false,
        composite: false,
        target: "ES2020",
        module: "ES2020",
        declaration: false,
        declarationMap: false,
        sourceMap: true,
        inlineSourceMap: false,
        inlineSources: true,
        strict: true,
        esModuleInterop: true,
        moduleResolution: "node",
        outDir: outDir,
        jsx: "preserve",
        jsxImportSource: packageName,
      }),
      json({
        preferConst: true,
      }),
      commonjs({
        ignoreGlobal: true,
      }),
      babel({
        babelrc: false,
        configFile: false,
        babelHelpers: "bundled",
        extensions: [".tsx", ".ts", ".jsx", ".mjs", ".js", ".cjs"],
        presets: [[framework, { env: "production", target: "node" } as FrameworkOptions]],
      }),
      resolve({
        exportConditions: ["import"],
        browser: false,
        mainFields: ["module", "main"],
        extensions: [".tsx", ".ts", ".jsx", ".mjs", ".js", ".cjs", ".json", ".node"],
      }),
      terser({
        ecma: 2020,
      }),
    ],
  });

  await build.write({
    dir: outDir,
    format: "module",
    entryFileNames: "index.js",
    interop: "auto",
    compact: true,
    sourcemap: true,
  });

  for (const type of Object.keys(browserslists)) {
    const isNoModule = type === "nomodule";
    const build = await rollup({
      input: browser,
      preserveEntrySignatures: false,
      onwarn: warnings.add,
      plugins: [
        typescript({
          incremental: false,
          composite: false,
          target: "ES2020",
          module: "ES2020",
          declaration: false,
          declarationMap: false,
          sourceMap: false,
          inlineSourceMap: false,
          inlineSources: false,
          strict: true,
          esModuleInterop: true,
          moduleResolution: "node",
          outDir: publicDir,
          jsx: "preserve",
          jsxImportSource: packageName,
        }),
        json({
          preferConst: true,
        }),
        commonjs({
          ignoreGlobal: true,
        }),
        rollupPluginTypescript({
          target: isNoModule ? ts.ScriptTarget.ES5 : ts.ScriptTarget.ES2017,
          downlevelIteration: isNoModule,
        }),
        babel({
          babelrc: false,
          configFile: false,
          babelHelpers: "bundled",
          extensions: [".tsx", ".ts", ".jsx", ".mjs", ".js", ".cjs"],
          presets: [[framework, { env: "production", target: type } as FrameworkOptions]],
        }),
        resolve({
          exportConditions: ["browser", "import"],
          browser: true,
          mainFields: ["browser", "module", "main"],
          extensions: [".tsx", ".ts", ".jsx", ".mjs", ".js", ".cjs", ".json", ".node"],
        }),
        terser({
          ecma: isNoModule ? 5 : 2017,
          safari10: true,
        }),
      ],
    });

    await build.write({
      dir: publicDir,
      format: isNoModule ? "system" : "module",
      entryFileNames: isNoModule ? `nomodule.js` : "index.js",
      interop: "auto",
      compact: true,
    });
  }

  const systemjsBuild = await rollup({ input: systemjsPath, onwarn: warnings.add, plugins: [terser()] });
  await systemjsBuild.write({ file: join(publicDir, "s.js"), interop: "auto", compact: true });
  warnings.flush();
};
