import {createStore} from "@odemian/react-store";
import {TFindQuery} from "@dataramen/types";
import {useNavigate} from "react-router-dom";
import {createTableOptions} from "../widgets/ExplorerView/utils.ts";
import {PAGES} from "../const/pages.ts";
import {useCallback} from "react";
import {useCreateWorkbenchTab, useRestoreArchivedTab} from "./queries/workbenchTabs.ts";

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

export const useSearchTable = () => {
  const navigate = useNavigate();
  const createWorkbenchTab = useCreateWorkbenchTab();
  const restoreTab = useRestoreArchivedTab();

  return useCallback(() => {
    const isOpened = !!SearchTableModalStore.get();
    if (isOpened) {
      return;
    }

    searchTable().then((searchResult) => {
      if (searchResult?.type === "table") {
        createWorkbenchTab.mutateAsync({
          name: searchResult.id,
          opts: createTableOptions({
            table: searchResult.id,
            dataSourceId: searchResult.dsId,
          }),
        }).then(result => {
          navigate(PAGES.workbenchTab.build({
            id: result.id
          }));
        });
      } else if (searchResult?.type === "query") {
        createWorkbenchTab.mutateAsync({
          queryId: searchResult.id,
        }).then(result => {
          navigate(PAGES.workbenchTab.build({
            id: result.id
          }));
        });
      } else if (searchResult?.type === "tab") {
        restoreTab.mutate(searchResult.id);
        navigate(PAGES.workbenchTab.build({
          id: searchResult.id
        }));
      }
    });
  }, []);
};
