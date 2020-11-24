import { cosmiconfig, cosmiconfigSync } from "cosmiconfig";
import type { CosmiconfigResult } from "cosmiconfig/dist/types";
import { basename } from "path";
import { packageName } from "#constants";
import type * as variables from "#variables";
import { defaultOptions as defaultRouteGeneratorConfig, Options as RouteGeneratorConfig } from "#route-generator";

export type Config = {
  "route-generator": Required<RouteGeneratorConfig>;
  variables: Partial<typeof variables>;
  filepath: string;
};

const moduleName = basename(packageName);

function merge<T, U>(target: T, source: U): T & U {
  const obj = Object.assign(Object.create(null), target);
  for (const [key, value] of Object.entries(source ?? {})) {
    obj[key] ??= value;
  }
  return obj;
}

function config(cosmiconfigResult: CosmiconfigResult) {
  const config: Config = { ...cosmiconfigResult?.config };
  config["route-generator"] = merge(defaultRouteGeneratorConfig, config["route-generator"]);
  config.variables ??= {};
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
