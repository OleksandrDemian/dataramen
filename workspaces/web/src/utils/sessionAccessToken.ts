const key = "__access_token__"

export const readAccessToken = () => {
  try {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    } else {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
};

export const storeAccessToken = (accessToken: string | undefined) => {
  if (accessToken) {
    localStorage.setItem(key, accessToken);
  } else {
    localStorage.removeItem(key);
  }
};
