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
  maxChars: 52,
  maxWords: 6,
  /** Меньше двух слов в куске — сирота, такое дочитывается за кадром. */
  minWords: 2,
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
  const segments = splitMarkup(text);
  let markGroup = 0;
  let prevWasMark = false;

  segments.forEach((seg, i) => {
    if (seg.mark && !prevWasMark) markGroup++;
    prevWasMark = seg.mark;

    const words = seg.text.split(/\s+/).filter(Boolean);
    if (!words.length) return;

    // «**сам**,» — это одно слово с запятой, а не слово и отдельная запятая.
    // Признак — отсутствие пробела по обе стороны от закрывающей разметки.
    const prev = segments[i - 1];
    const glued =
      i > 0 &&
      tokens.length > 0 &&
      prev !== undefined &&
      !/\s$/.test(prev.text) &&
      !/^\s/.test(seg.text);

    words.forEach((word, j) => {
      if (j === 0 && glued) {
        tokens[tokens.length - 1].text += word;
        return;
      }
      tokens.push({
        text: word,
        bold: seg.bold,
        mark: seg.mark ? markGroup : null,
        start: 0,
        end: 0,
      });
    });
  });

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

/** Режет список слов на предложения — по ним и проходят основные склейки. */
const bySentence = (tokens: Token[]): Token[][] => {
  const out: Token[][] = [];
  let current: Token[] = [];
  for (const t of tokens) {
    current.push(t);
    if (/[.!?…]$/.test(t.text)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
};

/** Слово можно перетащить в соседний кусок, только если оно не в плашке. */
const movable = (group: Token[]): boolean => {
  const last = group[group.length - 1];
  return last !== undefined && last.mark === null;
};

/**
 * Пакует предложение в куски по две строки, не разрывая группы подсветки.
 * Куски выравниваются по длине: жадная набивка оставляла в конце огрызок
 * вроде «же в каждом новом чате» после почти полной первой строки.
 */
const packSentence = (tokens: Token[]): Token[][] => {
  const width = tokens.reduce((a, t) => a + t.text.length + 1, 0) - 1;
  const parts = Math.max(1, Math.ceil(width / CHUNK.maxChars));
  const target = width / parts;

  const groups: Token[][] = [];
  let current: Token[] = [];
  let chars = 0;

  for (const t of tokens) {
    const continuesMark =
      current.length > 0 && t.mark !== null && current[current.length - 1].mark === t.mark;
    const full = chars >= target || current.length >= CHUNK.maxWords;

    if (current.length > 0 && !continuesMark && full) {
      groups.push(current);
      current = [];
      chars = 0;
    }

    current.push(t);
    chars += t.text.length + (current.length > 1 ? 1 : 0);
  }
  if (current.length) groups.push(current);

  // Хвост из одного слова читается как обрывок — подтягиваем к нему соседей.
  for (let i = groups.length - 1; i > 0; i--) {
    while (
      groups[i].length < CHUNK.minWords &&
      groups[i - 1].length > CHUNK.minWords &&
      movable(groups[i - 1])
    ) {
      groups[i].unshift(groups[i - 1].pop() as Token);
    }
  }

  return groups;
};

export const chunkTokens = (tokens: Token[]): Chunk[] =>
  bySentence(tokens)
    .flatMap(packSentence)
    .filter((group) => group.length > 0)
    .map((group) => ({
      tokens: group,
      start: group[0].start,
      end: group[group.length - 1].end,
    }));

export const buildTimeline = (script: VideoScript): Timeline => {
  const fps = script.fps ?? CANVAS.fps;
  const scenes: TimedScene[] = [];
  let from = 0;

  script.scenes.forEach((scene, index) => {
    const tokens = tokenize(scene.text, scene.words);
    let spoken = tokens.length ? tokens[tokens.length - 1].end : 0;
    const seconds = scene.durationInSeconds ?? spoken + PACE.sceneTail;

    // Длительность задана извне (обычно — реальной длиной озвучки),
    // а тайминги слов оценочные: растягиваем их под звук, иначе субтитр
    // добежит до конца раньше или позже голоса.
    if (scene.durationInSeconds && !scene.words && spoken > 0) {
      const target = Math.max(0.1, scene.durationInSeconds - PACE.sceneTail);
      const k = target / spoken;
      tokens.forEach((t) => {
        t.start *= k;
        t.end *= k;
      });
      spoken = target;
    }

    const chunks = chunkTokens(tokens);
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
