import {matchPath} from "react-router-dom";

type TParamsBase = Record<string, string> | void;
export type TPagePathBuilder <TParams extends TParamsBase> = (props: TParams) => string;
export type TPage<TParams extends TParamsBase> = {
  path: string;
  name: string;
  build: TPagePathBuilder<TParams>;
  check: (path: string) => boolean;
};

function createRoute <TParams extends TParamsBase = void>(name: string, path: string): TPage<TParams> {
  const build: TPagePathBuilder<TParams> = (data) => {
    if (typeof data === "object") {
      let compilePath = path;
      for (const [key, value] of Object.entries(data)) {
        compilePath = compilePath.replace(":" + key, value);
      }
      return compilePath;
    }
    return path;
  };

  const check = (pathname: string): boolean => {
    const matchResult = matchPath(
      {
        path: path,
        end: true,
      },
      pathname
    );

    return !!matchResult;
  };

  return {
    name,
    path,
    build,
    check,
  };
}

function createSimpleRoute (name: string, path: string): TPage<void> {
  return {
    name,
    path,
    build: () => path,
    check: (toMatch: string) => toMatch === path,
  };
}

/* SIMPLE ROUTES */
const home = createSimpleRoute("Home", "/");
const workbench = createSimpleRoute("Workbench", "/workbench");
const share = createSimpleRoute("Share query", "/share");
const login = createSimpleRoute("Login", "/login");

/* COMPLEX ROUTES */
const workbenchTab = createRoute<{ id: string }>(
  "Workbench tab",
  "/workbench/tab/:id",
);

export const PAGES = {
  home,
  workbench,
  share,
  login,
  workbenchTab,
};
