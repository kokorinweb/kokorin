import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, FONT } from '../../theme';
import { Face } from './Face';
import {
  HAIR,
  HAIR_DARK,
  INK,
  RIG,
  RIM,
  SHIRT,
  SHIRT_SHADE,
  SKIN,
  SKIN_MID,
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

/** Силуэт головы: скулы шире подбородка, иначе лицо читается как шар. */
const HEAD = `M 300 86
  C 392 86, 452 146, 452 224
  C 452 292, 424 348, 366 372
  C 344 381, 322 384, 300 384
  C 278 384, 256 381, 234 372
  C 176 348, 148 292, 148 224
  C 148 146, 208 86, 300 86 Z`;

const TORSO = `M 158 800
  L 172 522
  C 176 448, 208 408, 254 398
  L 346 398
  C 392 408, 424 448, 428 522
  L 442 800 Z`;

/**
 * Человечек нарисован вектором и позируется параметрами, а не картинками.
 * Объём даётся градиентами и размытыми тенями, свет — контровым бликом
 * справа, оттуда же, откуда светит сцена.
 */
export const Guy: React.FC<Props> = ({ pose, poseChangedAt, shirt = 'vibe' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const def = poseDef(pose);

  const breathe = Math.sin(frame / 26) * 0.012;
  const sway = Math.sin(frame / 38) * 1.6;
  const blink = frame % Math.round(fps * 3.1) < 4 ? 1 : 0;

  // На смене позы голова коротко «клюёт» — читается как реакция.
  const nod = interpolate(frame - poseChangedAt, [0, 5, 12], [10, -4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Волосы догоняют голову с запозданием — от этого фигура перестаёт быть жёсткой.
  const hairLag = spring({
    frame: frame - poseChangedAt,
    fps,
    config: { damping: 9, stiffness: 120, mass: 0.9 },
  });
  const hairSwing = interpolate(hairLag, [0, 1], [-7, 0]);

  return (
    <svg viewBox="0 0 600 800" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <Defs />
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
          <g transform={`rotate(${hairSwing * 0.5} 300 200)`}>
            <Hair />
          </g>
        </g>
        {def.overHead ? <Arms pose={def} /> : null}
      </g>
    </svg>
  );
};

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="g-skin" x1="0.75" y1="0" x2="0.2" y2="1">
      <stop offset="0" stopColor={SKIN} />
      <stop offset="0.55" stopColor={SKIN_MID} />
      <stop offset="1" stopColor={SKIN_SHADE} />
    </linearGradient>
    <linearGradient id="g-shirt" x1="0.8" y1="0" x2="0.15" y2="1">
      <stop offset="0" stopColor={SHIRT} />
      <stop offset="1" stopColor={SHIRT_SHADE} />
    </linearGradient>
    <linearGradient id="g-hair" x1="0.7" y1="0" x2="0.2" y2="1">
      <stop offset="0" stopColor={HAIR} />
      <stop offset="1" stopColor={HAIR_DARK} />
    </linearGradient>
    {/* Тени мягкие: жёсткая граница на лице читается как грязь. */}
    <filter id="f-soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <clipPath id="c-head">
      <path d={HEAD} />
    </clipPath>
    <clipPath id="c-torso">
      <path d={TORSO} />
    </clipPath>
  </defs>
);

const Head: React.FC = () => (
  <g>
    <ellipse cx={150} cy={262} rx={25} ry={33} fill="url(#g-skin)" stroke={INK} strokeWidth={6} />
    <ellipse cx={450} cy={262} rx={25} ry={33} fill="url(#g-skin)" stroke={INK} strokeWidth={6} />
    <path d={HEAD} fill="url(#g-skin)" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <g clipPath="url(#c-head)">
      {/* Тень от чёлки и притенённая левая скула. */}
      <ellipse cx={300} cy={132} rx={150} ry={54} fill={SKIN_SHADE} opacity={0.55} filter="url(#f-soft)" />
      <ellipse cx={168} cy={252} rx={62} ry={124} fill={SKIN_SHADE} opacity={0.45} filter="url(#f-soft)" />
    </g>
    {/* Контровой свет по правому краю. */}
    <path
      d="M 452 224 C 452 292, 424 348, 366 372"
      fill="none"
      stroke={RIM}
      strokeWidth={4.5}
      strokeLinecap="round"
    />
  </g>
);

const Hair: React.FC = () => (
  <g>
    <path
      d="M 152 200
         C 142 92, 232 44, 300 56
         C 374 44, 458 96, 448 206
         C 430 142, 376 122, 300 124
         C 224 122, 172 142, 152 200 Z"
      fill="url(#g-hair)"
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    {/* Вихор — единственная асимметрия в фигуре, за неё цепляется глаз. */}
    <path
      d="M 336 60 C 372 10, 424 14, 436 46 C 404 36, 372 44, 348 76 Z"
      fill="url(#g-hair)"
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    {/* Блик и пряди: без них волосы читаются пятном. */}
    <path
      d="M 226 96 C 262 74, 306 68, 344 76"
      fill="none"
      stroke="rgba(255,255,255,0.22)"
      strokeWidth={11}
      strokeLinecap="round"
    />
    <path
      d="M 196 168 C 214 140, 246 124, 276 120"
      fill="none"
      stroke={HAIR_DARK}
      strokeWidth={5}
      strokeLinecap="round"
      opacity={0.7}
    />
    <path
      d="M 404 172 C 392 146, 366 128, 338 122"
      fill="none"
      stroke={HAIR_DARK}
      strokeWidth={5}
      strokeLinecap="round"
      opacity={0.7}
    />
  </g>
);

const Torso: React.FC<{ shirt: string }> = ({ shirt }) => (
  <g>
    <rect x={272} y={332} width={56} height={88} rx={26} fill={SKIN_SHADE} stroke={INK} strokeWidth={6} />
    <path d={TORSO} fill="url(#g-shirt)" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <g clipPath="url(#c-torso)">
      {/* Тень от подбородка на груди и притенённый левый бок. */}
      <ellipse cx={300} cy={412} rx={120} ry={44} fill="#000" opacity={0.38} filter="url(#f-soft)" />
      <ellipse cx={176} cy={600} rx={58} ry={200} fill="#000" opacity={0.3} filter="url(#f-soft)" />
    </g>
    {/* Ворот-резинка. */}
    <path
      d="M 252 400 Q 300 442 348 400"
      fill="none"
      stroke={INK}
      strokeWidth={6}
      strokeLinecap="round"
    />
    <path
      d="M 258 406 Q 300 442 342 406"
      fill="none"
      stroke="rgba(255,255,255,0.14)"
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M 428 522 L 442 800"
      fill="none"
      stroke={RIM}
      strokeWidth={4.5}
      strokeLinecap="round"
      opacity={0.6}
    />
    <text
      x={300}
      y={584}
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

/**
 * Короткие рукава торчат из-под корпуса: они рисуются раньше него,
 * поэтому виден только их наружный край, а стык прячется под футболкой.
 * Руки начинаются ровно от кончика рукава — шва не остаётся.
 */
const Sleeves: React.FC = () => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <ellipse cx={206} cy={476} rx={62} ry={50} transform="rotate(-14 206 476)" fill="url(#g-shirt)" />
    <ellipse cx={394} cy={476} rx={62} ry={50} transform="rotate(14 394 476)" fill="url(#g-shirt)" />
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
    <path d={arm.d} stroke={INK} strokeWidth={RIG.armWidth + 12} strokeLinecap="round" fill="none" />
    <path d={arm.d} stroke="url(#g-skin)" strokeWidth={RIG.armWidth} strokeLinecap="round" fill="none" />
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
      fill="url(#g-skin)"
      stroke={INK}
      strokeWidth={6}
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
        <rect
          x={-46}
          y={-53}
          width={92}
          height={106}
          rx={42}
          fill="url(#g-skin)"
          stroke={INK}
          strokeWidth={6}
        />
      ) : (
        <circle cx={0} cy={0} r={42} fill="url(#g-skin)" stroke={INK} strokeWidth={6} />
      )}
    </g>
  );
};
