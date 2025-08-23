export type TPage = {
  path: string;
  name: string;
};

export type TPagePath =
  | 'home'
  | 'workbench'
  | 'login'
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
  login: {
    path: "/login",
    name: "Login",
  },
};
