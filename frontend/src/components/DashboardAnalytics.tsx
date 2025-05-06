import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { API_URL } from '../api/api';

type Point = { day: string; count: number };

export const TemplateViewsChart: React.FC<{ templateId: string }> = ({ templateId }) => {
  const [data, setData] = useState<Point[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/templates/${templateId}/views-by-day`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(setData)
    .catch(console.error);
  }, [templateId]);

  const chartData = {
    labels: data.map(d => d.day),
    datasets: [{
      label: 'Views',
      data: data.map(d => d.count),
      fill: false,
      borderColor: '#007bff'
    }]
  };

  return <Line data={chartData} />;
};
