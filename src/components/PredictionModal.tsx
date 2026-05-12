import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle2, Minus, Plus, AlertCircle } from "lucide-react"
import type { Partido } from "../types"
import { supabase } from "../lib/supabase"
import { SUCURSALES } from "../constants/sucursales"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Select } from "./ui/select"

interface PredictionModalProps {
  match: Partido | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (matchId: string, ci: string) => void
}

export function PredictionModal({ match, open, onOpenChange, onSuccess }: PredictionModalProps) {
  const [ci, setCi] = useState("")
  const [fullName, setFullName] = useState("")
  const [sucursal, setSucursal] = useState("")
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!match) return null

  const matchDate = parseISO(match.fecha_partido)
  const formattedDate = format(matchDate, "d 'de' MMMM, HH:mm'hs'", { locale: es })

  const handleSubmit = async () => {
    setError(null)
    if (!ci || !/^\d{6,8}$/.test(ci)) {
      setError("La cédula debe contener solo entre 6 y 8 números.")
      return
    }
    if (!fullName || fullName.length < 3) {
      setError("Ingresa tu nombre y apellido.")
      return
    }
    if (!sucursal) {
      setError("Selecciona una sucursal.")
      return
    }

    setIsSubmitting(true)
    try {
      const { error: dbError } = await supabase
        .schema('penca')
        .from('predicciones')
        .insert({
          partido_id: match.id,
          ci,
          nombre_completo: fullName,
          sucursal,
          prediccion_a: scoreA,
          prediccion_b: scoreB,
        })

      if (dbError) {
        if (dbError.code === '23505') {
          setError("Ya existe una predicción para esta cédula en este partido.")
        } else {
          setError("Ocurrió un error al enviar la predicción. Intenta nuevamente.")
          console.error(dbError)
        }
      } else {
        setIsSuccess(true)
        onSuccess(match.id, ci)
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setIsSuccess(false)
      setCi("")
      setFullName("")
      setSucursal("")
      setScoreA(0)
      setScoreB(0)
      setError(null)
    }, 300)
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <DialogTitle className="text-2xl font-bold text-success">¡Predicción enviada!</DialogTitle>
            <p className="text-muted-foreground">Tu predicción fue registrada correctamente.</p>

            <div className="w-full bg-muted/50 rounded-xl p-4 mt-4 border border-border text-left space-y-3">
              <div className="flex justify-center items-center gap-3 font-bold text-xl pb-3 border-b border-border/50">
                <span className="text-2xl">{match.bandera_a}</span>
                <span>{match.equipo_a}</span>
                <span className="text-primary px-2">{scoreA} - {scoreB}</span>
                <span>{match.equipo_b}</span>
                <span className="text-2xl">{match.bandera_b}</span>
              </div>
              <div className="text-sm">
                <p><span className="font-semibold text-muted-foreground">Nombre:</span> {fullName}</p>
                <p><span className="font-semibold text-muted-foreground">Sucursal:</span> {sucursal}</p>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full mt-6" size="lg">Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex justify-center items-center gap-3 font-bold text-lg">
            <span>{match.bandera_a} {match.equipo_a}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full font-bold">VS</span>
            <span>{match.equipo_b} {match.bandera_b}</span>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {match.grupo || match.etapa} · {formattedDate}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Tus datos</h4>
            
            <div className="space-y-3">
              <div>
                <Input 
                  placeholder="Cédula de Identidad *" 
                  type="number" 
                  value={ci} 
                  onChange={(e) => setCi(e.target.value.replace(/\D/g, ''))}
                  className="font-medium"
                />
              </div>
              <div>
                <Input 
                  placeholder="Nombre y Apellido *" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="font-medium"
                />
              </div>
              <div>
                <Select value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
                  <option value="" disabled>Selecciona tu sucursal *</option>
                  {SUCURSALES.map((suc) => (
                    <option key={suc} value={suc}>{suc}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary text-center">Tu predicción</h4>
            <p className="text-center text-xs text-muted-foreground font-medium">Marcador final (tiempo reglamentario)</p>

            <div className="flex justify-between items-center gap-4 px-2">
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{match.bandera_a}</span>
                  <span className="font-bold text-sm text-center leading-tight h-8 flex items-center">{match.equipo_a}</span>
                </div>
                
                <div className="bg-muted p-2 rounded-xl flex flex-col items-center gap-2 border border-border w-full max-w-[100px]">
                  <button 
                    onClick={() => setScoreA(s => s + 1)}
                    className="w-full h-10 flex items-center justify-center bg-background rounded-lg shadow-sm active:scale-95 transition-transform text-foreground"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="text-4xl font-black py-1">{scoreA}</span>
                  <button 
                    onClick={() => setScoreA(s => Math.max(0, s - 1))}
                    className="w-full h-10 flex items-center justify-center bg-background rounded-lg shadow-sm active:scale-95 transition-transform text-foreground"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <span className="text-xl font-bold text-muted-foreground mt-10">VS</span>

              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{match.bandera_b}</span>
                  <span className="font-bold text-sm text-center leading-tight h-8 flex items-center">{match.equipo_b}</span>
                </div>
                
                <div className="bg-muted p-2 rounded-xl flex flex-col items-center gap-2 border border-border w-full max-w-[100px]">
                  <button 
                    onClick={() => setScoreB(s => s + 1)}
                    className="w-full h-10 flex items-center justify-center bg-background rounded-lg shadow-sm active:scale-95 transition-transform text-foreground"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="text-4xl font-black py-1">{scoreB}</span>
                  <button 
                    onClick={() => setScoreB(s => Math.max(0, s - 1))}
                    className="w-full h-10 flex items-center justify-center bg-background rounded-lg shadow-sm active:scale-95 transition-transform text-foreground"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Solo se registra el marcador al final del tiempo reglamentario (90 min). No se considera alargue ni penales.</p>
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-row gap-3 sm:justify-between">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Predicción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
