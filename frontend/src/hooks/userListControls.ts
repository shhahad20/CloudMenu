import { useState, useCallback } from "react";

export interface SortOption {
  value: string;
  label: string;
}

export interface ListControlsState {
  page: number;
  pageSize: number;
  sortBy: string;
  order: "asc" | "desc";
  query: string;
}

export interface ListControlsHandlers {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSortBy: (sortBy: string) => void;
  toggleOrder: () => void;
  setQuery: (q: string) => void;
  reset: () => void;
}

/**
 * useListControls  
 * Manages page, pageSize, sortBy, order, and search query in one hook.
 */
export function useListControls(
  initial: Partial<ListControlsState> = {}
): [ListControlsState, ListControlsHandlers] {
  const [page, setPage] = useState(initial.page ?? 1);
  const [pageSize, setPageSize] = useState(initial.pageSize ?? 10);
  const [sortBy, setSortBy] = useState(initial.sortBy ?? "");
  const [order, setOrder] = useState<"asc" | "desc">(initial.order ?? "asc");
  const [query, setQuery] = useState(initial.query ?? "");

  const toggleOrder = useCallback(
    () => setOrder((o) => (o === "asc" ? "desc" : "asc")),
    []
  );
  const reset = useCallback(() => {
    setPage(1);
    setQuery("");
  }, []);

  return [
    { page, pageSize, sortBy, order, query },
    { setPage, setPageSize, setSortBy, toggleOrder, setQuery, reset },
  ];
}
