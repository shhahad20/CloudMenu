import React, { useEffect, useState } from "react";
import "../../styles/analytics.scss";
import "../../styles/UI/planUsage.scss";
import Sparkline from "./Sparkline";
import { fetchUserTemplates, PaginatedResult, Template } from "../../api/templates";
import { API_URL } from "../../api/api";
// import PlanUsage from "./PlanUsage";

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState("This Month");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingViews, setLoadingViews] = useState(true);
  const [errorViews, setErrorViews] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<{
    usedMenus: number;
    usedMB: number;
    limitMenus: number;
    limitStorageMB: number;
  } | null>(null);

  // const usedMenus = 1;
  // const limitMenus = 5;
  // const usedStorageMB = 10;
  // const limitStorageMB = 50;

  // Dummy data for sparklines
  const totalViewsTrend = [20, 35, 25, 40, 30, 50, 45];
  // const topTemplateTrend = [5, 15, 10, 18, 14, 20, 17];

  // fetch user’s templates once on mount
  useEffect(() => {
    setLoadingViews(true);
    fetchUserTemplates({
      page: 1,
      pageSize: 1000, // pull as many as you need for analytics
      sortBy: "view_count",
      order: "desc",
    })
      .then((res: PaginatedResult<Template>) => {
        setTemplates(res.data);
      })
      .catch((err) => setErrorViews(err.message))
      .finally(() => setLoadingViews(false));


    // 2) fetch usage in MB
    fetch(`${API_URL}/usage/analytics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, []);


  // const totalViews = templates.reduce((sum, t) => sum + t.view_count, 0);
  // const topTemplate =
  //   templates.length > 0
  //     ? templates.reduce(
  //         (best, t) => (t.view_count > best.view_count ? t : best),
  //         templates[0]
  //       )
  //     : null;
  const tplArray = Array.isArray(templates) ? templates : [];

  const totalViews = tplArray.reduce((sum, t) => sum + (t.view_count || 0), 0);

  const topTemplate = tplArray.length
    ? tplArray.reduce(
        (best, t) =>
          (t.view_count || 0) > (best.view_count || 0) ? t : best,
        tplArray[0]
      )
    : null;

  // const totalViews = totalViewsTrend.reduce((a, b) => a + b, 0);
  // const totalDeltaPct = Math.round((totalViewsTrend[6] / 50) * 100); // sample
  // const topTemplate = {
  //   name: "Classic",
  //   views: topTemplateTrend.reduce((a, b) => a + b, 0),
  // };
  // const percent = Math.min(
  //   100,
  //   Math.round((usedStorageMB / limitStorageMB) * 100)
  // );
  const usedMenus = analytics?.usedMenus ?? 0;
  const usedStorageMB = analytics?.usedMB ?? 0;
  const limitMenus = analytics?.limitMenus ?? 0;
  const limitStorageMB = analytics?.limitStorageMB ?? 0;
  const percent =
    limitStorageMB > 0
      ? Math.min(100, Math.round((usedStorageMB / limitStorageMB) * 100))
      : 0;
  const totalDeltaPct = React.useMemo(() => {
    // e.g. compare last two points of your sparkline data
    if (totalViewsTrend.length < 2) return 0;
    const last = totalViewsTrend[totalViewsTrend.length - 1];
    const prev = totalViewsTrend[totalViewsTrend.length - 2];
    return prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
  }, [totalViewsTrend]);

  <Sparkline
    data={totalViewsTrend}
    strokeColor="#2563EB"
    fillColor="#2563EB"
  />;
  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <select
          className="period-selector"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {["Today", "This Week", "This Month", "This Year"].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="card-top">
            <div className="card-title">Menu visits</div>
            <div className="card-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                  stroke="#1E1E1E"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="card-main">
            {/* <div className="big-number">{totalDeltaPct}%</div>
            <div className="subtitle">
              {totalViews.toLocaleString()} Total visits
            </div> */}
            {loadingViews ? (
              <div>Loading…</div>
            ) : errorViews ? (
              <div className="error">Error: {errorViews}</div>
            ) : (
              <>
                <div className="big-number">{totalViews.toLocaleString()}</div>
                <div className="subtitle">Total visits</div>
              </>
            )}
          </div>
          <div className="card-chart chart-bars-blue">
            {/* {totalViewsTrend.map((v, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar" style={{ height: `${v}px` }} />
              </div>
            ))} */}
            <Sparkline
              data={totalViewsTrend}
              strokeColor="#1e1e1e"
              fillColor="#1e1e1e"
            />
          </div>
        </div>

        {/* Top Viewed Template Card */}
        <div className="analytics-card">
          <div className="card-top">
            <div className="card-title">Top Viewed Template</div>
            <div className="card-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M13 19.9991C12.9051 20 12.7986 20 12.677 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V12.6747C20 12.7973 20 12.9045 19.9991 13M13 19.9991C13.2857 19.9966 13.4663 19.9862 13.6388 19.9448C13.8429 19.8958 14.0379 19.8147 14.2168 19.705C14.4186 19.5814 14.5916 19.4089 14.9375 19.063L19.063 14.9375C19.4089 14.5916 19.5809 14.4186 19.7046 14.2168C19.8142 14.0379 19.8953 13.8424 19.9443 13.6384C19.9857 13.4659 19.9964 13.2855 19.9991 13M13 19.9991V14.6001C13 14.04 13 13.7598 13.109 13.5459C13.2049 13.3577 13.3577 13.2049 13.5459 13.109C13.7598 13 14.0396 13 14.5996 13H19.9991"
                  stroke="#1E1E1E"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="card-main">
            {/* <div className="big-number">{topTemplate.name}</div>
            <div className="subtitle">
              {topTemplate.views.toLocaleString()} Total visits
            </div> */}
            {loadingViews ? (
              <div>Loading…</div>
            ) : errorViews ? (
              <div className="error">Error: {errorViews}</div>
            ) : topTemplate ? (
              <>
                <div className="big-number">{topTemplate.name}</div>
                <div className="subtitle">
                  {topTemplate.view_count.toLocaleString()} Total visits
                </div>
              </>
            ) : (
              <div>No templates yet</div>
            )}
          </div>
          {/* <div className="card-chart chart-bars-gold">
            {topTemplateTrend.map((v, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar" style={{ height: `${v}px` }} />
              </div>
            ))}
          </div> */}
          <div className="arrow-up">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 19V5M12 5L5 12M12 5L19 12"
                stroke="#6b7280"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div className="arrow-up__text">{totalDeltaPct}% vs last month</div>
          </div>
        </div>
        {/* --- Plan Usage Card --- */}
        <div className="analytics-card">
          <div className="card-top">
            <div className="card-title">Plan Usage</div>
          </div>
          <div className="card-main">
            {analytics == null ? (
              <div>Loading…</div>
            ) : (
              <>
                <div className="plan-usage__percent">{percent}%</div>
                <div className="plan-usage__bar-container">
                  <div
                    className="plan-usage__bar"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {analytics != null && (
            <div className="plan-usage__details">
              <div className="plan-usage__details-primary">
                {usedStorageMB} MB used&nbsp;–&nbsp;{usedMenus} Menu
                {usedMenus !== 1 && "s"}
              </div>
              <div className="plan-usage__details-secondary">
                {limitStorageMB - usedStorageMB} MB&nbsp;–&nbsp;
                {limitMenus - usedMenus} Menu
                {limitMenus - usedMenus !== 1 && "s"} Available
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
