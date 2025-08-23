import {Route, Routes} from "react-router-dom";
import {HomePage} from "./Home";
import {PAGES} from "../const/pages.ts";
import {EntityCreator} from "../widgets/EntityCreator";
import {EntityEditor} from "../widgets/EntityEditor";
import {ConfirmModal} from "../widgets/ConfirmModal";
import {PromptModal} from "../widgets/PromptModal";
import {ValueDisplayModal} from "../widgets/ValueDisplayModal";
import {WorkbenchPage} from "./Workbench";
import {QueryModal} from "../widgets/QueryModal";
import {DataSourceModal} from "../widgets/DataSourceModal";
import {SearchTableModal} from "../widgets/SearchTableModal";
import {useSetupGlobalListeners} from "../hooks/useGlobalHotkey.ts";
import {useAnalyticsPageview} from "../hooks/useAnalyticsPageview.ts";
import {UpdateServerModal} from "../widgets/UpdateServerModal";
import {PeopleSettingsModal} from "../widgets/PeopleSettingsModal";
import {LoginPage} from "./Login";
import {useEffect} from "react";
import {AccessTokenHandler} from "../services/accessTokenHandler.ts";
import {readAccessToken} from "../utils/sessionAccessToken.ts";

function Router() {
  useSetupGlobalListeners();
  useAnalyticsPageview();

  useEffect(() => {
    if (readAccessToken() !== undefined) {
      // do not autologin if token already exist
      return;
    }

    AccessTokenHandler.login({
      username: "guest",
      password: "guest",
    });
  }, []);

  return (
    <>
      <Routes>
        <Route path={PAGES.home.path} element={<HomePage />} />
        <Route path={PAGES.workbench.path} element={<WorkbenchPage />} />
        <Route path={PAGES.login.path} element={<LoginPage />} />
      </Routes>

      <QueryModal />
      <EntityCreator />
      <EntityEditor />
      <ValueDisplayModal />
      <DataSourceModal />
      <SearchTableModal />
      <UpdateServerModal />
      <PeopleSettingsModal />

      <PromptModal />
      <ConfirmModal />
    </>
  );
}

export default Router;
