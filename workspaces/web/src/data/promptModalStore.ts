import {createStore} from "@odemian/react-store";
import { TQueryExpressionInput } from "@dataramen/types";

export type TPromptModalProps = {
  message: string;
  defaultValue?: string;
  onConfirm: (value: string | TQueryExpressionInput) => void;
  onCancel: VoidFunction;
  type: 'string' | 'query-expression';
};
export const [usePromptModal, updatePromptModal] = createStore<TPromptModalProps | undefined>(undefined);

export const prompt = async (message: string, defaultValue?: string): Promise<string | undefined> => {
  return new Promise<string | undefined>((resolve) => {
    updatePromptModal({
      message,
      defaultValue,
      onCancel: () => {
        updatePromptModal(undefined);
        resolve(undefined);
      },
      onConfirm: (value) => {
        updatePromptModal(undefined);
        resolve(value as string);
      },
      type: 'string',
    });
  });
};

export const queryExpressionPrompt = async (message: string, defaultValue?: string): Promise<TQueryExpressionInput | undefined> => {
  return new Promise<TQueryExpressionInput | undefined>((resolve) => {
    updatePromptModal({
      message,
      defaultValue,
      onCancel: () => {
        updatePromptModal(undefined);
        resolve(undefined);
      },
      onConfirm: (value) => {
        updatePromptModal(undefined);
        resolve(value as TQueryExpressionInput);
      },
      type: 'query-expression',
    });
  });
};
