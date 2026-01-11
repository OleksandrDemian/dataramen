import {useLocation, useNavigate} from "react-router-dom";
import {useAccessToken} from "../data/queries/users.ts";
import {useEffect} from "react";
import {PAGES} from "../const/pages.ts";

export type TLoginGuardFunction = () => void;

const enabledGuard: TLoginGuardFunction = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: token, isLoading } = useAccessToken();

  useEffect(() => {
    if (!token && !isLoading && !PAGES.login.check(pathname)) {
      navigate(PAGES.login.build());
    }
  }, [token, isLoading, navigate, pathname]);
};

const disabledGuard: TLoginGuardFunction = () => {};

export const useLoginGuard: TLoginGuardFunction = __CLIENT_CONFIG__.skipAuth ? disabledGuard : enabledGuard;
