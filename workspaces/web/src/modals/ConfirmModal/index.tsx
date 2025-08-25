import {Modal} from "../../widgets/Modal";
import {TConfirmProps, useConfirmModal} from "../../data/confirmModalStore.ts";
import {useEffect, useState} from "react";

const Component = ({ confirm }: { confirm: TConfirmProps }) => {
  return (
    <div>
      <p>{confirm.message}</p>
      <div className="flex gap-2 justify-end mt-4">
        <button className="button tertiary" onClick={confirm.onCancel}>Cancel</button>
        <button className="button primary" onClick={confirm.onConfirm}>Confirm</button>
      </div>
    </div>
  );
};

export const ConfirmModal = () => {
  const data = useConfirmModal();
  const [temp, setTemp] = useState<TConfirmProps | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setTemp(data);
    }
  }, [data]);

  return (
    <Modal
      isVisible={!!data}
      onClose={() => data?.onCancel()}
      onClosed={() => setTemp(undefined)}
    >
      {temp && (
        <Component confirm={temp} />
      )}
    </Modal>
  );
};
