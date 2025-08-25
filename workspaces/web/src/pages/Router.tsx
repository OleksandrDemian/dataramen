import {Route, Routes} from "react-router-dom";
import {HomePage} from "./Home";
import {PAGES} from "../const/pages.ts";
import {EntityCreator} from "../modals/EntityCreator";
import {EntityEditor} from "../modals/EntityEditor";
import {ConfirmModal} from "../modals/ConfirmModal";
import {PromptModal} from "../modals/PromptModal";
import {ValueDisplayModal} from "../modals/ValueDisplayModal";
import {WorkbenchPage} from "./Workbench";
import {QueryModal} from "../modals/QueryModal";
import {DataSourceModal} from "../modals/DataSourceModal";
import {SearchTableModal} from "../modals/SearchTableModal";
import {useSetupGlobalListeners} from "../hooks/useGlobalHotkey.ts";
import {useAnalyticsPageview} from "../hooks/useAnalyticsPageview.ts";
import {UpdateServerModal} from "../modals/UpdateServerModal";
import {PeopleSettingsModal} from "../modals/PeopleSettingsModal";
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
