import {EntityManager} from "typeorm";
import {DatabaseTable} from "../../repository/tables/databaseTable";
import {DatabaseColumn} from "../../repository/tables/databaseColumn";

export const cleanupDatasourceInfo = async (entityManager: EntityManager,  dsId: string) => {
  const tables = await entityManager.find(DatabaseTable, {
    where: {
      datasource: {
        id: dsId,
      },
    },
    select: ["id"],
  });

  for (const table of tables) {
    const columnsToDelete = await entityManager.find(DatabaseColumn, {
      where: {
        tableId: table.id,
      },
      select: ["id"],
    });
    await entityManager.remove(DatabaseColumn, columnsToDelete);
    await entityManager.delete(DatabaseTable, table);
  }
};
