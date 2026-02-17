import {Route, Routes} from "react-router-dom";
import {HomePage} from "./Home";
import {PAGES} from "../const/pages.ts";
import {EntityCreator} from "../modals/EntityCreator";
import {EntityEditor} from "../modals/EntityEditor";
import {ConfirmModal} from "../modals/ConfirmModal";
import {PromptModal} from "../modals/PromptModal";
import {ValueDisplayModal} from "../modals/ValueDisplayModal";
import {WorkbenchTabPage} from "./WorkbenchTab";
import {DataSourceSidebar} from "../modals/DataSourceModal";
import {SearchTableModal} from "../modals/SearchTableModal";
import {useSetupGlobalListeners} from "../hooks/useGlobalHotkey.ts";
import {AccountSettingsModal} from "../modals/AccountSettingsModal";
import {PeopleSettingsModal} from "../modals/PeopleSettingsModal";
import {LoginPage} from "./Login";
import {useLoginGuard} from "../hooks/useLoginGuard.ts";
import {SharedQuery} from "./SharedQuery";
import {TabsHistorySidebar} from "../modals/TabsHistorySidebar";
import {WorkbenchPage} from "./Workbench";
import {SavedQueriesSidebar} from "../modals/SavedQueries";

function Router() {
  useSetupGlobalListeners();
  useLoginGuard();

  return (
    <>
      <Routes>
        <Route path={PAGES.home.path} element={<HomePage />} />
        <Route path={PAGES.workbench.path} element={<WorkbenchPage />} />
        <Route path={PAGES.workbenchTab.path} element={<WorkbenchTabPage />} />
        <Route path={PAGES.login.path} element={<LoginPage />} />
        <Route path={PAGES.share.path} element={<SharedQuery />} />
      </Routes>

      <EntityCreator />
      <EntityEditor />
      <ValueDisplayModal />
      <DataSourceSidebar />
      <SearchTableModal />
      <AccountSettingsModal />
      <PeopleSettingsModal />
      <TabsHistorySidebar />
      <SavedQueriesSidebar />

      <PromptModal />
      <ConfirmModal />
    </>
  );
}

export default Router;
