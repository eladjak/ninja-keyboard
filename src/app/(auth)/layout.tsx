import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authEnabled = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {'\u{1F977} נינג׳ה מקלדת'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {'למד להקליד כמו נינג׳ה'}
          </p>
        </div>
        {!authEnabled && (
          <div
            className="bg-secondary/10 border-secondary/30 mb-6 rounded-xl border p-4 text-center text-sm"
            role="status"
          >
            <p className="font-medium">
              החשבונות עוד לא נפתחו — בינתיים משחקים כאורחים 🥷
            </p>
            <p className="text-muted-foreground mt-1">
              כל ההתקדמות נשמרת על המכשיר הזה.
            </p>
            <Link
              href="/home"
              className="text-primary mt-2 inline-block font-semibold underline underline-offset-4"
            >
              כניסה כאורחים ומתחילים לשחק
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
