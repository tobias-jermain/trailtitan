import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Step1Setup } from './Step1_Setup'
import { Step2Terrain } from './Step2_Terrain'
import { Step3Checkpoints } from './Step3_Checkpoints'
import { Step4Review } from './Step4_Review'

const STEPS = [
  { id: 1, label: 'Setup', render: () => <Step1Setup /> },
  { id: 2, label: 'Terrain', render: () => <Step2Terrain /> },
  { id: 3, label: 'Checkpoints', render: () => <Step3Checkpoints /> },
  { id: 4, label: 'Review', render: () => <Step4Review /> },
]

/** The wizard sidebar: step indicator + active step body + nav. */
export function WizardSidebar() {
  const [step, setStep] = useState(1)
  const active = STEPS.find((s) => s.id === step)!

  return (
    <div className="flex h-full flex-col">
      <ol className="flex shrink-0 items-center gap-1 border-b px-4 py-3">
        {STEPS.map((s) => (
          <li key={s.id} className="flex flex-1 items-center">
            <button
              onClick={() => setStep(s.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors',
                step === s.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]',
                  step >= s.id
                    ? 'bg-brand-gradient text-white'
                    : 'bg-muted-foreground/20',
                )}
              >
                {s.id}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="mb-4 text-base font-semibold">
          Step {active.id}: {active.label}
        </h2>
        {active.render()}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={step === STEPS.length}
          onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
