import st from "./index.module.css";
import {useLocation, useNavigate} from "react-router-dom";
import {PAGES} from "../../../const/pages.ts";
import {openAccountSettingsModal} from "../../../data/accountSettingsModalStore.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";
import {useSearchTable} from "../../../data/tableSearchModalStore.ts";

const enableAuth = !__CLIENT_CONFIG__.skipAuth;
const rootClass = `${st.root} ${enableAuth ? 'grid-cols-4' : 'grid-cols-2'}`;

export const MobileNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const searchTable = useSearchTable("Mobile nav");

  const onHome = () => {
    if (pathname !== PAGES.home.path) {
      navigate(PAGES.home.path);
    }
  }

  return (
    <div className={rootClass}>
      <button onClick={onHome}>
        <p>🏠</p>
        <p className="text-xs font-semibold text-gray-600">Home</p>
      </button>

      <button onClick={searchTable}>
        <p>🔎</p>
        <p className="text-xs font-semibold text-gray-600">New query</p>
      </button>

      {enableAuth && (
        <>
          <button onClick={openAccountSettingsModal}>
            <p>🪪</p>
            <p className="text-xs font-semibold text-gray-600">Account</p>
          </button>

          <button onClick={openPeopleSettings}>
            <p>👥</p>
            <p className="text-xs font-semibold text-gray-600">Users</p>
          </button>
        </>
      )}
    </div>
  );
};
