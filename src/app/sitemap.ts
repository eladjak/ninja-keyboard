import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ninja-keyboard-nine.vercel.app'

const ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/about', priority: 0.8 },
  { path: '/home', priority: 0.9 },
  { path: '/lessons', priority: 0.9 },
  { path: '/practice', priority: 0.7 },
  { path: '/drill', priority: 0.6 },
  { path: '/speed-test', priority: 0.7 },
  { path: '/battle', priority: 0.8 },
  { path: '/games', priority: 0.8 },
  { path: '/games/word-rain', priority: 0.6 },
  { path: '/games/ninja-slice', priority: 0.6 },
  { path: '/games/letter-memory', priority: 0.6 },
  { path: '/shortcuts', priority: 0.7 },
  { path: '/story', priority: 0.7 },
  { path: '/leaderboard', priority: 0.5 },
  { path: '/statistics', priority: 0.5 },
  { path: '/badges', priority: 0.5 },
  { path: '/certificates', priority: 0.5 },
  { path: '/gallery', priority: 0.5 },
  { path: '/jukebox', priority: 0.4 },
  { path: '/tips', priority: 0.5 },
  { path: '/accessibility', priority: 0.4 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route.priority,
  }))
}
