'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { themes } from '@/styles/themes'
import type { AgeName } from '@/types/theme'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { ageName, colorScheme, setAgeName, toggleDarkMode } = useThemeStore()
  const isDark = colorScheme === 'dark' || colorScheme === 'dark-high-contrast'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-6" />
            הגדרות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">מצב כהה</Label>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          <div className="space-y-3">
            <Label>ערכת נושא (גיל)</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setAgeName(theme.name as AgeName)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3 text-start transition-colors',
                    ageName === theme.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-xl">{theme.emoji}</span>
                  <div>
                    <div className="font-medium">{theme.label}</div>
                    <div className="text-xs text-muted-foreground">
                      גילאי {theme.ageRange[0]}-{theme.ageRange[1]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
