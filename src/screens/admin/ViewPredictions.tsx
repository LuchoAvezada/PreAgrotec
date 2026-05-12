import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Partido, Prediccion } from '../../types'
import { Card, CardContent } from '../../components/ui/card'
import { Select } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'

export function ViewPredictions() {
  const [matches, setMatches] = useState<Partido[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string>('')
  const [predictions, setPredictions] = useState<Prediccion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    if (selectedMatchId) {
      fetchPredictions(selectedMatchId)
    }
  }, [selectedMatchId])

  async function fetchMatches() {
    try {
      const { data, error } = await supabase
        .schema('penca')
        .from('partidos')
        .select('*')
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

  async function fetchPredictions(matchId: string) {
    try {
      const { data, error } = await supabase
        .schema('penca')
        .from('predicciones')
        .select('*')
        .eq('partido_id', matchId)
        .order('enviado_en', { ascending: true })

      if (error) throw error
      setPredictions((data as Prediccion[]) || [])
    } catch (err) {
      console.error(err)
    }
  }

  const selectedMatch = matches.find(m => m.id === selectedMatchId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Pronósticos por Partido</h2>

        <div className="w-full md:w-auto min-w-[300px]">
          <Select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
          >
            <option value="" disabled>Selecciona un partido</option>
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {m.bandera_a} {m.equipo_a} vs {m.equipo_b} {m.bandera_b} ({m.etapa})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {selectedMatch && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-lg font-bold">
              <span>{selectedMatch.bandera_a} {selectedMatch.equipo_a}</span>
              <span className="text-muted-foreground">vs</span>
              <span>{selectedMatch.equipo_b} {selectedMatch.bandera_b}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-background">
                Total de pronósticos: {predictions.length}
              </Badge>
              {selectedMatch.estado === 'finalizado' && (
                <Badge variant="success">
                  Resultado Real: {selectedMatch.resultado_a} - {selectedMatch.resultado_b}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4">Nº</th>
                  <th className="px-6 py-4">Cédula</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Sucursal</th>
                  <th className="px-6 py-4 text-center">Pronóstico</th>
                  <th className="px-6 py-4 text-center">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {predictions.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{i + 1}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{p.ci}</td>
                    <td className="px-6 py-4 font-bold">{p.nombre_completo}</td>
                    <td className="px-6 py-4">{p.sucursal}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {p.prediccion_a} - {p.prediccion_b}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {p.puntos_ganados !== null ? p.puntos_ganados : '-'}
                    </td>
                  </tr>
                ))}
                {predictions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No hay pronósticos registrados para este partido.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
