import CloseIcon from "../../assets/close-outline.svg?react";
import st from "./index.module.css";
import {MouseEventHandler, useEffect} from "react";
import clsx from "clsx";
import {useNavigate, useParams} from "react-router-dom";
import {useMediaQuery} from "../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../utils/screen.ts";
import {ExplorerTab} from "./ExplorerTab";
import {useArchiveTab, useWorkbenchTabs} from "../../data/queries/workbenchTabs.ts";
import {PAGES} from "../../const/pages.ts";
import {tryScrollIntoTab} from "../../utils/scrollIntoTab.ts";
import { TGetWorkbenchTabsEntry } from "@dataramen/types";

function getNextTabId (currentId: string, tabs: TGetWorkbenchTabsEntry[]): string | undefined {
  // if not tabs or this is last tab, exit
  if (tabs.length < 2) {
    return undefined;
  }

  const index = tabs.findIndex(
    (t) => t.id === currentId
  );

  if (index >= tabs.length - 1) {
    return tabs[index-1].id;
  } else if (index <= tabs.length - 1) {
    return tabs[index+1].id;
  }

  return undefined;
}

export const WorkbenchTabPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data: workbenchTabs } = useWorkbenchTabs();
  console.log(workbenchTabs);
  const archiveTab = useArchiveTab();

  const isDesktop = useMediaQuery(ScreenQuery.laptop);

  const fallbackTab = (tabId: string) => {
    if (tabId === id && workbenchTabs) {
      const nextTab = getNextTabId(tabId, workbenchTabs);
      if (nextTab) {
        tryScrollIntoTab(nextTab);
        return navigate(PAGES.workbenchTab.build({ id: nextTab }));
      }
      return navigate(PAGES.home.build());
    }
  };

  const archiveTabHandler = (tabId: string) => {
    fallbackTab(tabId);
    archiveTab.mutate(tabId);
  };

  const onCloseTab: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const tabId = e.currentTarget.getAttribute("data-tab-id");
    if (tabId) {
      archiveTabHandler(tabId);
    }
  };

  useEffect(() => {
    if (id) {
      tryScrollIntoTab(id);
    }
  }, [id, workbenchTabs]);

  return (
    <div className="h-screen max-h-screen bg-(--bg) flex flex-col">

      {id ? (
        <ExplorerTab id={id} />
      ) : (
        <div className="flex-1" />
      )}

      <div className={clsx(st.tabs, "no-scrollbar", !isDesktop && st.mobile)}>
        {workbenchTabs?.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(PAGES.workbenchTab.build({ id: t.id }))}
            className={clsx(st.tab, t.id === id && st.active)}
            data-tooltip-id="default"
            // DO NOT REMOVE data-tab-id attribute, it is used to scroll into tab
            data-tab-id={t.id}
            data-tooltip-content={t.name}
            onAuxClick={() => archiveTabHandler(t.id)}
          >
            <span className="truncate w-full">{t.name}</span>
            <button data-tab-id={t.id} className={st.closeButton} onClick={onCloseTab}>
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
