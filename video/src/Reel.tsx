import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import './fonts';
import { Background } from './components/Background';
import { BrollView } from './components/broll';
import { Mascot } from './components/Mascot';
import { Subtitles } from './components/Subtitles';
import { buildTimeline, sceneAt } from './script/parse';
import type { VideoScript } from './script/types';

export type ReelProps = {
  script: VideoScript;
  /** Показывать человечка. Выключается для роликов без персонажа. */
  mascot?: boolean;
  /** Надпись на его футболке. */
  shirt?: string;
};

export const Reel: React.FC<ReelProps> = ({ script, mascot = true, shirt }) => {
  const timeline = useMemo(() => buildTimeline(script), [script]);
  const frame = useCurrentFrame();
  const active = sceneAt(timeline, frame);

  return (
    <AbsoluteFill>
      <Background />
      {timeline.audio ? <Audio src={staticFile(timeline.audio)} /> : null}

      {mascot ? (
        <Mascot pose={active?.pose} poseChangedAt={active?.from ?? 0} shirt={shirt} />
      ) : null}

      {timeline.scenes.map((scene) => (
        <Sequence key={scene.index} from={scene.from} durationInFrames={scene.durationInFrames}>
          <BrollView broll={scene.broll} />
          <Subtitles chunks={scene.chunks} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
