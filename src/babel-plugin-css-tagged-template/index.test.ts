import { transformAsync, TransformOptions } from "@babel/core";
import { test, expect } from "@jest/globals";
import plugin from "./index";

const options: TransformOptions = {
  babelrc: false,
  configFile: false,
  plugins: [[plugin]],
};

const transform = (code: string) => transformAsync(code, options);

test("babel-plugin-css-tagged-template", async () => {
  let result = await transform(`
    css\`
      width: 10px;
    \`
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "@mo36924/framework";

    const _css2 = _css(
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

    _css2();
  `);

  result = await transform(`
    function a(){
      const className = css\`
        width: 10px;
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "@mo36924/framework";

    const _css2 = _css(
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

    function a() {
      const className = _css2();
    }
  `);

  result = await transform(`
    function a(b){
      const className = css\`
        width: 10px;
        height: \${b}px;
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "@mo36924/framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0, _1) => ({
            module: \`.\${_0}{height:\${_1}px;width:10px}\`,
            nomodule: \`.\${_0}{height:\${_1}px;width:10px}\`,
          })
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`]
        : (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`],
      "WSOlo8TZ"
    );

    function a(b) {
      const className = _css2(b);
    }
  `);

  result = await transform(`
    function a(b){
      const className = css\`
        width: 10px;
        height: \${b}px;
      \`
    }

    function b(c, d){
      const className = css\`
        width: \${c}px;
        height: \${d}px;
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "@mo36924/framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0, _1) => ({
            module: \`.\${_0}{height:\${_1}px;width:10px}\`,
            nomodule: \`.\${_0}{height:\${_1}px;width:10px}\`,
          })
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`]
        : (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`],
      "WSOlo8TZ"
    );

    const _css3 = _css(
      typeof self === "undefined"
        ? (_0, _1, _2) => ({
            module: \`.\${_0}{height:\${_2}px;width:\${_1}px}\`,
            nomodule: \`.\${_0}{height:\${_2}px;width:\${_1}px}\`,
          })
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1, _2) => [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`]
        : (_0, _1, _2) => [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`],
      "vEKpkqOF"
    );

    function a(b) {
      const className = _css2(b);
    }

    function b(c, d) {
      const className = _css3(c, d);
    }
  `);

  result = await transform(`
    function a(b){
      const className = css\`
        width: 10px;
        height: \${b}px;
        &:before {
          width: \${b}px;
        }
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "@mo36924/framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0, _1, _2) => ({
            module: \`.\${_0}{height:\${_1}px;width:10px}.\${_0}:before{width:\${_2}px}\`,
            nomodule: \`.\${_0}{height:\${_1}px;width:10px}.\${_0}:before{width:\${_2}px}\`,
          })
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1, _2) => [\`.\${_0}{height:\${_1}px;width:10px}\`, \`.\${_0}:before{width:\${_2}px}\`]
        : (_0, _1, _2) => [\`.\${_0}{height:\${_1}px;width:10px}\`, \`.\${_0}:before{width:\${_2}px}\`],
      "nVoEBgcG"
    );

    function a(b) {
      const className = _css2(b, b);
    }
  `);
});
