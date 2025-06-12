import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cart.scss"; // reuse cart styles
import { useCart } from "../context/CartContext";
// import { cloneTemplate } from '../api/templates';
import { API_URL } from "../api/api";
import { cloneTemplate } from "../api/templates";

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // if (!cardNumber || !expiry || !cvc) {
  //   setError("Please fill out all card details.");
  //   setProcessing(false);
  //   return;
  // }
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePay = async () => {
    setProcessing(true);
    setError("");

    // 1) quick client-side validation:
    if (!cardNumber || !expiry || !cvc) {
      setError("Please fill out all card details.");
      setProcessing(false);
      return;
    }
 
    try {
      // 1) (Optional) call your backend /api/checkout if using Stripe

       
      // 2) For each item, do the right thing
      await Promise.all(
        items.map(async (i) => {
          if (i.id.startsWith("plan-")) {
            // subscription flow
            const key = i.id.slice("plan-".length); // "pro"
            const planName = key.charAt(0).toUpperCase() + key.slice(1);
            
            console.log("planName:", planName);
            // const planName = i.id.replace("plan-", "") as
            //   | "Free"
            //   | "Pro"
            //   | "Enterprise";
            const resp = await fetch(`${API_URL}/plans/me/plan`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
              body: JSON.stringify({ plan: planName }),
            });
            if (!resp.ok) {
              const body = await resp.json().catch(() => null);
              throw new Error(
                body?.error || `Failed to update plan (${resp.status})`
              );
            }
          } else {
            // menu clone flow
            await cloneTemplate(i.id);
          }
        })
      );

      // assume items: LineItem[], subtotal in SAR
      const invoiceResp = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          items,
          currency: "SAR",
        }),
      });

      if (!invoiceResp.ok) {
        throw new Error("Failed to save invoice.");
      }
      // const { invoiceId } = await invoiceResp.json();

      // (optional) redirect straight to your GET-invoice-PDF endpoint:
      // window.open(`${API_URL}/invoices/${invoiceId}/pdf`, '_blank');

      // 3) clear & redirect
      clearCart();
      alert("Success! Redirecting to dashboard…");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Payment/clone failed.");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <h1>No items to checkout</h1>
        <button className="btn primary" onClick={() => navigate("/menus")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page checkout-page">
      {/* Header */}
      <div className="cart-header">
        <h1>Checkout</h1>
        <button className="btn secondary" onClick={() => navigate("/cart")}>
          ← Back to Cart
        </button>
      </div>

      {/* Main Content: Items + Payment Form & Summary */}
      <div className="checkout-content">
        {/* Left: review items */}
        <table className="cart-table-checkout">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>PRICE</th>
              <th>QTY</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td className="product-cell">
                  <div className="product-img-placeholder" />
                  <div className="product-info">
                    <div className="product-name">{i.name}</div>
                    <div className="product-meta">#{i.id}</div>
                  </div>
                </td>
                <td>{i.price.toFixed(2)} SAR</td>
                <td>{i.quantity}</td>
                <td>{(i.price * i.quantity).toFixed(2)} SAR</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Right: payment form & summary */}
        <div className="order-summary checkout-summary">
          <h2>Payment Details</h2>

          <div className="card-form">
            <label>
              Card Number
              <input
                type="text"
                placeholder="•••• •••• •••• ••••"
                disabled={processing}
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </label>
            <label>
              Expiry
              <input
                type="text"
                placeholder="MM/YY"
                disabled={processing}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
              />
            </label>
            <label>
              CVC
              <input
                type="text"
                placeholder="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                disabled={processing}
                required
              />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} SAR</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{subtotal.toFixed(2)} SAR</span>
          </div>

          <button
            className="btn checkout-btn"
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? "Processing…" : "Pay Now "}
            <span className="btn-price">{subtotal.toFixed(2)} SAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
