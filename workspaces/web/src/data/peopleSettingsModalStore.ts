import {createStore} from "@odemian/react-store";

export const [useShowPeopleSettings, setShowPeopleSettings] = createStore(false);

export const openPeopleSettings = () => setShowPeopleSettings(true);
export const closePeopleSettings = () => setShowPeopleSettings(false);
