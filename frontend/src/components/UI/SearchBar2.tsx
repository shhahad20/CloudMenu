import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
  style = { marginRight: 8 }
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={style}
    />
  );
};

// components/SortSelect.tsx

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SortOption<T>[];
  className?: string;
  style?: React.CSSProperties;
}

export function SortSelect<T extends string>({
  value,
  onChange,
  options,
  className = "",
  style = { marginRight: 8 }
}: SortSelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={className}
      style={style}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}