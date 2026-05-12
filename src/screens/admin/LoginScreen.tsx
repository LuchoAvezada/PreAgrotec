import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Shield } from 'lucide-react'

export function LoginScreen() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: dbError } = await supabase
        .schema('penca')
        .from('usuarios_admin')
        .select('*')
        .eq('usuario', username)
        .eq('password', password)
        .single()
      
      if (dbError || !data) {
        throw new Error("Usuario o contraseña incorrectos")
      }
      
      // Save session in localStorage
      localStorage.setItem('penca_admin_logged_in', 'true')
      localStorage.setItem('penca_admin_user', username)
      
      navigate('/admin')
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black text-primary">Admin Penca</CardTitle>
          <p className="text-muted-foreground text-sm">Acceso exclusivo con cuenta Agrotec</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Usuario</label>
              <Input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                placeholder="nombre.apellido"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Contraseña</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md text-center font-medium">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full h-12 font-bold text-base mt-2" disabled={loading}>
              {loading ? "Verificando..." : "Ingresar al Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
