import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center"
      dir="rtl"
    >
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold">הדף לא נמצא</h1>
      <p className="text-muted-foreground">
        נראה שהנינג&apos;ה אבד בדרך... הדף שחיפשת לא קיים.
      </p>
      <Link
        href="/home"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        חזרה לדף הבית
      </Link>
    </div>
  )
}
