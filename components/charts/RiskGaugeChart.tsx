/**
 * Wishlist AI — Risk Gauge Chart
 *
 * SVG semicircular gauge with animated needle.
 * Score 0–100 maps across Conservative → Balanced → Aggressive.
 */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number; // 0–100
  size?: number;
}

export function RiskGaugeChart({ score, size = 200 }: RiskGaugeProps) {
  const [animatedAngle, setAnimatedAngle] = useState(-90);

  // Map score (0–100) to angle (-90° to 90°)
  const targetAngle = -90 + (Math.min(100, Math.max(0, score)) / 100) * 180;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedAngle(targetAngle), 100);
    return () => clearTimeout(timeout);
  }, [targetAngle]);

  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size / 2 - 20;
  const strokeWidth = 14;

  // Create arc path
  const createArc = (startAngle: number, endAngle: number): string => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Three colored segments
  const segments = [
    { start: -180, end: -120, color: "#06D6A0" }, // Conservative (mint)
    { start: -120, end: -60, color: "#FFD166" },  // Balanced (gold)
    { start: -60, end: 0, color: "#FF6B6B" },     // Aggressive (coral)
  ];

  // Needle position
  const needleRad = (animatedAngle * Math.PI) / 180;
  const needleLen = radius - 10;
  const nx = cx + needleLen * Math.cos((-90 + animatedAngle) * Math.PI / 180 - Math.PI / 2);
  const ny = cy + needleLen * Math.sin((-90 + animatedAngle) * Math.PI / 180 - Math.PI / 2);

  // Recalculate needle using proper mapping
  const needleAngleRad = ((animatedAngle - 90) * Math.PI) / 180;
  const needleX = cx + needleLen * Math.cos(needleAngleRad);
  const needleY = cy + needleLen * Math.sin(needleAngleRad);

  const label = score <= 33 ? "Conservative" : score <= 66 ? "Balanced" : "Aggressive";
  const labelColor = score <= 33 ? "#06D6A0" : score <= 66 ? "#FFD166" : "#FF6B6B";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Background arc (gray) */}
        <path
          d={createArc(-180, 0)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {segments.map((seg, i) => (
          <path
            key={i}
            d={createArc(seg.start, seg.end)}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.8}
          />
        ))}

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ x2: cx, y2: cy - needleLen }}
          animate={{ x2: needleX, y2: needleY }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={6} fill="white" />
        <circle cx={cx} cy={cy} r={3} fill="#6C63FF" />

        {/* Labels */}
        <text x={15} y={cy + 20} fontSize={10} fill="rgba(155,155,192,0.6)" fontFamily="sans-serif">
          0
        </text>
        <text x={size - 25} y={cy + 20} fontSize={10} fill="rgba(155,155,192,0.6)" fontFamily="sans-serif">
          100
        </text>
      </svg>

      {/* Score + label */}
      <div className="text-center -mt-2">
        <p className="text-3xl font-bold text-text-primary font-mono-numbers">{score}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: labelColor }}>
          {label}
        </p>
      </div>
    </div>
  );
}
