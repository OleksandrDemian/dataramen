import {createStore} from "@odemian/react-store";
import {TFindQuery} from "@dataramen/types";
import {useNavigate} from "react-router-dom";
import {createTableOptions} from "../widgets/ExplorerView/utils.ts";
import {PAGES} from "../const/pages.ts";
import {useCallback, useEffect} from "react";
import {Analytics} from "../utils/analytics.ts";
import {useCreateWorkbenchTab} from "./queries/workbenchTabs.ts";

type PromiseResult = {
  type: TFindQuery["type"];
  id: string;
  dsId: string;
};

export type TTableSearchModalProps = {
  onConfirm: (type: TFindQuery["type"], id: string, dsId: string) => void;
  onCancel: VoidFunction;
};
export const [useSearchTableModal, updateSearchTableModal, SearchTableModalStore] = createStore<TTableSearchModalProps | undefined>(undefined);

export const searchTable = async (): Promise<PromiseResult | undefined> => {
  return new Promise<PromiseResult | undefined>((resolve) => {
    updateSearchTableModal({
      onCancel: () => {
        updateSearchTableModal(undefined);
        resolve(undefined);
      },
      onConfirm: (type, id, dsId) => {
        updateSearchTableModal(undefined);
        resolve({ dsId, id, type });
      },
    });
  });
};

export const useSearchTable = (eventSource: string) => {
  const navigate = useNavigate();
  const createWorkbenchTab = useCreateWorkbenchTab();

  useEffect(() => {
    if (createWorkbenchTab?.data?.id){
      navigate(`${PAGES.workbench.path}/tab/${createWorkbenchTab.data.id}`)
    }
  }, [createWorkbenchTab.data]);

  return useCallback(() => {
    const isOpened = !!SearchTableModalStore.get();
    if (isOpened) {
      return;
    }

    searchTable().then((searchResult) => {
      if (searchResult?.type === "table") {
        createWorkbenchTab.mutate({
          name: searchResult.id,
          opts: createTableOptions({
            table: searchResult.id,
            dataSourceId: searchResult.dsId,
          }),
        });
      } else if (searchResult?.type === "query") {
        createWorkbenchTab.mutate({
          name: searchResult.id,
          queryId: searchResult.id,
        });
      }
    });

    Analytics.event(`On open query search [${eventSource}]`);
  }, [navigate, eventSource]);
};
