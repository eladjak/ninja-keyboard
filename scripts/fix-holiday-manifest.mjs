#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manifestPath = resolve(__dirname, '..', 'public/audio/music/music-manifest.json')
const musicDir = resolve(__dirname, '..', 'public/audio/music')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))

const missingHolidays = [
  { id: 'HOL-003', name: 'pesach-theme', title: 'Pesach Theme', titleHe: 'פסח — ערכת חג' },
  { id: 'HOL-004', name: 'yom-haatzmaut-theme', title: "Yom Ha'atzmaut Theme", titleHe: 'יום העצמאות — ערכת חג' },
  { id: 'HOL-006', name: 'sukkot-theme', title: 'Sukkot Theme', titleHe: 'סוכות — ערכת חג' },
  { id: 'HOL-007', name: 'shavuot-theme', title: 'Shavuot Theme', titleHe: 'שבועות — ערכת חג' },
  { id: 'HOL-009', name: 'tu-bishvat-theme', title: 'Tu Bishvat Theme', titleHe: 'ט"ו בשבט — ערכת חג' },
  { id: 'HOL-010', name: 'yom-hazikaron-theme', title: 'Yom Hazikaron Theme', titleHe: 'יום הזיכרון — ערכת חג' },
  { id: 'HOL-011', name: 'yom-hashoah-theme', title: 'Yom Hashoah Theme', titleHe: 'יום השואה — ערכת חג' },
]

let added = 0
for (const h of missingHolidays) {
  const files = []
  const mainFile = 'holidays/' + h.name + '.mp3'
  const v2File = 'holidays/' + h.name + '-v2.mp3'

  if (existsSync(resolve(musicDir, mainFile))) files.push(mainFile)
  if (existsSync(resolve(musicDir, v2File))) files.push(v2File)

  if (files.length === 0) continue

  const existing = (manifest.generated_tracks || []).find(t => t.trackId === h.id)
  if (existing) { console.log('SKIP ' + h.id + ' (already in manifest)'); continue }

  manifest.generated_tracks = manifest.generated_tracks || []
  manifest.generated_tracks.push({
    trackId: h.id,
    name: h.name,
    title: h.title,
    titleHe: h.titleHe,
    category: 'holidays',
    files: files,
    generatedAt: new Date().toISOString(),
  })

  manifest.pending_tracks = (manifest.pending_tracks || []).filter(t => t.id !== h.id)
  manifest.not_generated = (manifest.not_generated || []).filter(t => t.name !== h.name)

  added++
  console.log('ADDED ' + h.id + ' (' + files.join(', ') + ')')
}

// Add purim-theme-v2 which was quality-rejected but file exists
const purimEntry = manifest.generated_tracks.find(t => t.trackId === 'HOL-002')
if (purimEntry && !purimEntry.files.includes('holidays/purim-theme-v2.mp3')) {
  if (existsSync(resolve(musicDir, 'holidays/purim-theme-v2.mp3'))) {
    purimEntry.files.push('holidays/purim-theme-v2.mp3')
    console.log('ADDED purim-theme-v2.mp3 to HOL-002')
    added++
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log('Done. Added ' + added + ' entries. Total generated tracks: ' + manifest.generated_tracks.length)
