#!/usr/bin/env node

import {TApp} from "./types/app";
import {createCommanderApp} from "./app.commander";
import {cliPkg} from "./utils/pkgUtils";
import {commandModules, defaultCommand} from "./commands";

const app: TApp = createCommanderApp();
app
  .setMetadata({
    name: "dataramen",
    description: "A cozy web GUI for MySQL and PostgreSQL - built for developers who like to move fast and stay focused.",
    version: cliPkg().version,
  })
  .setDefaultCommand(defaultCommand)
  .setModules(commandModules)
  .start();
