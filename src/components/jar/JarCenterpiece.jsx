import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Large animated jar SVG — centerpiece component.
 * Props:
 *   fillPercent  0-100 (and beyond 100 for overflow)
 *   color        hex fill color
 *   goalLabel    e.g. "daily limit: 10"
 *   todayCount   integer to show big above jar
 *   overGoal     boolean — show overflow drip
 *   overGoalBy   integer
 *   animate      boolean — pour animation on mount/change
 */
export default function JarCenterpiece({
  fillPercent = 0,
  color = '#abff4f',
  goalLabel = '',
  todayCount = 0,
  overGoal = false,
  overGoalBy = 0,
  animate: doAnimate = true,
}) {
  const [displayed, setDisplayed] = useState(doAnimate ? 0 : fillPercent);
  const prevRef = useRef(fillPercent);
  const [wobble, setWobble] = useState(0); // 0 = idle, 1 = wobbling

  // Pour animation on fillPercent change
  useEffect(() => {
    if (!doAnimate) { setDisplayed(fillPercent); return; }
    const start = prevRef.current;
    const end = Math.min(fillPercent, 100);
    prevRef.current = fillPercent;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    const raf = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [fillPercent, doAnimate]);

  // Wobble every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWobble(w => w + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // SVG dimensions
  const W = 160;
  const H = 220;
  const bodyX = 14;
  const bodyY = 28;
  const bodyW = W - 28;
  const bodyH = H - 36;
  const neckX = W * 0.28;
  const neckW = W * 0.44;
  const neckH = 20;
  const rx = 10;

  const cappedFill = Math.min(displayed, 100);
  const fillH = (cappedFill / 100) * bodyH;
  const fillY = bodyY + bodyH - fillH;

  // Wobble offset: a wave shift applied to the fill rect top
  const wobbleOffset = wobble > 0 ? Math.sin(wobble) * 0 : 0; // triggers re-render via key

  const isOverGoal = fillPercent > 100;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Today count */}
      <motion.div
        key={todayCount}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center"
      >
        <span
          className="font-mono font-black"
          style={{
            fontSize: 64,
            lineHeight: 1,
            color: isOverGoal ? '#c1121f' : 'white',
          }}
        >
          {todayCount}
        </span>
        {goalLabel ? (
          <span className="font-mono text-[11px] text-muted-foreground mt-1">{goalLabel}</span>
        ) : null}
        {isOverGoal && overGoalBy > 0 && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs mt-1"
            style={{ color: '#c1121f' }}
          >
            {overGoalBy} above today's limit
          </motion.span>
        )}
      </motion.div>

      {/* Jar SVG */}
      <div
        className="relative"
        style={{
          width: W,
          height: H,
          // responsive: 280px on mobile, 360px on desktop achieved via parent wrapper
        }}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <clipPath id="jar-clip">
              <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={rx} />
            </clipPath>
            {/* Wobble filter */}
            <filter id="wobble-filter">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="2"
                seed={wobble}
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale={displayed > 0 ? 3 : 0}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>

          {/* Jar neck */}
          <rect
            x={neckX}
            y={4}
            width={neckW}
            height={neckH}
            rx={5}
            fill="#141414"
            stroke="#2a2a2a"
            strokeWidth={1.5}
          />
          {/* Neck highlight */}
          <rect
            x={neckX + 2}
            y={5}
            width={neckW - 4}
            height={3}
            rx={2}
            fill="rgba(255,255,255,0.05)"
          />

          {/* Jar body background */}
          <rect
            x={bodyX}
            y={bodyY}
            width={bodyW}
            height={bodyH}
            rx={rx}
            fill="#0d0d0d"
            stroke="#2a2a2a"
            strokeWidth={1.5}
          />

          {/* Fill liquid — clipped to jar body */}
          <g clipPath="url(#jar-clip)">
            {/* Liquid body */}
            <motion.rect
              x={bodyX}
              y={fillY}
              width={bodyW}
              height={fillH + 10}
              fill={color}
              fillOpacity={0.25}
            />
            {/* Liquid surface (brighter) */}
            <motion.rect
              x={bodyX}
              y={fillY}
              width={bodyW}
              height={3}
              rx={1}
              fill={color}
              fillOpacity={0.7}
              filter="url(#wobble-filter)"
            />
          </g>

          {/* Jar body border on top of fill */}
          <rect
            x={bodyX}
            y={bodyY}
            width={bodyW}
            height={bodyH}
            rx={rx}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={1.5}
          />
          {/* Glass highlight */}
          <rect
            x={bodyX + 4}
            y={bodyY + 6}
            width={10}
            height={bodyH - 12}
            rx={5}
            fill="rgba(255,255,255,0.03)"
          />

          {/* Overflow drip — when over goal */}
          {isOverGoal && (
            <motion.ellipse
              cx={bodyX + bodyW * 0.7}
              cy={bodyY + 4}
              rx={4}
              ry={6}
              fill={color}
              fillOpacity={0.6}
              animate={{ cy: [bodyY + 4, bodyY + 30, bodyY + 4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </svg>

        {/* % label inside jar when has fill */}
        {cappedFill > 15 && (
          <div
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              left: bodyX,
              top: fillY,
              width: bodyW,
              height: fillH,
            }}
          >
            <span
              className="font-mono text-[11px] font-semibold"
              style={{ color, opacity: 0.9 }}
            >
              {Math.round(cappedFill)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}