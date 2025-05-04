import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../styles/dashboard.scss";

type PlanType = "Free" | "Pro" | "Enterprise";

interface Profile {
  id: string;
  username: string;
  role: string;
  created_at: string;
  plan: PlanType;
}

import { API_URL } from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return navigate("/sign-in", { replace: true });
    }

    fetch(`${API_URL}/profiles/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then((data: Profile) => setProfile(data))
      .catch(() => navigate("/sign-in", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <div className="dashboard-loading">Loading…</div>;
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome, {profile?.username.split(" ")[0]}!
            <span className={`plan-badge plan-badge--${profile?.plan}`}>
              {profile?.plan}
            </span>
          </h1>
          <p className="dashboard-role">{profile?.role}</p>

          <nav className="dashboard-tabs">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                isActive ? "tab tab--active" : "tab"
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/dashboard/menus"
              className={({ isActive }) =>
                isActive ? "tab tab--active" : "tab"
              }
            >
              Menus
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                isActive ? "tab tab--active" : "tab"
              }
            >
              Settings
            </NavLink>
            <NavLink
              to="/dashboard/upgrade/pricing"
              className={({ isActive }) =>
                isActive ? "tab tab--active" : "tab"
              }
            >
              Upgrade
            </NavLink>
          </nav>
        </header>

        <section className="dashboard-content">
          <p>Here’s where you’d see your metrics, recent activity, etc.</p>
          {/* ... */}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;
