import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-6" />
            הפרופיל שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">הפרופיל שלך יוצג כאן בקרוב.</p>
        </CardContent>
      </Card>
    </div>
  )
}
