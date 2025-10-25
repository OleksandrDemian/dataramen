import {useEffect, useRef} from "react";
import {subscribe} from "../services/hotkeys.ts";
import {useSearchTable} from "../data/tableSearchModalStore.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {PAGES} from "../const/pages.ts";
import {useCurrentUser} from "../data/queries/users.ts";
import {useWorkbenchTabs} from "../data/queries/workbenchTabs.ts";

export function useGlobalHotkey(key: string, callback: VoidFunction, label?: string) {
  const cbRef = useRef({ callback, label });
  cbRef.current.callback = callback;

  useEffect(() => {
    return subscribe(key, () => {
      cbRef.current.callback();
    }, cbRef.current.label);
  }, [key]);
}

export const useSetupGlobalListeners = () => {
  const searchAndOpen = useSearchTable("Hotkey");
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const { data: tabs } = useWorkbenchTabs();

  useGlobalHotkey("n", () => {
    if (!user) {
      return;
    }

    searchAndOpen();
  }, "📖 New query");

  useGlobalHotkey("w", () => {
    if (!user) {
      return;
    }

    if (tabs && tabs.length > 0) {
      navigate(`${PAGES.workbench.path}/tab/${tabs[0].id}`);
    } else {
      searchAndOpen();
    }
  }, "🛠️ Open Workbench");

  useGlobalHotkey("h", () => {
    if (location.pathname !== PAGES.home.path) {
      navigate(PAGES.home.path);
    }
  }, "🏠 Go home");
};
