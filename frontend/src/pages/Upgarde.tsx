import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/dashboard.scss';
import '../styles/upgrade.scss';
import { API_URL } from "../api/api";

interface Plan {
  name: 'Free' | 'Pro' | 'Enterprise';
  price: number; 
}

const Upgrade: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/sign-in', { replace: true });

    fetch(`${API_URL}/plans`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <div className="dashboard-loading">Loading plans…</div>;
  }
console.log(plans);
  return (
    <>
      <Navbar />

      <main className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Upgrade Your Plan</h1>
          <p className="dashboard-role">
            Choose the plan that’s right for you.
          </p>

          <nav className="dashboard-tabs">
            <NavLink to="/dashboard" end className="tab">
              Overview
            </NavLink>
            <NavLink to="/dashboard/menus" className="tab">
              Menus
            </NavLink>
            <NavLink to="/dashboard/settings" className="tab">
              Settings
            </NavLink>
            <NavLink to="/dashboard/upgrade" className="tab tab--active">
              Upgrade
            </NavLink>
          </nav>
        </header>

        <section className="dashboard-content upgrade-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`plan-card plan-card--${plan.name}`}>
              <h2>{plan.name}</h2>
              <p className="price">${plan.price}/month</p>
              <button
                className="btn subscribe-btn"
                onClick={() => alert(`Subscribing to ${plan.name}`)}
              >
                {plan.name === 'Free' ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Upgrade;
