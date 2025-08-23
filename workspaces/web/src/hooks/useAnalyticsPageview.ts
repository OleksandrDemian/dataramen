import {useEffect} from "react";
import {Analytics} from "../utils/analytics.ts";
import {useLocation} from "react-router-dom";

/**
 * AS OF NOW THIS IS NOT IMPLEMENTED, NO DATA IS BEING COLLECTED
 */
export const useAnalyticsPageview = () => {
  const location = useLocation();

  useEffect(() => {
    Analytics.pageView();
  }, [location.pathname]);
};
