import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { MatchesScreen } from './screens/MatchesScreen'
import { RankingScreen } from './screens/RankingScreen'
import { isSupabaseConfigured } from './lib/supabase'

// Admin screens
import { AdminLayout } from './screens/admin/AdminLayout'
import { LoginScreen } from './screens/admin/LoginScreen'
import { ManageMatches } from './screens/admin/ManageMatches'
import { ViewPredictions } from './screens/admin/ViewPredictions'
import { MatchWinners } from './screens/admin/MatchWinners'

function PublicApp() {
  const [activeTab, setActiveTab] = useState<"partidos" | "ranking">("partidos")

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 w-full max-w-6xl mx-auto md:px-6 pt-0 md:pt-8 pb-24 md:pb-12">
        {activeTab === "partidos" ? <MatchesScreen /> : <RankingScreen />}
      </main>
    </div>
  )
}

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-background border-x flex flex-col items-center justify-center p-6 text-center shadow-2xl">
        <h2 className="text-xl font-bold text-destructive mb-4">Configuración Pendiente</h2>
        <p className="text-muted-foreground mb-4">
          Falta configurar las variables de entorno de Supabase.
        </p>
        <div className="bg-muted p-4 rounded-lg text-sm text-left">
          <ol className="list-decimal pl-4 space-y-2">
            <li>Renombra el archivo <code>.env.example</code> a <code>.env.local</code></li>
            <li>Completa los valores de <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> con los datos de tu proyecto.</li>
            <li>El servidor se recargará automáticamente.</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicApp />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginScreen />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/matches" replace />} />
          <Route path="matches" element={<ManageMatches />} />
          <Route path="predictions" element={<ViewPredictions />} />
          <Route path="winners" element={<MatchWinners />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
