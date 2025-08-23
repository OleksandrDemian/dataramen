export type TUserId = string;

export type TUser = {
  id: TUserId;
  teamId: string;
  teamRole: EUserTeamRole;
  teamName: string;
  username: string;
};

export type TAuthUserParams = {
  username: string;
  password: string;
};

export type TAuthUser = {
  accessToken: string;
};

export enum EUserTeamRole {
  OWNER = "owner",
  ADMIN = "admin",
  EDITOR = "editor",
  READ_ONLY = "read_only",
}

export type TCreateUser = {
  username: string;
  password: string;
  teamId: string;
};
