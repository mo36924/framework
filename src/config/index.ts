import { packageName } from "~/constants";
import type { DeepPartial } from "~/types";
import { cosmiconfig, cosmiconfigSync } from "cosmiconfig";
import type { CosmiconfigResult } from "cosmiconfig/dist/types";
import { basename } from "path";

const defaultConfig = {
  filepath: "package.json",
  node: {
    entry: "node/index.ts",
    outDir: "dist/node",
  },
  browser: {
    entry: "browser/index.ts",
    outDir: "dist/browser",
  },
  variables: {},
  "route-generator": {
    watch: !!process.env.NODE_ENV,
    routeDir: "routes",
    component: "components/Router.tsx",
    template: "components/Router.txt",
    include: ["**/*.tsx"],
    exclude: ["**/*.(test|spec).tsx", "**/__tests__/**"],
  },
};

export type Config = typeof defaultConfig;
export type PartialConfig = DeepPartial<Config>;

const moduleName = basename(packageName);

export function mergeConfig<T>(target: T, source: any = {}): T {
  const ret: any = {};
  for (const [key, value] of Object.entries(target)) {
    if (typeof value === "object") {
      ret[key] = { ...value, ...source[key] };
    } else {
      ret[key] = source[key] ?? value;
    }
  }
  return ret;
}

function config(cosmiconfigResult: CosmiconfigResult) {
  const config: Config = mergeConfig(defaultConfig, cosmiconfigResult?.config);
  config.filepath = cosmiconfigResult?.filepath ?? "";
  return config;
}

export async function getConfig() {
  const result = await cosmiconfig(moduleName).search();
  return config(result);
}

export function getConfigSync() {
  const result = cosmiconfigSync(moduleName).search();
  return config(result);
}

export function clearCaches() {
  cosmiconfig(moduleName).clearCaches();
}
