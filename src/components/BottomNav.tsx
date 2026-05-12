import { Home, Trophy } from "lucide-react"
import { cn } from "../lib/utils"

interface BottomNavProps {
  activeTab: "partidos" | "ranking"
  onTabChange: (tab: "partidos" | "ranking") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-background border-t border-border flex justify-around items-center pb-safe-bottom z-40">
      <button
        onClick={() => onTabChange("partidos")}
        className={cn(
          "flex-1 flex flex-col items-center justify-center py-3 px-2 gap-1 transition-colors active:scale-95",
          activeTab === "partidos" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium uppercase tracking-wider">Partidos</span>
      </button>
      <button
        onClick={() => onTabChange("ranking")}
        className={cn(
          "flex-1 flex flex-col items-center justify-center py-3 px-2 gap-1 transition-colors active:scale-95",
          activeTab === "ranking" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Trophy className="w-6 h-6" />
        <span className="text-[10px] font-medium uppercase tracking-wider">Ranking</span>
      </button>
    </div>
  )
}
