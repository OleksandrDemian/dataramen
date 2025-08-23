import st from "./index.module.css";
import {MouseEventHandler} from "react";
import {removeTab, setActiveTab, useOpenTabs} from "../../data/openTabsStore.ts";
import {PAGES} from "../../const/pages.ts";
import {useNavigate} from "react-router-dom";
import {Analytics} from "../../utils/analytics.ts";

export const WorkbenchTabs = () => {
  const openTabs = useOpenTabs();
  const navigate = useNavigate();

  const onOpenTab: MouseEventHandler<HTMLButtonElement> = (event) => {
    setActiveTab(event.currentTarget.dataset.tabId as string);
    navigate(PAGES.workbench.path);
    Analytics.event("On open workbench tab [Home]");
  };

  const onAuxTabClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (event.button === 1) {
      removeTab(event.currentTarget.dataset.tabId as string);
    }
  };

  const onOpenWorkbench = () => {
    navigate(PAGES.workbench.path);
    Analytics.event("On open workbench [Home]");
  };

  return (
    <div className="mt-4 card-white">
      <h2 className="font-semibold text-xl flex justify-between items-center">
        <span>🛠️ Workbench</span>
        <button className="hotkey" onClick={onOpenWorkbench}>W</button>
      </h2>
      <p className="text-sm text-gray-700">Continue your work from where you left.</p>

      <div className="flex gap-1 mt-4 flex-wrap">
        {openTabs.map((tab) => (
          <button
            key={tab.id}
            className={st.tab}
            onClick={onOpenTab}
            data-tab-id={tab.id}
            onAuxClick={onAuxTabClick}
            data-tooltip-id="default"
            data-tooltip-content={tab.label}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
