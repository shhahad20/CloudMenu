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
import { InvoiceType, Template } from "../api/templates";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [errorInvoices, setErrorInvoices] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

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

        // 2) load templates
        setLoadingTemplates(true);
        fetch(`${API_URL}/templates`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => {
            if (!r.ok) throw new Error("Failed to load templates");
            return r.json();
          })
          .then((list: Template[]) => {
            // sort by most recent update
            const sorted = list.sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            );
            setTemplates(sorted);
          })
          .catch(console.error)
          .finally(() => setLoadingTemplates(false));

        // 3) load last 5 invoices
        setLoadingInvoices(true);
        fetch(`${API_URL}/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => {
            if (!r.ok) throw new Error("Failed to load invoices");
            return r.json();
          })
          .then((list: InvoiceType[]) => {
            // sort newest first, take 5
            const recent = list
              .sort(
                (a, b) =>
                  new Date(b.invoice_date).getTime() -
                  new Date(a.invoice_date).getTime()
              )
              .slice(0, 5);
            setInvoices(recent);
          })
          .catch((err) => setErrorInvoices(err.message))
          .finally(() => setLoadingInvoices(false));
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
                    {/* <th>Total views</th> */}
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTemplates ? (
                    <tr>
                      <td colSpan={6}>Loading…</td>
                    </tr>
                  ) : templates.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No templates found.</td>
                    </tr>
                  ) : (
                    templates.slice(0, 3).map((t) => {
                      const dt = new Date(t.updated_at || "");
                      const date = dt
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, ".");
                      const time = dt.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      });
                      return (
                        <tr key={t.id}>
                          <td>{t.name}</td>
                          <td>{date}</td>
                          <td>{time}</td>
                          <td>#{t.id}</td>
                          {/* <td>{t.view_count}</td> */}
                          <td className="view-cell">⋮</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Last Invoices */}
          <section className="dashboard-section">
            <h2 className="section-title">
              Last Invoices{" "}
                {invoices.some((inv) => inv.status === "Overdue") ? (
                <span className="badge badge--warning">
                  {invoices.filter((inv) => inv.status === "Overdue").length} – Overdue
                </span>
                ) : (
                <span className="badge badge--warning">0 – Overdue</span>
                )}
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
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={6}>Loading…</td>
                    </tr>
                  ) : errorInvoices ? (
                    +(
                      <tr>
                        <td colSpan={6}>Error: {errorInvoices}</td>
                      </tr>
                    )
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No invoices found.</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => {
                      const dt = new Date(inv.invoice_date);
                      const date = dt
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, ".");
                      const time = dt.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      });
                      return (
                        <tr key={inv.id}>
                          <td>
                            <span
                              className={`status-dot status-${inv.status.toLowerCase()}`}
                            />
                            {inv.status}
                          </td>
                          <td>{date}</td>
                          <td>{time}</td>
                          <td>#{inv.id}</td>
                          <td>{inv.total.toFixed(2)} SAR</td>
                          <td className="view-cell">⋮</td>
                        </tr>
                      );
                    })
                  )}
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
