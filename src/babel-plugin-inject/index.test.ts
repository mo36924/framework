import { transformAsync, TransformOptions } from "@babel/core";
import { describe, test, expect } from "@jest/globals";
import plugin from "./index";

const options: TransformOptions = {
  babelrc: false,
  configFile: false,
  plugins: [
    [
      plugin,
      {
        Promise: ["promise-polyfill"],
        fetch: ["whatwg-fetch", "fetch"],
        _Headers: ["whatwg-fetch", "Headers"],
      },
    ],
  ],
};
const transform = (code: string) => transformAsync(code, options);

describe("babel-plugin-inject", () => {
  test("inject module", async () => {
    const result = await transform(`
      Promise.resolve(true)
      fetch("/url").then(res => console.log(res))
      console.log(_Headers);
    `);
    expect(result).toMatchInlineSnapshot(`
      import "promise-polyfill";
      import { fetch } from "whatwg-fetch";
      import { Headers as _Headers } from "whatwg-fetch";
      Promise.resolve(true);
      fetch("/url").then((res) => console.log(res));
      console.log(_Headers);
    `);
  });
});
