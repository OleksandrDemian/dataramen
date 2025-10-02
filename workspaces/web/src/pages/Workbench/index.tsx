import CloseIcon from "../../assets/close-outline.svg?react";
import st from "./index.module.css";
import {
  OpenTabs,
  removeTab,
  renameTab,
  setActiveTab,
  useActiveTab,
  useOpenTabs
} from "../../data/openTabsStore.ts";
import {MouseEventHandler, useMemo} from "react";
import clsx from "clsx";
import {prompt} from "../../data/promptModalStore.ts";
import {Navigate} from "react-router-dom";
import {ITooltip, Tooltip} from "react-tooltip";
import {getDataSource} from "../../data/queries/dataSource.utils.ts";
import {filterToString} from "../../utils/sql.ts";
import {useMediaQuery} from "../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../utils/screen.ts";
import {ExplorerTab} from "./ExplorerTab";

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

  const onCloseTab: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const tabId = e.currentTarget.getAttribute("data-tab-id");
    if (tabId) {
      removeTab(tabId);
    }
  };

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

  if (openTabs.length < 1) {
    return <Navigate to="/" />;
  }

  return (
    <div className="h-screen max-h-screen bg-(--bg) flex flex-col">
      {isDesktop && (
        <Tooltip id="tab" render={renderTooltip} className="z-10 shadow-md p-0!" offset={-1} noArrow opacity={1} variant="light" clickable delayShow={500} />
      )}

      {tab && (
        <ExplorerTab tab={tab} />
      )}

      <div className={clsx(st.tabs, "no-scrollbar", !isDesktop && st.mobile)}>
        {openTabs?.map((t) => (
          <div
            key={t.id}
            onClick={() => setActiveTab(t.id)}
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
            <span className="truncate w-full">📄 {t.label}</span>
            <button data-tab-id={t.id} className={st.closeButton} onClick={onCloseTab}>
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
