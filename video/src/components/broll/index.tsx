import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR, FONT, LAYOUT, PLACES } from '../../theme';
import type { Broll, Place } from '../../script/types';
import { Icon } from '../Icon';
import { Chip, Panel, Stack, toneColors } from './parts';

/**
 * Блок влетает с разных сторон и с разной высоты — если каждый раз одинаково
 * снизу по центру, кадр читается как слайд-шоу. Сторона берётся из номера
 * сцены, поэтому соседние блоки никогда не приходят одинаково.
 */
const Enter: React.FC<{
  children: React.ReactNode;
  index: number;
  place: Place;
  durationInFrames: number;
}> = ({ children, index, place, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 150, mass: 0.7 } });

  // Четыре стороны по кругу: снизу, слева, справа, сверху.
  const side = index % 4;
  const from = [
    { x: 0, y: 44 },
    { x: -90, y: 12 },
    { x: 90, y: 12 },
    { x: 0, y: -48 },
  ][side];

  // Уход в конце сцены даёт монтажный стык вместо подмены картинки.
  const leave = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Пока блок на экране, он еле заметно наезжает — кадр не застывает.
  const creep = 1 + Math.min(frame, 200) * 0.00035;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${PLACES[place] * 100}%`,
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: LAYOUT.brollMaxWidth,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(s, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' }) * leave,
          transform: `translate(${interpolate(s, [0, 1], [from.x, 0])}px, ${interpolate(
            s,
            [0, 1],
            [from.y, 0],
          )}px) scale(${interpolate(s, [0, 1], [0.9, 1]) * creep})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Появление по элементам: i-й ждёт своей очереди. */
const useStagger = (index: number, step = 6) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - index * step,
    fps,
    config: { damping: 18, stiffness: 170, mass: 0.6 },
  });
};

const BigNumber: React.FC<{ value: string; label?: string }> = ({ value, label }) => (
  <Stack gap={20}>
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 168,
        fontWeight: 700,
        color: COLOR.accent,
        lineHeight: 1,
        letterSpacing: '-0.03em',
      }}
    >
      {value}
    </div>
    {label ? <Chip label={label} tone="plain" /> : null}
  </Stack>
);

const CodeBlock: React.FC<{ file: string; lines: string[] }> = ({ file, lines }) => (
  <Panel pad={0}>
    <div
      style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${COLOR.panelLine}`,
        fontFamily: FONT.mono,
        fontSize: 24,
        color: COLOR.textFaint,
      }}
    >
      {file}
    </div>
    <div style={{ padding: '24px 28px', fontFamily: FONT.mono, fontSize: 27, lineHeight: 1.62 }}>
      {lines.map((line, i) => (
        <CodeLine key={i} index={i} line={line} />
      ))}
    </div>
  </Panel>
);

const CodeLine: React.FC<{ line: string; index: number }> = ({ line, index }) => {
  const s = useStagger(index, 4);
  // Значения после двоеточия подсвечиваем акцентом, ключи оставляем тусклыми.
  const [key, ...rest] = line.split(':');
  const value = rest.join(':');
  return (
    <div style={{ opacity: s, transform: `translateX(${(1 - s) * 12}px)`, whiteSpace: 'pre' }}>
      <span style={{ color: COLOR.textDim }}>{key}</span>
      {value ? <span style={{ color: COLOR.accent }}>{':' + value}</span> : null}
    </div>
  );
};

const Terminal: React.FC<{ title?: string; command: string }> = ({ title, command }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.min(command.length, Math.floor((frame - 6) * 1.6)));
  const caret = Math.floor(frame / 8) % 2 === 0;

  return (
    <Panel pad={0}>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${COLOR.panelLine}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: FONT.mono,
          fontSize: 23,
          color: COLOR.textFaint,
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: 99, background: COLOR.warn }} />
        {title ?? 'terminal'}
      </div>
      <div style={{ padding: '26px 28px', fontFamily: FONT.mono, fontSize: 28, color: COLOR.text }}>
        <span style={{ color: COLOR.accent }}>{'> '}</span>
        {command.slice(0, shown)}
        <span style={{ opacity: caret ? 1 : 0, color: COLOR.accent }}>▌</span>
      </div>
    </Panel>
  );
};

const List: React.FC<{ items: string[] }> = ({ items }) => (
  <Stack gap={14}>
    {items.map((item, i) => (
      <ListRow key={i} index={i} item={item} />
    ))}
  </Stack>
);

const ListRow: React.FC<{ item: string; index: number }> = ({ item, index }) => {
  const s = useStagger(index, 7);
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${(1 - s) * 16}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: COLOR.panel,
        border: `1px solid ${COLOR.panelLine}`,
        borderRadius: 14,
        padding: '16px 28px',
        minWidth: 420,
        fontFamily: FONT.sans,
        fontSize: 34,
        fontWeight: 500,
        color: COLOR.text,
      }}
    >
      <span style={{ color: COLOR.accent, fontFamily: FONT.mono }}>→</span>
      {item}
    </div>
  );
};

const Badge: React.FC<{ icon: Extract<Broll, { type: 'badge' }>['icon']; label?: string; tone?: Extract<Broll, { type: 'badge' }>['tone'] }> = ({
  icon,
  label,
  tone,
}) => {
  const { bg } = toneColors(tone);
  return (
    <Stack gap={22}>
      <div
        style={{
          width: 190,
          height: 190,
          borderRadius: 40,
          background: COLOR.panel,
          border: `1px solid ${COLOR.panelLine}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 90px ${tone === 'warn' ? 'rgba(255,91,91,0.16)' : 'rgba(198,242,78,0.14)'}`,
        }}
      >
        <Icon name={icon} size={104} color={bg} />
      </div>
      {label ? <Chip label={label} tone={tone} /> : null}
    </Stack>
  );
};

const Shot: React.FC<{ src: string; caption?: string }> = ({ src, caption }) => (
  <Stack gap={20}>
    <div
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${COLOR.panelLine}`,
        boxShadow: '0 34px 80px rgba(0,0,0,0.6)',
        width: '100%',
      }}
    >
      <Img src={staticFile(src)} style={{ width: '100%', display: 'block' }} />
    </div>
    {caption ? <Chip label={caption} tone="plain" /> : null}
  </Stack>
);

const Strike: React.FC<{ text: string; note?: string; noteTone?: Extract<Broll, { type: 'strike' }>['noteTone'] }> = ({
  text,
  note,
  noteTone = 'warn',
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Stack gap={26}>
      <div style={{ position: 'relative' }}>
        <Chip label={text} size={40} tone="plain" />
        <div
          style={{
            position: 'absolute',
            left: 4,
            right: 4,
            top: '52%',
            height: 4,
            borderRadius: 4,
            background: COLOR.warn,
            transform: `scaleX(${draw}) rotate(-2deg)`,
            transformOrigin: 'left center',
          }}
        />
      </div>
      {note ? <Chip label={note} tone={noteTone} /> : null}
    </Stack>
  );
};

const Chips: React.FC<{ items: { label: string; tone?: Extract<Broll, { type: 'badge' }>['tone'] }[] }> = ({
  items,
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
    {items.map((it, i) => (
      <ChipRow key={i} index={i} label={it.label} tone={it.tone} />
    ))}
  </div>
);

const ChipRow: React.FC<{ label: string; index: number; tone?: Extract<Broll, { type: 'badge' }>['tone'] }> = ({
  label,
  index,
  tone,
}) => {
  const s = useStagger(index, 5);
  return (
    <div style={{ opacity: s, transform: `translateY(${(1 - s) * 14}px)` }}>
      <Chip label={label} tone={tone ?? 'plain'} size={34} />
    </div>
  );
};

export const BrollView: React.FC<{
  broll?: Broll;
  index: number;
  place?: Place;
  durationInFrames: number;
}> = ({ broll, index, place = 'top', durationInFrames }) => {
  if (!broll || broll.type === 'none') return null;

  const inner = (() => {
    switch (broll.type) {
      case 'bignum':
        return <BigNumber value={broll.value} label={broll.label} />;
      case 'code':
        return <CodeBlock file={broll.file} lines={broll.lines} />;
      case 'terminal':
        return <Terminal title={broll.title} command={broll.command} />;
      case 'list':
        return <List items={broll.items} />;
      case 'badge':
        return <Badge icon={broll.icon} label={broll.label} tone={broll.tone} />;
      case 'shot':
        return <Shot src={broll.src} caption={broll.caption} />;
      case 'strike':
        return <Strike text={broll.text} note={broll.note} noteTone={broll.noteTone} />;
      case 'chips':
        return <Chips items={broll.items} />;
    }
  })();

  return (
    <Enter index={index} place={place} durationInFrames={durationInFrames}>
      {inner}
    </Enter>
  );
};
