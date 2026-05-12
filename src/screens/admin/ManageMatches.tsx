import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Partido } from '../../types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'

export function ManageMatches() {
  const [matches, setMatches] = useState<Partido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    try {
      const { data, error } = await supabase
        .schema('penca')
        .from('partidos')
        .select('*')
        .order('fecha_partido', { ascending: false })

      if (error) throw error
      setMatches((data as Partido[]) || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.schema('penca').from('partidos').update({ estado: newStatus }).eq('id', id)
      fetchMatches()
    } catch (err) {
      console.error(err)
      alert("Error al actualizar estado")
    }
  }

  const updateResult = async (id: string, resA: number, resB: number) => {
    try {
      await supabase.schema('penca').from('partidos').update({
        resultado_a: resA,
        resultado_b: resB,
        estado: 'finalizado'
      }).eq('id', id)
      fetchMatches()
      alert("Resultado guardado. Los puntos se calcularon automáticamente.")
    } catch (err) {
      console.error(err)
      alert("Error al guardar resultado")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Partidos</h2>
        <Button>+ Nuevo Partido</Button>
      </div>

      {loading ? (
        <p>Cargando partidos...</p>
      ) : (
        <div className="grid gap-4">
          {matches.map(match => (
            <MatchAdminCard
              key={match.id}
              match={match}
              onUpdateStatus={updateStatus}
              onUpdateResult={updateResult}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchAdminCard({ match, onUpdateStatus, onUpdateResult }: {
  match: Partido,
  onUpdateStatus: (id: string, s: string) => void,
  onUpdateResult: (id: string, a: number, b: number) => void
}) {
  const [resA, setResA] = useState(match.resultado_a?.toString() || "")
  const [resB, setResB] = useState(match.resultado_b?.toString() || "")

  const matchDate = parseISO(match.fecha_partido)
  const isStarted = new Date() >= matchDate

  return (
    <Card>
      <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <Badge variant="outline">{match.etapa} {match.grupo ? `- ${match.grupo}` : ''}</Badge>
          <div className="text-sm text-muted-foreground">
            {format(matchDate, "d 'de' MMMM yyyy, HH:mm'hs'", { locale: es })}
            {isStarted && <span className="ml-2 text-destructive font-bold">(Hora superada)</span>}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 font-bold text-lg pt-2">
            <span>{match.bandera_a} {match.equipo_a}</span>
            <span className="text-muted-foreground">VS</span>
            <span>{match.equipo_b} {match.bandera_b}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center md:items-end w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Estado:</span>
            <Select
              value={match.estado}
              onChange={(e) => onUpdateStatus(match.id, e.target.value)}
              className="w-32 h-9"
            >
              <option value="proximo">Próximo</option>
              <option value="abierto">Abierto</option>
              <option value="cerrado">Cerrado</option>
              <option value="finalizado">Finalizado</option>
            </Select>
          </div>

          <div className="flex items-center gap-2 mt-4 bg-slate-50 p-3 rounded-lg border">
            <span className="text-sm font-bold mr-2">Resultado Real:</span>
            <Input
              type="number"
              className="w-16 text-center font-bold"
              value={resA}
              onChange={e => setResA(e.target.value)}
            />
            <span>-</span>
            <Input
              type="number"
              className="w-16 text-center font-bold"
              value={resB}
              onChange={e => setResB(e.target.value)}
            />
            <Button
              size="sm"
              onClick={() => onUpdateResult(match.id, parseInt(resA), parseInt(resB))}
              disabled={resA === "" || resB === ""}
            >
              Guardar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
