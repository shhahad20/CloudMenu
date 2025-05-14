import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/api";
import "../styles/settings.scss";
import { useCart } from "../context/CartContext";
import { plans } from "../api/templates";

type Tab = "general" | "security" | "Subscription";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [availablePlans, setAvailablePlans] = useState<
    Array<{ id: string; name: string; features: string; price_cents: string }>
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
    if (!window.confirm(
      "⚠️ This action is irreversible. Are you sure you want to delete your account?"
    )) return;

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
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="settings-tabs">
        {(["general", "security", "Subscription"] as Tab[]).map((t) => (
          <button
            key={t}
            className={activeTab === t ? "active" : ""}
            onClick={() => {
              setActiveTab(t);
              setError(null);
            }}
          >
            {/* {t === "general" ? "General" : "Security"} */}
            {t[0].toUpperCase() + t.slice(1)}
            {/* {t === "general" ? "General" : t === "security" ? "Security" : "Subscription"} */}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {activeTab === "general" && (
        <div className="settings-section">
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
          <button onClick={handleGeneralSave} disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="settings-section">
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
          <button onClick={handlePasswordSave} disabled={saving}>
            {saving ? "Updating…" : "Update Password"}
          </button>

          {/* Danger Zone */}
      <div className="danger-zone">
        <h3>Delete Account</h3>
        <p>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          className="btn delete-account"
          onClick={handleDeleteAccount}
        >
          Delete My Account
        </button>
      </div>
        </div>
      )}

      {activeTab === "Subscription" && (
        <div className="settings-section subscription">
          {availablePlans.map((planDef) => {
            const isCurrent = planDef.id === currentPlan;
            return (
              <div
                key={planDef.id}
                className={`plan-card ${isCurrent ? "current" : ""}`}
                onClick={() => {
                  if (!isCurrent) {
                    addItem({ id: `plan-${planDef.id}`, name: `plan-${planDef.name}`, quantity: 1, price: parseFloat(planDef.price_cents) });
                    navigate("/checkout");
                  }
                }}
              >
                <h3>{planDef.name}</h3>
                <p>{planDef.features}</p>
                <div className="price">{planDef.price_cents}</div>
                {isCurrent && <span className="badge">Current Plan</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
