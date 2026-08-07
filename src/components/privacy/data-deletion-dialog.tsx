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
import { useCurrentUser } from '@/hooks/use-current-user'
import {
  clearAllLocalData,
  isCompleteErasure,
  type ClearResult,
} from '@/lib/privacy/local-data'

/** Word the user must type to confirm deletion */
const CONFIRM_WORD = 'מחק'

interface DataDeletionDialogProps {
  onDeleted?: () => void
}

/**
 * This dialog previously promised to delete "ההתקדמות, XP, והסכמות", called
 * only `revokeAllConsents()`, and then told the parent "כל הנתונים נמחקו
 * בהצלחה". Everything else — XP, completed lessons, badges, practice history,
 * story progress, the offline queue — survived untouched.
 *
 * It now does what it says for data on this device, and says only what it does
 * about data that is not on this device. Deleting rows from the server needs
 * server-side work that is not done here, so when a child is signed in the
 * dialog states that in plain Hebrew a parent can act on, instead of quietly
 * implying it happened.
 */
export function DataDeletionDialog({ onDeleted }: DataDeletionDialogProps) {
  const { status } = useCurrentUser()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [result, setResult] = useState<ClearResult | null>(null)

  const isConfirmed = confirmText === CONFIRM_WORD
  const isSignedIn = status === 'authenticated'

  function handleDelete() {
    if (!isConfirmed) return
    const r = clearAllLocalData()
    setResult(r)
    onDeleted?.()
    // Storage is empty but every zustand store still holds the old values in
    // memory. Without this reload a child's XP would still be on screen under
    // a "deleted successfully" banner. Give the parent a moment to read it.
    if (isCompleteErasure(r) && !isSignedIn) {
      window.setTimeout(() => window.location.reload(), 1800)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setConfirmText('')
      setResult(null)
      // If data was cleared and we did not auto-reload (signed-in case), the
      // page is showing stale state — reload on close rather than leave it.
      if (result) window.location.reload()
    }
  }

  const complete = result ? isCompleteErasure(result) : false

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          aria-label="מחק את כל הנתונים של הילד/ה מהמכשיר הזה"
        >
          מחק את כל הנתונים
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
            מחיקת הנתונים מהמכשיר הזה
          </DialogTitle>
          <DialogDescription>
            הפעולה תמחק מהמכשיר הזה את כל מה ששמור על הילד/ה: ההתקדמות
            והשיעורים שהושלמו, ה-XP והרמה, ההישגים, היסטוריית התרגול, הסיפור,
            ההגדרות וההסכמות.
            <strong className="mt-2 block text-foreground">
              הפעולה אינה הפיכה.
            </strong>
            {isSignedIn && (
              <span className="mt-2 block">
                הילד/ה מחובר/ת לחשבון. הנתונים שנשמרו בחשבון עצמו אינם נמחקים
                כאן, ולכן הם יחזרו למכשיר בהתחברות הבאה. כדי למחוק גם את
                נתוני החשבון יש לפנות אלינו בבקשת מחיקה.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div
            role="status"
            aria-live="polite"
            className={
              complete
                ? 'rounded-lg bg-green-500/15 p-4 text-center font-medium text-green-300'
                : 'rounded-lg bg-yellow-500/15 p-4 text-center font-medium text-yellow-200'
            }
          >
            {complete ? (
              isSignedIn ? (
                <>
                  הנתונים נמחקו מהמכשיר הזה.
                  <span className="mt-1 block text-sm font-normal">
                    נתוני החשבון עצמו לא נמחקו — לשם כך יש לפנות אלינו.
                  </span>
                </>
              ) : (
                <>
                  כל הנתונים נמחקו מהמכשיר הזה.
                  <span className="mt-1 block text-sm font-normal">
                    הדף ייטען מחדש כדי להתחיל מחדש.
                  </span>
                </>
              )
            ) : (
              <>
                המחיקה בוצעה חלקית.
                <span className="mt-1 block text-sm font-normal">
                  חלק מהנתונים לא נמחקו מהמכשיר. נסו שוב, או נקו את נתוני
                  האתר דרך הגדרות הדפדפן.
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                כדי לאשר, הקלד/י{' '}
                <span
                  className="font-bold text-destructive"
                  aria-label="את המילה מחק"
                >
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
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {result ? 'סגור' : 'ביטול'}
          </Button>
          {!result && (
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
