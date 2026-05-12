import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { RankingEntry } from "../types"
import { RankingList } from "../components/RankingList"
import { Badge } from "../components/ui/badge"

export function RankingScreen() {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRanking() {
      try {
        const { data, error } = await supabase
          .schema('penca')
          .from('ranking')
          .select('*')
          .order('puntos_totales', { ascending: false })
          .order('resultados_exactos', { ascending: false })

        if (error) throw error
        setRanking((data as RankingEntry[]) || [])
      } catch (err) {
        console.error("Error fetching ranking:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50">
      <div className="sticky top-16 md:top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center md:rounded-t-2xl md:max-w-3xl md:mx-auto md:w-full md:mt-4 md:border-x md:border-t">
        <h2 className="text-xl font-bold text-foreground">Ranking General</h2>
        <Badge variant="secondary" className="px-3">
          {ranking.length} participantes
        </Badge>
      </div>

      <div className="md:max-w-3xl md:mx-auto md:w-full md:bg-background md:border-x md:border-b md:rounded-b-2xl md:shadow-sm">
        <RankingList ranking={ranking} />
      </div>
    </div>
  )
}
