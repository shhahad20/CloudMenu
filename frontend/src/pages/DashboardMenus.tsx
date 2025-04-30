// src/pages/DashboardMenus.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/dashboard.scss';
import '../styles/dashboardMenus.scss';
import { API_URL } from '../api/api';

interface UserTemplate {
  id: string;
  name: string;
  preview_url: string;
  created_at: string;
}

const DashboardMenus: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string|null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/sign-in', { replace: true });
      return;
    }

    fetch(`${API_URL}/templates`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch your menus');
        return res.json();
      })
      .then((data: UserTemplate[]) => {
        setTemplates(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <div className="dashboard-loading">Loading your menus…</div>;
  }
  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <h2 className="sidebar-logo">MyApp</h2>
          <nav>
            <ul>
              <li><Link to="/dashboard">Home</Link></li>
              <li className="active"><Link to="/dashboard/menus">My Menus</Link></li>
              <li><Link to="/dashboard/settings">Settings</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="dashboard-main">
          <header>
            <h1>My Menus</h1>
            <p>Here are the templates you’ve cloned:</p>
          </header>

          {templates.length === 0 ? (
            <p>You haven’t cloned any menu templates yet.</p>
          ) : (
            <div className="menus-grid">
              {templates.map(tpl => (
                <div key={tpl.id} className="menu-card">
                  <img
                    src={tpl.preview_url}
                    alt={tpl.name}
                    className="menu-preview-img"
                  />
                  <h3>{tpl.name}</h3>
                  <p className="created-at">
                    Created {new Date(tpl.created_at).toLocaleDateString()}
                  </p>
                  <div className="card-actions">
                    <Link to={`/builder/${tpl.id}`} className="btn">
                      Edit
                    </Link>
                    <Link to={`/menus/${tpl.id}`} className="btn secondary">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DashboardMenus;
