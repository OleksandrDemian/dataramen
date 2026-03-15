import {ReactNode} from "react";
import st from "./Nav/index.module.css";
import {Nav} from "./Nav";
import {useMediaQuery} from "../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../utils/screen.ts";
import {Tooltip} from "react-tooltip";
import {MobileNav} from "./MobileNav";
import {useLocation} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import {EntityEditor, MobileEntityEditor} from "../../modals/EntityEditor";
import {EntityCreator, MobileEntityCreator} from "../../modals/EntityCreator";

const DesktopLayout = ({ children, isLogin }: { children: ReactNode; isLogin: boolean }) => {
  return (
    <div className={st.desktopLayout}>
      <Tooltip id="default" className="z-500" />
      <Tooltip id="default-xs" className="z-500 text-xs!" />
      {!isLogin && <Nav />}

      <main className={st.main}>
        {children}
      </main>

      <EntityEditor />
      <EntityCreator />
    </div>
  );
};

const MobileLayout = ({ children, isLogin }: { children: ReactNode; isLogin: boolean }) => {
  return (
    <div className={st.mobileLayout}>
      <main className={st.main}>
        {children}
      </main>

      <MobileEntityEditor />
      <MobileEntityCreator />

      {!isLogin && <MobileNav />}
    </div>
  );
};

export const AppLayout = ({children}: { children: ReactNode }) => {
  const isDesktop = useMediaQuery(ScreenQuery.laptop);
  const { pathname } = useLocation();

  const isLogin = PAGES.login.check(pathname);

  if (isDesktop) {
    return (
      <DesktopLayout isLogin={isLogin}>
        {children}
      </DesktopLayout>
    );
  }

  return (
    <MobileLayout isLogin={isLogin}>
      {children}
    </MobileLayout>
  );
};