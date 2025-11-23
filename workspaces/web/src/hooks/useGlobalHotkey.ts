import {useSearchTable} from "../data/tableSearchModalStore.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {PAGES} from "../const/pages.ts";
import {useCurrentUser} from "../data/queries/users.ts";
import {useWorkbenchTabs} from "../data/queries/workbenchTabs.ts";
import {useHotkeys} from "react-hotkeys-hook";
import {updateShowTabsHistory} from "../data/showTabsHistorySidebarStore.ts";

export const useSetupGlobalListeners = () => {
  const searchAndOpen = useSearchTable("Hotkey");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const { data: tabs } = useWorkbenchTabs();

  const isHome = pathname === PAGES.home.path;

  useHotkeys("n", () => {
    if (!user) {
      return;
    }

    searchAndOpen();
  });

  useHotkeys("w", () => {
    if (!user) {
      return;
    }

    if (tabs && tabs.length > 0) {
      navigate(`${PAGES.workbench.path}/tab/${tabs[0].id}`);
    } else {
      searchAndOpen();
    }
  }, { enabled: isHome });

  useHotkeys("h", () => {
    updateShowTabsHistory({ show: true });
  });
};
