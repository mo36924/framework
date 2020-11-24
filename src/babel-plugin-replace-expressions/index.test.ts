import { transformAsync, TransformOptions } from "@babel/core";
import { describe, expect, test } from "@jest/globals";
import plugin from "./index";

const options: TransformOptions = {
  babelrc: false,
  configFile: false,
  plugins: [
    [
      plugin,
      {
        "process.env.NODE_ENV": true,
        "typeof window": JSON.stringify("object"),
        __VALUE__: JSON.stringify("value"),
      },
    ],
  ],
};
const transform = (code: string) => transformAsync(code, options);

describe("babel-plugin-replace-expressions", () => {
  test("NODE_ENV", async () => {
    const result = await transform(`
      if(process.env.NODE_ENV === "production"){
        console.log(process.env.NODE_ENV)
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      if (true === "production") {
        console.log(true);
      }
    `);
    const result1 = await transform(`
      if("process.env.NODE_ENV" === "production"){
        console.log("process.env.NODE_ENV")
      }
    `);
    expect(result1).toMatchInlineSnapshot(`
      if ("process.env.NODE_ENV" === "production") {
        console.log("process.env.NODE_ENV");
      }
    `);
  });

  test("typeof", async () => {
    const result = await transform(`
      if(typeof window === "undefined"){
        console.log("")
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      if ("object" === "undefined") {
        console.log("");
      }
    `);
  });

  test("global value", async () => {
    const result = await transform(`
      if(__VALUE__){
        console.log(__VALUE__)
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      if ("value") {
        console.log("value");
      }
    `);
  });
});
