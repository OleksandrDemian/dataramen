import {ExplorerView} from "../../../widgets/ExplorerView";
import {TExplorerTab, TOpenTab, updateOpenTabs} from "../../../data/openTabsStore.ts";
import {useCallback} from "react";
import {TTableOptions} from "../../../widgets/ExplorerView/context/TableContext.ts";

export const ExplorerTab = ({ tab }: { tab: TExplorerTab }) => {
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

  return (
    <ExplorerView
      updater={updater}
      options={tab.options}
      name={tab.label}
      tabId={tab.id}
    />
  );
};
