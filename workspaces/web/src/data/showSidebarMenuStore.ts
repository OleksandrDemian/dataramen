import {createStore} from "@odemian/react-store";

export const [useShowSidebarMenu, setShowSidebarMenu] = createStore(false);

export const toggleSidebarMenu = () => setShowSidebarMenu((state) => !state);
export const closeMenuSidebar = () => setShowSidebarMenu(false);
