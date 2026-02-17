import { IDataSource } from "@dataramen/types";
import {useEffect, useRef} from "react";
import {invalidateDatabaseInspections} from "../../data/queries/dataSources.ts";

export const useRefetchInspectionGuard = (data: IDataSource | undefined) => {
  const ref = useRef(false);

  useEffect(() => {
    if (data) {
      if (data.status === "INSPECTING") {
        ref.current = true;
      } else if (data.status === "READY" && ref.current) {
        invalidateDatabaseInspections(data.id);
        ref.current = false;
      }
    }
  }, [data]);
};
