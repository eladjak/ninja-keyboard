/**
 * Shareable "תעודת נינ׳ה" (Ninja Certificate) generator.
 *
 * Draws a brand-consistent, RTL Hebrew certificate to an HTML canvas and
 * exports it as a downloadable PNG — fully client-side, zero dependencies.
 *
 * The pure helpers (display-data assembly, filename, date formatting, star
 * string) are split out from the canvas drawing so they are unit-testable
 * without a DOM.
 */

import { CERTIFICATES, type CertificateLevel } from './certificate'

/** Brand palette (matches CLAUDE.md + game theme tokens). */
const BRAND = {
  primary: '#6C5CE7', // game-accent-purple
  secondary: '#00B894', // game-accent-green
  ink: '#1a1530',
  paper: '#fbfaff',
  paperEdge: '#efeaff',
  gold: '#f5b301',
  muted: '#6b6480',
} as const

export interface CertificateData {
  /** Kid's name as it should appear on the certificate. */
  name: string
  /** Hebrew title of the milestone (e.g. "מאסטר נינג׳ה"). */
  titleHe: string
  /** Sub-line describing the achievement. */
  subtitleHe: string
  /** Emoji/seal for the milestone. */
  emoji: string
  /** Stars earned (0-3) shown as a row. */
  stars: number
  /** ISO timestamp the certificate was issued (defaults to now). */
  issuedAt: number
}

/** Fallback name when the player hasn't set one yet. */
export const DEFAULT_CERTIFICATE_NAME = 'נינג׳ה אלמוני'

/**
 * Format an ISO/epoch timestamp as a Hebrew dd.MM.yyyy date string.
 * Locale-independent (manual formatting) so it renders identically on the
 * canvas regardless of the host's Intl support.
 */
export function formatCertificateDate(ts: number): string {
  const d = new Date(ts)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

/** Build a safe, descriptive PNG filename for the download. */
export function certificateFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '') // strip filesystem-illegal chars
    .replace(/\s+/g, '-')
    .slice(0, 40)
  // Empty / whitespace-only names get an ASCII-safe fallback slug.
  return `teudat-ninja-${cleaned || 'ninja'}.png`
}

/** Render the star row (filled + empty) as a string for a11y / titles. */
export function starString(stars: number): string {
  const filled = Math.max(0, Math.min(3, Math.round(stars)))
  return '★'.repeat(filled) + '☆'.repeat(3 - filled)
}

/**
 * Assemble the certificate display data for a given milestone level.
 * Pure — used by both the canvas drawer and tests.
 */
export function buildCertificateData(params: {
  name: string
  level: CertificateLevel
  stars?: number
  issuedAt?: number
}): CertificateData {
  const cert =
    CERTIFICATES.find((c) => c.level === params.level) ??
    CERTIFICATES[CERTIFICATES.length - 1]
  const name = params.name.trim() || DEFAULT_CERTIFICATE_NAME
  return {
    name,
    titleHe: cert.titleHe,
    subtitleHe: cert.descriptionHe,
    emoji: cert.emoji,
    stars: Math.max(0, Math.min(3, params.stars ?? 3)),
    issuedAt: params.issuedAt ?? Date.now(),
  }
}

/** Canvas dimensions (3:2 landscape, retina-scaled). */
export const CERT_WIDTH = 1200
export const CERT_HEIGHT = 800
const SCALE = 2

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Draw the certificate onto a fresh canvas and return it.
 * Browser-only (requires a real CanvasRenderingContext2D).
 */
export function drawCertificate(data: CertificateData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = CERT_WIDTH * SCALE
  canvas.height = CERT_HEIGHT * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.scale(SCALE, SCALE)

  const W = CERT_WIDTH
  const H = CERT_HEIGHT

  // Background paper with a subtle vertical wash.
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, BRAND.paper)
  bg.addColorStop(1, BRAND.paperEdge)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Outer brand frame (double border).
  ctx.lineWidth = 10
  ctx.strokeStyle = BRAND.primary
  roundRect(ctx, 26, 26, W - 52, H - 52, 28)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.strokeStyle = BRAND.secondary
  roundRect(ctx, 46, 46, W - 92, H - 92, 20)
  ctx.stroke()

  // RTL-friendly centered text. We center everything horizontally so the
  // Hebrew reads naturally without bidi surprises.
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cx = W / 2

  const fontStack =
    '"Heebo", "Assistant", "Segoe UI", system-ui, sans-serif'

  // Seal / emoji.
  ctx.font = `90px ${fontStack}`
  ctx.fillText(data.emoji, cx, 150)

  // Heading.
  ctx.fillStyle = BRAND.primary
  ctx.font = `bold 64px ${fontStack}`
  ctx.fillText('תעודת נינג׳ה', cx, 245)

  // Subheading ribbon.
  ctx.fillStyle = BRAND.muted
  ctx.font = `28px ${fontStack}`
  ctx.fillText('מוענקת בגאווה ל', cx, 315)

  // Name (the hero of the certificate).
  ctx.fillStyle = BRAND.ink
  ctx.font = `bold 76px ${fontStack}`
  ctx.fillText(data.name, cx, 395)

  // Underline beneath the name.
  const nameWidth = Math.min(ctx.measureText(data.name).width + 80, W - 160)
  ctx.strokeStyle = BRAND.secondary
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx - nameWidth / 2, 445)
  ctx.lineTo(cx + nameWidth / 2, 445)
  ctx.stroke()

  // Milestone title.
  ctx.fillStyle = BRAND.primary
  ctx.font = `bold 40px ${fontStack}`
  ctx.fillText(data.titleHe, cx, 510)

  // Achievement subtitle.
  ctx.fillStyle = BRAND.muted
  ctx.font = `26px ${fontStack}`
  ctx.fillText(data.subtitleHe, cx, 558)

  // Stars row.
  ctx.font = `52px ${fontStack}`
  const filled = Math.max(0, Math.min(3, Math.round(data.stars)))
  const starGap = 64
  const startX = cx - starGap
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < filled ? BRAND.gold : '#d8d2ec'
    ctx.fillText(i < filled ? '★' : '☆', startX + i * starGap, 630)
  }

  // Footer: date + brand wordmark.
  ctx.fillStyle = BRAND.muted
  ctx.font = `24px ${fontStack}`
  ctx.fillText(`הוענקה בתאריך ${formatCertificateDate(data.issuedAt)}`, cx, 705)

  ctx.fillStyle = BRAND.primary
  ctx.font = `bold 28px ${fontStack}`
  ctx.fillText('🥷 נינג׳ה מקלדת', cx, 745)

  return canvas
}

/** Draw the certificate and return a PNG data URL. Browser-only. */
export function certificateDataUrl(data: CertificateData): string {
  return drawCertificate(data).toDataURL('image/png')
}

/**
 * Trigger a browser download of the certificate PNG.
 * Browser-only. Returns the filename used.
 */
export function downloadCertificate(data: CertificateData): string {
  const url = certificateDataUrl(data)
  const fileName = certificateFileName(data.name)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  return fileName
}
