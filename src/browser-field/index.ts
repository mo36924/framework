import glob from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import { format, resolveConfig } from "~/prettier-module";
import { exit } from "process";

(async () => {
  const sourceDir = "src";
  const packageJsonPath = "package.json";
  const [files, pkgJson] = await Promise.all([
    glob(["**/*.browser.{ts,tsx}", "!**/__tests__/**"], { cwd: sourceDir }),
    readFile(packageJsonPath, "utf-8"),
  ]);
  const pkg = JSON.parse(pkgJson);
  const browser: { [key: string]: string } = (pkg.browser = {});
  for (const file of files.sort()) {
    const name = file.replace(/\.(ts|tsx)$/, "");
    const key = name.replace(/\.browser$/, "");
    browser[`./${key}.mjs`] = `./${name}.mjs`;
  }
  const config = await resolveConfig(packageJsonPath);
  const _pkgJSON = format(JSON.stringify(pkg), { ...config, filepath: packageJsonPath });
  await writeFile(packageJsonPath, _pkgJSON);
})().catch((err) => {
  console.log(err);
  exit(1);
});
