import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ClassCodeForm } from '@/components/auth/class-code-form'

export default function JoinPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{'\u05D4\u05E6\u05D8\u05E8\u05E4\u05D5\u05EA \u05DC\u05DB\u05D9\u05EA\u05D4'}</CardTitle>
        <CardDescription>
          {'\u05E7\u05D9\u05D1\u05DC\u05EA \u05E7\u05D5\u05D3 \u05DE\u05D4\u05DE\u05D5\u05E8\u05D4? \u05D4\u05DB\u05E0\u05E1 \u05D0\u05D5\u05EA\u05D5 \u05DB\u05D0\u05DF'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClassCodeForm />
      </CardContent>
    </Card>
  )
}
