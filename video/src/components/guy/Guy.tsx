import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, FONT } from '../../theme';
import { Face } from './Face';
import {
  HAIR,
  INK,
  RIG,
  SHIRT,
  SHIRT_SHADE,
  SKIN,
  SKIN_SHADE,
  poseDef,
  type Arm,
  type HandShape,
  type PoseDef,
} from './parts';

type Props = {
  pose?: string;
  /** Кадр, на котором сменилась поза: с него считается реакция. */
  poseChangedAt: number;
  /** Надпись на футболке. */
  shirt?: string;
};

/**
 * Человечек нарисован вектором и позируется параметрами, а не картинками.
 * Поэтому пропорции, свет и лицо не «плывут» от позы к позе.
 */
export const Guy: React.FC<Props> = ({ pose, poseChangedAt, shirt = 'vibe' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const def = poseDef(pose);

  // Дыхание и лёгкое покачивание, чтобы кадр не выглядел мёртвым.
  const breathe = Math.sin(frame / 26) * 0.012;
  const sway = Math.sin(frame / 38) * 1.6;

  // Моргание раз в три секунды, четыре кадра.
  const blink = frame % Math.round(fps * 3.1) < 4 ? 1 : 0;

  // На смене позы голова коротко «клюёт» — читается как реакция.
  const nod = interpolate(frame - poseChangedAt, [0, 5, 12], [10, -4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg viewBox="0 0 600 800" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <g
        transform={`translate(${sway} 0)`}
        style={{ transform: `scaleY(${1 + breathe})`, transformOrigin: '300px 800px' }}
      >
        <Sleeves />
        <Torso shirt={shirt} />
        {def.overHead ? null : <Arms pose={def} />}
        <g transform={`rotate(${def.tilt + sway * 0.4} 300 380) translate(0 ${nod})`}>
          <Head />
          <Face expr={def.expr} blink={blink} />
          <Hair />
        </g>
        {def.overHead ? <Arms pose={def} /> : null}
      </g>
    </svg>
  );
};

const Torso: React.FC<{ shirt: string }> = ({ shirt }) => (
  <g>
    <rect x={272} y={330} width={56} height={90} rx={26} fill={SKIN_SHADE} stroke={INK} strokeWidth={8} />
    <path
      d="M 168 800 L 176 500 Q 182 412 252 398 L 348 398 Q 418 412 424 500 L 432 800 Z"
      fill={SHIRT}
      stroke={INK}
      strokeWidth={8}
      strokeLinejoin="round"
    />
    <path
      d="M 254 398 Q 300 438 346 398"
      fill={SHIRT_SHADE}
      stroke={INK}
      strokeWidth={8}
      strokeLinejoin="round"
    />
    <text
      x={300}
      y={572}
      textAnchor="middle"
      fill={COLOR.accent}
      fontFamily={FONT.mono}
      fontSize={54}
      fontWeight={700}
      letterSpacing="2"
    >
      {shirt}
    </text>
  </g>
);

const Head: React.FC = () => (
  <g>
    <ellipse cx={148} cy={266} rx={26} ry={34} fill={SKIN_SHADE} stroke={INK} strokeWidth={8} />
    <ellipse cx={452} cy={266} rx={26} ry={34} fill={SKIN_SHADE} stroke={INK} strokeWidth={8} />
    <ellipse
      cx={RIG.head.cx}
      cy={RIG.head.cy}
      rx={RIG.head.rx}
      ry={RIG.head.ry}
      fill={SKIN}
      stroke={INK}
      strokeWidth={8}
    />
  </g>
);

const Hair: React.FC = () => (
  <g fill={HAIR} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <path
      d="M 154 196
         C 146 84, 236 40, 300 52
         C 372 40, 458 92, 448 202
         C 432 138, 378 118, 300 120
         C 222 118, 172 138, 154 196 Z"
    />
    {/* Вихор — единственная асимметрия в фигуре, за неё цепляется глаз. */}
    <path d="M 336 58 C 372 8, 424 12, 436 44 C 404 34, 372 42, 348 74 Z" />
  </g>
);

/**
 * Короткие рукава торчат из-под корпуса: они рисуются раньше него,
 * поэтому виден только их наружный край, а стык прячется под футболкой.
 * Руки начинаются ровно от кончика рукава — шва не остаётся.
 */
const Sleeves: React.FC = () => (
  <g fill={SHIRT} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <ellipse cx={206} cy={476} rx={62} ry={50} transform="rotate(-14 206 476)" />
    <ellipse cx={394} cy={476} rx={62} ry={50} transform="rotate(14 394 476)" />
  </g>
);

/** Руки-«лапша»: контур и заливка одной кривой, кисть — отдельной фигурой. */
const Arms: React.FC<{ pose: PoseDef }> = ({ pose }) => (
  <g>
    <ArmShape arm={pose.armR} />
    <ArmShape arm={pose.armL} />
  </g>
);

const ArmShape: React.FC<{ arm: Arm }> = ({ arm }) => (
  <g>
    <path d={arm.d} stroke={INK} strokeWidth={RIG.armWidth + 16} strokeLinecap="round" fill="none" />
    <path d={arm.d} stroke={SKIN} strokeWidth={RIG.armWidth} strokeLinecap="round" fill="none" />
    <Hand shape={arm.hand} x={arm.x} y={arm.y} angle={arm.angle} />
  </g>
);

const Hand: React.FC<{ shape: HandShape; x: number; y: number; angle: number }> = ({
  shape,
  x,
  y,
  angle,
}) => {
  const finger = (dx: number, dy: number, len: number, rot: number) => (
    <rect
      x={dx - 15}
      y={dy - len}
      width={30}
      height={len}
      rx={15}
      fill={SKIN}
      stroke={INK}
      strokeWidth={8}
      transform={`rotate(${rot} ${dx} ${dy})`}
    />
  );

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {shape === 'point' ? finger(0, -22, 64, 0) : null}
      {shape === 'thumb' ? finger(-8, -22, 56, -20) : null}
      {shape === 'victory' ? (
        <>
          {finger(-17, -20, 60, -16)}
          {finger(17, -20, 60, 16)}
        </>
      ) : null}
      {shape === 'palm' ? (
        <rect x={-46} y={-53} width={92} height={106} rx={42} fill={SKIN} stroke={INK} strokeWidth={8} />
      ) : (
        <circle cx={0} cy={0} r={42} fill={SKIN} stroke={INK} strokeWidth={8} />
      )}
    </g>
  );
};
