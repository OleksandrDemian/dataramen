import {useEffect, useRef} from "react";
import {subscribe} from "../services/hotkeys.ts";
import {useSearchTable} from "../data/tableSearchModalStore.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {PAGES} from "../const/pages.ts";
import {OpenTabs} from "../data/openTabsStore.ts";
import {useCurrentUser} from "../data/queries/users.ts";

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

    const openedTabs = OpenTabs.get();
    if (openedTabs.length < 1) {
      searchAndOpen();
    } else if (location.pathname !== PAGES.workbench.path) {
      navigate(PAGES.workbench.path);
    }
  }, "🛠️ Open Workbench");

  useGlobalHotkey("h", () => {
    if (location.pathname !== PAGES.home.path) {
      navigate(PAGES.home.path);
    }
  }, "🏠 Go home");
};
