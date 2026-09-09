/**
 * Единственное место, где живут цвета, размеры и ритм анимаций.
 * Все размеры — в пикселях холста 1080x1920.
 */
export const CANVAS = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const COLOR = {
  bg: '#070707',
  bgGlow: 'rgba(84, 150, 44, 0.22)',
  grid: 'rgba(255, 255, 255, 0.032)',

  text: '#FFFFFF',
  textDim: '#A9AFB8',
  textFaint: '#5A5F66',

  accent: '#C6F24E',
  accentInk: '#0C1206',
  accentSoft: 'rgba(198, 242, 78, 0.14)',

  warn: '#FF5B5B',
  warnInk: '#2A0808',

  panel: '#101114',
  panelLine: 'rgba(255, 255, 255, 0.09)',
} as const;

export const FONT = {
  sans: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

/** Вертикальная раскладка кадра — доли высоты. */
export const LAYOUT = {
  brollCenterY: 0.24,
  brollMaxWidth: 880,
  subtitleCenterY: 0.565,
  subtitleMaxWidth: 900,
  subtitleSize: 58,
  mascotHeight: 760,
} as const;

/**
 * Крупность плана. Кадр не должен стоять на месте: на реакциях персонажа
 * подводим ближе, на информационных кадрах отводим назад.
 */
export const SHOTS = {
  wide: { scale: 0.88, y: 30 },
  mid: { scale: 1, y: 0 },
  close: { scale: 1.42, y: 330 },
} as const;

/** Высота блока B-roll в кадре — доля высоты. */
export const PLACES = {
  high: 0.17,
  top: 0.24,
  center: 0.33,
} as const;

/** Ритм: сколько кадров занимают типовые появления. */
export const BEAT = {
  wordIn: 5,
  brollIn: 14,
  brollOut: 8,
  poseIn: 7,
} as const;
