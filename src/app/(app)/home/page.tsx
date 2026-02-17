import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <span className="text-6xl">🥷</span>
        <h1 className="text-3xl font-bold">ברוכים הבאים לנינג&apos;ה מקלדת!</h1>
        <p className="text-muted-foreground text-lg">מוכנים להפוך לנינג&apos;ות הקלדה?</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>המסע שלך מתחיל כאן</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>שיעורי הקלדה מגיעים בקרוב בספרינט 2!</p>
          <Button size="lg" disabled>
            התחל שיעור
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
