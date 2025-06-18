import React from 'react';

interface PageSizeSelectProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
  style?: React.CSSProperties;
}

export const PageSizeSelect: React.FC<PageSizeSelectProps> = ({
  value,
  onChange,
  options = [4, 8, 16, 32],
  className = "",
  style = {}
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={className}
      style={style}
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {n} / page
        </option>
      ))}
    </select>
  );
};

// components/PaginationControls.tsx

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "pagination-controls",
  style = { marginTop: 16 }
}) => {
  return (
    <div className={className} style={style}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{ marginRight: 8 }}
      >
        Prev
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{ marginLeft: 8 }}
      >
        Next
      </button>
    </div>
  );
};