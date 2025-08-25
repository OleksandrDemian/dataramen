import {Modal, ModalClose, ModalTitle} from "../../widgets/Modal";
import {closeAccountSettingsModal, useAccountSettingsModal} from "../../data/accountSettingsModalStore.ts";
import {useCurrentUser, useUpdateUser} from "../../data/queries/users.ts";
import {useForm} from "../../hooks/form/useForm.ts";
import {Alert} from "../../widgets/Alert";
import {AccessTokenHandler} from "../../services/accessTokenHandler.ts";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";

const PasswordAlert = ({ repeatPassword, password }: { password: string; repeatPassword: string; }) => {
  if (password.length < 1) {
    return null;
  }

  if (password.length < 8) {
    return (
      <Alert variant="warning">
        New password should be at least 8 characters long
      </Alert>
    );
  }

  if (password !== repeatPassword) {
    return (
      <Alert variant="warning">
        Repeat password should match new password
      </Alert>
    );
  }

  return null;
};

export const AccountSettingsModal = () => {
  const opened = useAccountSettingsModal();
  const { data: account } = useCurrentUser();
  const { mutateAsync: updatePassword, isLoading: isUpdating } = useUpdateUser();
  const navigate = useNavigate();

  const [{ password, repeatPassword }, { change, touched, reset }] = useForm<{
    password: string;
    repeatPassword: string;
  }>({
    password: "",
    repeatPassword: "",
  });

  const logout = () => {
    navigate("/");
    AccessTokenHandler.logout()
      .then(() => {
        closeAccountSettingsModal();
      });
  };

  const onUpdatePassword = () => {
    updatePassword({
      password,
    }).then(() => {
      reset();
      toast.success("Password successfully updated!");
    });
  };

  const disableUpdate = password.length < 8 || password !== repeatPassword || isUpdating;
  const showAlert = touched.includes("password");

  return (
    <Modal isVisible={opened} onClose={closeAccountSettingsModal}>
      <ModalClose onClick={closeAccountSettingsModal} />
      <div className="w-full lg:w-lg flex flex-col gap-2">
        <ModalTitle>Account settings</ModalTitle>

        <label>
          <p className="text-xs font-semibold mb-1">Username</p>
          <input className="input w-full" readOnly disabled value={account?.username} />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label>
            <p className="text-xs font-semibold mb-1">Change password</p>
            <input
              className="input w-full"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              value={password}
              onChange={change("password")}
            />
          </label>

          <label>
            <p className="text-xs font-semibold mb-1">Repeat password</p>
            <input className="input w-full" type="password" value={repeatPassword} onChange={change("repeatPassword")} />
          </label>
        </div>

        {showAlert && (
          <PasswordAlert password={password} repeatPassword={repeatPassword} />
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button className="button tertiary" disabled={disableUpdate} onClick={onUpdatePassword}>Update password</button>
          <button className="button danger" onClick={logout}>Log out</button>
        </div>
      </div>
    </Modal>
  );
};
