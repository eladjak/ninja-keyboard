'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Users, Swords, Shield, Skull, Heart, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CHARACTER_CONFIGS } from '@/lib/story/character-config'
import type { CharacterName } from '@/types/story'
import type { CharacterConfig } from '@/lib/story/character-config'

// ─── Character Descriptions ────────────────────────────────────────────────

const CHARACTER_DESCRIPTIONS: Record<CharacterName, string> = {
  ki: 'גיבור ראשי — דוג\'ו הקוד',
  mika: 'האקרית — טכנולוגיה + רגשות',
  yuki: 'מהירה כברק — דוג\'ו הרוח',
  luna: 'האמנית הביישנית',
  noa: 'המרפאה — דוג\'ו הטבע',
  kai: 'לוחם האש — דוג\'ו האש',
  pixel: 'הרובוטית הנשית',
  rex: 'דינוזאור גיימר יצירתי',
  senseiZen: 'צב חכם — המנטור הראשי',
  masterBeat: 'ישות טרנסצנדנטית קוסמית',
  sakura: 'עגורת מנטורית',
  shadow: 'חתול הצללים — יריב + חבר',
  storm: 'שועלת ברקים',
  barak: 'שועל ברקים — אח של סטורם',
  blaze: 'שומר דוג\'ו האש',
  bug: 'חרק קוד זדוני',
  zara: 'מלכת הבאגים',
  keres: 'מלך הבאגים',
  block: 'חסימה יצירתית',
  lens: 'עין מצלמה',
  virus: 'הנבל הראשי — 4 צורות',
  glitch: '5 צורות סיפוריות',
  phantom: 'התלמיד האבוד של סנסיי זן',
  alon: 'אבא של קי — נינג\'ה-קודר',
  shir: 'אמא של קי',
}

// ─── Category Definitions ──────────────────────────────────────────────────

interface CategoryDef {
  labelHe: string
  icon: LucideIcon
  color: string
  characters: CharacterName[]
}

const CATEGORIES: CategoryDef[] = [
  {
    labelHe: 'גיבורים',
    icon: Star,
    color: '#6C5CE7',
    characters: ['ki', 'mika', 'yuki', 'luna', 'noa', 'kai', 'pixel', 'rex'],
  },
  {
    labelHe: 'מנטורים',
    icon: Shield,
    color: '#FAD390',
    characters: ['senseiZen', 'masterBeat', 'sakura'],
  },
  {
    labelHe: 'יריבים',
    icon: Swords,
    color: '#0984E3',
    characters: ['shadow', 'storm', 'barak', 'blaze'],
  },
  {
    labelHe: 'נבלים',
    icon: Skull,
    color: '#D63031',
    characters: ['bug', 'zara', 'keres', 'block', 'lens', 'virus', 'glitch'],
  },
  {
    labelHe: 'הורים',
    icon: Heart,
    color: '#C0A060',
    characters: ['alon', 'shir'],
  },
  {
    labelHe: 'מסתורי',
    icon: Users,
    color: '#9B59B6',
    characters: ['phantom'],
  },
]

// ─── Variant Image Keys ────────────────────────────────────────────────────

type VariantKey =
  | 'fireHeroImage'
  | 'evilHeroImage'
  | 'revealHeroImage'
  | 'combatHeroImage'
  | 'ancientHeroImage'
  | 'fusionHeroImage'
  | 'confusedHeroImage'
  | 'corruptedHeroImage'
  | 'shatteredHeroImage'
  | 'wholeHeroImage'

const VARIANT_LABELS: Record<VariantKey, string> = {
  fireHeroImage: 'לוחם אש',
  evilHeroImage: 'צורה רעה',
  revealHeroImage: 'חשיפה',
  combatHeroImage: 'קרב',
  ancientHeroImage: 'קדמון',
  fusionHeroImage: 'מיזוג',
  confusedHeroImage: 'מבולבל',
  corruptedHeroImage: 'מושחת',
  shatteredHeroImage: 'שבור',
  wholeHeroImage: 'שלם',
}

function getVariants(config: CharacterConfig): { key: VariantKey; src: string; label: string }[] {
  const variantKeys: VariantKey[] = [
    'fireHeroImage',
    'evilHeroImage',
    'revealHeroImage',
    'combatHeroImage',
    'ancientHeroImage',
    'fusionHeroImage',
    'confusedHeroImage',
    'corruptedHeroImage',
    'shatteredHeroImage',
    'wholeHeroImage',
  ]
  return variantKeys
    .filter((k) => config[k] != null)
    .map((k) => ({ key: k, src: config[k] as string, label: VARIANT_LABELS[k] }))
}

// ─── Character Detail Dialog ───────────────────────────────────────────────

interface CharacterDialogProps {
  name: CharacterName
  config: CharacterConfig
  children: React.ReactNode
}

function CharacterDetailDialog({ name, config, children }: CharacterDialogProps) {
  const [activeImage, setActiveImage] = useState<string>(
    config.heroImage ?? config.image
  )
  const variants = getVariants(config)
  const description = CHARACTER_DESCRIPTIONS[name]

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-md border-0 p-0"
        dir="rtl"
        style={{
          background: 'linear-gradient(135deg, #0d0b1a 0%, #1a1030 100%)',
          boxShadow: `0 0 40px ${config.glowColor}40, 0 0 80px ${config.glowColor}20`,
          borderRadius: '16px',
        }}
      >
        {/* Glow top border */}
        <div
          className="h-0.5 w-full rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${config.glowColor}, transparent)` }}
        />

        <div className="p-6 space-y-4">
          <DialogHeader className="text-end">
            <DialogTitle
              className="text-2xl font-bold font-heebo text-glow"
              style={{ color: config.glowColor }}
            >
              {config.nameHe}
            </DialogTitle>
            <p className="text-sm text-white/60 font-heebo">{description}</p>
          </DialogHeader>

          {/* Main image */}
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{
              aspectRatio: '3/4',
              boxShadow: `0 0 20px ${config.glowColor}40`,
            }}
          >
            <Image
              src={activeImage}
              alt={config.nameHe}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {/* Gradient overlay at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/3"
              style={{
                background: 'linear-gradient(to top, #0d0b1a, transparent)',
              }}
            />
          </div>

          {/* Variant thumbnails */}
          {variants.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-white/40 font-heebo">צורות נוספות:</p>
              <div className="flex flex-wrap gap-2">
                {/* Main image thumbnail */}
                <button
                  type="button"
                  onClick={() => setActiveImage(config.heroImage ?? config.image)}
                  className="relative size-14 overflow-hidden rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
                  aria-label={`${config.nameHe} — ראשי`}
                  style={{
                    boxShadow:
                      activeImage === (config.heroImage ?? config.image)
                        ? `0 0 8px ${config.glowColor}, 0 0 0 2px ${config.glowColor}`
                        : '0 0 0 1px rgba(255,255,255,0.15)',
                  }}
                >
                  <Image
                    src={config.heroImage ?? config.image}
                    alt={`${config.nameHe} ראשי`}
                    fill
                    className="object-cover object-top"
                    sizes="56px"
                  />
                </button>

                {variants.map(({ key, src, label }) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setActiveImage(src)}
                    className="relative size-14 overflow-hidden rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
                    aria-label={`${config.nameHe} — ${label}`}
                    title={label}
                    style={{
                      boxShadow:
                        activeImage === src
                          ? `0 0 8px ${config.glowColor}, 0 0 0 2px ${config.glowColor}`
                          : '0 0 0 1px rgba(255,255,255,0.15)',
                    }}
                  >
                    <Image
                      src={src}
                      alt={`${config.nameHe} — ${label}`}
                      fill
                      className="object-cover object-top"
                      sizes="56px"
                    />
                    {/* Label overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5">
                      <p className="truncate text-center text-[9px] text-white font-heebo leading-tight">
                        {label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Single Character Card ─────────────────────────────────────────────────

interface CharacterCardProps {
  name: CharacterName
  config: CharacterConfig
}

function CharacterCard({ name, config }: CharacterCardProps) {
  const variants = getVariants(config)
  const hasVariants = variants.length > 0
  const displayImage = config.heroImage ?? config.image
  const description = CHARACTER_DESCRIPTIONS[name]

  return (
    <CharacterDetailDialog name={name} config={config}>
      <motion.button
        type="button"
        className="group relative flex w-full flex-col overflow-hidden rounded-2xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        aria-label={`${config.nameHe} — ${description}`}
      >
        {/* Glow on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 30px ${config.glowColor}30, 0 0 20px ${config.glowColor}25` }}
        />

        {/* Character image */}
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '3/4' }}
        >
          <Image
            src={displayImage}
            alt={config.nameHe}
            fill
            className="object-cover object-top transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-2/5"
            style={{ background: 'linear-gradient(to top, #0d0b1a 0%, transparent 100%)' }}
          />

          {/* Variant badge */}
          {hasVariants && (
            <div
              className="absolute start-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold font-heebo text-white"
              style={{ background: `${config.glowColor}cc` }}
            >
              +{variants.length}
            </div>
          )}
        </div>

        {/* Name + description */}
        <div className="relative px-3 pb-3 pt-1">
          <p
            className="text-base font-bold font-heebo leading-tight"
            style={{ color: config.glowColor }}
          >
            {config.nameHe}
          </p>
          <p className="mt-0.5 text-[11px] text-white/50 font-heebo leading-tight">
            {description}
          </p>

          {/* Variant dots */}
          {hasVariants && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {variants.slice(0, 4).map(({ key }) => (
                <span
                  key={key}
                  className="size-1.5 rounded-full"
                  style={{ background: config.glowColor }}
                />
              ))}
              {variants.length > 4 && (
                <span className="text-[9px] text-white/30 font-heebo">+{variants.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </motion.button>
    </CharacterDetailDialog>
  )
}

// ─── Category Section ──────────────────────────────────────────────────────

interface CategorySectionProps {
  category: CategoryDef
}

function CategorySection({ category }: CategorySectionProps) {
  const { labelHe, icon: Icon, color, characters } = category
  const availableChars = characters.filter((name) => name in CHARACTER_CONFIGS)

  if (availableChars.length === 0) return null

  return (
    <section aria-labelledby={`category-${labelHe}`}>
      {/* Category header */}
      <div className="mb-4 flex items-center gap-3" dir="rtl">
        <div
          className="flex size-9 items-center justify-center rounded-xl"
          style={{ background: `${color}22`, boxShadow: `0 0 12px ${color}40` }}
        >
          <Icon className="size-5" style={{ color: color }} />
        </div>
        <h2
          id={`category-${labelHe}`}
          className="text-lg font-bold font-heebo text-glow"
          style={{ color }}
        >
          {labelHe}
        </h2>
        <span className="text-sm text-white/30 font-heebo">({availableChars.length})</span>
        {/* Divider line */}
        <div
          className="h-px flex-1"
          style={{ background: `linear-gradient(to start, ${color}40, transparent)` }}
        />
      </div>

      {/* Cards grid */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        }}
      >
        {availableChars.map((name) => (
          <CharacterCard
            key={name}
            name={name}
            config={CHARACTER_CONFIGS[name]}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Main Gallery ──────────────────────────────────────────────────────────

export function CharacterGallery() {
  const totalCount = Object.keys(CHARACTER_CONFIGS).length

  return (
    <div dir="rtl" className="space-y-10">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl p-4"
        style={{ background: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <Users className="size-4" style={{ color: 'var(--game-accent-purple)' }} />
          <span className="text-sm font-heebo text-white/70">
            <span className="font-bold text-white">{totalCount}</span> דמויות
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="size-4" style={{ color: '#FAD390' }} />
          <span className="text-sm font-heebo text-white/70">
            <span className="font-bold text-white">{CATEGORIES.length}</span> קטגוריות
          </span>
        </div>
        <p className="ms-auto text-xs text-white/40 font-heebo">
          לחץ על דמות לפרטים ותמונות נוספות
        </p>
      </div>

      {/* Category sections */}
      {CATEGORIES.map((category) => (
        <CategorySection key={category.labelHe} category={category} />
      ))}
    </div>
  )
}
