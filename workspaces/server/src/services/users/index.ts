import {TeamRepository, UserRepository, UsersToTeamsRepository} from "../../repository/db";
import {EUserTeamRole, IUserSchema} from "@dataramen/types";
import {hashPassword} from "../../utils/passwordHash";
import { randomBytes } from "node:crypto";

const DEFAULTS = {
  teamName: "Default Team",
  username: "admin",
};

const getOrCreateTeam = async () => {
  const team = await TeamRepository.findOneBy({}); // grab first team
  if (team) {
    return team;
  }

  return TeamRepository.save(
    TeamRepository.create({
      name: DEFAULTS.teamName,
    })
  );
};

export type TInitDefaultOwnerUserProps = {
  name: string;
  password: string;
};
export const initDefaultOwnerUser = async (props?: TInitDefaultOwnerUserProps): Promise<IUserSchema> => {
  const existingOwner = await UsersToTeamsRepository.findOne({
    where: {
      role: EUserTeamRole.OWNER,
    },
    relations: {
      user: true,
    }
  });

  if (existingOwner) {
    return existingOwner.user;
  }

  // Create new team or reuse existing one. For now only 1 team per server is allowed
  const team = await getOrCreateTeam();

  const hashedPassword = await hashPassword(
    props?.password || randomBytes(32).toString("hex")
  );

  const user = await UserRepository.save(
    UserRepository.create({
      username: props?.name || DEFAULTS.username,
      password: hashedPassword,
    })
  );

  const join = await UsersToTeamsRepository.save(
    UsersToTeamsRepository.create({
      user,
      team,
      role: EUserTeamRole.OWNER,
    }),
  );

  await UserRepository.update(user.id, {
    currentTeam: join,
  });

  // missing current team
  return user;
};
