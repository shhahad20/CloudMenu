// src/pages/CartPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/cart.scss';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { items, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1>Your Cart is Empty</h1>
        <button onClick={() => navigate('/dashboard')}>Go Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <ul className="cart-list">
        {items.map((i) => (
          <li key={i.id} className="cart-item">
            <span>{i.name} x{i.quantity}</span>
            <span>${(i.price * i.quantity).toFixed(2)}</span>
            <button onClick={() => removeItem(i.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <strong>Total: ${total.toFixed(2)}</strong>
        <button onClick={() => navigate('/checkout')}>Proceed to Payment</button>
        <button onClick={clearCart} className="secondary">Clear Cart</button>
      </div>
    </div>
  );
};

export default CartPage;
