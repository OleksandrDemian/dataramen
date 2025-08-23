#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {Commands} from "./commands";

yargs(hideBin(process.argv))
  .command("start", 'Default command, start/restart the server', Commands.start)
  .command(["logs"], 'Listen for logs', Commands.logs)
  .command("stop", 'Stop the server', Commands.stop)
  .command("open", 'Stop the server', Commands.open)
  .command(["version"], 'Show version', Commands.version)
  .parse();
