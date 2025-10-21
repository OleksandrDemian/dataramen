import CloseIcon from "../../assets/close-outline.svg?react";
import st from "./index.module.css";
import {MouseEventHandler} from "react";
import clsx from "clsx";
import {useNavigate, useParams} from "react-router-dom";
import {useMediaQuery} from "../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../utils/screen.ts";
import {ExplorerTab} from "./ExplorerTab";
import {useArchiveTab, useWorkbenchTabs} from "../../data/queries/workbenchTabs.ts";
import {PAGES} from "../../const/pages.ts";

// const renderTooltip: ITooltip["render"] = ({
//  content,
//  activeAnchor,
// }) => {
//   if (!activeAnchor) return null;
//
//   // Access custom data attribute
//   const tabId = activeAnchor.getAttribute("data-tab-id");
//   const tab = OpenTabs.get().find((t) => t.id === tabId);
//   const dataSource = getDataSource(tab?.options.dataSourceId);
//
//   if (!tab) {
//     return content;
//   }
//
//   const onRename = () => {
//     prompt("New tab name", tab.label)
//       .then((name) => {
//         if (name) {
//           renameTab(tab.id, name);
//         }
//       });
//   };
//
//   return (
//     <div>
//       <button className={st.tooltipLabel} onClick={onRename}>
//         <div className="overflow-hidden">
//           <p className="text-xs">label</p>
//           <p className="truncate font-semibold">{tab.label}</p>
//         </div>
//         <span>✏️</span>
//       </button>
//
//       <div className={st.tooltipInfoEntry}>
//         <p className="text-sm">table</p>
//         <p className="truncate font-semibold">{tab.options.table}</p>
//       </div>
//
//       {dataSource && (
//         <div className={st.tooltipInfoEntry}>
//           <p className="text-sm">data source [{dataSource.dbType}]</p>
//           <p className="truncate font-semibold">{dataSource.name}</p>
//         </div>
//       )}
//
//       {tab.options.joins.length > 0 && (
//         <div className={st.tooltipInfoEntry}>
//           <p className="text-sm">joins</p>
//           <p className="truncate font-semibold">{tab.options.joins.map((j) => j.table).join(", ")}</p>
//         </div>
//       )}
//
//       {tab.options.filters.length > 0 && (
//         <div className={st.tooltipInfoEntry}>
//           <p className="text-sm">filters</p>
//           {tab.options.filters.map((f) => (
//             <p className="truncate font-semibold">{filterToString((f))}</p>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

export const WorkbenchPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workbenchTabs } = useWorkbenchTabs();
  const archiveTab = useArchiveTab();

  const isDesktop = useMediaQuery(ScreenQuery.laptop);

  const onCloseTab: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const tabId = e.currentTarget.getAttribute("data-tab-id");
    if (tabId) {
      // todo: change tab after current tab is archived
      archiveTab.mutate(tabId);
    }
  };

  const onAuxTabClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button === 1) {
      // todo: change tab after current tab is archived
      archiveTab.mutate(event.currentTarget.dataset.tabId as string);
    }
  };

  const onRenameTab = (tabId: string) => {
    console.log("TODO", tabId); // todo
    // const curTab = openTabs.find(t => t.id === tabId);
    // prompt("New tab name", curTab?.label)
    //   .then((name) => {
    //     if (name) {
    //       renameTab(tabId, name);
    //     }
    //   });
  };

  return (
    <div className="h-screen max-h-screen bg-(--bg) flex flex-col">

      {id && (
        <ExplorerTab id={id} />
      )}

      <div className={clsx(st.tabs, "no-scrollbar", !isDesktop && st.mobile)}>
        {workbenchTabs?.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`${PAGES.workbench.path}/tab/${t.id}`)}
            className={clsx(st.tab, t.id === id && st.active)}
            data-tab-id={t.id}
            data-tooltip-id="tab"
            data-tooltip-content={t.name}
            onAuxClick={onAuxTabClick}
            onContextMenu={(e) => {
              e.preventDefault();
              onRenameTab(t.id);
            }}
          >
            <span className="truncate w-full">📄 {t.name}</span>
            <button data-tab-id={t.id} className={st.closeButton} onClick={onCloseTab}>
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
