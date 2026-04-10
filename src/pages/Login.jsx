import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
import VaultLogo from '../components/VaultLogo'
import { supabase } from '../supabase'

const G  = 'linear-gradient(135deg,#22c55e,#15803d)'
const GO = 'linear-gradient(135deg,#22c55e,#d97706)'

const inputStyle = {
  width:'100%', background:'#f8fafc', border:'1.5px solid #e2e8f0',
  borderRadius:14, padding:'12px 16px', fontSize:14, color:'#1e293b',
  outline:'none', boxSizing:'border-box', transition:'border-color .2s, box-shadow .2s',
}
const onFocus = e => { e.target.style.borderColor='#22c55e'; e.target.style.boxShadow='0 0 0 3px rgba(34,197,94,0.12)' }
const onBlur  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

const Label = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:800, color:'#475569', textTransform:'uppercase',
    letterSpacing:1.5, marginBottom:8 }}>{children}</div>
)

/* ── Vue : formulaire connexion/inscription ── */
function AuthForm({ onForgot }) {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [loading, setLoading]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (isRegister && password !== confirm)
      return setError('Les mots de passe ne correspondent pas.')
    if (password.length < 8)
      return setError('Le mot de passe doit faire au moins 8 caractères.')
    setLoading(true)
    try {
      const result = await (isRegister ? register(email, password) : login(email, password))
      if (isRegister && result?.user && !result?.session) {
        setSuccess('Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse.')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials'))
        setError('Email ou mot de passe incorrect.')
      else if (msg.includes('Email not confirmed'))
        setError('Veuillez confirmer votre email avant de vous connecter.')
      else if (msg.includes('User already registered') || msg.includes('already been registered'))
        setError('Cet email est déjà utilisé. Connectez-vous plutôt.')
      else if (msg.includes('Password should be at least'))
        setError('Le mot de passe doit faire au moins 6 caractères.')
      else if (msg.includes('Unable to validate email') || msg.includes('invalid format'))
        setError('Adresse email invalide.')
      else if (msg.includes('Email rate limit'))
        setError('Trop de tentatives. Attendez quelques minutes.')
      else if (msg.includes('Failed to fetch') || msg.includes('NetworkError'))
        setError('Erreur réseau. Vérifiez votre connexion.')
      else
        setError(msg || 'Une erreur est survenue. Réessayez.')
    }
    setLoading(false)
  }

  return (
    <>
      <h2 style={{ fontSize:18, fontWeight:900, color:'#0f172a', marginBottom:22 }}>
        {isRegister ? 'Créer un compte' : 'Bon retour 👋'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

        <div>
          <Label>Email</Label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com" required
            style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <Label>{isRegister ? 'Mot de passe maître' : 'Mot de passe'}</Label>
            {!isRegister && (
              <button type="button" onClick={onForgot}
                style={{ fontSize:12, fontWeight:700, color:'#d97706', background:'none',
                  border:'none', cursor:'pointer', padding:0 }}>
                Mot de passe oublié ?
              </button>
            )}
          </div>
          <div style={{ position:'relative' }}>
            <input type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères" required
              style={{ ...inputStyle, paddingRight:44 }}
              onFocus={onFocus} onBlur={onBlur}/>
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
              {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        {isRegister && (
          <div>
            <Label>Confirmer</Label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Répétez le mot de passe" required
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
          </div>
        )}

        {isRegister && (
          <div style={{ display:'flex', gap:10, padding:'12px 14px', borderRadius:14,
            background:'linear-gradient(135deg,#fffbeb,#fef9ee)', border:'1px solid #fde68a' }}>
            <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
            <p style={{ fontSize:12, color:'#92400e', lineHeight:1.7, margin:0 }}>
              Ce mot de passe chiffre <strong>toutes</strong> vos données.
              Sans lui, il est impossible de les récupérer. Notez-le précieusement.
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding:'12px 14px', borderRadius:14, background:'#fef2f2',
            border:'1px solid #fecaca', fontSize:13, color:'#dc2626', fontWeight:500 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding:'12px 14px', borderRadius:14, background:'#f0fdf4',
            border:'1px solid #bbf7d0', fontSize:13, color:'#15803d', fontWeight:500 }}>
            {success}
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ padding:'14px', borderRadius:14, border:'none', background:G,
            color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
            opacity: loading ? 0.7 : 1, boxShadow:'0 8px 24px rgba(34,197,94,0.35)',
            marginTop:4 }}>
          {loading ? 'Chargement…' : isRegister ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </form>

      <p style={{ textAlign:'center', fontSize:13, color:'#64748b', marginTop:20 }}>
        {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
        <button onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }}
          style={{ fontWeight:800, color:'#d97706', background:'none', border:'none',
            cursor:'pointer', fontSize:13 }}>
          {isRegister ? 'Se connecter' : "S'inscrire"}
        </button>
      </p>
    </>
  )
}

/* ── Vue : mot de passe oublié ── */
function ForgotForm({ onBack }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('rate limit') || msg.includes('too many'))
        setError('Trop de tentatives. Attendez quelques minutes.')
      else if (msg.includes('Unable to validate') || msg.includes('invalid'))
        setError('Adresse email invalide.')
      else
        setError('Une erreur est survenue. Réessayez.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div style={{ textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Mail size={28} color="#16a34a" strokeWidth={1.5}/>
        </div>
        <h2 style={{ fontSize:18, fontWeight:900, color:'#0f172a', marginBottom:10 }}>Email envoyé !</h2>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.75, marginBottom:24 }}>
          Un lien de réinitialisation a été envoyé à <strong style={{ color:'#0f172a' }}>{email}</strong>.
          Vérifiez votre boîte mail (et vos spams).
        </p>
        <div style={{ padding:'12px 14px', borderRadius:14, background:'#fffbeb',
          border:'1px solid #fde68a', fontSize:12, color:'#92400e', marginBottom:24, textAlign:'left' }}>
          ⚠️ <strong>Rappel :</strong> Le nouveau mot de passe que vous choisirez deviendra
          votre mot de passe maître. Vos anciennes données chiffrées seront inaccessibles
          si vous le changez.
        </div>
        <button onClick={onBack}
          style={{ width:'100%', padding:'13px', borderRadius:14, border:'1.5px solid #e2e8f0',
            background:'#f8fafc', color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          Retour à la connexion
        </button>
      </div>
    )
  }

  return (
    <>
      <button onClick={onBack}
        style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
          cursor:'pointer', color:'#64748b', fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
        <ArrowLeft size={14}/> Retour
      </button>

      <h2 style={{ fontSize:18, fontWeight:900, color:'#0f172a', marginBottom:8 }}>
        Mot de passe oublié
      </h2>
      <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:22 }}>
        Entrez votre email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <Label>Email</Label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com" required
            style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
        </div>

        {error && (
          <div style={{ padding:'12px 14px', borderRadius:14, background:'#fef2f2',
            border:'1px solid #fecaca', fontSize:13, color:'#dc2626', fontWeight:500 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ padding:'14px', borderRadius:14, border:'none', background:G,
            color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
            opacity: loading ? 0.7 : 1, boxShadow:'0 8px 24px rgba(34,197,94,0.35)' }}>
          {loading ? 'Envoi…' : 'Envoyer le lien'}
        </button>
      </form>
    </>
  )
}

/* ── Vue : réinitialisation du mot de passe ── */
function ResetForm() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas.')
    if (password.length < 8)  return setError('Le mot de passe doit faire au moins 8 caractères.')
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <h2 style={{ fontSize:18, fontWeight:900, color:'#0f172a', marginBottom:10 }}>Mot de passe mis à jour !</h2>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7 }}>
          Redirection vers la connexion dans quelques secondes…
        </p>
      </div>
    )
  }

  return (
    <>
      <h2 style={{ fontSize:18, fontWeight:900, color:'#0f172a', marginBottom:8 }}>
        Nouveau mot de passe
      </h2>
      <div style={{ padding:'12px 14px', borderRadius:14, background:'#fffbeb',
        border:'1px solid #fde68a', fontSize:12, color:'#92400e', marginBottom:20 }}>
        ⚠️ Ce nouveau mot de passe deviendra votre mot de passe maître. Vos données
        existantes chiffrées avec l'ancien mot de passe seront <strong>inaccessibles</strong>.
      </div>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <Label>Nouveau mot de passe</Label>
          <div style={{ position:'relative' }}>
            <input type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères" required
              style={{ ...inputStyle, paddingRight:44 }}
              onFocus={onFocus} onBlur={onBlur}/>
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
              {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>
        <div>
          <Label>Confirmer</Label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe" required
            style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
        </div>
        {error && (
          <div style={{ padding:'12px 14px', borderRadius:14, background:'#fef2f2',
            border:'1px solid #fecaca', fontSize:13, color:'#dc2626', fontWeight:500 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading}
          style={{ padding:'14px', borderRadius:14, border:'none', background:G,
            color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
            opacity: loading ? 0.7 : 1, boxShadow:'0 8px 24px rgba(34,197,94,0.35)' }}>
          {loading ? 'Mise à jour…' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </>
  )
}

/* ── Composant principal ── */
export default function Login() {
  const navigate  = useNavigate()
  const isReset   = window.location.pathname === '/reset-password'
  const [view, setView] = useState(isReset ? 'reset' : 'auth') // 'auth' | 'forgot' | 'reset'

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:20, position:'relative', overflow:'hidden',
      background:'linear-gradient(145deg,#f0fdf4 0%,#fef9ee 50%,#fef3c7 100%)' }}>

      {/* Décors */}
      <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(34,197,94,0.12),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-60, right:-60, width:260, height:260, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(217,119,6,0.10),transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:380, position:'relative', zIndex:1 }}>

        {/* Logo + retour accueil */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
            <VaultLogo size={64} gradient={true}/>
          </div>
          <h1 style={{ fontSize:24, fontWeight:900, background:GO,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PassGuard</h1>
          <p style={{ fontSize:13, color:'#64748b', marginTop:4 }}>Vos mots de passe, en sécurité</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.90)', backdropFilter:'blur(16px)',
          borderRadius:24, padding:'28px', border:'1px solid rgba(255,255,255,0.8)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.08)' }}>

          {view === 'auth'   && <AuthForm  onForgot={() => setView('forgot')}/>}
          {view === 'forgot' && <ForgotForm onBack={() => setView('auth')}/>}
          {view === 'reset'  && <ResetForm/>}
        </div>

        {/* Lien retour landing */}
        <div style={{ textAlign:'center', marginTop:20 }}>
          <button onClick={() => navigate('/')}
            style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'none',
              cursor:'pointer', color:'#94a3b8', fontSize:13, fontWeight:600 }}>
            <ArrowLeft size={13}/> Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
