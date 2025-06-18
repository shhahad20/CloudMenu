
// hooks/usePagination.ts
import { useState, useCallback } from 'react';

interface PaginationState<T extends string> {
  page: number;
  pageSize: number;
  sortBy: T;
  order: 'asc' | 'desc';
  query: string;
}

interface UsePaginationProps<T extends string> {
  initialPageSize?: number;
  initialSortBy: T; // Make this required to ensure type safety
  initialOrder?: 'asc' | 'desc';
}

export function usePagination<T extends string>({
  initialPageSize = 8,
  initialSortBy,
  initialOrder = 'asc',
}: UsePaginationProps<T>) {
  const [state, setState] = useState<PaginationState<T>>({
    page: 1,
    pageSize: initialPageSize,
    sortBy: initialSortBy,
    order: initialOrder,
    query: '',
  });

  const [totalPages, setTotalPages] = useState(1);

  const goToPage = useCallback(
    (p: number) => {
      setState(prev => ({
        ...prev,
        page: Math.max(1, Math.min(totalPages, p))
      }));
    },
    [totalPages]
  );

  const toggleOrder = useCallback(() => {
    setState(prev => ({
      ...prev,
      order: prev.order === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  }, []);

  const setSortBy = useCallback((sortBy: T) => {
    setState(prev => ({
      ...prev,
      sortBy,
      page: 1
    }));
  }, []);

  const setQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      query,
      page: 1
    }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pageSize,
      page: 1
    }));
  }, []);

  return {
    state,
    totalPages,
    setTotalPages,
    goToPage,
    toggleOrder,
    setSortBy,
    setQuery,
    setPageSize,
  };
}