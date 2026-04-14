import {closeDisplayValue, useValueDisplay} from "../../data/valueDisplayStore.ts";
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

  return (
    <Modal isVisible={!!value} onClose={closeDisplayValue} backdropClose>
      <textarea className={st.textarea} readOnly defaultValue={value?.toString()}></textarea>
      <div className="mt-2 flex gap-1 justify-end">
        <button className="button primary" onClick={onCopy}>Copy</button>
        <button className="button tertiary" onClick={closeDisplayValue}>Close</button>
      </div>
    </Modal>
  );
};
