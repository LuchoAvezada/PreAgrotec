import { useState, useEffect } from "react"
import { CircleDashed } from "lucide-react"
import type { Partido } from "../types"
import { supabase } from "../lib/supabase"
import { StageSelector } from "../components/StageSelector"
import { MatchCard } from "../components/MatchCard"
import { PredictionModal } from "../components/PredictionModal"

export function MatchesScreen() {
  const [matches, setMatches] = useState<Partido[]>([])
  const [loading, setLoading] = useState(true)
  const [stages, setStages] = useState<string[]>([])
  const [activeStage, setActiveStage] = useState<string>("")

  const [selectedMatch, setSelectedMatch] = useState<Partido | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Custom hook logic to track local storage predicted match CIs
  const [predictedMatches, setPredictedMatches] = useState<Record<string, string>>(() => {
    const predicted: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('penca_ci_')) {
        const matchId = key.replace('penca_ci_', '')
        predicted[matchId] = localStorage.getItem(key) || ""
      }
    }
    return predicted
  })

  useEffect(() => {
    async function fetchMatches() {
      try {
        const { data, error } = await supabase
          .schema('penca')
          .from('partidos')
          .select('*')
          .order('fecha_partido', { ascending: true })

        if (error) throw error

        const fetchedMatches = (data as Partido[]) || []
        setMatches(fetchedMatches)

        const activeMatches = fetchedMatches.filter(m => m.estado !== 'proximo')
        const uniqueStages = [...new Set(activeMatches.map(m => m.etapa))]

        setStages(uniqueStages)

        if (uniqueStages.length > 0) {
          const firstOpenMatch = activeMatches.find(m => m.estado === 'abierto')
          if (firstOpenMatch) {
            setActiveStage(firstOpenMatch.etapa)
          } else {
            setActiveStage(uniqueStages[0])
          }
        }
      } catch (err) {
        console.error("Error fetching matches:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const handlePredictClick = (match: Partido) => {
    setSelectedMatch(match)
    setIsModalOpen(true)
  }

  const handlePredictionSuccess = (matchId: string, ci: string) => {
    localStorage.setItem(`penca_ci_${matchId}`, ci)
    setPredictedMatches(prev => ({ ...prev, [matchId]: ci }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
        <CircleDashed className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-bold text-foreground">No hay partidos disponibles</h3>
        <p className="text-sm text-muted-foreground mt-2">
          El link de la siguiente etapa será compartido por WhatsApp cuando comiencen las predicciones.
        </p>
      </div>
    )
  }

  const filteredMatches = matches.filter(m => m.etapa === activeStage && m.estado !== 'proximo')

  return (
    <div className="flex flex-col pb-24">
      <StageSelector
        stages={stages}
        activeStage={activeStage}
        onStageChange={setActiveStage}
      />

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredMatches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            hasPredicted={!!predictedMatches[match.id]}
            onPredictClick={handlePredictClick}
          />
        ))}
        {filteredMatches.length === 0 && (
          <p className="text-center text-muted-foreground mt-8 text-sm">
            No hay partidos activos en esta etapa.
          </p>
        )}
      </div>

      <PredictionModal
        match={selectedMatch}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handlePredictionSuccess}
      />
    </div>
  )
}
