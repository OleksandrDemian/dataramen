import {matchPath, useLocation} from "react-router-dom";
import {useMemo} from "react";
import {PAGES} from "../const/pages.ts";

export const useWorkbenchTabId = (): string | undefined => {
  const { pathname } = useLocation();
  return useMemo(() => {
    const match = matchPath(
      {
        path: `${PAGES.workbench.path}/tab/:id`,
        end: false, // or true if you want an exact match
      },
      pathname
    );

    return match?.params.id;
  }, [pathname]);
};
