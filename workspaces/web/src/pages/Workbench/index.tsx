import {useFetchLastTab} from "../../data/queries/project.ts";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import {useCurrentUser} from "../../data/queries/users.ts";

export const WorkbenchPage = () => {
  const { data: user } = useCurrentUser();
  const lastTab = useFetchLastTab(user?.teamId);
  const navigate = useNavigate();

  useEffect(() => {
    lastTab.mutateAsync()
      .then((tab) => {
        if (tab) {
          navigate(PAGES.workbenchTab.build({ id: tab.id }), {
            replace: true,
          });
        } else {
          navigate(PAGES.home.build(), {
            replace: true,
          });
        }
      });
  }, []);

  return null;
};
