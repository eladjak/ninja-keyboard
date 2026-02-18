'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConsentStore } from '@/stores/consent-store'

/** Word the user must type to confirm deletion */
const CONFIRM_WORD = 'מחק'

interface DataDeletionDialogProps {
  onDeleted?: () => void
}

export function DataDeletionDialog({ onDeleted }: DataDeletionDialogProps) {
  const revokeAllConsents = useConsentStore((s) => s.revokeAllConsents)
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleted, setDeleted] = useState(false)

  const isConfirmed = confirmText === CONFIRM_WORD

  function handleDelete() {
    if (!isConfirmed) return
    revokeAllConsents()
    setDeleted(true)
    onDeleted?.()
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Reset state when dialog closes
      setConfirmText('')
      setDeleted(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          aria-label="מחק את כל הנתונים של הילד/ה"
        >
          מחק את כל הנתונים
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
            מחיקת כל הנתונים
          </DialogTitle>
          <DialogDescription>
            פעולה זו תמחק את כל הנתונים של הילד/ה לרבות ההתקדמות, XP, והסכמות.
            <strong className="block mt-2 text-foreground">
              פעולה זו אינה הפיכה.
            </strong>
          </DialogDescription>
        </DialogHeader>

        {deleted ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-700 dark:text-green-300 text-center font-medium"
          >
            כל הנתונים נמחקו בהצלחה.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                כדי לאשר, הקלד/י{' '}
                <span className="font-bold text-destructive" aria-label="את המילה מחק">
                  &ldquo;{CONFIRM_WORD}&rdquo;
                </span>{' '}
                בשדה:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_WORD}
                aria-required="true"
                aria-describedby="confirm-hint"
              />
              <p id="confirm-hint" className="text-muted-foreground text-xs">
                הקלד/י &quot;{CONFIRM_WORD}&quot; (בעברית) לאישור המחיקה.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            ביטול
          </Button>
          {!deleted && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmed}
              aria-disabled={!isConfirmed}
            >
              מחק לצמיתות
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
