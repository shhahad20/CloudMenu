import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/cart.scss';
import { useCart } from '../context/CartContext';

interface ServiceOption {
  id: string;
  label: string;
  sublabel: string;
  cost: number;
}

export const CartPage: React.FC = () => {
  const { items, addItem, removeOne, removeItem } = useCart();
  const navigate = useNavigate();
// default service
const [selectedService, setSelectedService] = useState<ServiceOption>({
  id: 'nothing',
  label: 'No Extra Service Needed',
  sublabel: 'Free',
  cost: 0,
});

const serviceOptions: ServiceOption[] = [
  {
    id: 'nothing',
    label: 'No Extra Service Needed',
    sublabel: 'Free',
    cost: 0,
  },
  {
    id: 'assistant',
    label: 'Assistant Designer',
    sublabel: '+50 SAR',
    cost: 50,
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    sublabel: '+100 SAR',
    cost: 100,
  },
  {
    id: 'printing',
    label: 'Menu Printing',
    sublabel: 'Cost will be calculated after contact',
    cost: 0,
  },
];

const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
const total    = subtotal + selectedService.cost;

if (items.length === 0) {
  return (
    <div className="cart-page empty">
      <h1>Your Cart is Empty</h1>
      <button className="btn primary" onClick={() => navigate('/menus')}>
        Continue Shopping
      </button>
    </div>
  );
}

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <h1>My Cart</h1>
        <button className="btn secondary" onClick={() => navigate('/menus')}>
          ← Continue shopping
        </button>
      </div>

      {/* Items Table */}
      <table className="cart-table">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>PRICE</th>
            <th>QTY</th>
            <th>TOTAL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td className="product-cell">
                {/* replace with real image <img src={i.imageUrl} /> if available */}
                <div className="product-img-placeholder" />
                <div className="product-info">
                  <div className="product-name">{i.name}</div>
                  <div className="product-meta">#{i.id}</div>
                </div>
              </td>
              <td> {i.price.toFixed(2)} SAR </td>
              <td>
              <button onClick={() => removeOne(i.id)} className="qty-btn">−</button>
                <span className="qty">{i.quantity}</span>
                <button
                  onClick={() =>
                    addItem({ id: i.id, name: i.name, price: i.price, quantity: 1 })
                  }
                  className="qty-btn"
                >
                  +
                </button>
              </td>
              <td>{(i.price * i.quantity).toFixed(2)} SAR</td>
              <td>
                <button className="btn-remove" onClick={() => removeItem(i.id)}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Shipping & Summary */}
      <div className="cart-footer">
      <div className="service-options">
          <h2>Choose additional service:</h2>
          {serviceOptions.map((opt) => (
            <label
              key={opt.id}
              className={`service-option ${
                selectedService.id === opt.id ? 'active' : ''
              }`}
            >
              <input
                type="radio"
                name="service"
                value={opt.id}
                checked={selectedService.id === opt.id}
                onChange={() => setSelectedService(opt)}
              />
              <div className="service-text">
                <span className="service-label">{opt.label}</span>
                <span className="service-sublabel">{opt.sublabel}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>SUBTOTAL</span>
            <span>{subtotal.toFixed(2)} SAR</span>
          </div>
          <div className="summary-row">
            <span>SERVICE</span>
            <span>
              {selectedService.cost === 0
                ? 'Free'
                : `${selectedService.cost.toFixed(2)} SAR`}
            </span>
          </div>
          <div className="summary-row total">
            <span>TOTAL</span>
            <span>{total.toFixed(2)} SAR</span>
          </div>
          <button
            className="btn checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Checkout
            <span className="btn-price">{total.toFixed(2)} SAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
