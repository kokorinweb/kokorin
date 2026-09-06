import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CANVAS, COLOR } from '../theme';

const GRID_STEP = 108;

/** Почти чёрный фон: тонкая вертикальная сетка и зелёное свечение снизу. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  // Свечение чуть дышит, чтобы кадр не выглядел стоп-кадром на паузах речи.
  const breathe = 1 + Math.sin(frame / 90) * 0.05;

  const lines = [];
  for (let x = GRID_STEP; x < CANVAS.width; x += GRID_STEP) {
    lines.push(
      <div
        key={x}
        style={{
          position: 'absolute',
          left: x,
          top: 0,
          bottom: 0,
          width: 1,
          background: `linear-gradient(to bottom, transparent, ${COLOR.grid} 22%, ${COLOR.grid} 78%, transparent)`,
        }}
      />,
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg }}>
      {lines}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 55% at 50% 108%, ${COLOR.bgGlow}, transparent 70%)`,
          transform: `scale(${breathe})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(90% 60% at 50% 40%, transparent 40%, rgba(0,0,0,0.55))',
        }}
      />
    </AbsoluteFill>
  );
};
