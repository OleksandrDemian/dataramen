import {DatabaseColumnRepository, DatabaseTableRepository} from "../../repository/db";

export const cleanupDatasourceInfo = async (dsId: string) => {
  const columnsToDelete = await DatabaseColumnRepository.find({
    where: {
      table: {
        datasource: { id: dsId }
      },
    },
    relations: { table: true }
  });
  await DatabaseColumnRepository.remove(columnsToDelete);

  await DatabaseTableRepository.delete({
    datasource: { id: dsId, },
  });
};
