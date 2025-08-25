import {Modal, ModalClose, ModalTitle} from "../../widgets/Modal";
import {closePeopleSettings, useShowPeopleSettings} from "../../data/peopleSettingsModalStore.ts";
import {useCreateUser, useCurrentUser} from "../../data/queries/users.ts";
import {useRemoveUser, useTeamUsers, useUpdateUserTeamRole} from "../../data/queries/teams.ts";
import {gte} from "../../utils/numbers.ts";
import {EUserTeamRole} from "@dataramen/types";
import {useForm} from "../../hooks/form/useForm.ts";
import st from "./index.module.css";
import {confirm} from "../../data/confirmModalStore.ts";
import {useRequireRole} from "../../hooks/useRequireRole.ts";

export const PeopleSettingsModal = () => {
  const open = useShowPeopleSettings();
  const { data: user } = useCurrentUser();
  const { data: teamUsers } = useTeamUsers(user?.teamId);

  const { mutate: createUser, isLoading: isCreatingUser } = useCreateUser();
  const { mutate: changeRole, isLoading: isChangingRole } = useUpdateUserTeamRole();
  const { mutate: removeUser, isLoading: isRemovingUser } = useRemoveUser();
  const [form, { change, reset }] = useForm<{ username: string; password: string }>({
    password: "",
    username: "",
  });

  const onCreateUser = () => {
    createUser({
      username: form.username,
      password: form.password,
      teamId: user?.teamId || "",
    });

    reset();
  };

  const onChangeRole = (userId: string, role: EUserTeamRole) => {
    changeRole({
      teamId: user!.teamId,
      role,
      userId
    })
  };

  const onRemoveUser = (userId: string) => {
    confirm("Are you sure you want to remove this user?")
      .then((res) => {
        if (res) {
          removeUser({
            userId,
            teamId: user!.teamId,
          });
        }
      });
  };

  const canManageUsers = useRequireRole(EUserTeamRole.ADMIN);
  const isMutating = isCreatingUser || isChangingRole || isRemovingUser;

  return (
    <Modal isVisible={open} onClose={closePeopleSettings} backdropClose>
      <ModalClose onClick={closePeopleSettings} />
      <div className="w-full lg:w-lg flex flex-col overflow-hidden">
        <ModalTitle>Manage users</ModalTitle>

        {gte(teamUsers?.length, 0) && (
          <div className="mt-4 overflow-y-auto flex-1">
            {teamUsers.map((u) => (
              <div className={st.userEntry} key={u.id}>
                <select
                  className="input"
                  value={u.role}
                  disabled={!canManageUsers || isMutating}
                  onChange={(e) => onChangeRole(u.id, e.currentTarget.value as EUserTeamRole)}
                >
                  <option value={EUserTeamRole.OWNER}>Owner</option>
                  <option value={EUserTeamRole.ADMIN}>Admin</option>
                  <option value={EUserTeamRole.EDITOR}>Editor</option>
                  <option value={EUserTeamRole.READ_ONLY}>Reader</option>
                </select>

                <p className="flex-1 mx-2">{u.name}</p>

                {canManageUsers && (
                  <button className="p-1 cursor-pointer text-red-500 text-sm" onClick={() => onRemoveUser(u.id)}>❌</button>
                )}
              </div>
            ))}
          </div>
        )}

        {canManageUsers && (
          <div className="mt-4">
            <p className="font-semibold">Create new user</p>
            <div className="flex flex-col lg:flex-row gap-2 lg:items-center mt-2">
              <input
                className="input flex-1"
                onChange={change("username")}
                value={form.username}
                placeholder="Username"
                disabled={isMutating}
              />

              <input
                className="input"
                onChange={change("password")}
                value={form.password}
                type="password"
                name="newPassword"
                autoComplete="new-password"
                placeholder="Password"
                disabled={isMutating}
              />

              <button className="button primary" onClick={onCreateUser} disabled={isMutating}>Create user</button>
            </div>
            <p className="text-xs mt-1 text-gray-600">You should create default password for the new account. The user should change it after the first login.</p>
          </div>
        )}
      </div>
    </Modal>
  )
};
