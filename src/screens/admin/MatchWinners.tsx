import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Partido, Prediccion } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Select } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Trophy } from 'lucide-react'

export function MatchWinners() {
  const [matches, setMatches] = useState<Partido[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string>('')
  const [winners, setWinners] = useState<Prediccion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinishedMatches()
  }, [])

  useEffect(() => {
    if (selectedMatchId) {
      fetchWinners(selectedMatchId)
    }
  }, [selectedMatchId])

  async function fetchFinishedMatches() {
    try {
      const { data, error } = await supabase
        .schema('penca')
        .from('partidos')
        .select('*')
        .eq('estado', 'finalizado')
        .order('fecha_partido', { ascending: false })

      if (error) throw error
      const fetched = (data as Partido[]) || []
      setMatches(fetched)
      if (fetched.length > 0) {
        setSelectedMatchId(fetched[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWinners(matchId: string) {
    try {
      const { data, error } = await supabase
        .schema('penca')
        .from('predicciones')
        .select('*')
        .eq('partido_id', matchId)
        .gt('puntos_ganados', 0) // Only participants who scored points
        .order('puntos_ganados', { ascending: false })
        .order('nombre_completo', { ascending: true })

      if (error) throw error
      setWinners((data as Prediccion[]) || [])
    } catch (err) {
      console.error(err)
    }
  }

  const selectedMatch = matches.find(m => m.id === selectedMatchId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Ganadores por Partido</h2>

        <div className="w-full md:w-auto min-w-[300px]">
          <Select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
          >
            <option value="" disabled>Selecciona un partido finalizado</option>
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {m.bandera_a} {m.equipo_a} vs {m.equipo_b} {m.bandera_b} ({m.resultado_a}-{m.resultado_b})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {selectedMatch && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-lg font-bold">
              <span>{selectedMatch.bandera_a} {selectedMatch.equipo_a}</span>
              <span className="text-muted-foreground">vs</span>
              <span>{selectedMatch.equipo_b} {selectedMatch.bandera_b}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="success" className="text-base py-1">
                Resultado Oficial: {selectedMatch.resultado_a} - {selectedMatch.resultado_b}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-bold text-lg">Aún no hay partidos finalizados</h3>
          <p className="text-muted-foreground">Cuando cargues el resultado real de un partido, aparecerá aquí la lista de ganadores.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3 Points Winners */}
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Marcador Exacto (3 pts)
              </CardTitle>
            </CardHeader>
            <div className="divide-y">
              {winners.filter(w => w.puntos_ganados === 3).map((w) => (
                <div key={w.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold">{w.nombre_completo}</p>
                    <p className="text-xs text-muted-foreground">{w.sucursal} - CI: {w.ci}</p>
                  </div>
                  <Badge variant="secondary" className="text-base px-3">{w.prediccion_a} - {w.prediccion_b}</Badge>
                </div>
              ))}
              {winners.filter(w => w.puntos_ganados === 3).length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Nadie acertó el marcador exacto en este partido.
                </div>
              )}
            </div>
          </Card>

          {/* 1 Point Winners */}
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Acierto de Ganador/Empate (1 pt)
              </CardTitle>
            </CardHeader>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {winners.filter(w => w.puntos_ganados === 1).map((w) => (
                <div key={w.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm">{w.nombre_completo}</p>
                    <p className="text-xs text-muted-foreground">{w.sucursal}</p>
                  </div>
                  <Badge variant="outline" className="text-sm">{w.prediccion_a} - {w.prediccion_b}</Badge>
                </div>
              ))}
              {winners.filter(w => w.puntos_ganados === 1).length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Nadie sumó 1 punto en este partido.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
