#!/usr/bin/env node
import program from "commander";
import { routeGenerator } from "~/route-generator";
import { packageName } from "~/constants";
import build from "~/build";

program.name("framework").usage("command");

program
  .command("build")
  .description("build project")
  .action(async () => {
    await routeGenerator();
    await build();
    process.exit(process.exitCode);
  });

program
  .command("dev")
  .description("dev project")
  .action(async () => {
    routeGenerator({ watch: true });
  });

program.parse(process.argv);
