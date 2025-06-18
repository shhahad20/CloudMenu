import React from 'react';
import { SearchBar, SortOption, SortSelect } from './SearchBar2';

import { OrderToggle } from './OrderToggle';
import { PageSizeSelect } from './PageSizeSelect';

interface ListToolbarProps<T extends string> {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Sort
  sortBy: T;
  onSortChange: (value: T) => void;
  sortOptions: SortOption<T>[];
  
  // Order
  order: 'asc' | 'desc';
  onOrderToggle: () => void;
  
  // Page size
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
}

export function ListToolbar<T extends string>({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  sortBy,
  onSortChange,
  sortOptions,
  order,
  onOrderToggle,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  className = "toolbar",
  style = { marginBottom: 16 }
}: ListToolbarProps<T>) {
  return (
    <div className={className} style={style}>
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />
      
      <SortSelect
        value={sortBy}
        onChange={onSortChange}
        options={sortOptions}
      />
      
      <OrderToggle
        order={order}
        onToggle={onOrderToggle}
      />
      
      <PageSizeSelect
        value={pageSize}
        onChange={onPageSizeChange}
        options={pageSizeOptions}
      />
    </div>
  );
}