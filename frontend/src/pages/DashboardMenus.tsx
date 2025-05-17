import React, { useEffect, useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/dashboard.scss";
import "../styles/dashboardMenus.scss";
import { API_URL } from "../api/api";
import { SortOption, useListControls } from "../hooks/userListControls";
import { fetchUserTemplates, PaginatedResult } from "../api/templates";
import ListToolbar from "../components/UI/ListToolbar";
import Pagination from "../components/UI/Pagination";

interface UserTemplate {
  id: string;
  name: string;
  preview_url: string;
  created_at: string;
  updated_at: string;
}
const SORT_OPTIONS: SortOption[] = [
  { value: "updated_at", label: "Recently Updated" },
  { value: "created_at", label: "Date Created" },
  { value: "name", label: "Name" },
];

const DashboardMenus: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const [{ page, pageSize, sortBy, order, query }, handlers] = useListControls({
    pageSize: 12,
    sortBy: "updated_at",
    order: "desc",
  });

  // useEffect(() => {
  //   const token = localStorage.getItem("access_token");
  //   if (!token) {
  //     navigate("/sign-in", { replace: true });
  //     return;
  //   }

  //   fetch(`${API_URL}/templates`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then(async (res) => {
  //       if (!res.ok) throw new Error("Failed to fetch your menus");
  //       return res.json();
  //     })
  //     .then((data: UserTemplate[]) => setTemplates(data))
  //     .catch((err) => {
  //       console.error(err);
  //       setError(err.message);
  //     })
  //     .finally(() => setLoading(false));
  // }, [navigate]);

  // // fetch whenever any control changes
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/sign-in", { replace: true });
      return;
    }

    setLoading(true);
    setError(null);

    fetchUserTemplates({ page, pageSize, sortBy, order, q: query })
      .then((res: PaginatedResult<UserTemplate>) => {
        setTemplates(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, sortBy, order, query, navigate]);

  const handleView = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/templates/${id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Failed to record view:", err);
      // not critical—still navigate
    } finally {
      // go to the public menu page
      window.open(`/menus/${id}`, "_blank");
    }
  };

  // if (loading) {
  //   return <div className="dashboard-loading">Loading your menus…</div>;
  // }
  // if (error) {
  //   return <div className="dashboard-error">Error: {error}</div>;
  // }

  return (
    <>
      <Navbar />

      <main className="dashboard-container">
        {/* header + tabs */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">My Menus</h1>
          <p className="dashboard-role">
            Here are the templates you’ve cloned:
          </p>

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

        {/* content */}
        <div className="user-menus">
          <section className="dashboard-content menus-grid">
            {/* Toolbar: search + sort */}
            <ListToolbar
              state={{ page, pageSize, sortBy, order, query }}
              handlers={handlers}
              sortOptions={SORT_OPTIONS}
            />
            {loading && <div className="dashboard-loading">Loading…</div>}
            {error && <div className="dashboard-error">Error: {error}</div>}

            {!loading && !error && templates.length === 0 && (
              <p>You haven’t cloned any menu templates yet.</p>
            )}

            {!loading && !error && templates.length > 0 && (
              <>
                <div className="templates-grid">
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="menu-card">
                      <img
                        src={tpl.preview_url}
                        alt={tpl.name}
                        className="menu-preview-img"
                      />
                      <h3>{tpl.name}</h3>
                      <p className="created-at">
                        Updated{" "}
                        {new Date(tpl.updated_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="created-at">
                        Created{" "}
                        {new Date(tpl.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <div className="card-actions">
                        <Link to={`/builder/${tpl.id}`} className="btn">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleView(tpl.id)}
                          className="btn secondary"
                        >
                          View ↗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlers.setPage}
                />
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default DashboardMenus;
