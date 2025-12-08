#!/usr/bin/env node

import { Command } from "commander";
import {cliPkg} from "./utils/pkgUtils";
import start from "./commands/start";
import {commandsList} from "./commands";

const program = new Command();

// App metadata
program
  .name("dataramen")
  .description("A cozy web GUI for MySQL and PostgreSQL - built for developers who like to move fast and stay focused.")
  .version(cliPkg().version, "-v, --version", "Show version");

// Default start dataramen
program
  .command("default", { hidden: true, isDefault: true })
  .action(start.handler);

// initialize other commands
commandsList.forEach((command) => {
  program
    .command(command.command)
    .description(command.description)
    .action(command.handler);
});

program.parse();
