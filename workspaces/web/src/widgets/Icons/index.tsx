import MySqlIcon from "../../assets/mysql.svg?react";
import PgIcon from "../../assets/pgsql.svg?react";
import TwitterIcon from "../../assets/twitter.svg?react";

export type TDataSourceIconProps = {
  size: number;
  type: string;
};
export const DataSourceIcon = ({ size, type }: TDataSourceIconProps) => {
  if (type === "mysql") {
    return <MySqlIcon width={size} height={size} />
  }

  return <PgIcon width={size} height={size} />;
}

export {
  TwitterIcon,
};
