import {useSearchTable} from "../../data/tableSearchModalStore.ts";

export const StartQuery = () => {
  const searchAndOpen = useSearchTable("Home");

  return (
    <button className="bg-white p-4 rounded-lg border border-blue-200" onClick={searchAndOpen}>
      <h2 className="font-semibold text-xl flex justify-between items-center">
        <span>🔎 Start new query</span>
        <span className="hotkey">N</span>
      </h2>
      <p className="text-sm text-left text-gray-700 mb-4">Select a table to start from. You will be able to customize your query later.</p>

      <p className="cursor-text text-gray-400 bg-gray-50 rounded-lg p-2 w-full text-left border border-gray-200 truncate">Search table or saved query to start exploring</p>
    </button>
  );
}