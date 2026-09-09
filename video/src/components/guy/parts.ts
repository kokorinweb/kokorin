/** Палитра и геометрия человечка. Всё, что задаёт его внешность, — здесь. */
export const SKIN = '#FBD9B4';
export const SKIN_MID = '#F3C393';
export const SKIN_SHADE = '#DFA574';
export const HAIR = '#3A2A20';
export const HAIR_DARK = '#241811';
export const SHIRT = '#26323F';
export const SHIRT_SHADE = '#151C25';
/** Обводка тёплая тёмно-коричневая, а не чёрная: чистый чёрный удешевляет. */
export const INK = '#241812';
export const EYE_WHITE = '#FFFFFF';
/** Контровой свет с той же стороны, откуда светит сцена. */
export const RIM = 'rgba(214, 245, 140, 0.3)';

/** Опорные точки фигуры в системе viewBox 600x800. */
export const RIG = {
  head: { cx: 300, cy: 232, rx: 152, ry: 147 },
  eye: { lx: 242, rx: 358, cy: 232, rw: 39, rh: 43 },
  mouthY: 316,
  armWidth: 46,
} as const;

export type HandShape = 'fist' | 'palm' | 'point' | 'thumb' | 'victory';
export type Expression = 'neutral' | 'happy' | 'laugh' | 'shock' | 'think' | 'annoyed' | 'sad';

export type Arm = {
  /** Кривая от плеча к кисти. */
  d: string;
  hand: HandShape;
  /** Куда развёрнута кисть, градусы. */
  angle: number;
  x: number;
  y: number;
};

export type PoseDef = {
  armL: Arm;
  armR: Arm;
  expr: Expression;
  /** Наклон головы, градусы. */
  tilt: number;
  /** Рисовать руки поверх головы. Нужно только для жестов у лица. */
  overHead?: boolean;
};

/** Руки растут из кончика рукава, а не из середины корпуса. */
const SLEEVE_L = 'M156 490';
const SLEEVE_R = 'M444 490';

const armDown = (side: 'L' | 'R'): Arm =>
  side === 'L'
    ? { d: `${SLEEVE_L} Q 146 580 172 660`, hand: 'fist', angle: -6, x: 172, y: 660 }
    : { d: `${SLEEVE_R} Q 454 580 428 660`, hand: 'fist', angle: 6, x: 428, y: 660 };

/**
 * Позы. Название — это поле `pose` у сцены сценария.
 * Левая и правая считаются по экрану, а не по телу.
 */
export const POSES: Record<string, PoseDef> = {
  idle: { armL: armDown('L'), armR: armDown('R'), expr: 'neutral', tilt: 0 },

  point: {
    armL: armDown('L'),
    armR: { d: `${SLEEVE_R} Q 492 398 474 252`, hand: 'point', angle: 0, x: 474, y: 252 },
    expr: 'happy',
    tilt: -3,
  },

  shrug: {
    armL: { d: `${SLEEVE_L} Q 116 506 106 558`, hand: 'palm', angle: -28, x: 106, y: 558 },
    armR: { d: `${SLEEVE_R} Q 484 506 494 558`, hand: 'palm', angle: 28, x: 494, y: 558 },
    expr: 'sad',
    tilt: 4,
  },

  explain: {
    armL: { d: `${SLEEVE_L} Q 150 572 198 608`, hand: 'palm', angle: -18, x: 198, y: 608 },
    armR: { d: `${SLEEVE_R} Q 450 572 402 608`, hand: 'palm', angle: 18, x: 402, y: 608 },
    expr: 'neutral',
    tilt: 0,
  },

  think: {
    armL: { d: `${SLEEVE_L} Q 158 582 250 618`, hand: 'fist', angle: 0, x: 250, y: 618 },
    armR: { d: `${SLEEVE_R} Q 456 468 358 352`, hand: 'fist', angle: -20, x: 358, y: 352 },
    expr: 'think',
    tilt: -6,
    overHead: true,
  },

  stop: {
    armL: armDown('L'),
    armR: { d: `${SLEEVE_R} Q 486 412 444 318`, hand: 'palm', angle: 6, x: 444, y: 318 },
    expr: 'annoyed',
    tilt: 0,
  },

  facepalm: {
    armL: armDown('L'),
    armR: { d: `${SLEEVE_R} Q 474 378 350 256`, hand: 'palm', angle: -34, x: 350, y: 256 },
    expr: 'sad',
    tilt: 7,
    overHead: true,
  },

  happy: {
    armL: { d: `${SLEEVE_L} Q 116 398 130 296`, hand: 'palm', angle: -34, x: 130, y: 296 },
    armR: { d: `${SLEEVE_R} Q 484 398 470 296`, hand: 'palm', angle: 34, x: 470, y: 296 },
    expr: 'laugh',
    tilt: 0,
  },

  wave: {
    armL: armDown('L'),
    armR: { d: `${SLEEVE_R} Q 490 412 474 282`, hand: 'palm', angle: 18, x: 474, y: 282 },
    expr: 'happy',
    tilt: -4,
  },

  thumbup: {
    armL: armDown('L'),
    armR: { d: `${SLEEVE_R} Q 472 440 434 364`, hand: 'thumb', angle: 0, x: 434, y: 364 },
    expr: 'happy',
    tilt: -2,
  },

  victory: {
    armL: armDown('L'),
    armR: { d: `${SLEEVE_R} Q 480 400 458 284`, hand: 'victory', angle: 6, x: 458, y: 284 },
    expr: 'happy',
    tilt: -3,
  },

  cross: {
    armL: { d: `${SLEEVE_L} Q 166 558 372 528`, hand: 'fist', angle: 0, x: 372, y: 528 },
    armR: { d: `${SLEEVE_R} Q 434 562 228 552`, hand: 'fist', angle: 0, x: 228, y: 552 },
    expr: 'annoyed',
    tilt: 0,
  },

  shock: {
    armL: { d: `${SLEEVE_L} Q 124 458 146 370`, hand: 'palm', angle: -20, x: 146, y: 370 },
    armR: { d: `${SLEEVE_R} Q 476 458 454 370`, hand: 'palm', angle: 20, x: 454, y: 370 },
    expr: 'shock',
    tilt: 0,
  },
};

export const poseDef = (name?: string): PoseDef => POSES[name ?? 'idle'] ?? POSES.idle;
