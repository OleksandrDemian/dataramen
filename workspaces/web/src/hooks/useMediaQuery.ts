import {useLayoutEffect, useState} from "react";

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
};

const getMatches = (query: string): boolean => {
  return window.matchMedia(query).matches;
};

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {},
): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  });

  useLayoutEffect(() => {
    const matchMedia = window.matchMedia(query);
    function handleChange() {
      setMatches(() => getMatches(query));
    }

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Use deprecated `addListener` and `removeListener` to support Safari < 14 (#135)
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener('change', handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener('change', handleChange);
      }
    }
  }, [query]);

  return matches;
};
