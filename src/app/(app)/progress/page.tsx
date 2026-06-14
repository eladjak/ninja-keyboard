'use client'

import Image from 'next/image'
import { BarChart3, Zap, Flame, Trophy, Target } from 'lucide-react'
import { useXpStore } from '@/stores/xp-store'
import { motion } from 'framer-motion'
import { CharacterIdleWrapper } from '@/components/characters/character-idle-wrapper'
import { formatNumber } from '@/lib/utils'
import { useHydrated } from '@/hooks/use-hydrated'

const EMPTY_LESSONS: Record<string, never> = {}

export default function ProgressPage() {
  // Hold the server's default state (0 XP / level 1 / no lessons) through the
  // first client render so SSR matches before the persisted store rehydrates.
  const hydrated = useHydrated()
  const xp = useXpStore()
  const totalXp = hydrated ? xp.totalXp : 0
  const level = hydrated ? xp.level : 1
  const streak = hydrated ? xp.streak : 0
  const completedLessons = hydrated ? xp.completedLessons : EMPTY_LESSONS

  const completedCount = Object.keys(completedLessons).length
  const progress = hydrated ? xp.levelProgress() : 0

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4">
      {/* Page header */}
      <div
        className="game-card-border flex items-center gap-3 p-4"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}
      >
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: 'oklch(0.495 0.205 292 / 20%)', boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)' }}
        >
          <BarChart3 className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
        </div>
        <h1 className="text-2xl font-bold text-glow">ההתקדמות שלי</h1>
      </div>

      {/* Noa companion character */}
      <div className="flex justify-center">
        <CharacterIdleWrapper character="noa" intensity="subtle" entryAnimation>
          <Image
            src="/images/characters/heroes/noa-hero.jpg"
            alt="נועה - מרפאת הקוד"
            width={220}
            height={220}
            className="rounded-2xl object-cover drop-shadow-[0_0_28px_rgba(0,184,148,0.5)]"
          />
        </CharacterIdleWrapper>
      </div>

      {/* Level & XP card */}
      <div
        className="game-card-border space-y-4 p-5"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: 'var(--game-accent-purple)' }}>רמה {level}</span>
          <span className="game-stat-badge">
            <Zap className="size-3 text-amber-400" />
            {formatNumber(totalXp)} XP
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>התקדמות לרמה הבאה</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full"
            style={{ background: 'oklch(0.18 0.02 290)', border: '1px solid var(--game-border)' }}
            role="progressbar"
            aria-label="התקדמות לרמה הבאה"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6C5CE7, #00B894)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Trophy, label: 'שיעורים הושלמו', value: completedCount, accent: '#00B894', glow: 'oklch(0.672 0.148 168 / 35%)' },
          { icon: Flame, label: 'ימים ברצף', value: streak, accent: '#f97316', glow: 'oklch(0.65 0.22 40 / 35%)' },
          { icon: Zap, label: 'נקודות XP', value: totalXp, accent: '#f59e0b', glow: 'oklch(0.75 0.18 80 / 35%)' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="game-card-border flex flex-col items-center gap-2 p-4 text-center"
              style={{ borderColor: `${stat.accent}40` }}
            >
              <div
                className="flex size-10 items-center justify-center rounded-full"
                style={{ background: `${stat.accent}20` }}
              >
                <Icon className="size-5" style={{ color: stat.accent }} />
              </div>
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: stat.accent, textShadow: `0 0 12px ${stat.glow}` }}
              >
                {stat.value}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">{stat.label}</span>
            </motion.div>
          )
        })}
      </div>

      {/* Completed lessons list */}
      {completedCount > 0 && (
        <div
          className="game-card-border space-y-3 p-4"
          style={{ borderColor: 'oklch(0.672 0.148 168 / 30%)' }}
        >
          <div className="flex items-center gap-2 pb-1">
            <Target className="size-4" style={{ color: 'var(--game-accent-green)' }} />
            <h3 className="game-section-title text-sm">שיעורים שהושלמו</h3>
          </div>
          <div className="space-y-1.5">
            {Object.values(completedLessons).map((lesson) => (
              <div
                key={lesson.lessonId}
                className="flex items-center justify-between rounded-lg p-3 text-sm transition-colors"
                style={{ background: 'var(--game-hover-bg)', border: '1px solid var(--game-border)' }}
              >
                <span className="text-foreground">{lesson.lessonId}</span>
                <div className="flex gap-3 text-xs">
                  <span style={{ color: 'var(--game-accent-purple)' }}>{lesson.bestWpm} מ/ד</span>
                  <span style={{ color: 'var(--game-accent-green)' }}>{lesson.bestAccuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedCount === 0 && (
        <div
          className="game-card-border p-8 text-center"
          style={{ borderColor: 'oklch(0.495 0.205 292 / 20%)' }}
        >
          <p className="text-muted-foreground">
            עדיין אין תוצאות. התחל שיעור כדי לראות את ההתקדמות שלך!
          </p>
        </div>
      )}
    </div>
  )
}
