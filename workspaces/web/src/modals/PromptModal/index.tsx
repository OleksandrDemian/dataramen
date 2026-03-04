import {Modal} from "../../widgets/Modal";
import {TPromptModalProps, updatePromptModal, usePromptModal} from "../../data/promptModalStore.ts";
import {ChangeEvent, KeyboardEvent, useEffect, useState} from "react";
import st from "./index.module.css";
import { TQueryExpressionInput } from "@dataramen/types";
import {QueryExpressionInput} from "../../widgets/QueryExpressionInput";
import {RawMode} from "../../widgets/QueryExpressionInput/const.ts";

const StringComponent = ({ data }: { data: TPromptModalProps }) => {
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
      <input autoFocus className="w-full input my-2" value={value} onChange={onChange} onKeyDown={onKeyDown} />
      <div className="flex justify-end gap-2">
        <button className="button tertiary" onClick={data.onCancel}>Cancel</button>
        <button className="button primary" onClick={() => data.onConfirm(value)}>Confirm</button>
      </div>
    </div>
  );
};

const QueryExpressionComponent = ({ data }: { data: TPromptModalProps }) => {
  const [value, setValue] = useState<TQueryExpressionInput>({
    mode: "default",
    value: data.defaultValue || '',
  });

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
      <QueryExpressionInput
        prefix="_"
        autoFocus
        className="w-full my-2 h-8"
        value={value.value}
        mode={value.mode}
        onExpressionChange={setValue}
        allowedModes={RawMode}
        onKeyDown={onKeyDown}
        placeholder="Filter value"
      />
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
      {temp?.type === "string" && (
        <StringComponent data={temp} />
      )}
      {temp?.type === "query-expression" && (
        <QueryExpressionComponent data={temp} />
      )}
    </Modal>
  );
};
