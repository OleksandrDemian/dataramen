import CloseIcon from "../../assets/close-outline.svg?react";
import st from "./index.module.css";
import {MouseEventHandler, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import {useNavigate, useParams} from "react-router-dom";
import {useMediaQuery} from "../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../utils/screen.ts";
import {ExplorerTab} from "./ExplorerTab";
import {
  updateCachedWorkbenchTabs,
  useArchiveTab,
  useUpdateWorkbenchTab,
  useWorkbenchTabs
} from "../../data/queries/workbenchTabs.ts";
import {PAGES} from "../../const/pages.ts";
import {tryScrollIntoTab} from "../../utils/scrollIntoElement.ts";
import {TArchiveTabsParams, TGetWorkbenchTabsEntry} from "@dataramen/types";
import {ContextualMenu, TContextMenuRef} from "../../widgets/ContextualMenu";
import {gt} from "../../utils/numbers.ts";
import {prompt} from "../../data/promptModalStore.ts";

const useTabArchiver = () => {
  const { data: workbenchTabs } = useWorkbenchTabs();
  const archiveTab = useArchiveTab();

  const archive = (remTab: string, curTab: string, opts: TArchiveTabsParams = {}): string | undefined | 'home' => {
    // mutate without waiting
    archiveTab.mutate({ tabId: remTab, ...opts });

    const activeTab = workbenchTabs?.find((tab) => tab.id === curTab);
    const removedTab = workbenchTabs?.find((tab) => tab.id === remTab);
    let nextId: string | undefined | 'home';

    if (workbenchTabs && activeTab && removedTab) {
      let finalTabs: TGetWorkbenchTabsEntry[];

      if (opts.all) {
        finalTabs = [];
      } else if (opts.others) {
        finalTabs = workbenchTabs.filter((tab) => tab.id === remTab);
        if (curTab !== remTab) {
          nextId = remTab;
        }
      } else {
        const curIndex = workbenchTabs.findIndex((tab) => tab.id === curTab);
        finalTabs = workbenchTabs.filter((tab) => tab.id !== remTab);
        if (finalTabs.length > curIndex) {
          nextId = finalTabs[curIndex]?.id;
        } else if (finalTabs.length > 0) {
          nextId = finalTabs[finalTabs.length - 1].id;
        }
      }

      updateCachedWorkbenchTabs(() => finalTabs);
      if (finalTabs.length === 0) {
        nextId = 'home';
      }
    }

    return nextId;
  };

  return {
    workbenchTabs: workbenchTabs,
    archive: archive,
  };
};

const useRenameTab = () => {
  const updateWorkbenchTab = useUpdateWorkbenchTab();

  const rename = async (name: string, workbenchId: string) => {
    if (workbenchId) {
      const newName = await prompt("New tab name", name);
      if (newName) {
        await updateWorkbenchTab.mutateAsync({
          id: workbenchId,
          payload: {
            name: newName,
          },
        });
      }
    }

    return Promise.resolve();
  };

  return {
    rename,
  };
};

export const WorkbenchTabPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { workbenchTabs, archive } = useTabArchiver();
  const { rename } = useRenameTab();
  const [currentMenu, setCurrentMenu] = useState<string | undefined>(undefined);

  const menuRef = useRef<TContextMenuRef>(null);

  const isDesktop = useMediaQuery(ScreenQuery.laptop);

  const archiveTabHandler = (tabId: string, params: TArchiveTabsParams = {}) => {
    menuRef.current?.close();
    const nextId = archive(tabId, id || '', params);
    if (nextId) {
      if (nextId === 'home') {
        navigate(PAGES.home.build(), {
          replace: true,
        });
      } else {
        tryScrollIntoTab(nextId);
        navigate(PAGES.workbenchTab.build({ id: nextId }), {
          replace: true,
        });
      }
    }
  };

  const onCloseTab: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const tabId = e.currentTarget.getAttribute("data-tab-id");
    if (tabId) {
      archiveTabHandler(tabId);
    }
  };

  const onOpenTabMenu: MouseEventHandler<HTMLDivElement> = (e) => {
    const tabId = e.currentTarget.getAttribute("data-tab-id");
    if (tabId && menuRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setCurrentMenu(tabId);
      menuRef.current.open(e);
    }
  };

  const onRenameTab = (tabId: string) => {
    const curTab = workbenchTabs?.find((tab) => tab.id === tabId);
    if (curTab) {
      menuRef.current?.close();
      rename(curTab.name, tabId);
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

      {gt(workbenchTabs?.length, 0) && (
        <div className={clsx(st.tabs, "no-scrollbar", !isDesktop && st.mobile)}>
          <ContextualMenu ref={menuRef} onClosed={() => setCurrentMenu(undefined)}>
            {currentMenu && (
              <div className={st.menu}>
                <button className={st.item} onClick={() => onRenameTab(currentMenu)}>Rename</button>
                <button className={st.item} onClick={() => archiveTabHandler(currentMenu)}>Close</button>
                <div className="border-t border-gray-200 my-1" />
                <button className={st.item} onClick={() => archiveTabHandler(currentMenu, { others: true })}>Close other tabs</button>
                <button className={st.item} onClick={() => archiveTabHandler(currentMenu, { all: true })}>Close all tabs</button>
              </div>
            )}
          </ContextualMenu>

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
              onContextMenu={onOpenTabMenu}
            >
              <span className="truncate w-full">{t.name}</span>
              <button data-tab-id={t.id} className={st.closeButton} onClick={onCloseTab}>
                <CloseIcon width={20} height={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
