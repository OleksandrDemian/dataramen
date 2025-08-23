import {createStore} from "@odemian/react-store";
import {isLaptop} from "../utils/screen.ts";

export const [useShowQuerySidebar, setShowQuerySidebar] = createStore(isLaptop());

export const toggleShowQuerySidebar = () => setShowQuerySidebar((val) => !val);
