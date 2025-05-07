import '../styles/analytics.scss';

export const TemplateViewsChart: React.FC = () => {
  const views = [
    { date: '2025-05-01', count: 50 },
    { date: '2025-05-02', count: 120 },
    { date: '2025-05-03', count: 80 },
    // ...
  ];
  


  return <div className="chart-container">
  {views.map((view, index) => (
    <div key={index} className="bar-wrapper">
      <div
        className="bar"
        style={{ height: `${view.count}px` }}
        title={`${view.date}: ${view.count}`}
      />
      <span className="label">{view.date.slice(5)}</span>
    </div>
  ))}
</div>
;
};
