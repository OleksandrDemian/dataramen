import {displayValue, useValueDisplay} from "../../data/valueDisplayStore.ts";
import {Modal} from "../../widgets/Modal";
import st from "./index.module.css";
import toast from "react-hot-toast";

export const ValueDisplayModal = () => {
  const value = useValueDisplay();

  const onCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value.toString());
      toast.success("Copied!");
    }
  };

  const onClose = () => displayValue(undefined);

  return (
    <Modal isVisible={!!value} onClose={onClose} backdropClose>
      <textarea className={st.textarea} readOnly defaultValue={value?.toString()}></textarea>
      <div className="mt-2 flex gap-1 justify-end">
        <button className="button primary" onClick={onCopy}>Copy</button>
        <button className="button tertiary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};
