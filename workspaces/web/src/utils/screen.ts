export const ScreenQuery = {
  tablet: "(min-width: 640px)",
  laptop: "(min-width: 1024px)",
};

export const isTablet = (): boolean => {
  return window.matchMedia(ScreenQuery.tablet).matches;
};

export const isLaptop = (): boolean => {
  return window.matchMedia(ScreenQuery.laptop).matches;
};
