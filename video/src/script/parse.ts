import { CANVAS } from '../theme';
import type { AlignedWord, Scene, VideoScript } from './types';

/** Оценка темпа речи. Правится здесь, если ролики выходят рваными. */
const PACE = {
  wordBase: 0.13,
  perChar: 0.052,
  minWord: 0.18,
  pauseComma: 0.12,
  pauseSentence: 0.3,
  sceneTail: 0.22,
} as const;

/** Сколько влезает в две строки субтитра. */
const CHUNK = {
  maxChars: 46,
  maxWords: 6,
} as const;

export type Token = {
  text: string;
  bold: boolean;
  /** Номер группы подсветки: соседние слова с одним номером — одна плашка. */
  mark: number | null;
  start: number;
  end: number;
};

export type Chunk = { tokens: Token[]; start: number; end: number };

export type TimedScene = Scene & {
  index: number;
  from: number;
  durationInFrames: number;
  chunks: Chunk[];
};

export type Timeline = {
  fps: number;
  durationInFrames: number;
  audio: string | null;
  scenes: TimedScene[];
};

type Segment = { text: string; bold: boolean; mark: boolean };

/** Разбирает разметку `**жирный**` и `==плашка==` в плоский список сегментов. */
const splitMarkup = (raw: string): Segment[] => {
  const out: Segment[] = [];
  let bold = false;
  let mark = false;
  let buf = '';

  const flush = () => {
    if (buf) out.push({ text: buf, bold, mark });
    buf = '';
  };

  for (let i = 0; i < raw.length; i++) {
    if (raw.startsWith('**', i)) {
      flush();
      bold = !bold;
      i++;
      continue;
    }
    if (raw.startsWith('==', i)) {
      flush();
      mark = !mark;
      i++;
      continue;
    }
    buf += raw[i];
  }
  flush();
  return out;
};

const wordSeconds = (word: string): number => {
  const letters = word.replace(/[^\p{L}\p{N}]/gu, '').length;
  let d = Math.max(PACE.minWord, PACE.wordBase + letters * PACE.perChar);
  if (/[,;:]$/.test(word)) d += PACE.pauseComma;
  if (/[.!?…]$/.test(word)) d += PACE.pauseSentence;
  return d;
};

/** Текст сцены -> слова с флагами и таймингами (секунды от начала сцены). */
export const tokenize = (text: string, aligned?: AlignedWord[]): Token[] => {
  const tokens: Token[] = [];
  let markGroup = 0;
  let prevWasMark = false;

  for (const seg of splitMarkup(text)) {
    if (seg.mark && !prevWasMark) markGroup++;
    prevWasMark = seg.mark;

    for (const word of seg.text.split(/\s+/)) {
      if (!word) continue;
      tokens.push({
        text: word,
        bold: seg.bold,
        mark: seg.mark ? markGroup : null,
        start: 0,
        end: 0,
      });
    }
  }

  // Тайминги: из выравнивания по звуку, если оно есть, иначе — оценка по буквам.
  let cursor = 0;
  tokens.forEach((t, i) => {
    const hit = aligned?.[i];
    if (hit) {
      t.start = hit.start;
      t.end = hit.end;
      cursor = hit.end;
    } else {
      t.start = cursor;
      cursor += wordSeconds(t.text);
      t.end = cursor;
    }
  });

  return tokens;
};

/** Пакует слова в куски по две строки, не разрывая группы подсветки. */
export const chunkTokens = (tokens: Token[]): Chunk[] => {
  const chunks: Chunk[] = [];
  let current: Token[] = [];
  let chars = 0;

  const flush = () => {
    if (!current.length) return;
    chunks.push({
      tokens: current,
      start: current[0].start,
      end: current[current.length - 1].end,
    });
    current = [];
    chars = 0;
  };

  for (const t of tokens) {
    const next = chars + t.text.length + 1;
    const breaksMarkGroup =
      t.mark !== null && current.length > 0 && current[current.length - 1].mark === t.mark;

    if (current.length && !breaksMarkGroup && (next > CHUNK.maxChars || current.length >= CHUNK.maxWords)) {
      flush();
    }
    current.push(t);
    chars += t.text.length + 1;
  }
  flush();
  return chunks;
};

export const buildTimeline = (script: VideoScript): Timeline => {
  const fps = script.fps ?? CANVAS.fps;
  const scenes: TimedScene[] = [];
  let from = 0;

  script.scenes.forEach((scene, index) => {
    const tokens = tokenize(scene.text, scene.words);
    const chunks = chunkTokens(tokens);
    const spoken = tokens.length ? tokens[tokens.length - 1].end : 0;
    const seconds = scene.durationInSeconds ?? spoken + PACE.sceneTail;
    const durationInFrames = Math.max(1, Math.round(seconds * fps));

    scenes.push({ ...scene, index, from, durationInFrames, chunks });
    from += durationInFrames;
  });

  return {
    fps,
    durationInFrames: Math.max(1, from),
    audio: script.audio ?? null,
    scenes,
  };
};

/** Какая сцена звучит на этом кадре. */
export const sceneAt = (timeline: Timeline, frame: number): TimedScene | null => {
  for (const s of timeline.scenes) {
    if (frame >= s.from && frame < s.from + s.durationInFrames) return s;
  }
  return timeline.scenes[timeline.scenes.length - 1] ?? null;
};
