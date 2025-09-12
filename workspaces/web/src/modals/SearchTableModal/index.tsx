import {Modal, ModalClose} from "../../widgets/Modal";
import {SearchQuery} from "../../widgets/SearchTable";
import {useSearchTableModal} from "../../data/tableSearchModalStore.ts";

export const SearchTableModal = () => {
  const data = useSearchTableModal();

  const onTable = (table: string, dsId: string) => {
    data?.onConfirm("table", table, dsId);
  };

  const onQuery = (id: string, dsId: string) => {
    data?.onConfirm("query", id, dsId);
  };

  const onClose = () => {
    data?.onCancel();
  };

  return (
    <Modal isVisible={!!data} onClose={onClose}>
      <ModalClose onClick={onClose} />
      <SearchQuery autoFocus onTable={onTable} onQuery={onQuery} />
    </Modal>
  );
};
