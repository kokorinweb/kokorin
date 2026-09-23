/**
 * Приклеивает base-путь к внутренней ссылке.
 * На своём домене base === '/', на GitHub Pages — '/kokorin/'.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Ссылка на секцию главной страницы.
 * На самой главной остаётся якорем (плавный скролл),
 * с внутренних страниц ведёт на главную к нужной секции.
 */
export function sectionLink(anchor: string, pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const current = pathname.replace(/\/$/, '') || '/';
  const home = base || '/';
  const isHome = current === home.replace(/\/$/, '') || current === '/';
  return isHome ? anchor : `${home === '/' ? '' : home}/${anchor}`;
}
