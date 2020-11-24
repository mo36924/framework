import { transformAsync } from "@babel/core";
import { expect, test } from "@jest/globals";
import plugin from "./index";

test("babel-plugin-import-meta-url", async () => {
  const result = await transformAsync(`import "hoge.ts";import {} from "hoge.tsx";export * from "hoge.ts";`, {
    babelrc: false,
    configFile: false,
    plugins: [[plugin, { ".ts": ".mjs", ".tsx": ".mjs" }]],
  });

  expect(result).toMatchInlineSnapshot(`
    import "hoge.mjs";
    import "hoge.mjs";
    export * from "hoge.mjs";
  `);
});
