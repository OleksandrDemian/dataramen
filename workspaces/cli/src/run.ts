#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {Commands} from "./commands";

yargs(hideBin(process.argv))
  .command({
    command: "start",
    describe: "Start local server, restarts if already running",
    handler: Commands.start,
  })
  .command({
    command: "logs",
    describe: "Listen for logs",
    handler: Commands.logs,
  })
  .command({
    command: "stop",
    describe: "Stop the server",
    handler: Commands.stop,
  })
  .command({
    command: "open",
    describe: "Stop the server",
    handler: Commands.open,
  })
  .command({
    command: "set [prop] [value]",
    describe: "Set env value",
    handler: Commands.setEnvVariable,
  })
  .command({
    command: "unset [prop]",
    describe: "Remove env value",
    handler: Commands.unsetEnvVariable,
  })
  .command({
    command: "version",
    describe: "Show version",
    handler: Commands.version,
  })
  .parse();
