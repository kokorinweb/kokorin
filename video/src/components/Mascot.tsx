import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { LAYOUT, SHOTS } from '../theme';
import type { Shot } from '../script/types';
import { Guy } from './guy/Guy';
import { posePath } from './poses';

type Props = {
  pose?: string;
  poseChangedAt: number;
  /** Крупность плана на текущей сцене и на предыдущей — между ними едем. */
  shot: Shot;
  prevShot: Shot;
  shirt?: string;
};

/**
 * Маскот стоит по центру снизу и меняет позу на каждой сцене.
 * Живёт вне <Sequence>, чтобы не перемонтироваться и не мигать на стыках.
 * По умолчанию рисуется вектором; PNG из public/mascot перебивает его.
 */
export const Mascot: React.FC<Props> = ({ pose, poseChangedAt, shot, prevShot, shirt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const override = posePath(pose);

  // Наезд и отъезд — медленная пружина, её должно быть незаметно на глаз.
  const move = spring({
    frame: frame - poseChangedAt,
    fps,
    config: { damping: 200, stiffness: 45, mass: 1.1 },
  });
  const scale = interpolate(move, [0, 1], [SHOTS[prevShot].scale, SHOTS[shot].scale]);
  const shift = interpolate(move, [0, 1], [SHOTS[prevShot].y, SHOTS[shot].y]);

  // Короткий подскок на смене позы — поверх плавного наезда.
  const pop = spring({
    frame: frame - poseChangedAt,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });
  const lift = interpolate(pop, [0, 1], [22, 0]);

  // Кадр никогда не стоит совсем: очень медленный дрейф вглубь.
  const drift = 1 + Math.sin(frame / 190) * 0.012;

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
        transform: `translateY(${lift + shift}px) scale(${scale * drift})`,
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
