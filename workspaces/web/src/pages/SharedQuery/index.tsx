import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import {PAGES} from "../../const/pages.ts";
import {Spinner} from "../../widgets/Spinner";
import {Alert} from "../../widgets/Alert";
import {useCreateWorkbenchTab} from "../../data/queries/workbenchTabs.ts";

export const SharedQuery = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const createWorkbenchTab = useCreateWorkbenchTab();
  const queryId = searchParams.get("shareId");

  useEffect(() => {
    if (queryId) {
      createWorkbenchTab.mutateAsync({
        queryId,
      }).then((result) => {
        navigate(`${PAGES.workbench.path}/tab/${result.id}`, {
          replace: true,
        });
      });
    }
  }, [queryId]);

  return (
    <div className="page-container flex items-center justify-center h-screen">
      {createWorkbenchTab.isLoading && (
        <div className="flex items-center flex-col gap-2">
          <Spinner />
          <p>Fetching query information</p>
        </div>
      )}
      {createWorkbenchTab.isError && (
        <Alert variant="danger">Failed to load query information</Alert>
      )}
    </div>
  );
};
