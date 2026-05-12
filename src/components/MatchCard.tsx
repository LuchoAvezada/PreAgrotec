import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Check } from "lucide-react"
import type { Partido } from "../types"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

interface MatchCardProps {
  match: Partido
  hasPredicted: boolean
  onPredictClick: (match: Partido) => void
}

export function MatchCard({ match, hasPredicted, onPredictClick }: MatchCardProps) {
  const matchDate = parseISO(match.fecha_partido)
  const formattedDate = format(matchDate, "d 'de' MMMM, HH:mm'hs'", { locale: es })

  const hasStarted = new Date() >= matchDate

  const isFinished = match.estado === 'finalizado'
  const isClosed = match.estado === 'cerrado' || hasStarted
  const isOpen = match.estado === 'abierto' && !hasStarted

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          {match.grupo ? (
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              {match.grupo}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] sm:text-xs border-dashed">
              {match.etapa}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-medium">{formattedDate}</span>
        </div>

        <div className="flex items-center justify-between gap-2 py-2">
          <div className="flex flex-col items-center flex-1 gap-1">
            <span className="text-3xl sm:text-4xl">{match.bandera_a}</span>
            <span className="text-sm font-bold text-center leading-tight">{match.equipo_a}</span>
          </div>

          <div className="flex flex-col items-center justify-center px-2">
            {isFinished && match.resultado_a !== null && match.resultado_b !== null ? (
              <div className="flex items-center gap-2 font-black text-2xl">
                <span>{match.resultado_a}</span>
                <span className="text-muted-foreground">-</span>
                <span>{match.resultado_b}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">VS</span>
            )}
          </div>

          <div className="flex flex-col items-center flex-1 gap-1">
            <span className="text-3xl sm:text-4xl">{match.bandera_b}</span>
            <span className="text-sm font-bold text-center leading-tight">{match.equipo_b}</span>
          </div>
        </div>

        {hasPredicted && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-success/10 text-success rounded-full self-center mb-1">
            <Check className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Ya predijiste este partido</span>
          </div>
        )}

        {isOpen && !hasPredicted && (
          <Button 
            className="w-full font-bold shadow-sm" 
            onClick={() => onPredictClick(match)}
          >
            Predecir resultado
          </Button>
        )}
        
        {isOpen && hasPredicted && (
          <Button variant="ghost" className="w-full font-medium" disabled>
            Ya enviaste tu predicción
          </Button>
        )}

        {(isClosed || isFinished) && (
          <Button variant="secondary" className="w-full font-medium opacity-80" disabled>
            {isFinished ? 'Partido Finalizado' : hasStarted ? 'Partido en Curso' : 'Cerrado'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
