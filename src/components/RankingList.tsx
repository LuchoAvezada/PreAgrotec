import { Trophy } from "lucide-react"
import { cn } from "../lib/utils"
import type { RankingEntry } from "../types"

interface RankingListProps {
  ranking: RankingEntry[]
}

export function RankingList({ ranking }: RankingListProps) {
  if (ranking.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
        <Trophy className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-bold text-foreground">Aún no hay predicciones registradas.</h3>
        <p className="text-sm text-muted-foreground mt-2">
          ¡Sé el primero en participar enviando tu predicción en la pestaña de partidos!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 gap-3 pb-24">
      {ranking.map((entry, index) => {
        const position = index + 1
        const isTop3 = position <= 3
        
        let positionBadge = <span className="font-bold text-lg text-muted-foreground">{position}</span>
        if (position === 1) positionBadge = <span className="text-2xl" title="1er Lugar">🥇</span>
        else if (position === 2) positionBadge = <span className="text-2xl" title="2do Lugar">🥈</span>
        else if (position === 3) positionBadge = <span className="text-2xl" title="3er Lugar">🥉</span>

        return (
          <div 
            key={entry.ci}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border bg-card transition-all",
              isTop3 ? "border-l-4 shadow-sm" : "border-border",
              position === 1 ? "border-l-yellow-400" : "",
              position === 2 ? "border-l-slate-300" : "",
              position === 3 ? "border-l-amber-600" : ""
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {positionBadge}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight text-foreground">{entry.nombre_completo}</span>
                <span className="text-xs text-muted-foreground">{entry.sucursal}</span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {entry.resultados_exactos} exactos · {entry.aciertos_ganador} resultados
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[3.5rem]">
                <span className="text-xl font-black leading-none">{entry.puntos_totales}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Pts</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
