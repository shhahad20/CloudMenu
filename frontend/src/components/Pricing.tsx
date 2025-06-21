import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

import "../styles/pricing.scss";
import { API_URL } from "../api/api";


interface Plan {
  name: string;
  price_cents: number;
  features: string[];
  tag?: string;  
  // isPlan: true,         
}

const PricingCard: React.FC<{
  plan: Plan;
  yearly: boolean;
}> = ({ plan, yearly }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const price = yearly ? plan.price_cents*10 : plan.price_cents;
  const suffix = yearly ? '/year' : '/month';

  const handleSelect = () => {
    // push a “subscription” item with a special ID
    addItem({
      id: `plan-${plan.name}`, 
      name: `${plan.name} Plan`, 
      price: price, 
      quantity: 1,
    });
    navigate('/checkout');
  };

  return (
    <motion.div
      className="pricing-card"
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {plan.tag && <div className="plan-tag">{plan.tag}</div>}  {/* badge */}
      <h3 className="plan-name">{plan.name}</h3>
      <div className="plan-price">
        <span className="amount">${price}</span>
        <span className="suffix">{suffix}</span>
      </div>
      <ul className="features">
        {plan.features.map((f, i) => (
          <li key={i}>
            <img className="feature-icon" src="/checked.svg" alt="✓" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className="select-btn" onClick={handleSelect}>Choose {plan.name}</button>
    </motion.div>
  );
}; 

const Pricing: React.FC = () => {
  const [yearly, setYearly] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/plans`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch plans");
        return res.json() as Promise<Plan[]>;
      })
      .then((data) => {
        console.log(data)
        // derive full Plan objects
        const enriched: Plan[] = data.map((p) => ({
          name: p.name,
          price_cents: p.price_cents,
          // priceYearly: p.price * 10, // e.g. 10 months for the price of 10
          tag: p.tag || "", // use tag from the database
          features: p.features || [], // use features from the database
          // isPlan: true, // this is a plan
        }));
        setPlans(enriched);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="pricing-container">Loading plans…</div>;
  }
  if (error) {
    return <div className="pricing-container error">Error: {error}</div>;
  }

  return (
      <div className="pricing-container">
        <h1 className="pricing-header">Choose the Perfect Plan for You</h1>

        {/* add a class here so CSS can target thumb position */}
        <div className={`toggle-switch ${yearly ? "yearly" : "monthly"}`}>
          <span
            className={!yearly ? "active" : ""}
            onClick={() => setYearly(false)}
          >
            Monthly
          </span>
          <span
            className={yearly ? "active" : ""}
            onClick={() => setYearly(true)}
          >
            Yearly
          </span>
        </div>

        <div className="cards-grid">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} yearly={yearly} />
          ))}
        </div>
      </div>
  );
};

export default Pricing;
