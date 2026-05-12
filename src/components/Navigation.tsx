import { Home, Trophy } from "lucide-react"
import { cn } from "../lib/utils"

interface NavigationProps {
  activeTab: "partidos" | "ranking"
  onTabChange: (tab: "partidos" | "ranking") => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <>
      {/* Desktop Top Navigation */}
      <header className="hidden md:flex sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-black text-xl tracking-tight">
            <Trophy className="w-6 h-6" />
            <span>Penca Mundial 26</span>
          </div>
          
          <nav className="flex items-center gap-8">
            <button
              onClick={() => onTabChange("partidos")}
              className={cn(
                "flex items-center gap-2 text-sm font-bold transition-colors hover:text-primary",
                activeTab === "partidos" ? "text-primary border-b-2 border-primary h-16" : "text-muted-foreground"
              )}
            >
              <Home className="w-4 h-4" />
              PARTIDOS
            </button>
            <button
              onClick={() => onTabChange("ranking")}
              className={cn(
                "flex items-center gap-2 text-sm font-bold transition-colors hover:text-primary",
                activeTab === "ranking" ? "text-primary border-b-2 border-primary h-16" : "text-muted-foreground"
              )}
            >
              <Trophy className="w-4 h-4" />
              RANKING
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-background border-t border-border flex justify-around items-center pb-safe-bottom z-40">
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
    </>
  )
}
