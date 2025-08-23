import {FormEventHandler, useState} from "react";
import {AxiosError} from "axios";
import {AccessTokenHandler} from "../../services/accessTokenHandler.ts";
import {Alert} from "../../widgets/Alert";
import {useNavigate} from "react-router-dom";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AxiosError | undefined>();
  const [firstLogin, setFirstLogin] = useState(false);
  const navigate = useNavigate();

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setError(undefined);
    AccessTokenHandler.login({
      password,
      username,
    })
      .then(() => {
        navigate("/", {
          replace: true,
        });
      })
      .catch(setError);
  };

  return (
    <div className="page-container bg-(--bg) h-screen">
      <div className="page-content items-center">
        <form className="flex flex-col gap-2 w-full lg:w-lg" onSubmit={onSubmit}>
          <p className="font-semibold text-xl min-w-md">Login</p>

          {error && (
            <Alert variant="danger">Failed to login. Please verify your credentials</Alert>
          )}

          <input value={username} onChange={(e) => setUsername(e.currentTarget.value)} className="input" placeholder="User name" />
          <input value={password} onChange={(e) => setPassword(e.currentTarget.value)} className="input" type="password" placeholder="Password" />
          <button type="submit" className="button primary">Login</button>

          {firstLogin ? (
            <Alert className="w-full border border-blue-500">
              <p>If this is your first login, the default credentials are:</p>
              <ul className="mt-2">
                <li>Username: <strong>admin</strong></li>
                <li>Password: <strong>admin</strong></li>
              </ul>
              <p className="mt-2">Please make sure to change the default password to a secure one.</p>
            </Alert>
          ) : (
            <button className="button tertiary" onClick={() => setFirstLogin(true)}>
              First login?
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
