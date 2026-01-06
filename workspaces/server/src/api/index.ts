import {TRouter} from "../utils/createRouter";
import {FastifyInstance} from "fastify";
import auth from "./auth/router";
import dataSources from "./dataSources/router";
import project from "./project/router";
import queries from "./queries/router";
import runner from "./runner/router";
import status from "./status/router";
import teams from "./teams/router";
import users from "./users/router";
import userSettings from "./userSettings/router";
import savedQueries from "./saved-queries/router";
import workbenchTabs from "./workbenchTabs/router";
import client from "./client/router";
import setup from "./setup/router";

const routes: ([TRouter, string])[] = [
  [client, `/`],

  [auth, `/api/auth`],
  [dataSources, `/api/data-sources`],
  [project, `/api/project`],
  [queries, `/api/queries`],
  [runner, `/api/runner`],
  [status, `/api/status`],
  [teams, `/api/teams`],
  [users, `/api/users`],
  [userSettings, `/api/user-settings`],
  [savedQueries, `/api/saved-queries`],
  [workbenchTabs, `/api/workbench-tabs`],
  [setup, `/api/setup`],
];

export const initRoutes = (server: FastifyInstance) => {
  for (const [fn, prefix] of routes) {
    server.register(fn, { prefix });
    console.log("Registered " + prefix);
  }
};
