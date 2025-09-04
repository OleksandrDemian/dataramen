import CloseIcon from "../../assets/close-outline.svg?react";
import st from "./index.module.css";
import {
  OpenTabs,
  removeTab,
  renameTab,
  setActiveTab, TOpenTab, updateOpenTabs,
  useActiveTab,
  useOpenTabs
} from "../../data/openTabsStore.ts";
import {MouseEventHandler, useCallback, useMemo} from "react";
import clsx from "clsx";
import {ExplorerView} from "../../widgets/ExplorerView";
import {prompt} from "../../data/promptModalStore.ts";
import {Link, Navigate} from "react-router-dom";
import {TTableOptions} from "../../widgets/ExplorerView/context/TableContext.ts";
import {ITooltip, Tooltip} from "react-tooltip";
import {getDataSource} from "../../data/queries/dataSource.utils.ts";
import {filterToString} from "../../utils/sql.ts";
import {useMediaQuery} from "../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../utils/screen.ts";
import {toggleShowQuerySidebar} from "../../data/showQuerySidebarStore.ts";
import {toggleSidebarMenu} from "../../data/showSidebarMenuStore.ts";

const renderTooltip: ITooltip["render"] = ({
 content,
 activeAnchor,
}) => {
  if (!activeAnchor) return null;

  // Access custom data attribute
  const tabId = activeAnchor.getAttribute("data-tab-id");
  const tab = OpenTabs.get().find((t) => t.id === tabId);
  const dataSource = getDataSource(tab?.options.dataSourceId);

  if (!tab) {
    return content;
  }

  const onRename = () => {
    prompt("New tab name", tab.label)
      .then((name) => {
        if (name) {
          renameTab(tab.id, name);
        }
      });
  };

  return (
    <div>
      <button className={st.tooltipLabel} onClick={onRename}>
        <div className="overflow-hidden">
          <p className="text-xs">label</p>
          <p className="truncate font-semibold">{tab.label}</p>
        </div>
        <span>✏️</span>
      </button>

      <div className={st.tooltipInfoEntry}>
        <p className="text-sm">table</p>
        <p className="truncate font-semibold">{tab.options.table}</p>
      </div>

      {dataSource && (
        <div className={st.tooltipInfoEntry}>
          <p className="text-sm">data source [{dataSource.dbType}]</p>
          <p className="truncate font-semibold">{dataSource.name}</p>
        </div>
      )}

      {tab.options.joins.length > 0 && (
        <div className={st.tooltipInfoEntry}>
          <p className="text-sm">joins</p>
          <p className="truncate font-semibold">{tab.options.joins.map((j) => j.table).join(", ")}</p>
        </div>
      )}

      {tab.options.filters.length > 0 && (
        <div className={st.tooltipInfoEntry}>
          <p className="text-sm">filters</p>
          {tab.options.filters.map((f) => (
            <p className="truncate font-semibold">{filterToString((f))}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export const WorkbenchPage = () => {
  const activeTab = useActiveTab();
  const openTabs = useOpenTabs();
  const isDesktop = useMediaQuery(ScreenQuery.laptop);

  const tab = useMemo(() => {
    if (!openTabs) {
      return undefined;
    }

    const tab = openTabs.find(t => t.id === activeTab);
    if (tab) {
      return tab;
    }

    return openTabs[0];
  }, [activeTab, openTabs]);

  const onClose = (tabId: string) => removeTab(tabId);

  const onAuxTabClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button === 1) {
      removeTab(event.currentTarget.dataset.tabId as string);
    }
  };

  const onRenameTab = (tabId: string) => {
    const curTab = openTabs.find(t => t.id === tabId);
    prompt("New tab name", curTab?.label)
      .then((name) => {
        if (name) {
          renameTab(tabId, name);
        }
      });
  };

  const updater = useCallback((fn: (opts: TTableOptions) => TTableOptions) => {
    updateOpenTabs((store) => store.map((t) => {
      if (t.id !== tab!.id) {
        return t;
      }

      return {
        ...t,
        options: fn(t.options as TTableOptions),
      } as TOpenTab;
    }));
  }, [tab]);

  if (openTabs.length < 1) {
    return <Navigate to="/" />;
  }

  return (
    <div className="h-screen max-h-screen bg-(--bg) flex flex-col">
      {isDesktop && (
        <Tooltip id="tab" render={renderTooltip} className="z-10 shadow-md border border-blue-400 p-0!" offset={-4} noArrow opacity={1} variant="light" clickable delayShow={500} />
      )}

      <div className={clsx(st.tabs, "no-scrollbar")}>
        {openTabs?.map((t) => (
          <div
            key={t.id}
            className={clsx(st.tab, t.id === tab?.id && st.active)}
            data-tab-id={t.id}
            data-tooltip-id="tab"
            data-tooltip-content={t.label}
            onAuxClick={onAuxTabClick}
            onContextMenu={(e) => {
              e.preventDefault();
              onRenameTab(t.id);
            }}
          >
            <button className="cursor-pointer truncate w-full" onClick={() => setActiveTab(t.id)}>📄 {t.label}</button>
            <button className={st.closeButton} onClick={() => onClose(t.id)}>
              <CloseIcon width={20} height={20} />
            </button>
            {t.id === tab?.id && (
              <span className={st.activeTab} />
            )}
          </div>
        ))}
      </div>

      {tab && (
        <ExplorerView
          updater={updater}
          options={tab.options}
          name={tab.label}
          tabId={tab.id}
        />
      )}

      {!isDesktop && (
        <div className="fixed bottom-0 left-0 right-0 p-2 flex justify-end gap-2">
          <Link to="/">
            <button className={st.mobileButton}>🏠</button>
          </Link>
          <button onClick={toggleShowQuerySidebar} className={st.mobileButton}>✏️</button>
          <button onClick={toggleSidebarMenu} className={st.mobileButton}>☰</button>
        </div>
      )}
    </div>
  );
};
