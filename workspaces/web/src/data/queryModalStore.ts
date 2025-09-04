import {createStore} from "@odemian/react-store";
import {TExplorerTab} from "./openTabsStore.ts";
import {createTableOptions} from "../widgets/ExplorerView/utils.ts";
import {TTableOptions} from "../widgets/ExplorerView/context/TableContext.ts";
import {genSimpleId} from "../utils/id.ts";

export const [useQueryModal, setQueryModal] = createStore<TExplorerTab | undefined>(undefined);

export const openQueryModal = (label: string, opts: Partial<TTableOptions>) => {
  setQueryModal({
    label: label,
    type: "explorer",
    id: genSimpleId(),
    options: createTableOptions(opts),
  });
};

export const closeQueryModal = () => setQueryModal(undefined);
