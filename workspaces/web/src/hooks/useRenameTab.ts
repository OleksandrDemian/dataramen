import {useWorkbenchTabId} from "./useWorkbenchTabId.ts";
import {prompt} from "../data/promptModalStore.ts";
import {useUpdateWorkbenchTab} from "../data/queries/workbenchTabs.ts";

export const useRenameTab = () => {
  const workbenchId = useWorkbenchTabId();
  const updateWorkbenchTab = useUpdateWorkbenchTab()

  const rename = async (name: string) => {
    if (workbenchId) {
      const newName = await prompt("New tab name", name);
      if (newName) {
        await updateWorkbenchTab.mutateAsync({
          id: workbenchId,
          payload: {
            name: newName,
          },
        });
      }
    }

    return Promise.resolve();
  };

  return {
    rename,
  };
}