import { transformAsync, TransformOptions } from "@babel/core";
import { describe, test, expect } from "@jest/globals";
import preset from "./index";

const options: TransformOptions = {
  babelrc: false,
  configFile: false,
  presets: [[preset]],
  filename: "index.ts",
};
const transform = (code: string) => transformAsync(code, options);

describe("babel-preset", () => {
  test("preset", async () => {
    const code = await transform("css`width: 10px`");
    expect(code).toMatchInlineSnapshot(`
      import { css as _css } from "@mo36924/framework";

      const _css2 = _css(
        typeof self === "undefined"
          ? (_0) => ({
              modern: \`.\${_0}{width:10px}\`,
              module: \`.\${_0}{width:10px}\`,
              nomodule: \`.\${_0}{width:10px}\`,
            })
          : typeof __MODERN__ !== "undefined"
          ? (_0) => [\`.\${_0}{width:10px}\`]
          : typeof __MODULE__ !== "undefined"
          ? (_0) => [\`.\${_0}{width:10px}\`]
          : (_0) => [\`.\${_0}{width:10px}\`],
        "zfm5Ii6T"
      );

      _css2();
    `);
  });

  test("preset-resolve", async () => {
    const code = await transform(`import "preact"`);
    expect(code).toMatchInlineSnapshot(`import "./node_modules/preact/dist/preact.mjs";`);
  });
});
