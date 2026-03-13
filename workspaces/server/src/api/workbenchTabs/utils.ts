import {WorkbenchTabsRepository} from "../../repository/db";

export const getNextOrderIndex = async (): Promise<number> => {
  const next = await WorkbenchTabsRepository.maximum("orderIndex");
  if (next != null) {
    return next + 1;
  }

  return 0;
};
