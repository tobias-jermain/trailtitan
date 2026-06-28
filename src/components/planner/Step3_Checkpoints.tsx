import { useExpeditionStore } from '@/lib/store/expedition'
import type { Checkpoint, EmergencyContact } from '@/types/expedition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import { Field } from './Field'

let cpSeq = 0
let ecSeq = 0

/** Step 3 — Checkpoints, camping options, emergency contacts. */
export function Step3Checkpoints() {
  const config = useExpeditionStore((s) => s.config)
  const updateConfig = useExpeditionStore((s) => s.updateConfig)

  const addCheckpoint = () => {
    cpSeq += 1
    const cp: Checkpoint = {
      id: `cp-${Date.now()}-${cpSeq}`,
      name: `Checkpoint ${config.checkpoints.length + 1}`,
      coordinates: [-4.0758, 53.0685],
    }
    updateConfig({ checkpoints: [...config.checkpoints, cp] })
  }

  const updateCheckpoint = (id: string, patch: Partial<Checkpoint>) =>
    updateConfig({
      checkpoints: config.checkpoints.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })

  const removeCheckpoint = (id: string) =>
    updateConfig({
      checkpoints: config.checkpoints.filter((c) => c.id !== id),
    })

  const addContact = () => {
    ecSeq += 1
    const ec: EmergencyContact = { name: '', role: '', phone: '' }
    void ecSeq
    updateConfig({ emergencyContacts: [...config.emergencyContacts, ec] })
  }

  const updateContact = (index: number, patch: Partial<EmergencyContact>) =>
    updateConfig({
      emergencyContacts: config.emergencyContacts.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    })

  const removeContact = (index: number) =>
    updateConfig({
      emergencyContacts: config.emergencyContacts.filter((_, i) => i !== index),
    })

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Checkpoints</p>
          <Button size="sm" variant="outline" onClick={addCheckpoint}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {config.checkpoints.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No checkpoints yet. These appear on the map and in exports.
          </p>
        )}
        <div className="space-y-3">
          {config.checkpoints.map((cp) => (
            <div key={cp.id} className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={cp.name}
                  placeholder="Name"
                  onChange={(e) => updateCheckpoint(cp.id, { name: e.target.value })}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeCheckpoint(cp.id)}
                  aria-label="Remove checkpoint"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="any"
                  value={cp.coordinates[1]}
                  aria-label="Latitude"
                  onChange={(e) =>
                    updateCheckpoint(cp.id, {
                      coordinates: [cp.coordinates[0], Number(e.target.value)],
                    })
                  }
                />
                <Input
                  type="number"
                  step="any"
                  value={cp.coordinates[0]}
                  aria-label="Longitude"
                  onChange={(e) =>
                    updateCheckpoint(cp.id, {
                      coordinates: [Number(e.target.value), cp.coordinates[1]],
                    })
                  }
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  aria-label="Earliest arrival"
                  value={cp.arrivalWindow?.earliest ?? ''}
                  onChange={(e) =>
                    updateCheckpoint(cp.id, {
                      arrivalWindow: {
                        earliest: e.target.value,
                        latest: cp.arrivalWindow?.latest ?? e.target.value,
                      },
                    })
                  }
                />
                <Input
                  type="time"
                  aria-label="Latest arrival"
                  value={cp.arrivalWindow?.latest ?? ''}
                  onChange={(e) =>
                    updateCheckpoint(cp.id, {
                      arrivalWindow: {
                        earliest: cp.arrivalWindow?.earliest ?? e.target.value,
                        latest: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Overnight</p>
        <div className="flex items-center justify-between rounded-md border p-3">
          <span className="text-sm">Camping allowed</span>
          <Switch
            checked={config.campingAllowed}
            onCheckedChange={(v) =>
              updateConfig({
                campingAllowed: v,
                wildcampingAllowed: v ? config.wildcampingAllowed : false,
              })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <span className="text-sm">
            Wild camping allowed
            {!config.campingAllowed && (
              <span className="ml-1 text-xs text-muted-foreground">
                (requires camping)
              </span>
            )}
          </span>
          <Switch
            disabled={!config.campingAllowed}
            checked={config.wildcampingAllowed}
            onCheckedChange={(v) => updateConfig({ wildcampingAllowed: v })}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Emergency contacts</p>
          <Button size="sm" variant="outline" onClick={addContact}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {config.emergencyContacts.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <Input
                placeholder="Name"
                value={c.name}
                onChange={(e) => updateContact(i, { name: e.target.value })}
              />
              <Input
                placeholder="Role"
                value={c.role}
                onChange={(e) => updateContact(i, { role: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={c.phone}
                onChange={(e) => updateContact(i, { phone: e.target.value })}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeContact(i)}
                aria-label="Remove contact"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Field label="Export formats" htmlFor="export" hint="Shown on the Export page.">
        <select
          id="export"
          className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
          value={config.reportExport}
          onChange={(e) =>
            updateConfig({
              reportExport: e.target.value as typeof config.reportExport,
            })
          }
        >
          <option value="none">None</option>
          <option value="gpx">GPX only</option>
          <option value="pdf">PDF only</option>
          <option value="csv">CSV only</option>
          <option value="all">All formats</option>
        </select>
      </Field>
    </div>
  )
}
