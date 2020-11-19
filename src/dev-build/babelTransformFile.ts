import { basename } from "path";
import { transformAsync, transformFromAstAsync } from "@babel/core";
import babelPluginTransformModulesCommonjs from "@babel/plugin-transform-modules-commonjs";
import babelPresetEnv from "@babel/preset-env";
import babelPresetReact from "@babel/preset-react";
import babelPluginImportMetaUrl from "../babel-plugin-import-meta-url";
import babelPluginReplaceImportExtensions from "../babel-plugin-replace-import-extensions";
import { addSourceMappingURL } from "./addSourceMappingURL";
import { scriptRegExp } from "./config";
import { writeFile } from "./writeFile";

const sourceMapComment = "//# sourceMappingURL=data:application/json;base64,";
const sourceMapCommentLength = sourceMapComment.length;

export async function babelTransformFile(path: string, data: string, writeByteOrderMark?: boolean) {
  const sourceMapCommentIndex = data.lastIndexOf(sourceMapComment);

  const sourceMap = JSON.parse(
    Buffer.from(data.slice(sourceMapCommentIndex + sourceMapCommentLength), "base64").toString()
  );

  data = data.slice(0, sourceMapCommentIndex);

  const module = await transformAsync(data, {
    babelrc: false,
    configFile: false,
    sourceType: "module",
    sourceMaps: true,
    inputSourceMap: sourceMap,
    ast: true,
    filename: path,
    presets: [
      [babelPresetEnv, { modules: false, targets: { node: true }, bugfixes: true }],
      [babelPresetReact, { runtime: "automatic", useSpread: true }],
    ],
    plugins: [[babelPluginReplaceImportExtensions, { ".ts": ".mjs", ".tsx": ".mjs" }]],
  });

  const commonjs = await transformFromAstAsync(module!.ast!, data, {
    babelrc: false,
    configFile: false,
    sourceType: "module",
    sourceMaps: true,
    inputSourceMap: sourceMap,
    filename: path,
    plugins: [
      babelPluginImportMetaUrl,
      [babelPluginReplaceImportExtensions, { ".mjs": ".js" }],
      babelPluginTransformModulesCommonjs,
    ],
  });

  const modulePath = path.replace(scriptRegExp, ".mjs");
  const moduleMapPath = `${modulePath}.map`;
  const commonjsPath = path.replace(scriptRegExp, ".js");
  const commonjsMapPath = `${commonjsPath}.map`;

  module!.map!.file = basename(modulePath);
  commonjs!.map!.file = basename(commonjsPath);

  writeFile(modulePath, addSourceMappingURL(module!.code!, moduleMapPath), writeByteOrderMark);
  writeFile(moduleMapPath, JSON.stringify(module!.map!), writeByteOrderMark);
  writeFile(commonjsPath, addSourceMappingURL(commonjs!.code!, commonjsMapPath), writeByteOrderMark);
  writeFile(commonjsMapPath, JSON.stringify(commonjs!.map!), writeByteOrderMark);
}
