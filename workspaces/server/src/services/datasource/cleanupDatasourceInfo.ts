import {EntityManager} from "typeorm";
import {DatabaseTable} from "../../repository/tables/databaseTable";
import {DatabaseColumn} from "../../repository/tables/databaseColumn";
import {Query} from "../../repository/tables/query";
import {SavedQuery} from "../../repository/tables/savedQuery";

export const cleanupDataSourceQueries = async (entityManager: EntityManager,  dsId: string) => {
  await entityManager.createQueryBuilder()
    .delete()
    .from(SavedQuery)
    .where(`queryId IN (
      SELECT id
      FROM query
      WHERE dataSourceId = :dataSourceId
     )`)
    .setParameter("dataSourceId", dsId)
    .execute();

  await entityManager.delete(Query, {
    dataSource: {
      id: dsId,
    },
  });
};

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
    await entityManager.delete(DatabaseColumn, {
      table: {
        id: table.id,
      }
    });
    await entityManager.delete(DatabaseTable, table);
  }
};
