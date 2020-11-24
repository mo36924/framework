import glob from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import { format, resolveConfig } from "#prettier-module";
import { exit } from "process";

type Imports = {
  [path: string]: {
    browser: string;
    import: string;
    require: string;
  };
};

type Exports = Imports;

(async () => {
  const sourceDir = "src";
  const packageJsonPath = "package.json";
  const [files, pkgJson] = await Promise.all([
    glob(["**/*.{ts,tsx}", "!**/*.{spec,test}.{ts,tsx}", "!**/__tests__/**"], { cwd: sourceDir }),
    readFile(packageJsonPath, "utf-8"),
  ]);
  const pkg = JSON.parse(pkgJson);
  pkg.main = "core/index.js";
  pkg.module = "core/index.mjs";
  pkg.browser = "core/index.mjs";
  const imports: Exports = (pkg.imports = {});
  const exports: Exports = (pkg.exports = {
    ".": {
      browser: "./core/index.mjs",
      import: "./core/index.mjs",
      require: "./core/index.js",
    },
  });
  for (const file of files.sort()) {
    const name = file.replace(/\.(ts|tsx)$/, "");
    const key = name.replace(/\.browser$/, "");
    if (key.endsWith("/index")) {
      const dir = key.replace(/\/index$/, "");
      if (!imports[`#${dir}`]) {
        imports[`#${dir}`] = exports[`./${dir}`] = {
          browser: `./${name}.mjs`,
          import: `./${name}.mjs`,
          require: `./${name}.js`,
        };
      } else if (name.endsWith(".browser")) {
        imports[`#${dir}`].browser = exports[`./${dir}`].browser = `./${name}.mjs`;
      } else {
        imports[`#${dir}`].import = exports[`./${dir}`].import = `./${name}.mjs`;
        imports[`#${dir}`].require = exports[`./${dir}`].require = `./${name}.js`;
      }
    }

    if (!imports[`#${key}`]) {
      imports[`#${key}`] = exports[`./${key}`] = {
        browser: `./${name}.mjs`,
        import: `./${name}.mjs`,
        require: `./${name}.js`,
      };
    } else if (name.endsWith(".browser")) {
      imports[`#${key}`].browser = exports[`./${key}`].browser = `./${name}.mjs`;
    } else {
      imports[`#${key}`].import = exports[`./${key}`].import = `./${name}.mjs`;
      imports[`#${key}`].require = exports[`./${key}`].require = `./${name}.js`;
    }
  }

  const config = await resolveConfig(packageJsonPath);
  const _pkgJSON = format(JSON.stringify(pkg), { ...config, filepath: packageJsonPath });
  await writeFile(packageJsonPath, _pkgJSON);
})().catch((err) => {
  console.log(err);
  exit(1);
});
