import React from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Renders Prev / Next buttons and “Page X of Y”.
 */
const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange }) => (
  <div className="pagination-controls">
    <button
      onClick={() => onPageChange(page - 1)}
      disabled={page <= 1}
    >
      Prev
    </button>

    <span>
      Page {page} of {totalPages}
    </span>

    <button
      onClick={() => onPageChange(page + 1)}
      disabled={page >= totalPages}
    >
      Next
    </button>
  </div>
);

export default Pagination;
