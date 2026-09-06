import React from 'react';
import { COLOR, FONT } from '../../theme';
import type { Tone } from '../../script/types';

export const toneColors = (tone: Tone = 'accent') => {
  if (tone === 'warn') return { bg: COLOR.warn, ink: COLOR.warnInk };
  if (tone === 'plain') return { bg: COLOR.panel, ink: COLOR.textDim };
  return { bg: COLOR.accent, ink: COLOR.accentInk };
};

/** Моноширинная плашка-подпись под визуалом — фирменный элемент формата. */
export const Chip: React.FC<{ label: string; tone?: Tone; size?: number }> = ({
  label,
  tone = 'accent',
  size = 28,
}) => {
  const { bg, ink } = toneColors(tone);
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: ink,
        fontFamily: FONT.mono,
        fontSize: size,
        fontWeight: 500,
        padding: '7px 16px 9px',
        borderRadius: 9,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};

/** Тёмная панель со скруглением и тонкой рамкой — контейнер для кода и скриншотов. */
export const Panel: React.FC<{ children: React.ReactNode; pad?: number }> = ({
  children,
  pad = 30,
}) => (
  <div
    style={{
      background: COLOR.panel,
      border: `1px solid ${COLOR.panelLine}`,
      borderRadius: 20,
      padding: pad,
      boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
      width: '100%',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

export const Stack: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 24,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap,
      width: '100%',
    }}
  >
    {children}
  </div>
);
