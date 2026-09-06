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
};

export type VideoScript = {
  id: string;
  title?: string;
  fps?: number;
  /** Файл озвучки в public/. Без него ролик считается по оценке ритма. */
  audio?: string | null;
  scenes: Scene[];
};
