import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{'\u05DB\u05E0\u05D9\u05E1\u05D4 \u05DC\u05E0\u05D9\u05E0\u05D2\u05F3\u05D4 \u05DE\u05E7\u05DC\u05D3\u05EA'}</CardTitle>
        <CardDescription>
          {'\u05D4\u05DB\u05E0\u05E1 \u05D0\u05EA \u05E4\u05E8\u05D8\u05D9 \u05D4\u05D7\u05E9\u05D1\u05D5\u05DF \u05E9\u05DC\u05DA'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
