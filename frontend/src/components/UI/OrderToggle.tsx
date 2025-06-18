import React from 'react';

interface OrderToggleProps {
  order: 'asc' | 'desc';
  onToggle: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const OrderToggle: React.FC<OrderToggleProps> = ({
  order,
  onToggle,
  className = "",
  style = { marginRight: 8 }
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={className}
      style={style}
    >
      {order === "asc" ? "Asc ↑" : "Desc ↓"}
    </button>
  );
};