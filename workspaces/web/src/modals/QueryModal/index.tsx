import {closeQueryModal, setQueryModal, useQueryModal} from "../../data/queryModalStore.ts";
import {Modal, ModalClose} from "../../widgets/Modal";
import {ExplorerView} from "../../widgets/ExplorerView";
import {useCallback} from "react";
import {TTableOptions} from "../../widgets/ExplorerView/context/TableContext.ts";
import toast from "react-hot-toast";

export const QueryModal = () => {
  const queryModal = useQueryModal();

  const updater = useCallback((fn: (opts: TTableOptions) => TTableOptions) => {
    setQueryModal((store) => {
      if (!store) {
        toast.error("Something went wrong.");
        return store;
      }

      return {
        ...store,
        options: fn(store.options),
      };
    });
  }, []);

  if (!queryModal) {
    return null;
  }

  return (
    <Modal isVisible onClose={closeQueryModal}>
      <ModalClose onClick={closeQueryModal} />
      <div className="border border-gray-200 bg-(--bg) flex flex-col">
        <ExplorerView name={queryModal.label} options={queryModal.options} updater={updater} />
      </div>
    </Modal>
  )
};
