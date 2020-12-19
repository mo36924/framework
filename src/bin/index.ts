#!/usr/bin/env node
import program from "commander";
import { routeGenerator } from "~/route-generator";
import { packageName } from "~/constants";
import build from "~/build";

program
  .name(packageName)
  .usage("[options]")
  .option("-b, --build", "build project")
  .option("-d, --dev", "development mode")
  .parse(process.argv);

(async () => {
  if (program.build) {
    await routeGenerator();
    await build();
    return;
  }
  if (program.dev) {
    routeGenerator({ watch: true });
    return;
  }
})();
