import st from "./index.module.css";
import {ProjectStructure} from "../components/ProjectStructure";
import {useCurrentUser} from "../../../data/queries/users.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";

export const Nav = () => {
  const { data: currentUser } = useCurrentUser();

  return (
    <nav className={st.nav}>
      <ProjectStructure />

      {currentUser && (
        <div className={st.footer}>
          <button>
            🪪 {currentUser.username}
          </button>
          <button onClick={openPeopleSettings}>
            👥 Manage users
          </button>
        </div>
      )}
    </nav>
  );
};
