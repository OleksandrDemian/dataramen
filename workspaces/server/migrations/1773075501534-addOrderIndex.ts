import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";
import {Tables} from "./utils/migrationUtils";

const orderIndexColumn = new TableColumn({
  name: "orderIndex",
  type: "int",
  isNullable: false,
  default: 0,
});

export class AddOrderIndex1773075501534 implements MigrationInterface {
  name = "AddOrderIndex1773075501534";

  public async up(queryRunner: QueryRunner) {
    await queryRunner.addColumn(Tables.WorkbenchTabs, orderIndexColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(Tables.WorkbenchTabs, orderIndexColumn);
  }
}
