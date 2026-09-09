import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Loop, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import './fonts';
import { Background } from './components/Background';
import { BrollView } from './components/broll';
import { Mascot } from './components/Mascot';
import { Subtitles } from './components/Subtitles';
import { buildTimeline, sceneAt } from './script/parse';
import type { Music, VideoScript } from './script/types';

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
      <BackingTrack music={script.music} hasVoice={Boolean(timeline.audio)} />

      {mascot ? (
        <Mascot pose={active?.pose} poseChangedAt={active?.from ?? 0} shirt={shirt} />
      ) : null}

      {timeline.scenes.map((scene) => (
        <Sequence key={scene.index} from={scene.from} durationInFrames={scene.durationInFrames}>
          <EnterSound name={scene.sfx ?? script.sfx?.enter} volume={script.sfx?.volume} />
          <BrollView broll={scene.broll} />
          <Subtitles chunks={scene.chunks} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/**
 * Фоновая музыка. Под голосом она должна быть почти неслышной:
 * на слух её замечаешь, только когда выключишь.
 */
const BackingTrack: React.FC<{ music?: Music; hasVoice: boolean }> = ({ music, hasVoice }) => {
  const { durationInFrames, fps } = useVideoConfig();
  if (!music) return null;

  const volume = music.volume ?? (hasVoice ? 0.12 : 0.3);
  const track = <Audio src={staticFile(music.src)} volume={volume} />;

  if (!music.loopSeconds) return track;
  return <Loop durationInFrames={Math.round(music.loopSeconds * fps)}>{track}</Loop>;
};

/** Короткий звук на входе сцены — он и держит ритм монтажа. */
const EnterSound: React.FC<{ name?: string; volume?: number }> = ({ name, volume }) => {
  if (!name || name === 'none') return null;
  return <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume ?? 0.5} />;
};
