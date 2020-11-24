import { transformAsync } from "@babel/core";
import { describe, expect, test } from "@jest/globals";
import { resolve } from "path";
import plugin, { Options } from "./index";

const transform = (code: string, options: Options = {}) =>
  transformAsync(code, {
    babelrc: false,
    configFile: false,
    filename: resolve("index.mjs"),
    plugins: [[plugin, options]],
  });

describe("babel-plugin-resolve", () => {
  test("bare import", async () => {
    const result = await transform(`import preact from "preact"`);
    expect(result).toMatchInlineSnapshot(`import preact from "./node_modules/preact/dist/preact.mjs";`);
  });

  test("builtin module", async () => {
    const result = await transform(`import path from "buffer"`, { ignoreBuiltins: true });
    expect(result).toMatchInlineSnapshot(`import path from "buffer";`);
  });

  test("export", async () => {
    const result = await transform(`export { createElement } from "preact"`);
    expect(result).toMatchInlineSnapshot(`export { createElement } from "./node_modules/preact/dist/preact.mjs";`);
  });
});
