import React from "react";
import SearchBar from "../UI/SearchBar";
import {
  SortOption,
  ListControlsState,
  ListControlsHandlers,
} from "../../hooks/userListControls";

interface Props {
  state: ListControlsState;
  handlers: ListControlsHandlers;
  sortOptions: SortOption[];
}

/**
 * Renders a SearchBar + sort dropdown + order toggle button.
 * - resets page to 1 on new search or new sort.
 */
const ListToolbar: React.FC<Props> = ({ state, handlers, sortOptions }) => {
  const { sortBy, order, query } = state;
  const { setPage, setQuery, setSortBy, toggleOrder } = handlers;

  return (
    <div className="list-toolbar">
      <div className="search-bar list-search">
        <SearchBar
          initialValue={query}
          onSearch={(q) => {
            setQuery(q);
            setPage(1);
          }}
        />
      </div>
      <div className="sort-controls">
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button onClick={toggleOrder}>{order === "desc" ? "↓" : "↑"}</button>
      </div>
    </div>
  );
};

export default ListToolbar;
