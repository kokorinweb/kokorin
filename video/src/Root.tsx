import React from 'react';
import { Composition } from 'remotion';
import { CANVAS } from './theme';
import { Reel, type ReelProps } from './Reel';
import { buildTimeline } from './script/parse';
import type { VideoScript } from './script/types';
import demo from '../scripts/demo.json';

const demoProps = demo as unknown as ReelProps;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={CANVAS.width}
    height={CANVAS.height}
    fps={CANVAS.fps}
    durationInFrames={300}
    defaultProps={demoProps}
    // Длительность ролика диктует сценарий, а не константа в конфиге.
    calculateMetadata={({ props }) => {
      const timeline = buildTimeline(props.script as VideoScript);
      return { durationInFrames: timeline.durationInFrames, fps: timeline.fps };
    }}
  />
);
