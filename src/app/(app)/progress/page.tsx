import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-6" />
            ההתקדמות שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">מעקב התקדמות מגיע בקרוב!</p>
        </CardContent>
      </Card>
    </div>
  )
}
