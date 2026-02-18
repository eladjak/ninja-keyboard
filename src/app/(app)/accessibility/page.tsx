import { AccessibilityPanel } from '@/components/accessibility/accessibility-panel'

export const metadata = {
  title: 'הגדרות נגישות | נינג\'ה מקלדת',
  description: 'התאם את הגדרות הנגישות לצרכים שלך',
}

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="p-4 sm:p-6">
      <AccessibilityPanel />
    </main>
  )
}
