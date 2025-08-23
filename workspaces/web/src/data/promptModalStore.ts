import {createStore} from "@odemian/react-store";
import {AlertProps} from "../widgets/Alert";

export type TPromptModalProps = {
  message: string;
  defaultValue?: string;
  alert?: {
    type: AlertProps["variant"];
    message: string;
  };
  onConfirm: (value: string) => void;
  onCancel: VoidFunction;
};
export const [usePromptModal, updatePromptModal] = createStore<TPromptModalProps | undefined>(undefined);

export const prompt = async (message: string, defaultValue?: string, alert?: TPromptModalProps["alert"]): Promise<string | undefined> => {
  return new Promise<string | undefined>((resolve) => {
    updatePromptModal({
      message,
      defaultValue,
      alert,
      onCancel: () => {
        updatePromptModal(undefined);
        resolve(undefined);
      },
      onConfirm: (value) => {
        updatePromptModal(undefined);
        resolve(value);
      },
    });
  });
};