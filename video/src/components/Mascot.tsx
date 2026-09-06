import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BEAT, COLOR, FONT, LAYOUT } from '../theme';
import { posePath } from './poses';

type Props = { pose?: string; poseChangedAt: number; placeholder: boolean };

/**
 * Маскот стоит по центру снизу и меняет позу на каждой сцене.
 * Живёт вне <Sequence>, чтобы не перемонтироваться и не мигать на стыках.
 */
export const Mascot: React.FC<Props> = ({ pose, poseChangedAt, placeholder }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = posePath(pose);

  if (!src && !placeholder) return null;

  const pop = spring({
    frame: frame - poseChangedAt,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });
  const scale = interpolate(pop, [0, 1], [0.94, 1]);
  const lift = interpolate(pop, [0, 1], [26, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -18,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(${lift}px) scale(${scale})`,
        transformOrigin: 'bottom center',
      }}
    >
      {src ? (
        <Img src={src} style={{ height: LAYOUT.mascotHeight, objectFit: 'contain' }} />
      ) : (
        <PosePlaceholder pose={pose} />
      )}
    </div>
  );
};

/** Видимое место под персонажа, пока его нет. В финальные ролики не идёт. */
const PosePlaceholder: React.FC<{ pose?: string }> = ({ pose }) => (
  <div
    style={{
      height: LAYOUT.mascotHeight,
      width: LAYOUT.mascotHeight * 0.82,
      borderRadius: '48% 48% 0 0',
      border: `2px dashed ${COLOR.panelLine}`,
      borderBottom: 'none',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.022), transparent)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 120,
    }}
  >
    <span
      style={{
        fontFamily: FONT.mono,
        fontSize: 26,
        color: COLOR.textFaint,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {pose ?? 'pose'}
    </span>
  </div>
);
