import st from "./index.module.css";
import {ProjectStructure} from "../components/ProjectStructure";
import {useResizable} from "../../../hooks/useResizable.ts";
import {useCurrentUser} from "../../../data/queries/users.ts";
import {openAccountSettingsModal} from "../../../data/accountSettingsModalStore.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";

export const Nav = () => {
  const { elementRef, handleRef } = useResizable<HTMLDivElement, HTMLDivElement>({
    resizeDirection: "horizontal-r",
  });

  const { data: currentUser } = useCurrentUser();

  return (
    <nav className={st.nav} ref={elementRef}>
      <div ref={handleRef} className="hr-slide"/>

      <ProjectStructure />

      {currentUser && (
        <div className={st.footer}>
          <button onClick={openAccountSettingsModal}>
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
