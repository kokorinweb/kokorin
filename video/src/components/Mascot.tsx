import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { LAYOUT } from '../theme';
import { Guy } from './guy/Guy';
import { posePath } from './poses';

type Props = {
  pose?: string;
  poseChangedAt: number;
  /** Надпись на футболке. */
  shirt?: string;
};

/**
 * Маскот стоит по центру снизу и меняет позу на каждой сцене.
 * Живёт вне <Sequence>, чтобы не перемонтироваться и не мигать на стыках.
 * По умолчанию рисуется вектором; PNG из public/mascot перебивает его.
 */
export const Mascot: React.FC<Props> = ({ pose, poseChangedAt, shirt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const override = posePath(pose);

  const pop = spring({
    frame: frame - poseChangedAt,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });
  const scale = interpolate(pop, [0, 1], [0.95, 1]);
  const lift = interpolate(pop, [0, 1], [22, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -24,
        height: LAYOUT.mascotHeight,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(${lift}px) scale(${scale})`,
        transformOrigin: 'bottom center',
      }}
    >
      {override ? (
        <Img src={override} style={{ height: '100%', objectFit: 'contain' }} />
      ) : (
        <div style={{ height: '100%', aspectRatio: '600 / 800' }}>
          <Guy pose={pose} poseChangedAt={poseChangedAt} shirt={shirt} />
        </div>
      )}
    </div>
  );
};
