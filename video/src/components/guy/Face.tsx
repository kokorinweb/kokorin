import React from 'react';
import { EYE_WHITE, INK, RIG, SKIN_SHADE, type Expression } from './parts';

/** Веки, брови и рот. Всё остальное в голове не двигается. */
export const Face: React.FC<{ expr: Expression; blink: number }> = ({ expr, blink }) => (
  <g>
    <Cheeks expr={expr} />
    <Eye side="l" expr={expr} blink={blink} />
    <Eye side="r" expr={expr} blink={blink} />
    <Brows expr={expr} />
    <Mouth expr={expr} />
  </g>
);

const Cheeks: React.FC<{ expr: Expression }> = ({ expr }) => {
  const strong = expr === 'happy' || expr === 'laugh' || expr === 'shock';
  return (
    <g fill="#F0A183" opacity={strong ? 0.5 : 0.28}>
      <ellipse cx={196} cy={302} rx={34} ry={20} />
      <ellipse cx={404} cy={302} rx={34} ry={20} />
    </g>
  );
};

const Eye: React.FC<{ side: 'l' | 'r'; expr: Expression; blink: number }> = ({
  side,
  expr,
  blink,
}) => {
  const cx = side === 'l' ? RIG.eye.lx : RIG.eye.rx;
  const cy = RIG.eye.cy;
  const dir = side === 'l' ? -1 : 1;

  // Дуга вместо глаза — для смеха, зажмуренной радости и моргания.
  const arc = expr === 'laugh' || blink > 0.5;
  if (arc) {
    return (
      <path
        d={`M ${cx - 36} ${cy + 6} Q ${cx} ${cy - 32} ${cx + 36} ${cy + 6}`}
        stroke={INK}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  const wide = expr === 'shock';
  const rw = wide ? RIG.eye.rw + 5 : RIG.eye.rw;
  const rh = wide ? RIG.eye.rh + 9 : RIG.eye.rh;
  const pupil = wide ? 13 : 20;

  // Зрачки уводим в сторону, когда персонаж думает или недоволен.
  const gaze = expr === 'think' ? 12 : expr === 'annoyed' ? -8 : 0;
  const drop = expr === 'sad' ? 6 : 0;

  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rw} ry={rh} fill={EYE_WHITE} stroke={INK} strokeWidth={5.5} />
      <circle cx={cx + gaze * dir * 0.4 + gaze} cy={cy + drop} r={pupil} fill={INK} />
      <circle cx={cx + gaze + 8} cy={cy + drop - 9} r={6} fill="#FFFFFF" />
      {expr === 'annoyed' || expr === 'sad' ? (
        // Полуприкрытое веко: перекрываем верх глаза цветом кожи.
        <path
          d={`M ${cx - rw - 4} ${cy - 4} A ${rw + 4} ${rh + 4} 0 0 1 ${cx + rw + 4} ${cy - 4} Z`}
          fill={SKIN_SHADE}
          stroke={INK}
          strokeWidth={5.5}
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
};

const Brows: React.FC<{ expr: Expression }> = ({ expr }) => {
  // Внутренний край брови вверх — удивление, вниз — злость.
  const inner = { neutral: 0, happy: -6, laugh: -8, shock: -22, think: -4, annoyed: 16, sad: -18 }[
    expr
  ];
  const lift = { neutral: -5, happy: -8, laugh: -10, shock: -20, think: -9, annoyed: 4, sad: -3 }[expr];
  // Низкая бровь читается как злость, поэтому базовая высота с запасом.
  const y = RIG.eye.cy - 76 + lift;

  const brow = (cx: number, dir: number) => (
    <path
      d={`M ${cx - 42 * dir} ${y + inner} Q ${cx} ${y - 14} ${cx + 42 * dir} ${y + 4}`}
      stroke={INK}
      strokeWidth={10}
      strokeLinecap="round"
      fill="none"
    />
  );

  return (
    <g>
      {brow(RIG.eye.lx, 1)}
      {brow(RIG.eye.rx, -1)}
    </g>
  );
};

const Mouth: React.FC<{ expr: Expression }> = ({ expr }) => {
  const y = RIG.mouthY;

  if (expr === 'laugh') {
    return (
      <g>
        <path
          d={`M 252 ${y - 12} Q 300 ${y - 4} 348 ${y - 12} Q 336 ${y + 54} 300 ${y + 54} Q 264 ${y + 54} 252 ${y - 12} Z`}
          fill="#2A1216"
          stroke={INK}
          strokeWidth={5.5}
          strokeLinejoin="round"
        />
        <path
          d={`M 274 ${y + 30} Q 300 ${y + 16} 326 ${y + 30} Q 326 ${y + 54} 300 ${y + 54} Q 274 ${y + 54} 274 ${y + 30} Z`}
          fill="#E1687C"
        />
      </g>
    );
  }

  if (expr === 'shock') {
    return <ellipse cx={300} cy={y + 16} rx={27} ry={35} fill="#2A1216" stroke={INK} strokeWidth={5.5} />;
  }

  const d = {
    neutral: `M 268 ${y} Q 300 ${y + 20} 332 ${y}`,
    happy: `M 258 ${y - 8} Q 300 ${y + 40} 342 ${y - 8}`,
    think: `M 272 ${y + 8} Q 300 ${y - 4} 330 ${y + 10}`,
    annoyed: `M 268 ${y + 10} Q 300 ${y + 2} 332 ${y - 2}`,
    sad: `M 268 ${y + 16} Q 300 ${y - 10} 332 ${y + 16}`,
    laugh: '',
    shock: '',
  }[expr];

  return <path d={d} stroke={INK} strokeWidth={10} strokeLinecap="round" fill="none" />;
};
