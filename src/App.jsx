import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { supabase } from './supabase'
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import LandingPage    from './pages/LandingPage'
import EmailConfirm   from './pages/EmailConfirm'
import AdminDashboard from './pages/AdminDashboard'
import TeamDashboard  from './pages/TeamDashboard'
import VaultLogo      from './components/VaultLogo'

const G = 'linear-gradient(135deg,#22c55e,#15803d)'

/* ── Écran de chargement ── */
function Spinner() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg,#f0fdf4,#fefce8)' }}>
      <div style={{ textAlign:'center' }}>
        <VaultLogo size={52} gradient={true}/>
        <div style={{ width:36, height:36, borderRadius:'50%', margin:'20px auto 0',
          border:'3px solid #f0fdf4', borderTopColor:'#22c55e',
          animation:'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}

/* ── Écran saisie mot de passe maître ── */
function MasterPasswordGate({ user, onUnlock, onLogout }) {
  const [input, setInput]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input) return setError('Entrez votre mot de passe maître.')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: user.email, password: input
    })
    if (err) { setError('Mot de passe incorrect.'); setLoading(false); return }
    onUnlock(input)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg,#f0fdf4,#fefce8)', padding:24 }}>
      <div style={{ background:'white', borderRadius:24, padding:'40px 32px', textAlign:'center',
        maxWidth:380, width:'100%', boxShadow:'0 24px 64px rgba(34,197,94,0.12)' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <VaultLogo size={56} gradient={true}/>
        </div>
        <div style={{ fontSize:12, color:'#94a3b8', marginBottom:2 }}>Connecté en tant que</div>
        <div style={{ fontSize:13, fontWeight:700, color:'#334155', marginBottom:20 }}>{user.email}</div>
        <h2 style={{ fontSize:19, fontWeight:900, color:'#0f172a', margin:'0 0 8px' }}>
          Mot de passe maître requis
        </h2>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, margin:'0 0 24px' }}>
          Entrez votre mot de passe pour déchiffrer votre coffre.
        </p>
        <form onSubmit={handleSubmit} style={{ textAlign:'left' }}>
          <input type="password" value={input} autoFocus
            onChange={e => { setInput(e.target.value); setError('') }}
            placeholder="Mot de passe maître"
            style={{ width:'100%', padding:'13px 16px', borderRadius:14, boxSizing:'border-box',
              border: error ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
              fontSize:14, color:'#1e293b', outline:'none', background:'#f8fafc',
              marginBottom: error ? 8 : 12 }}/>
          {error && (
            <div style={{ fontSize:12, color:'#dc2626', fontWeight:600, marginBottom:12 }}>
              ⚠ {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'14px', borderRadius:14, border:'none',
              background:G, color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
              opacity: loading ? 0.7 : 1, boxShadow:'0 8px 24px rgba(34,197,94,0.35)',
              marginBottom:10 }}>
            {loading ? 'Vérification…' : 'Ouvrir mon coffre'}
          </button>
          <button type="button" onClick={onLogout}
            style={{ width:'100%', padding:'13px', borderRadius:14,
              border:'1.5px solid #fecaca', background:'white',
              color:'#ef4444', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Route privée : gère loading + masterPassword ── */
function PrivateRoute({ children }) {
  const { user, loading, masterPassword, restoreMasterPassword, logout } = useAuth()

  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/login" replace />

  if (!masterPassword) {
    return (
      <MasterPasswordGate
        user={user}
        onUnlock={(pwd) => restoreMasterPassword(pwd)}
        onLogout={logout}
      />
    )
  }

  return children
}

/* ── Route publique ── */
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return !user ? children : <Navigate to="/app" replace />
}

/* ── Redirection hash Supabase (confirmation email) ── */
function HashRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token') && hash.includes('type=signup')) {
      navigate('/confirm', { replace: true })
    }
  }, [navigate])
  return null
}

function AppRoutes() {
  return (
    <>
      <HashRedirect />
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/reset-password" element={<Login />} />
        <Route path="/confirm"        element={<EmailConfirm />} />
        <Route path="/app"            element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin"          element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/team"           element={<PrivateRoute><TeamDashboard /></PrivateRoute>} />
        <Route path="*"               element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
