import "#types";
import type { default as babel, TransformOptions, ConfigAPI } from "@babel/core";
import presetEnv, { Options as presetEnvOptions } from "@babel/preset-env";
import presetTypescript from "@babel/preset-typescript";
import presetReact from "@babel/preset-react";
import replaceExpressions from "#babel-plugin-replace-expressions";
import cssTaggedTemplate from "#babel-plugin-css-tagged-template";
import enhancedResolve, { Options as enhancedResolveOptions } from "#babel-plugin-enhanced-resolve";
import inject from "#babel-plugin-inject";
import { constantCase } from "change-case";
import * as variables from "#variables";
import { resolve } from "path";

import { packageName } from "#constants";
import { modern, module, nomodule } from "#browserslists";
import { getConfigSync } from "#config";

type Api = ConfigAPI & typeof babel;

export type Options = {
  env?: "production" | "development" | "test";
  target?: "node" | "modern" | "module" | "nomodule";
};

export default (_api: Api, options: Options): TransformOptions => {
  const { NODE_ENV, NODE_TARGET } = process.env;
  const { env: _env = NODE_ENV ?? "production", target = NODE_TARGET ?? "node" } = options;
  const __PROD__ = _env === "production" || undefined;
  const __DEV__ = _env === "development" || undefined;
  const __TEST__ = _env === "test" || undefined;
  const __NODE__ = target === "node" || undefined;
  const __BROWSER__ = !__NODE__ || undefined;
  const __MODERN__ = target === "modern" || undefined;
  const __MODULE__ = target === "module" || undefined;
  const __NOMODULE__ = target === "nomodule" || undefined;
  const config = getConfigSync();
  const variableObject = Object.fromEntries(
    Object.keys(variables).map((variable) => [
      `__${constantCase(variable)}__`,
      JSON.stringify((config.variables as any)[variable]),
    ])
  );

  return {
    presets: [
      [
        presetEnv,
        {
          bugfixes: true,
          modules: false,
          loose: false,
          ignoreBrowserslistConfig: true,
          targets: __NODE__
            ? {
                node: true,
              }
            : __MODERN__
            ? modern
            : __MODULE__
            ? module
            : __NOMODULE__
            ? nomodule
            : {
                node: "14",
                chrome: "80",
              },
          useBuiltIns: false,
          debug: __DEV__,
        } as presetEnvOptions,
      ],
      [presetTypescript],
      [
        presetReact,
        {
          runtime: "automatic",
          importSource: packageName,
          useBuiltIns: __NOMODULE__,
          useSpread: !__NOMODULE__,
          development: __DEV__,
        },
      ],
    ],
    plugins: [
      [
        replaceExpressions,
        {
          "typeof self": __NODE__ ? "'undefined'" : "'object'",
          "typeof global": __NODE__ ? "'object'" : "'undefined'",
          "typeof process": "'object'",
          "process.env.NODE_ENV": `'${_env}'`,
          __PROD__: `${__PROD__}`,
          __DEV__: `${__DEV__}`,
          __TEST__: `${__TEST__}`,
          __NODE__: `${__NODE__}`,
          __BROWSER__: `${__BROWSER__}`,
          ...variableObject,
        },
      ],
      [cssTaggedTemplate],
      [
        enhancedResolve,
        {
          ignoreBuiltins: __NODE__,
          mainFields: __NODE__ ? ["module", "main"] : ["browser", "module", "main"],
          conditionNames: __NODE__ ? ["import"] : ["browser", "import"],
          extensions: [".tsx", ".ts", ".jsx", ".mjs", ".js", ".json"],
        } as enhancedResolveOptions,
      ],
      [
        inject,
        {
          jsx: [packageName, "jsx"],
          jsxs: [packageName, "jsxs"],
          jsxDEV: [packageName, "jsxDEV"],
          createContext: [packageName, "createContext"],
          Fragment: [packageName, "Fragment"],
          hydrate: [packageName, "hydrate"],
          render: [packageName, "render"],
          useState: [packageName, "useState"],
          useReducer: [packageName, "useReducer"],
          useEffect: [packageName, "useEffect"],
          useLayoutEffect: [packageName, "useLayoutEffect"],
          useRef: [packageName, "useRef"],
          useImperativeHandle: [packageName, "useImperativeHandle"],
          useMemo: [packageName, "useMemo"],
          useCallback: [packageName, "useCallback"],
          useContext: [packageName, "useContext"],
          useDebugValue: [packageName, "useDebugValue"],
          useQuery: [packageName, "useQuery"],
          useMutation: [packageName, "useMutation"],
          Body: [packageName, "Body"],
          Head: [packageName, "Head"],
          Html: [packageName, "Html"],
          Meta: [packageName, "Meta"],
          Title: [packageName, "Title"],
          Router: [resolve(config["route-generator"].component), "default"],
          fetch: [packageName, "fetch"],
          Headers: [packageName, "Headers"],
          Request: [packageName, "Request"],
          Response: [packageName, "Response"],
        },
      ],
    ],
  };
};
