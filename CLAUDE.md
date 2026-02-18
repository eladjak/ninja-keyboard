# Ninja Keyboard (נינג'ה מקלדת)

Hebrew-first PWA teaching kids ages 6-16 to type. Touch typing, keyboard shortcuts, Windows navigation, gamification.

## Tech Stack
- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS 4 + shadcn/ui (New York)
- Zustand (state) + Supabase (backend) + next-intl (i18n)
- Framer Motion (animations, transform/opacity only)

## Commands
```bash
npm run dev          # Dev server on :3000
npm run build        # Production build
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run typecheck    # TypeScript check
npm run verify       # typecheck + test
```

## Key Rules
1. **RTL-first**: html lang="he" dir="rtl". Use CSS logical properties ONLY (ms-4 not ml-4, ps-4 not pl-4, start-0 not left-0)
2. **Hebrew fonts**: Heebo (primary), Assistant (a11y), Inter (English)
3. **5 age themes**: shatil (6-8), nevet (8-10), geza (10-12), anaf (12-14), tzameret (14-16+)
4. **Error handling**: better-result for business logic, try/catch only at 3rd-party boundaries
5. **Accessibility**: WCAG 2.2 AA, keyboard navigable, screen reader support, focus visible
6. **Animations**: transform/opacity only, max 200ms for feedback
7. **Brand color**: Primary #6C5CE7, Secondary #00B894

## Directory Structure
```
src/
├── app/
│   ├── (auth)/     # Login, register, join, student-setup
│   ├── (app)/      # Protected: home, lessons, battle, progress, profile, settings
│   ├── layout.tsx  # Root layout (RTL, Hebrew, fonts)
│   └── globals.css # Tailwind + theme variables
├── components/
│   ├── ui/         # shadcn/ui components
│   ├── auth/       # Auth forms and guards
│   ├── layout/     # App shell, sidebar, tabs, header
│   └── providers/  # Theme, auth providers
├── hooks/          # Custom React hooks
├── lib/
│   ├── supabase/   # Client, server, middleware
│   └── auth/       # Roles, class codes, server actions
├── stores/         # Zustand stores
├── styles/
│   ├── tokens/     # Design tokens (colors, typography, spacing)
│   ├── themes/     # 5 age-based themes
│   └── css/        # Theme CSS variables
├── types/          # TypeScript types
└── i18n/           # Internationalization
```

## Database
- Supabase with RLS policies
- Tables: users, classes, class_members, sessions, progress, gamification, consents
- Migrations in `supabase/migrations/`

---

## UI/Design Tools (MANDATORY - Feb 2026)

### Google Stitch MCP (USE FOR ALL UI WORK)
Before designing ANY UI component, page, or layout:
1. Use Stitch MCP tools: `build_site`, `get_screen_code`, `get_screen_image`
2. Generate designs in stitch.withgoogle.com first, then pull code via MCP
3. Use `/enhance-prompt` skill to optimize prompts for Stitch
4. Use `/design-md` skill to document design decisions
5. Use `/react-components` skill to convert Stitch designs to React

### Available Design Skills
- `/stitch-loop` - Generate multi-page sites from a single prompt
- `/enhance-prompt` - Refine UI ideas into Stitch-optimized prompts
- `/design-md` - Create design documentation from Stitch projects
- `/react-components` - Convert Stitch screens to React components
- `/shadcn-ui` - shadcn/ui component integration guidance
- `/remotion` - Create walkthrough videos from designs
- `/omc-frontend-ui-ux` - Designer-developer UI/UX agent

### Rule: NEVER design UI from scratch with Claude tokens. Always use Stitch MCP or v0.dev first!
