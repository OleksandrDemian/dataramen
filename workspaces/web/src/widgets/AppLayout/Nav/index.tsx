import st from "./index.module.css";
import {ProjectStructure} from "../components/ProjectStructure";
import {useCurrentUser} from "../../../data/queries/users.ts";
import {openAccountSettingsModal} from "../../../data/accountSettingsModalStore.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";
import {closeMenuSidebar} from "../../../data/showSidebarMenuStore.ts";
import {PAGES} from "../../../const/pages.ts";
import {useLocation, useNavigate} from "react-router-dom";

export const Nav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: currentUser } = useCurrentUser();

  const onHome = () => {
    closeMenuSidebar();
    if (pathname !== PAGES.home.path) {
      navigate(PAGES.home.path);
    }
  };

  return (
    <nav className={st.nav}>
      {currentUser && (
        <div className={st.header}>
          <button onClick={onHome}>
            🏠 Home
          </button>
          <button onClick={openAccountSettingsModal}>
            🪪 {currentUser.username}
          </button>
          <button onClick={openPeopleSettings}>
            👥 Manage users
          </button>
        </div>
      )}

      <ProjectStructure />
    </nav>
  );
};
