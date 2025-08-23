export type TTeam = {
  id: string;
  name: string;
};

export type TCreateTeam = Omit<TTeam, "id">;

export type TTeamUser = {
  id: string;
  name: string;
  role: string;
};
