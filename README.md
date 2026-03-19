# Ninja Keyboard

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)

A gamified Hebrew typing tutor that makes learning the keyboard fun. Practice typing with adaptive difficulty, track your progress, and compete with others — all wrapped in a ninja-themed experience with original characters, voice acting, and sound effects.

**[Live Demo](https://ninja-keyboard-nine.vercel.app)**

## Features

- **Adaptive Difficulty** — Lessons adjust in real time based on your accuracy and speed
- **Real-Time WPM Tracking** — Live words-per-minute and accuracy metrics as you type
- **Character System** — Unlock ninja characters with unique personalities and voice lines
- **Boss Battles** — Test your skills against timed typing challenges
- **Story Mode** — Progress through a narrative while mastering the Hebrew layout
- **Sound & Music** — Original soundtrack, SFX, and character voice acting
- **Internationalization** — Full Hebrew and English UI via next-intl
- **Dark/Light Theme** — System-aware theming with next-themes
- **PWA Support** — Installable as a progressive web app
- **Accessibility** — Keyboard navigation, screen reader support, axe-core audits

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion, Radix UI, shadcn/ui |
| State | Zustand |
| Backend | Supabase (Auth, Database, Realtime) |
| Audio | Howler.js, Lottie animations |
| Testing | Vitest, React Testing Library, Playwright (E2E), axe-core (a11y) |
| Validation | Zod |

## Getting Started

```bash
git clone https://github.com/eladjak/ninja-keyboard.git
cd ninja-keyboard
npm install
cp .env.example .env.local   # Add your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start typing.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run typecheck` | TypeScript type check |

## License

MIT
