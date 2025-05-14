import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/api";
import "../styles/settings.scss";
import { useCart } from "../context/CartContext";
import { plans } from "../api/templates";
import Navbar from "../components/Navbar";
import Contact from "../components/Contact";

type Tab = "general" | "security" | "Subscription" | "help";
// At top of file, define your icons:
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
  >
    <path
      d="M10.625 13.125C10.625 11.3991 9.22589 10 7.5 10C5.77411 10 4.375 11.3991 4.375 13.125M10.625 13.125H11.1269C11.8256 13.125 12.175 13.125 12.4421 12.9889C12.6773 12.8691 12.8691 12.6773 12.9889 12.4421C13.125 12.175 13.125 11.8256 13.125 11.1269V3.87307C13.125 3.17437 13.125 2.8245 12.9889 2.55737C12.8691 2.32217 12.6773 2.13108 12.4421 2.01124C12.1747 1.875 11.8252 1.875 11.1251 1.875H3.87512C3.17506 1.875 2.82476 1.875 2.55737 2.01124C2.32217 2.13108 2.13108 2.32217 2.01124 2.55737C1.875 2.82476 1.875 3.17506 1.875 3.87512V11.1251C1.875 11.8252 1.875 12.1747 2.01124 12.4421C2.13108 12.6773 2.32217 12.8691 2.55737 12.9889C2.8245 13.125 3.17437 13.125 3.87307 13.125H4.375M10.625 13.125H4.375M7.5 8.125C6.46447 8.125 5.625 7.28553 5.625 6.25C5.625 5.21447 6.46447 4.375 7.5 4.375C8.53553 4.375 9.375 5.21447 9.375 6.25C9.375 7.28553 8.53553 8.125 7.5 8.125Z"
      stroke="#1E1E1E"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
  >
    <path
      d="M5.76904 5.625H4.50012C3.80006 5.625 3.44976 5.625 3.18237 5.76124C2.94717 5.88108 2.75608 6.07217 2.63624 6.30737C2.5 6.57476 2.5 6.92506 2.5 7.62512V11.1251C2.5 11.8252 2.5 12.175 2.63624 12.4424C2.75608 12.6776 2.94717 12.8691 3.18237 12.9889C3.4495 13.125 3.79939 13.125 4.49809 13.125H10.5019C11.2006 13.125 11.55 13.125 11.8171 12.9889C12.0523 12.869 12.244 12.6776 12.3639 12.4424C12.5 12.1753 12.5 11.8259 12.5 11.1272V7.62307C12.5 6.92437 12.5 6.5745 12.3639 6.30737C12.244 6.07217 12.0523 5.88108 11.8171 5.76124C11.5497 5.625 11.2002 5.625 10.5001 5.625H9.23058M5.76904 5.625H9.23058M5.76904 5.625C5.68939 5.625 5.625 5.56043 5.625 5.48077V3.75C5.625 2.71447 6.46447 1.875 7.5 1.875C8.53553 1.875 9.375 2.71447 9.375 3.75V5.48077C9.375 5.56043 9.31024 5.625 9.23058 5.625"
      stroke="#1E1E1E"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const PlanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
  >
    <path
      d="M1.45911 6.46048C1.26333 6.27943 1.36967 5.95212 1.63448 5.92072L5.38672 5.47567C5.49464 5.46287 5.58839 5.3951 5.63391 5.29641L7.21655 1.86529C7.32824 1.62314 7.67249 1.62309 7.78418 1.86524L9.36682 5.29633C9.41234 5.39502 9.50548 5.46298 9.6134 5.47578L13.3658 5.92072C13.6307 5.95212 13.7367 6.27953 13.5409 6.46058L10.7671 9.02619C10.6873 9.09998 10.6518 9.20982 10.673 9.31641L11.4091 13.0225C11.4611 13.284 11.1827 13.4867 10.9501 13.3564L7.65297 11.5104C7.55814 11.4573 7.44292 11.4575 7.34809 11.5106L4.05065 13.356C3.81796 13.4862 3.53909 13.284 3.59106 13.0225L4.32735 9.31665C4.34853 9.21005 4.31309 9.09996 4.2333 9.02617L1.45911 6.46048Z"
      stroke="#1E1E1E"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
const HelpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
  >
    <path
      d="M5.71655 5.67101C5.8233 5.34208 6.01884 5.04935 6.28174 4.82468C6.54463 4.6 6.86487 4.45236 7.20642 4.39817C7.54797 4.34398 7.89764 4.38525 8.21716 4.51752C8.53669 4.64979 8.81341 4.86797 9.01672 5.14771C9.22004 5.42744 9.3418 5.75785 9.36898 6.1026C9.39616 6.44735 9.3274 6.79299 9.17043 7.10114C9.01346 7.40928 8.77461 7.66781 8.47976 7.84851C8.1849 8.02921 7.84582 8.12485 7.5 8.12485V8.75015M7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125ZM7.53113 10.625V10.6875L7.46887 10.6876V10.625H7.53113Z"
      stroke="#1E1E1E"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [availablePlans, setAvailablePlans] = useState<
    Array<{
      id: string;
      name: string;
      features: string[]; // ← array now
      price_cents: string;
    }>
  >([]);

  // form state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "enterprise">(
    "free"
  );

  const navigate = useNavigate();
  useEffect(() => {
    // fetch current user profile
    fetch(`${API_URL}/profiles/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setEmail(data.email);
        setUsername(data.username);
        setUserId(data.id);
        setCurrentPlan(data.plan);
      })
      .catch((e) => setError(e.message));
    // .finally(() => setLoading(false));

    // 2) fetch available plans
    plans()
      .then((data) => {
        // assume your API returns { plans: [...] }
        setAvailablePlans(data.plans ?? data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleGeneralSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ email, username }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile.");
      alert("Profile updated!");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Password update failed.");
      alert("Password successfully updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };
  // Delete account handler
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "⚠️ This action is irreversible. Are you sure you want to delete your account?"
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/settings/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete account.");
      }

      // Clear local session & redirect
      localStorage.removeItem("access_token");
      alert("Your account has been deleted.");
      navigate("/sign-up", { replace: true });
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert("Error deleting account: " + e.message);
      } else {
        alert("An unknown error occurred while deleting the account.");
      }
    }
  };
  if (loading) return <p>Loading…</p>;

  return (
    <>
      <Navbar />
      <div className="settings-page layout">
        <div className="settings-container">
          {/* <div className="settings-tabs">
        {(["general", "security", "Subscription"] as Tab[]).map((t) => (
          <button
            key={t}
            className={activeTab === t ? "active" : ""}
            onClick={() => {
              setActiveTab(t);
              setError(null);
            }}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div> */}
          {/* 1) Sidebar */}
          <aside className="settings-sidebar">
            <h2>Settings</h2>
            <nav className="nav-tabs">
              {(
                [
                  { key: "general", icon: <UserIcon />, label: "General" },
                  { key: "security", icon: <LockIcon />, label: "Security" },
                  {
                    key: "Subscription",
                    icon: <PlanIcon />,
                    label: "Subscription",
                  },
                  {
                    key: "help",
                    icon: <HelpIcon />,
                    label: "Help",
                  },
                ] as const
              ).map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`tab-btn ${activeTab === key ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(key);
                    setError(null);
                  }}
                >
                  <span className="icon">{icon}</span>
                  <span className="label">{label}</span>
                </button>
              ))}
            </nav>
          </aside>
          {/* 2) Divider */}
          <div className="divider" />
          {error && <div className="error">{error}</div>}

          {/* 3) Main content */}
          <section className="settings-content">
            {error && <div className="error">{error}</div>}
            {activeTab === "general" && (
              <div className="settings-section">
                <h1 className="setting-t-header">Profile</h1>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button
                  onClick={handleGeneralSave}
                  disabled={saving}
                  className="save-btn"
                >
                  {saving ? "Saving…" : "Save Profile"}
                </button>
              </div>
            )}

            {activeTab === "security" && (
              <div className="settings-section">
                <h1 className="setting-t-header">Security & Authentication</h1>
                <label>
                  New Password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
                <label>
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
                <button
                  onClick={handlePasswordSave}
                  disabled={saving}
                  className="save-btn"
                >
                  {saving ? "Updating…" : "Update Password"}
                </button>

                {/* Danger Zone */}
                <div className="danger-zone">
                  <h3>Delete Account</h3>
                  <p>
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <button
                    className="delete-account"
                    onClick={handleDeleteAccount}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Subscription" && (
              <div className="settings-section ">
                <h1 className="setting-t-header">Plans & Upgrade</h1>

                <div className="subscription">
                  {availablePlans.map((planDef) => {
                    const isCurrent = planDef.id === currentPlan;
                    return (
                      <div
                        key={planDef.id}
                        className={`plan-card ${isCurrent ? "current" : ""}`}
                      >
                        <div className="plan-header">
                          <div className="plan-subtitle">
                            {planDef.name} Plan
                          </div>
                          <h2 className="plan-title">{planDef.name}</h2>
                        </div>
                        <ul className="plan-features">
                          {planDef.features.map((feature) => (
                            <li key={feature}>
                              <svg
                                className="check-icon"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  stroke="#4CAF50"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <div className="plan-price">
                          ${parseFloat(planDef.price_cents) / 100}/month
                        </div>
                        {isCurrent ? (
                          <button className="current-plan-btn">
                            Current Plan
                          </button>
                        ) : (
                          <button
                            className="choose-plan-btn"
                            onClick={() => {
                              addItem({
                                id: `plan-${planDef.id}`,
                                name: planDef.name,
                                quantity: 1,
                                price: parseFloat(planDef.price_cents) / 100,
                              });
                              navigate("/checkout");
                            }}
                          >
                            Choose Plan
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="settings-section">

              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
