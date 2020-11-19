import { existsSync, readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { join, basename } from "path";
import { cwd } from "process";

const _require = createRequire(join(cwd(), "index.js"));
const tsPath = _require.resolve("typescript");
const tsDir = tsPath.slice(0, -basename(tsPath).length);
const _tsPath = tsDir + "_typescript.js";

if (!existsSync(_tsPath)) {
  const tsSource = readFileSync(tsPath, "utf8");
  const tsSeparator = "//# sourceMappingURL=typescript.js.map";
  const tsSeparatorIndex = tsSource.lastIndexOf(tsSeparator);
  if (tsSeparatorIndex === -1) {
    throw new Error("Could not find a separator");
  }

  const tscPath = tsDir + "tsc.js";
  const tscSource = readFileSync(tscPath, "utf8");
  const tscSeparator = "(function (ts) {";
  const tscSeparatorIndex = tscSource.lastIndexOf(tscSeparator);
  if (tscSeparatorIndex === -1) {
    throw new Error("Could not find a separator");
  }

  const tsdPath = tsDir + "typescript.d.ts";
  const tsdSource = readFileSync(tsdPath, "utf8");
  const _tsdPath = tsDir + "_typescript.d.ts";
  const _tsdSource = `${tsdSource}\ndeclare namespace ts {\n    function tsc(): void;\n}\n`;

  writeFileSync(_tsdPath, _tsdSource);

  const _tsSource = `${tsSource.slice(0, tsSeparatorIndex)}\nts.tsc = function(){\n${tscSource.slice(
    tscSeparatorIndex
  )}\n}\n${tsSource.slice(tsSeparatorIndex)}`;

  writeFileSync(_tsPath, _tsSource);
}

export default _require(_tsPath) as typeof import("typescript") & { tsc: () => void };
