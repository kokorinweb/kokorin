import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, FONT, LAYOUT } from '../theme';
import { BEAT } from '../theme';
import type { Chunk, Token } from '../script/parse';

type Props = { chunks: Chunk[] };

/** Слово: приглушено до того, как прозвучало, и полное — после. */
const Word: React.FC<{ token: Token; seconds: number; fps: number }> = ({ token, seconds, fps }) => {
  const since = (seconds - token.start) * fps;
  const appear = interpolate(since, [0, BEAT.wordIn], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const marked = token.mark !== null;
  const color = marked ? COLOR.accentInk : token.bold ? COLOR.text : COLOR.textDim;

  return (
    <span
      style={{
        color,
        fontWeight: token.bold || marked ? 700 : 600,
        opacity: 0.34 + appear * 0.66,
        transform: `translateY(${(1 - appear) * 7}px)`,
        display: 'inline-block',
        transition: 'none',
      }}
    >
      {token.text}
    </span>
  );
};

/**
 * Соседние слова одной группы `==...==` рисуются внутри общей плашки,
 * поэтому список слов сначала режется на пробеги по номеру группы.
 */
const runs = (tokens: Token[]) => {
  const out: { mark: number | null; tokens: Token[] }[] = [];
  for (const t of tokens) {
    const last = out[out.length - 1];
    if (last && last.mark === t.mark && t.mark !== null) last.tokens.push(t);
    else out.push({ mark: t.mark, tokens: [t] });
  }
  return out;
};

export const Subtitles: React.FC<Props> = ({ chunks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  const active = chunks.find((c) => seconds < c.end) ?? chunks[chunks.length - 1];
  if (!active) return null;

  const since = (seconds - active.start) * fps;
  const chunkIn = interpolate(since, [-2, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${LAYOUT.subtitleCenterY * 100}%`,
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: LAYOUT.subtitleMaxWidth,
          fontFamily: FONT.sans,
          fontSize: LAYOUT.subtitleSize,
          lineHeight: 1.3,
          letterSpacing: '-0.015em',
          textAlign: 'center',
          textWrap: 'balance',
          opacity: chunkIn,
        }}
      >
        {runs(active.tokens).map((run, i) => (
          <span
            key={i}
            style={
              run.mark === null
                ? { display: 'inline' }
                : {
                    display: 'inline-block',
                    background: COLOR.accent,
                    borderRadius: 10,
                    padding: '2px 12px 5px',
                    margin: '0 2px',
                  }
            }
          >
            {run.tokens.map((t, j) => (
              <React.Fragment key={j}>
                {j > 0 ? ' ' : null}
                <Word token={t} seconds={seconds} fps={fps} />
              </React.Fragment>
            ))}
            {' '}
          </span>
        ))}
      </div>
    </div>
  );
};
