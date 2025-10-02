import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import {pushNewExplorerTab} from "../../data/openTabsStore.ts";
import {PAGES} from "../../const/pages.ts";
import {Spinner} from "../../widgets/Spinner";
import {Alert} from "../../widgets/Alert";
import {useQueryById} from "../../data/queries/queries.ts";

export const SharedQuery = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: query, isLoading, isError } = useQueryById(searchParams.get("shareId"));

  useEffect(() => {
    if (query) {
      pushNewExplorerTab(query.name, {
        ...query.opts,
        dataSourceId: query.dataSource?.id,
      }, true);

      navigate(PAGES.workbench.path, {
        replace: true,
      });
    }
  }, [query]);

  return (
    <div className="page-container flex items-center justify-center h-screen">
      {isLoading && (
        <div className="flex items-center flex-col gap-2">
          <Spinner />
          <p>Fetching query information</p>
        </div>
      )}
      {isError && (
        <Alert variant="danger">Failed to load query information</Alert>
      )}
    </div>
  );
};
