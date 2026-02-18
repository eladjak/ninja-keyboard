import { PlacementTest } from '@/components/onboarding/placement-test'

export const metadata = {
  title: 'מבחן מיקום — נינג׳ה מקלדת',
  description: 'גלה את רמת ההקלדה שלך בשניות',
}

export default function PlacementPage() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-start bg-background"
      dir="rtl"
    >
      <PlacementTest />
    </main>
  )
}
