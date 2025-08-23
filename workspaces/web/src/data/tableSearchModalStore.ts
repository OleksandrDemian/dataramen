import {createStore} from "@odemian/react-store";
import {TFindQuery} from "@dataramen/types";
import {useNavigate} from "react-router-dom";
import {pushNewExplorerTab} from "./openTabsStore.ts";
import {createTableOptions} from "../widgets/ExplorerView/utils.ts";
import {PAGES} from "../const/pages.ts";
import {fetchQueryById} from "./queries/queries.utils.ts";
import {useCallback} from "react";
import {Analytics} from "../utils/analytics.ts";

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

  return useCallback(() => {
    const isOpened = !!SearchTableModalStore.get();
    if (isOpened) {
      return;
    }

    searchTable().then((searchResult) => {
      if (searchResult?.type === "table") {
        pushNewExplorerTab(searchResult.id, createTableOptions({
          table: searchResult.id,
          dataSourceId: searchResult.dsId,
        }), true);

        if (location.pathname !== PAGES.workbench.path) {
          navigate(PAGES.workbench.path);
        }
      } else if (searchResult?.type === "query") {
        fetchQueryById(searchResult.id)
          .then((result) => {
            pushNewExplorerTab(result.name, createTableOptions(result.opts), true);
            if (location.pathname !== PAGES.workbench.path) {
              navigate(PAGES.workbench.path);
            }
          });
      }
    });

    Analytics.event(`On open query search [${eventSource}]`);
  }, [navigate, eventSource]);
};
