import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/pricing.scss";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

interface Plan {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  tag?: string;          // <-- new!
}

const plans: Plan[] = [
  {
    name: "Basic",
    priceMonthly: "19",
    priceYearly: "190",
    tag: "",
    features: [
      "10 Projects",
      "5 GB Storage",
      "Basic Support",
      "Community Access",
      "Email Notifications",
    ],
  },
  {
    name: "Pro",
    priceMonthly: "49",
    priceYearly: "490",
    tag: "Most Popular",
    features: [
      "100 Projects",
      "50 GB Storage",
      "Priority Support",
      "Advanced Analytics",
      "Customizable Templates",
      "Team Collaboration",
    ],
  },
  {
    name: "Enterprise",
    priceMonthly: "99",
    priceYearly: "990",
    tag: "",
    features: [
      "Unlimited Projects",
      "200 GB Storage",
      "Dedicated Support",
      "24/7 Customer Service",
      "Custom Integrations",
      "Unlimited Team Members",
      "Advanced Security Features",
    ],
  },
];

const PricingCard: React.FC<{
  plan: Plan;
  yearly: boolean;
}> = ({ plan, yearly }) => {
  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  const suffix = yearly ? "/year" : "/month";

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
      <button className="select-btn">Choose {plan.name}</button>
    </motion.div>
  );
};

const Pricing: React.FC = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <Navbar />
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
          {/* <div className="switch" onClick={() => setYearly((y) => !y)}>
            <motion.div
              className="thumb"
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div> */}
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
      <Footer />
    </>
  );
};

export default Pricing;
