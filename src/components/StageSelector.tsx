import { cn } from "../lib/utils"

interface StageSelectorProps {
  stages: string[]
  activeStage: string
  onStageChange: (stage: string) => void
}

export function StageSelector({ stages, activeStage, onStageChange }: StageSelectorProps) {
  if (stages.length === 0) return null

  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-4 px-4 bg-background border-b border-border sticky top-0 z-30">
      <div className="flex gap-2">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => onStageChange(stage)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors active:scale-95",
              activeStage === stage
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
            )}
          >
            {stage}
          </button>
        ))}
      </div>
    </div>
  )
}
