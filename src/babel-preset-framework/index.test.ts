import { transformAsync, TransformOptions } from "@babel/core";
import { describe, test, expect } from "@jest/globals";
import preset from "./index";
import css, { Options } from "../babel-plugin-css-tagged-template";
import { resolve } from "path";

const options: TransformOptions = {
  babelrc: false,
  configFile: false,
  presets: [[preset]],
  plugins: [[css, { importSource: resolve("src/css") } as Options]],
  filename: "index.ts",
};
const transform = (code: string) => transformAsync(code, options);

describe("babel-preset", () => {
  test("preset", async () => {
    const code = await transform("css`width: 10px`");
    expect(code).toMatchInlineSnapshot(`
      import { css as _css } from "./src/css/index.ts";

      const _css3 = _css(
        typeof self === "undefined"
          ? (_0) => ({
              module: \`.\${_0}{width:10px}\`,
              nomodule: \`.\${_0}{width:10px}\`,
            })
          : typeof __MODULE__ !== "undefined"
          ? (_0) => [\`.\${_0}{width:10px}\`]
          : (_0) => [\`.\${_0}{width:10px}\`],
        "zfm5Ii6T"
      );

      _css3();
    `);
  });

  test("preset-resolve", async () => {
    const code = await transform(`import "preact"`);
    expect(code).toMatchInlineSnapshot(`import "./node_modules/preact/dist/preact.mjs";`);
  });
});
