import {createStore} from "@odemian/react-store";

export const [useShowQuerySidebar, setShowQuerySidebar] = createStore(false);

export const toggleShowQuerySidebar = () => setShowQuerySidebar((val) => !val);
