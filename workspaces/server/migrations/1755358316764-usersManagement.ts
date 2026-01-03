import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";
import {Tables} from "./utils/migrationUtils";

export class UsersManagement1755358316764 implements MigrationInterface {
  name = "UsersManagement1755358316764";

  public async up(queryRunner: QueryRunner) {
    await queryRunner.addColumns(Tables.Users, [
      new TableColumn({
        name: "username",
        type: "varchar",
        isUnique: true,
      }),
      new TableColumn({
        name: "password",
        type: "varchar",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(Tables.Users, ["username", "password"]);
  }
}
