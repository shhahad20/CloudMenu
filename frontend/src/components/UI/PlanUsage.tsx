import React from 'react';
import '../../styles/UI/planUsage.scss';

interface PlanUsageProps {
  usedStorageMB: number;
  usedMenus: number;
  limitStorageMB: number;
  limitMenus: number;
}

const PlanUsage: React.FC<PlanUsageProps> = ({
  usedStorageMB,
  usedMenus,
  limitStorageMB,
  limitMenus,
}) => {
  const percent = Math.min(
    100,
    Math.round((usedStorageMB / limitStorageMB) * 100)
  );

  return (
    <div className="plan-usage">
      <h2 className="plan-usage__title">Plan Usage</h2>

      <div className="plan-usage__body">
        <div className="plan-usage__percent">{percent}%</div>

        <div className="plan-usage__bar-container">
          <div
            className="plan-usage__bar"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="plan-usage__details">
          <div className="plan-usage__details-primary">
            {usedStorageMB} MB used – {usedMenus} Menu
            {usedMenus !== 1 ? 's' : ''}
          </div>
          <div className="plan-usage__details-secondary">
            {limitStorageMB - usedStorageMB} MB –{' '}
            {limitMenus - usedMenus} Menu
            {(limitMenus - usedMenus) !== 1 ? 's' : ''} Available
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanUsage;
