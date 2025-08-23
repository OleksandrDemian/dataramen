import {HttpError} from "../../utils/httpError";
import {TCreateDataSource} from "./types";

export const validateCreateDataSource = (dataSource: Partial<TCreateDataSource>) => {
  if (!dataSource.dbUrl) {
    throw new HttpError(400, "url is required");
  }
  if (!dataSource.dbUser) {
    throw new HttpError(400, "user is required");
  }
  if (!dataSource.dbType) {
    throw new HttpError(400, "type is required");
  }
  if (!dataSource.name) {
    throw new HttpError(400, "name is required");
  }
  if (!dataSource.dbDatabase) {
    throw new HttpError(400, "database is required");
  }
}