export type Tone = 'accent' | 'warn' | 'plain';

export type IconName =
  | 'lock'
  | 'check'
  | 'clipboard'
  | 'shield'
  | 'cursor'
  | 'arrow'
  | 'spark'
  | 'warning';

/** Что показываем в верхней трети кадра поверх фона. */
export type Broll =
  | { type: 'none' }
  | { type: 'bignum'; value: string; label?: string }
  | { type: 'code'; file: string; lines: string[] }
  | { type: 'terminal'; title?: string; command: string }
  | { type: 'list'; items: string[] }
  | { type: 'badge'; icon: IconName; label?: string; tone?: Tone }
  | { type: 'shot'; src: string; caption?: string }
  | { type: 'strike'; text: string; note?: string; noteTone?: Tone }
  | { type: 'chips'; items: { label: string; tone?: Tone }[] };

/** Слово с таймингом из выравнивания по звуку (секунды от начала сцены). */
export type AlignedWord = { word: string; start: number; end: number };

/** Фоновая музыка ролика. */
export type Music = {
  /** Файл в public/, например `music/loop.mp3`. */
  src: string;
  /** Громкость 0..1. Под голосом держим тихо, иначе он тонет. */
  volume?: number;
  /** Длина трека в секундах. Задана — трек зациклится под длину ролика. */
  loopSeconds?: number;
};

export type Scene = {
  /** Текст реплики. Разметка: **жирным** и ==в плашке==. */
  text: string;
  /** Имя файла позы маскота без расширения, из public/mascot. */
  pose?: string;
  broll?: Broll;
  /** Жёстко задать длительность сцены вместо оценки по тексту. */
  durationInSeconds?: number;
  /** Тайминги слов из whisper. Если нет — считаем по длине слов. */
  words?: AlignedWord[];
  /** Свой звук на входе сцены вместо общего. `none` — тишина. */
  sfx?: string;
};

export type VideoScript = {
  id: string;
  title?: string;
  fps?: number;
  /** Файл озвучки в public/. Без него ролик считается по оценке ритма. */
  audio?: string | null;
  music?: Music;
  /** Звук на входе каждой сцены: файл в public/sfx без расширения. */
  sfx?: { enter?: string; volume?: number };
  scenes: Scene[];
};
