import {Modal} from "../Modal";
import {TPromptModalProps, updatePromptModal, usePromptModal} from "../../data/promptModalStore.ts";
import {ChangeEvent, KeyboardEvent, useEffect, useState} from "react";
import st from "./index.module.css";
import {Alert} from "../Alert";

const Component = ({ data }: { data: TPromptModalProps }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (data.defaultValue) {
      setValue(data.defaultValue);
    }
  }, [data]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      data.onConfirm(value);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      data.onCancel();
    }
  }

  return (
    <div className={st.root}>
      <h2 className="text-xl font-semibold">{data.message}</h2>
      {data.alert && (
        <Alert variant={data.alert.type} className="mt-2">
          {data.alert.message}
        </Alert>
      )}
      <input autoFocus className="w-full input my-2" value={value} onChange={onChange} onKeyDown={onKeyDown} />
      <div className="flex justify-end gap-2">
        <button className="button tertiary" onClick={data.onCancel}>Cancel</button>
        <button className="button primary" onClick={() => data.onConfirm(value)}>Confirm</button>
      </div>
    </div>
  );
};

export const PromptModal = () => {
  const data = usePromptModal();
  const [temp, setTemp] = useState<TPromptModalProps | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setTemp(data);
    }
  }, [data]);

  return (
    <Modal
      isVisible={!!data}
      onClose={() => updatePromptModal(undefined)}
      onClosed={() => setTemp(undefined)}
    >
      {temp && (
        <Component data={temp} />
      )}
    </Modal>
  );
};
