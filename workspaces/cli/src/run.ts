#!/usr/bin/env node

import { Command } from "commander";
import { Commands } from "./commands";
import {cliPkg} from "./pkgUtils";

const program = new Command();

const app: { command: string; description: string; handler: (...args: string[]) => void }[] = [
  {
    command: "start",
    description: "Start local server, restarts if already running",
    handler: Commands.start,
  },
  {
    command: "logs",
    description: "Listen for logs",
    handler: Commands.logs,
  },
  {
    command: "stop",
    description: "Stop the server",
    handler: Commands.stop,
  },
  {
    command: "open",
    description: "Open webapp",
    handler: Commands.open,
  },
  {
    command: "set <prop> <value>",
    description: "Set env value",
    handler: Commands.setEnvVariable,
  },
  {
    command: "unset <prop>",
    description: "Remove env value",
    handler: Commands.unsetEnvVariable,
  },
];

// App metadata
program
  .name("dataramen")
  .description("A cozy web GUI for MySQL and PostgreSQL - built for developers who like to move fast and stay focused.")
  .version(cliPkg().version, "-v, --version", "Show version");

// Default start dataramen
program
  .command("default", { hidden: true, isDefault: true })
  .action(Commands.start);

// initialize other commands
app.forEach((command) => {
  program
    .command(command.command)
    .description(command.description)
    .action(command.handler);
});

program.parse();
