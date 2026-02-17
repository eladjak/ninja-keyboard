import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-6" />
            שיעורים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">שיעורי הקלדה מגיעים בקרוב בספרינט 2!</p>
        </CardContent>
      </Card>
    </div>
  )
}
