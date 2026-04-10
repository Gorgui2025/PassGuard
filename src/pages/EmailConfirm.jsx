import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import VaultLogo from '../components/VaultLogo'

const G  = 'linear-gradient(135deg,#22c55e,#15803d)'
const GO = 'linear-gradient(135deg,#22c55e,#d97706)'

export default function EmailConfirm() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(4)
  const [status, setStatus] = useState('checking') // checking | success | error

  useEffect(() => {
    if (loading) return
    if (user) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }, [user, loading])

  /* Compte à rebours + redirection automatique */
  useEffect(() => {
    if (status !== 'success') return
    const interval = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) {
          clearInterval(interval)
          navigate('/app')
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status, navigate])

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg,#f0fdf4,#fefce8)', padding:24 }}>

      <div style={{ background:'white', borderRadius:28, padding:'44px 36px', textAlign:'center',
        maxWidth:400, width:'100%', boxShadow:'0 24px 64px rgba(34,197,94,0.12)' }}>

        {/* Logo */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
          <VaultLogo size={60} gradient={true}/>
        </div>

        <div style={{ fontSize:14, fontWeight:900, background:GO,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          marginBottom:24 }}>PassGuard</div>

        {/* Chargement */}
        {status === 'checking' && (
          <>
            <div style={{ width:48, height:48, borderRadius:'50%',
              border:'4px solid #f0fdf4', borderTopColor:'#22c55e',
              margin:'0 auto 20px', animation:'spin 0.8s linear infinite' }}/>
            <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:8 }}>
              Vérification en cours…
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </>
        )}

        {/* Succès */}
        {status === 'success' && (
          <>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px', border:'3px solid #86efac' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, color:'#0f172a', margin:'0 0 10px' }}>
              Email confirmé !
            </h1>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.75, margin:'0 0 28px' }}>
              Votre adresse email a bien été vérifiée.<br/>
              Bienvenue dans PassGuard.
            </p>

            {/* Barre de progression */}
            <div style={{ height:4, background:'#f1f5f9', borderRadius:999, marginBottom:16, overflow:'hidden' }}>
              <div style={{ height:'100%', background:G, borderRadius:999,
                animation:`progress ${countdown}s linear forwards`,
                width:'100%' }}/>
            </div>
            <style>{`@keyframes progress { from { width:100% } to { width:0% } }`}</style>

            <p style={{ fontSize:12, color:'#94a3b8', marginBottom:24 }}>
              Redirection dans <strong style={{ color:'#16a34a' }}>{countdown}s</strong>…
            </p>

            <button onClick={() => navigate('/app')}
              style={{ width:'100%', padding:'14px', borderRadius:14, border:'none',
                background:G, color:'white', fontWeight:800, fontSize:14,
                cursor:'pointer', boxShadow:'0 8px 24px rgba(34,197,94,0.35)' }}>
              Accéder à mon coffre →
            </button>
          </>
        )}

        {/* Erreur */}
        {status === 'error' && (
          <>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#fef2f2,#fecaca)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px', border:'3px solid #fca5a5' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, color:'#0f172a', margin:'0 0 10px' }}>
              Lien invalide ou expiré
            </h1>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.75, margin:'0 0 28px' }}>
              Ce lien de confirmation n'est plus valide.<br/>
              Essayez de vous connecter directement, ou créez un nouveau compte.
            </p>
            <button onClick={() => navigate('/login')}
              style={{ width:'100%', padding:'14px', borderRadius:14, border:'none',
                background:G, color:'white', fontWeight:800, fontSize:14,
                cursor:'pointer', boxShadow:'0 8px 24px rgba(34,197,94,0.35)',
                marginBottom:10 }}>
              Se connecter
            </button>
            <button onClick={() => navigate('/')}
              style={{ width:'100%', padding:'13px', borderRadius:14,
                border:'1.5px solid #e2e8f0', background:'white', color:'#64748b',
                fontWeight:700, fontSize:14, cursor:'pointer' }}>
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  )
}
