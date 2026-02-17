import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords } from 'lucide-react'

export default function BattlePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="size-6" />
            זירת קרב
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">זירת הקרב מגיעה בקרוב!</p>
        </CardContent>
      </Card>
    </div>
  )
}
