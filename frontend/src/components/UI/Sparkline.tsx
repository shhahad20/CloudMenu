
// src/components/Sparkline.tsx
import React, { useId } from 'react';
import { motion } from 'framer-motion';
import "../../styles/analytics.scss";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor: string;
  fillColor: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 200,
  height = 60,
  strokeColor,
  fillColor,
}) => {
  const gradId = useId();
  if (data.length < 2) return null;

  const max = Math.max(...data),
        min = Math.min(...data);

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const norm = max === min ? 0.5 : (v - min) / (max - min);
    const y = height - norm * height;
    return [x, y] as [number, number];
  });

  // Build the smooth line path
  let lineD = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const cx = (x1 + x2) / 2;
    lineD += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  }

  // Fill path: from first point, along the curve, to last point, then down and back
  const [x0, y0] = pts[0];
  const [xN] = pts[pts.length - 1];
  const fillD = [
    `M ${x0} ${height}`,                // start at first x on bottom
    `L ${x0} ${y0}`,                    // up to the first point
    lineD.slice(1),                     // the curved path (drop leading 'M')
    `L ${xN} ${height}`,                // down to bottom at last x
    'Z'
  ].join(' ');

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
    //   viewBox={`0 0 ${width} ${height}`}
    viewBox={`0 -2 ${width} ${height + 2}`}
      preserveAspectRatio="none"
    //   overflow="visible"
    >
      <defs>
        <linearGradient id={`spark-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gradient fill matching line extents */}
      <path d={fillD} fill={`url(#spark-fill-${gradId})`} />

      {/* Animated smooth stroke */}
      <motion.path
        d={lineD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
};

export default Sparkline;
