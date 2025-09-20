export type TPage = {
  path: string;
  name: string;
};

export type TPagePath =
  | 'home'
  | 'workbench'
  | 'login'
  | 'share'
  ;

export const PAGES: Record<TPagePath, TPage> = {
  home: {
    path: '/',
    name: '🏠 Home',
  },
  workbench: {
    path: '/workbench',
    name: 'Workbench',
  },
  share: {
    path: '/share',
    name: 'Share query',
  },
  login: {
    path: "/login",
    name: "Login",
  },
};
