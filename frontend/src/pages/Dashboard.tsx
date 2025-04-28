import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/dashboard.scss';

interface Profile {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

import { API_URL } from "../api/api";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return navigate('/sign-in', { replace: true });
    }

    fetch(`${API_URL}/profiles/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then((data: Profile) => setProfile(data))
      .catch(() => navigate('/sign-in', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <div className="dashboard-loading">Loading…</div>;
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h2 className="sidebar-logo">MyApp</h2>
        <nav>
          <ul>
            <li><Link to="/dashboard">Home</Link></li>
            <li><Link to="/dashboard/menus">My Menus</Link></li>
            <li><Link to="/dashboard/settings">Settings</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header>
          <h1>Welcome, {profile?.username.split(' ')[0]}!</h1>
          <p>Role: {profile?.role}</p>
        </header>

        <section className="dashboard-content">
          <p>Here’s where you’d see your metrics, recent activity, etc.</p>
          {/* You can swap this out with cards, tables, graphs, whatever */}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
