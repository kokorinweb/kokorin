# KOKORIN WEB

Лендинг на Astro + Tailwind CSS 4. Статическая сборка, self-hosted шрифты,
без внешних запросов. Структура и тексты — с ilyalanding.ru.

## Команды

```bash
npm install
npm run dev      # локальный сервер, http://localhost:4321
npm run build    # статика в dist/
npm run preview  # предпросмотр собранного
npm run check    # проверка типов
```

## Структура страницы

| # | Секция | Компонент |
|---|---|---|
| — | Первый экран, метрики | `Hero.astro` |
| 02 | Что я делаю — 7 услуг | `Services.astro` |
| 03 | Кейсы — 6 проектов | `Cases.astro` |
| 04 | Как мы будем работать | `Process.astro` |
| 05 | Обо мне | `About.astro` |
| 06 | FAQ | `Faq.astro` |
| 07 | Бриф-квиз | `Brief.astro` |
| 08 | Контакты | `Contacts.astro` |

Плюс страницы `/privacy` и `/terms` на общем макете `layouts/Legal.astro`.

## Где что менять

| Что | Файл |
|---|---|
| Все тексты, услуги, кейсы, FAQ, контакты | `src/data/content.ts` |
| Палитра, шрифты, скругления, анимации | `src/styles/global.css`, блок `@theme` |
| Порядок секций | `src/pages/index.astro` |
| Домен для canonical и sitemap | `astro.config.mjs` → `site` |

## Что доделать перед запуском

- [ ] `src/components/Brief.astro` — endpoint формы вместо заглушки `/api/lead`.
      Сейчас квиз шлёт POST с полями `who`, `what[]`, `task`, `contact`
- [ ] Страницы кейсов: ссылки ведут на `/portfolio/*.html`, этих файлов
      в репозитории нет — перенести их или поправить `href` в `content.ts`
- [ ] `src/components/About.astro` — реальное фото вместо плейсхолдера
- [ ] Проверить ответы в FAQ: первый взят с сайта дословно, остальные пять
      написаны по смыслу вопросов и требуют вычитки
- [ ] Домен: сейчас `agency-kokorin.ru` (из адреса почты) — заменить,
      если боевой другой. Правится в `astro.config.mjs` и `public/robots.txt`
- [ ] Счётчики аналитики и цели

## Деплой

`npm run build` отдаёт статику в `dist/` — подходит любой статик-хостинг
(Vercel, Netlify, Cloudflare Pages, nginx). Серверная часть нужна только
для приёма заявок из брифа.
