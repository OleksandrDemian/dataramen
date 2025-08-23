import {createStore} from "@odemian/react-store";

export const [useAccountSettingsModal, setAccountSettingsModal] = createStore(false);

export const closeAccountSettingsModal = () => setAccountSettingsModal(false);
export const openAccountSettingsModal = () => setAccountSettingsModal(true);
