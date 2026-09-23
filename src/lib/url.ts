/**
 * Приклеивает base-путь к внутренней ссылке.
 * На своём домене base === '/', на GitHub Pages — '/kokorin/'.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
