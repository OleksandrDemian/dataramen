/**
 * AS OF NOW THIS IS NOT IMPLEMENTED, NO DATA IS BEING COLLECTED
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logEvent = (_eventName: string, _props?: Record<string, string | number | boolean>) => {
  try {
    // todo analytics
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) { /* empty */ }
}

const logPageView = () => {
  try {
    // todo analytics
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) { /* empty */ }
};

export const Analytics = {
  event: logEvent,
  pageView: logPageView,
};
