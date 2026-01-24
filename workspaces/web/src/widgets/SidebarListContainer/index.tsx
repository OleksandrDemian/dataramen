import {ReactNode} from "react";
import CloseIcon from "../../assets/close-outline.svg?react";
import {SearchInput} from "../SearchInput";

export type TSidebarListContainerProps = {
  hasMore: boolean;
  children: ReactNode;
  searchValue: string;
  onSearchValue: (value: string) => void;
  onClose: () => void;
  onLoadMore: () => void;
};
export const SidebarListContainer = ({ onLoadMore, children, onClose, hasMore, onSearchValue, searchValue }: TSidebarListContainerProps) => {
  return (
    <aside className="w-full lg:w-md no-scrollbar">
      <div className="sticky top-0 px-4 py-2 border-b border-gray-200 bg-white">
        <h3 className="text-lg flex justify-between items-center">
          Recent tabs

          {onClose && (
            <button className="cursor-pointer hover:bg-(--bg-ter) rounded-full p-1" onClick={onClose}>
              <CloseIcon width={24} height={24} />
            </button>
          )}
        </h3>

        <SearchInput
          containerClassName="mt-2"
          className="text-sm"
          placeholder="Filter"
          value={searchValue}
          autoFocus
          onChange={(e) => onSearchValue(e.target.value)}
        />
      </div>

      {children}

      {hasMore && (
        <div className="flex justify-center my-2">
          <button className="text-blue-800 text-sm p-2 cursor-pointer" onClick={onLoadMore}>Load more</button>
        </div>
      )}
    </aside>
  );
};