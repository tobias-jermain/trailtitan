import { useState } from 'react'
import { Check, ExternalLink, KeyRound } from 'lucide-react'
import { useAppStore } from '@/lib/store/app'
import { builtInPresets } from '@/lib/config/presets'
import type { ThemePreference } from '@/types/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field } from '@/components/planner/Field'

export function Settings() {
  const config = useAppStore((s) => s.config)
  const setApiKey = useAppStore((s) => s.setApiKey)
  const setTheme = useAppStore((s) => s.setTheme)
  const patch = useAppStore((s) => s.patch)

  const [keyDraft, setKeyDraft] = useState(config.orsApiKey)
  const [savedKey, setSavedKey] = useState(false)

  const saveKey = async () => {
    await setApiKey(keyDraft.trim())
    setSavedKey(true)
    setTimeout(() => setSavedKey(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-5 p-6">
        <h1 className="text-xl font-semibold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" /> OpenRouteService API key
            </CardTitle>
            <CardDescription>
              Stored locally on this machine — never committed or shared. Leave
              empty to use offline demo mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Paste your API key"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
              />
              <Button onClick={saveKey} variant="brand">
                {savedKey ? <Check className="h-4 w-4" /> : 'Save'}
              </Button>
            </div>
            <a
              href="https://openrouteservice.org/dev/#/signup"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-teal hover:underline"
            >
              Get a free API key <ExternalLink className="h-3 w-3" />
            </a>
            <p className="text-xs text-muted-foreground">
              Status:{' '}
              {config.orsApiKey
                ? 'Live routing enabled.'
                : 'Demo mode (no key set).'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance & defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Theme" htmlFor="theme">
              <Select
                id="theme"
                value={config.theme}
                onChange={(e) => setTheme(e.target.value as ThemePreference)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>

            <Field label="Default preset" htmlFor="preset">
              <Select
                id="preset"
                value={config.defaultPreset}
                onChange={(e) => patch({ defaultPreset: e.target.value })}
              >
                {builtInPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
