export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {'\u{1F977} \u05E0\u05D9\u05E0\u05D2\u05F3\u05D4 \u05DE\u05E7\u05DC\u05D3\u05EA'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {'\u05DC\u05DE\u05D3 \u05DC\u05D4\u05E7\u05DC\u05D9\u05D3 \u05DB\u05DE\u05D5 \u05E0\u05D9\u05E0\u05D2\u05F3\u05D4'}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
