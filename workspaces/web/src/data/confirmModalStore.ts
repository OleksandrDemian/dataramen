import {createStore} from "@odemian/react-store";

export type TConfirmProps = { message: string; onConfirm: VoidFunction; onCancel: VoidFunction };
export const [useConfirmModal, updateConfirmModal] = createStore<TConfirmProps | undefined>(undefined);

export const confirm = async (message: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    updateConfirmModal({
      message,
      onCancel: () => {
        resolve(false);
        updateConfirmModal(undefined);
      },
      onConfirm: () => {
        resolve(true);
        updateConfirmModal(undefined);
      },
    });
  });
};
