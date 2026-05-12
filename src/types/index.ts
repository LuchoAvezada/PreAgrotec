export type PartidoEstado = 'proximo' | 'abierto' | 'cerrado' | 'finalizado'

export interface Partido {
  id: string
  etapa: string
  fecha_partido: string
  equipo_a: string
  equipo_b: string
  bandera_a: string
  bandera_b: string
  grupo: string | null
  estado: PartidoEstado
  resultado_a: number | null
  resultado_b: number | null
}

export interface Prediccion {
  id: string
  partido_id: string
  ci: string
  nombre_completo: string
  sucursal: string
  prediccion_a: number
  prediccion_b: number
  puntos_ganados: number | null
}

export interface RankingEntry {
  ci: string
  nombre_completo: string
  sucursal: string
  partidos_puntuados: number
  puntos_totales: number
  resultados_exactos: number
  aciertos_ganador: number
}
