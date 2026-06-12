'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Share2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/settings-store'
import {
  CERT_HEIGHT,
  CERT_WIDTH,
  type CertificateData,
  buildCertificateData,
  certificateFileName,
  downloadCertificate,
  drawCertificate,
} from '@/lib/gamification/certificate-canvas'
import type { CertificateLevel } from '@/lib/gamification/certificate'

interface NinjaCertificateProps {
  /** Milestone level to issue the certificate for. */
  level: CertificateLevel
  /** Stars earned (0-3). */
  stars?: number
  className?: string
}

/**
 * Live, shareable "תעודת נינ׳ה" — draws to a canvas the kid can name,
 * download as PNG, or share. Fully client-side.
 */
export function NinjaCertificate({ level, stars = 3, className }: NinjaCertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerName = useSettingsStore((s) => s.playerName)
  const setPlayerName = useSettingsStore((s) => s.setPlayerName)
  const [status, setStatus] = useState<string | null>(null)

  // Build the certificate data once per relevant change.
  const data: CertificateData = buildCertificateData({
    name: playerName,
    level,
    stars,
  })

  // Render the live preview into the on-screen canvas whenever inputs change.
  useEffect(() => {
    const target = canvasRef.current
    if (!target) return
    const source = drawCertificate(data)
    target.width = source.width
    target.height = source.height
    const ctx = target.getContext('2d')
    if (ctx) ctx.drawImage(source, 0, 0)
    // We intentionally depend on the primitive fields, not the object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, data.titleHe, data.stars, data.emoji, data.issuedAt])

  function handleDownload() {
    const fileName = downloadCertificate(data)
    setStatus(`התעודה נשמרה (${fileName})`)
  }

  async function handleShare() {
    const source = drawCertificate(data)
    const blob: Blob | null = await new Promise((resolve) =>
      source.toBlob((b) => resolve(b), 'image/png'),
    )
    if (!blob) {
      handleDownload()
      return
    }
    const file = new File([blob], certificateFileName(data.name), {
      type: 'image/png',
    })
    const canShareFiles =
      typeof navigator !== 'undefined' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })

    if (canShareFiles && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          files: [file],
          title: 'תעודת נינג׳ה',
          text: `${data.name} סיים את הקורס בנינג׳ה מקלדת! 🥷`,
        })
        setStatus('התעודה שותפה!')
        return
      } catch {
        // user cancelled — fall through to download
      }
    }
    handleDownload()
  }

  return (
    <div className={className} dir="rtl">
      <canvas
        ref={canvasRef}
        className="h-auto w-full rounded-2xl border shadow-md"
        style={{ aspectRatio: `${CERT_WIDTH} / ${CERT_HEIGHT}`, borderColor: 'var(--game-border)' }}
        role="img"
        aria-label={`תעודת נינג׳ה עבור ${data.name}: ${data.titleHe}`}
      />

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="cert-name" className="mb-1 block text-sm font-medium">
            השם שלך על התעודה
          </label>
          <Input
            id="cert-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="הקלד את שמך…"
            maxLength={30}
            className="text-right"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDownload} className="game-button gap-2">
            <Download className="size-4" />
            הורד תעודה (PNG)
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="gap-2"
            style={{ borderColor: 'var(--game-border)' }}
          >
            <Share2 className="size-4" />
            שתף
          </Button>
        </div>

        {status && (
          <p
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Sparkles className="size-4" style={{ color: 'var(--game-accent-green)' }} />
            {status}
          </p>
        )}
      </div>
    </div>
  )
}
