import {TDatabaseInspection} from "../types/dataSources.ts";
import {THook} from "../types/hooks.ts";
import {useQuery} from "react-query";
import {QUERY_DATASOURCE_KEY} from "../keysConst.ts";
import {queryClient} from "../queryClient.ts";
import {apiClient} from "../clients.ts";

function generateHooks (inspections: TDatabaseInspection[]): THook[] {
  const hooks: THook[] = [];

  for (const inspection of inspections) {
    for (const col of inspection.columns) {
      if (col.ref) {
        hooks.push({
          id: `${inspection.tableName}->${col.ref.table}.${col.ref.field}`,
          name: `${inspection.tableName} in ${col.ref.table}`,
          where: `${inspection.tableName}.${col.name} = ${col.ref.table}.${col.ref.field}`,
          on: {
            fromTable: col.ref.table,
            toTable: inspection.tableName,
            fromColumn: col.ref.field,
            toColumn: col.name,
          },
        });

        hooks.push({
          id: `${col.ref.table}->${inspection.tableName}.${col.name}`,
          name: `${col.ref.table} in ${inspection.tableName}`,
          where: `${col.ref.table}.${col.ref.field} = ${inspection.tableName}.${col.name}`,
          on: {
            fromTable: inspection.tableName,
            toTable: col.ref.table,
            fromColumn: col.name,
            toColumn: col.ref.field,
          },
        });
      }
    }
  }

  return hooks;
}

export const useHooks = (dataSourceId?: string) => {
  return useQuery({
    queryKey: ["hooks", dataSourceId],
    queryFn: async () => {
      const data = await queryClient.fetchQuery({
        queryKey: [QUERY_DATASOURCE_KEY, dataSourceId, "inspections"], // same query key as dataSources.useDatabaseInspections
        queryFn: async () => {
          const {data} = await apiClient.get<{ data: TDatabaseInspection[] }>(`/data-sources/${dataSourceId}/inspections`);
          return data.data;
        },
      });

      return generateHooks(data);
    },
    enabled: !!dataSourceId,
  });
};
