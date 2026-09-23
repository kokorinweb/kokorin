/**
 * Передаёт позицию курсора в CSS-переменные карточки,
 * чтобы подсветка в .card-hover следовала за указателем.
 */
export function initCardSpotlight(): void {
  if (window.matchMedia('(hover: none)').matches) return;

  let frame = 0;

  document.addEventListener(
    'pointermove',
    (event) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>('.card-hover');
      if (!card) return;

      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
      });
    },
    { passive: true },
  );
}
