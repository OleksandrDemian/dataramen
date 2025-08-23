import {useLocation, useNavigate} from "react-router-dom";
import {useAccessToken} from "../data/queries/users.ts";
import {useEffect} from "react";
import {PAGES} from "../const/pages.ts";

export const useLoginGuard = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: token, isLoading } = useAccessToken();

  useEffect(() => {
    if (!token && !isLoading && pathname !== PAGES.login.path) {
      navigate(PAGES.login.path);
    }
  }, [token, isLoading, navigate, pathname]);
};
