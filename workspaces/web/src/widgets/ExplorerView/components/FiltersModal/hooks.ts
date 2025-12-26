import {useDatabaseInspections} from "../../../../data/queries/dataSources.ts";
import {useMemo} from "react";

export const useGenerateColumnTypes = (dsId: string): Record<string, string> => {
  const { data: inspections } = useDatabaseInspections(dsId);

  return useMemo(() => {
    if (!inspections) return {};

    return inspections.reduce((acc, insp) => {
      insp.columns.forEach((col) => {
        acc[`${insp.tableName}.${col.name}`] = col.type;
      });
      return acc;
    }, {} as Record<string, string>);
  }, [inspections]);
};
