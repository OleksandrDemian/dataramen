import {useCountQueries} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {PAGES} from "../../const/pages.ts";
import {Alert} from "../../widgets/Alert";
import {Spinner} from "../../widgets/Spinner";
import {SavedQueriesList} from "./SavedQueriesList";

export const SavedQueriesPage = () => {
  const { data: user } = useCurrentUser();
  const { data: countQueries, isLoading: isCheckingQueries } = useCountQueries(user?.teamId);

  return (
    <div className="page-container h-screen max-h-screen">
      <div className="page-content max-h-full">
        <div className="py-10 text-center w-full">
          <h1 className="comfortaa text-3xl font-semibold text-(--text-color-primary)">{PAGES.savedQueries.name}</h1>
        </div>

        {countQueries ? (
          <SavedQueriesList />
        ) : (
          <>
            {isCheckingQueries ? (
              <Spinner />
            ) : (
              <Alert variant="warning">You don't have saved queries.</Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
};
