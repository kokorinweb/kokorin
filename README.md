# kokorin

Лендинг на Astro + Tailwind CSS 4. Статическая сборка, self-hosted шрифты, без внешних запросов.

## Команды

```bash
npm install
npm run dev      # локальный сервер, http://localhost:4321
npm run build    # статика в dist/
npm run preview  # предпросмотр собранного
npm run check    # проверка типов
```

## Где что менять

| Что | Файл |
|---|---|
| Все тексты, цены, кейсы, FAQ, контакты | `src/data/content.ts` |
| Палитра, шрифты, скругления, анимации | `src/styles/global.css` (блок `@theme`) |
| Порядок секций | `src/pages/index.astro` |
| Отдельная секция | `src/components/*.astro` |
| Домен для canonical и sitemap | `astro.config.mjs` → `site` |

Копирайт написан под нишу «разработка лендингов». Смена ниши = правка одного
`content.ts`, вёрстку трогать не нужно.

## Что доделать перед запуском

- [ ] `src/data/content.ts` — реальные телефон, Telegram, WhatsApp, e-mail, домен
- [ ] `src/components/Contact.astro` — endpoint формы вместо заглушки `/api/lead`
      (Telegram-бот, CRM или форм-сервис)
- [ ] `src/components/About.astro` — настоящее фото вместо плейсхолдера
- [ ] `astro.config.mjs` и `public/robots.txt` — боевой домен
- [ ] Счётчики аналитики и цели

## Деплой

`npm run build` отдаёт статику в `dist/` — подходит любой статик-хостинг
(Vercel, Netlify, Cloudflare Pages, nginx). Серверная часть не нужна,
кроме приёма заявок из формы.
