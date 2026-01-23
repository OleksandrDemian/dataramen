import {FormEventHandler, useState} from "react";
import {AxiosError} from "axios";
import {AccessTokenHandler} from "../../services/accessTokenHandler.ts";
import {Alert} from "../../widgets/Alert";
import {useNavigate} from "react-router-dom";
import {UsefulLinks} from "../Home/components.tsx";
import st from "./index.module.css";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AxiosError | undefined>();
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
        <div className="py-10 text-center w-full sticky top-0 z-0">
          <h1 className="comfortaa text-3xl font-semibold text-(--text-color-primary) mb-4">Welcome to DataRamen!</h1>

          <UsefulLinks />
        </div>

        <form className={st.grayCard} onSubmit={onSubmit}>
          <h2 className={st.loginLabel}>Login</h2>

          {error && (
            <Alert className="border border-red-600" variant="danger">Failed to login. Please verify your credentials</Alert>
          )}

          <input value={username} onChange={(e) => setUsername(e.currentTarget.value)} className="input secondary" placeholder="User name" />
          <input value={password} onChange={(e) => setPassword(e.currentTarget.value)} className="input secondary" type="password" placeholder="Password" />
          <div className="flex justify-end">
            <button type="submit" className="button primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};
