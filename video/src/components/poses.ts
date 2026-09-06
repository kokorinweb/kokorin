import { staticFile } from 'remotion';

/**
 * Позы маскота. Кладём PNG с альфой в public/mascot/ и прописываем сюда.
 * Пока список пуст — в кадре рисуется заглушка на его месте.
 */
export const POSES: Record<string, string> = {
  // point:  staticFile('mascot/point.png'),
  // shrug:  staticFile('mascot/shrug.png'),
  // stop:   staticFile('mascot/stop.png'),
};

export const posePath = (name?: string): string | null => {
  if (!name) return null;
  return POSES[name] ?? null;
};
