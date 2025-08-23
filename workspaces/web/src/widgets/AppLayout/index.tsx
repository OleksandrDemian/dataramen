import {ReactNode} from "react";
import st from "./nav/index.module.css";
import {Nav} from "./nav";
import {useMediaQuery} from "../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../utils/screen.ts";
import {Tooltip} from "react-tooltip";
import {Sidebar} from "../Sidebar";
import {setShowSidebarMenu, useShowSidebarMenu} from "../../data/showSidebarMenuStore.ts";

const DesktopLayout = ({children}: { children: ReactNode }) => {
  return (
    <div className={st.desktopLayout}>
      <Tooltip id="default" className="z-100" />
      <Nav />

      <main className={st.main}>
        {children}
      </main>
    </div>
  );
};

const MobileLayout = ({children}: { children: ReactNode }) => {
  const showMenu = useShowSidebarMenu();
  const onCloseModal = () => setShowSidebarMenu(false);

  return (
    <div className={st.mobileLayout}>
      <Sidebar isVisible={showMenu} onClose={onCloseModal} backdropClose contentClassName="flex">
        <Nav />
      </Sidebar>

      <main className={st.main}>
        {children}
      </main>
    </div>
  );
};

export const AppLayout = ({children}: { children: ReactNode }) => {
  const isDesktop = useMediaQuery(ScreenQuery.laptop);

  if (isDesktop) {
    return (
      <DesktopLayout>
        {children}
      </DesktopLayout>
    );
  }

  return (
    <MobileLayout>
      {children}
    </MobileLayout>
  );
};