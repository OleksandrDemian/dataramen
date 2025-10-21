import {ExplorerView} from "../../../widgets/ExplorerView";
import {useCallback} from "react";
import {useWorkbenchTab} from "../../../data/queries/workbenchTabs.ts";
import {queryClient} from "../../../data/queryClient.ts";
import {IWorkbenchTab, TExecuteQuery} from "@dataramen/types";
import {Spinner} from "../../../widgets/Spinner";

export const ExplorerTab = ({ id }: { id: string }) => {
  const { data: tab } = useWorkbenchTab(id);
  const updater = useCallback((fn: (opts: TExecuteQuery) => TExecuteQuery) => {
    if (!tab) {
      return;
    }

    const options = fn(tab.opts);
    queryClient.setQueryData<IWorkbenchTab>(["workbench-tabs", tab.id], {
      ...tab,
      opts: {
        ...tab.opts,
        ...options,
      },
    });
  }, [tab]);

  if (!tab) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ExplorerView
      updater={updater}
      options={tab.opts}
      name={tab.name}
      tabId={tab.id}
    />
  );
};
