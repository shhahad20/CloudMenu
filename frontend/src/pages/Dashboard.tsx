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
// import PlanUsage from "../components/UI/PlanUsage";
import AnalyticsPage from "../components/UI/Analytics";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);

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
      .then((data: Profile) => {
        setProfile(data);

        // 2) now load invoices to get count
        fetch(`${API_URL}/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => {
            if (!r.ok) throw new Error("Failed to load invoices");
            return r.json();
          })
          .then((inv: { id: string; amount: number; date: string }[]) =>
            setInvoiceCount(inv.length)
          )
          .catch(() => setInvoiceCount(0));
      })
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
              to="/dashboard/invoices"
              className={({ isActive }) =>
                isActive ? "tab tab--active" : "tab"
              }
            >
              Invoices
            </NavLink>
            <NavLink
              to="/dashboard/upgrade/pricing"
              className={({ isActive }) =>
                isActive ? "tab tab--active" : "tab"
              }
            >
              Upgrade
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
              to="/contact"
              className={({ isActive }) =>
                isActive ? "tab tab--active" : "tab"
              }
            >
              Support
            </NavLink>
          </nav>
        </header>

        <section className="dashboard-content">
          <div className="dashboard-left-content">
            {/* <PlanUsage
              usedStorageMB={10}
              usedMenus={1}
              limitStorageMB={50}
              limitMenus={5}
            /> */}
            {/* {invoiceCount !== null && (
              <div className="invoice-count">
              <strong>{invoiceCount} - invoices</strong>
              <button
                className="manage-invoices-button"
                onClick={() => navigate("/dashboard/invoices")}
              >
                Manage invoices
              </button>
              </div>
            )}
            {invoiceCount !== null && (
              <div className="invoice-status">
              <strong>2 - overdue invoices</strong>
              <strong>5 - paid invoices</strong>
              </div>
            )} */}
          </div>

          <div className="dashboard-right-content">
            <AnalyticsPage />
          </div>

          {/* Last Menu Updates */}
          <section className="dashboard-section">
            <h2 className="section-title">Last Menu Updates</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Last Update</th>
                    <th>Time</th>
                    <th>#NUM</th>
                    <th>Total views</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {/* map your real menu data here */}
                  {[
                    {
                      status: "Classic",
                      date: "23.05.2025",
                      time: "11:10 AM",
                      num: "#1234566",
                    },
                    {
                      status: "Modern",
                      date: "22.05.2025",
                      time: "10:45 AM",
                      num: "#1234567",
                    },
                    {
                      status: "Vintage",
                      date: "21.05.2025",
                      time: "09:30 AM",
                      num: "#1234568",
                    },
                  ].map((m, i) => (
                    <tr key={i}>
                      <td>{m.status}</td>
                      <td>{m.date}</td>
                      <td>{m.time}</td>
                      <td>{m.num}</td>
                      <td>Upgrade Plan</td>
                      <td className="view-cell">⋮</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Last Invoices */}
          <section className="dashboard-section">
            <h2 className="section-title">
              Last Invoices{" "}
              <span className="badge badge--warning">3 – Overdue</span>
            </h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>#NUM</th>
                    <th>Total</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {/* map your real invoice data here */}
                  {[
                    {
                      status: "Paid",
                      date: "23.05.2025",
                      time: "11:10 AM",
                      num: "#1234566",
                      total: "230 SAR",
                    },
                    {
                      status: "Draft",
                      date: "22.05.2025",
                      time: "10:45 AM",
                      num: "#1234567",
                      total: "0 SAR",
                    },
                  ].map((inv, i) => (
                    <tr key={i}>
                      <td>
                        <span
                          className={`status-dot status-${inv.status.toLowerCase()}`}
                        >
                          {/* &bull; */}
                        </span>{" "}
                        {inv.status}
                      </td>
                      <td>{inv.date}</td>
                      <td>{inv.time}</td>
                      <td>{inv.num}</td>
                      <td>{inv.total}</td>
                      <td className="view-cell">⋮</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;
