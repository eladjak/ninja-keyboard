<div dir="rtl">

<p align="center">
  <img src="screenshots/home.png" alt="נינג'ה מקלדת" width="600" />
</p>

<h1 align="center">נינג'ה מקלדת</h1>

<p align="center">
  מאמן הקלדה עברי עם גיימיפיקציה שהופך את לימוד המקלדת לכיף
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.he.md">עברית</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white" alt="Framer Motion" />
  <br />
  <a href="https://github.com/eladjak/ninja-keyboard/stargazers">
    <img src="https://img.shields.io/github/stars/eladjak/ninja-keyboard?style=social" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/eladjak/ninja-keyboard/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
</p>

<p align="center">
  <a href="https://ninja-keyboard-nine.vercel.app"><strong>דמו חי</strong></a>
</p>

---

## אודות

נינג'ה מקלדת הוא מאמן הקלדה אינטראקטיבי בעברית המיועד לילדים בגילאי 6-16. תרגלו הקלדה עם רמת קושי מתאימה, עקבו אחרי ההתקדמות שלכם והתחרו באחרים -- הכל בחוויית נינג'ה עם דמויות מקוריות, קריינות ואפקטים קוליים.

## תכונות

- **רמת קושי מותאמת** -- השיעורים מותאמים בזמן אמת לפי הדיוק והמהירות שלכם
- **מעקב מהירות בזמן אמת** -- מדדי מילים לדקה (WPM) ודיוק חיים תוך כדי הקלדה
- **מערכת דמויות** -- שחררו דמויות נינג'ה עם אישיות ייחודית וקווי קול
- **קרבות בוסים** -- בחנו את הכישורים שלכם מול אתגרי הקלדה מתוזמנים
- **מצב סיפור** -- התקדמו דרך עלילה תוך שליטה בפריסת המקלדת העברית
- **סאונד ומוזיקה** -- פסקול מקורי, אפקטים קוליים וקריינות דמויות
- **בינלאומיות** -- ממשק מלא בעברית ואנגלית עם next-intl
- **ערכת נושא כהה/בהיר** -- עיצוב מותאם מערכת עם next-themes
- **PWA** -- ניתן להתקנה כאפליקציית ווב מתקדמת
- **נגישות** -- ניווט מקלדת, תמיכה בקוראי מסך, תאימות WCAG 2.2 AA

## צילומי מסך

| בית | שיעורים | מבחן מהירות |
|:---:|:-------:|:-----------:|
| ![בית](screenshots/home.png) | ![שיעורים](screenshots/lessons.png) | ![מבחן מהירות](screenshots/speed-test.png) |

| לוח תוצאות | סטטיסטיקות | משחקים |
|:----------:|:----------:|:------:|
| ![לוח תוצאות](screenshots/leaderboard.png) | ![סטטיסטיקות](screenshots/statistics.png) | ![משחקים](screenshots/games.png) |

## מחסנית טכנולוגית

| שכבה | טכנולוגיות |
|------|-----------|
| פריימוורק | Next.js 16, React 19, TypeScript |
| עיצוב | Tailwind CSS 4, Framer Motion, Radix UI, shadcn/ui |
| ניהול מצב | Zustand |
| בקאנד | Supabase (אימות, מסד נתונים, זמן אמת) |
| אודיו | Howler.js, אנימציות Lottie |
| בינלאומיות | next-intl (עברית + אנגלית) |
| בדיקות | Vitest, React Testing Library, Playwright (E2E), axe-core (נגישות) |
| ולידציה | Zod |

## התחלה מהירה

### דרישות מקדימות

- Node.js 18+ (או [Bun](https://bun.sh))
- פרויקט [Supabase](https://supabase.com) (שכבה חינמית מספיקה)

### התקנה

```bash
git clone https://github.com/eladjak/ninja-keyboard.git
cd ninja-keyboard
npm install
```

### הגדרה

```bash
cp .env.example .env.local
```

הוסיפו את פרטי ה-Supabase שלכם לקובץ `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### הרצה

```bash
npm run dev
```

פתחו [http://localhost:3000](http://localhost:3000) כדי להתחיל להקליד.

## סקריפטים

| פקודה | תיאור |
|-------|-------|
| `npm run dev` | הפעלת שרת פיתוח |
| `npm run build` | בנייה לפרודקשן |
| `npm run test` | הרצת בדיקות יחידה (Vitest) |
| `npm run test:e2e` | הרצת בדיקות E2E (Playwright) |
| `npm run typecheck` | בדיקת טיפוסי TypeScript |
| `npm run verify` | בדיקת טיפוסים + בדיקות |

## מבנה הפרויקט

```
src/
├── app/           # דפי Next.js App Router
│   ├── (auth)/    # התחברות, הרשמה, הגדרת תלמיד
│   └── (app)/     # מוגן: בית, שיעורים, קרב, התקדמות
├── components/    # רכיבי UI (shadcn/ui, אימות, פריסה)
├── hooks/         # React hooks מותאמים
├── lib/           # לקוח Supabase, כלי אימות
├── stores/        # ניהול מצב Zustand
├── styles/        # טוקני עיצוב וערכות נושא לפי גיל
├── types/         # הגדרות טיפוסי TypeScript
└── i18n/          # הודעות בינלאומיות
```

## תרומה לפרויקט

תרומות יתקבלו בברכה! אתם מוזמנים לפתוח issues או לשלוח pull requests.

1. צרו fork למאגר
2. צרו ענף לפיצ'ר (`git checkout -b feat/amazing-feature`)
3. בצעו commit לשינויים (`git commit -m 'feat: add amazing feature'`)
4. דחפו לענף (`git push origin feat/amazing-feature`)
5. פתחו Pull Request

## רישיון

פרויקט זה מורשה תחת רישיון MIT.

---

<p align="center">
  אם מצאתם את הפרויקט שימושי, שקלו לתת לו כוכב!
  <br />
  <a href="https://github.com/eladjak/ninja-keyboard">
    <img src="https://img.shields.io/github/stars/eladjak/ninja-keyboard?style=for-the-badge&logo=github&color=yellow" alt="תנו כוכב" />
  </a>
</p>

</div>
