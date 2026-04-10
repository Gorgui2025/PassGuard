import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Key, CreditCard, Mail, Users, Briefcase, ShoppingBag, WifiOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { encrypt, decrypt, passwordStrength } from '../utils/crypto'
import { supabase } from '../supabase'
import GeneratorModal from './GeneratorModal'
import useBreakpoint from '../hooks/useBreakpoint'

const G = 'linear-gradient(135deg,#22c55e,#15803d)'
const O = 'linear-gradient(135deg,#f59e0b,#b45309)'

const CATEGORIES = [
  { id:'banque',   label:'Banque',   icon:CreditCard,  grad:G, shadow:'rgba(34,197,94,0.35)'  },
  { id:'email',    label:'Email',    icon:Mail,        grad:O, shadow:'rgba(217,119,6,0.35)'  },
  { id:'social',   label:'Réseaux',  icon:Users,       grad:O, shadow:'rgba(180,83,9,0.35)'   },
  { id:'travail',  label:'Travail',  icon:Briefcase,   grad:O, shadow:'rgba(217,119,6,0.30)'  },
  { id:'shopping', label:'Shopping', icon:ShoppingBag, grad:G, shadow:'rgba(34,197,94,0.35)'  },
  { id:'autres',   label:'Autres',   icon:Key,         grad:'linear-gradient(135deg,#6b7280,#374151)', shadow:'rgba(0,0,0,0.2)' },
]
const STRENGTH = {
  'Très faible': { bars:1, color:'#ef4444' },
  'Faible':      { bars:2, color:'#f97316' },
  'Moyen':       { bars:3, color:'#eab308' },
  'Fort':        { bars:4, color:'#22c55e' },
  'Très fort':   { bars:5, color:'#16a34a' },
}

export default function AddEditModal({ entry, onClose, onSaved }) {
  const { user, masterPassword } = useAuth()
  const { isMobile } = useBreakpoint()

  const [site, setSite]         = useState(entry?.site || '')
  const [username, setUsername] = useState(entry?.username || '')
  const [password, setPassword] = useState(entry ? decrypt(entry.password_enc, masterPassword) : '')
  const [notes, setNotes]       = useState(entry?.notes || '')
  const [category, setCategory] = useState(entry?.category || 'autres')
  const [showPwd, setShowPwd]   = useState(false)
  const [showGen, setShowGen]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const strength    = password ? passwordStrength(password) : null
  const strengthCfg = strength ? STRENGTH[strength.label] : null

  const handleSave = async (e) => {
    e.preventDefault()
    if (!isOnline)    return setError('Vous êtes hors ligne. Reconnectez-vous pour enregistrer.')
    if (!site.trim()) return setError('Le site / service est obligatoire.')
    if (!password)    return setError('Le mot de passe est obligatoire.')
    setLoading(true); setError('')
    try {
      const payload = {
        site: site.trim(), username: username.trim(),
        password_enc: encrypt(password, masterPassword),
        notes: notes.trim(), category, user_id: user.id,
        updated_at: new Date().toISOString(),
      }
      if (entry) {
        const { error } = await supabase.from('passwords').update(payload).eq('id', entry.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('passwords').insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
      }
      onSaved(); onClose()
    } catch (err) { setError('Erreur : ' + err.message) }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #e2e8f0',
    background:'#ffffff', fontSize:13, color:'#1e293b', outline:'none',
    boxSizing:'border-box', transition:'border-color .2s, box-shadow .2s',
  }
  const onFocus = e => { e.target.style.borderColor='#22c55e'; e.target.style.boxShadow='0 0 0 3px rgba(34,197,94,0.12)' }
  const onBlur  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

  const Label = ({ children }) => (
    <div style={{ fontSize:11, fontWeight:800, color:'#475569', textTransform:'uppercase',
      letterSpacing:1.5, marginBottom:8 }}>{children}</div>
  )

  /* Overlay + card responsive */
  const overlayStyle = {
    position:'fixed', inset:0, zIndex:200,
    display:'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: isMobile ? 'stretch' : 'center',
    padding: isMobile ? 0 : 24,
    background:'rgba(15,23,42,0.55)', backdropFilter:'blur(8px)',
  }
  const cardStyle = {
    background:'white',
    width:'100%',
    maxWidth: isMobile ? '100%' : 460,
    maxHeight: isMobile ? '88vh' : '90vh',
    overflowY:'auto',
    boxShadow:'0 -4px 40px rgba(0,0,0,0.18)',
    borderRadius: isMobile ? '20px 20px 0 0' : 24,
    animation: isMobile ? 'pgSlideUp .28s ease' : 'pgFadeIn .2s ease',
    display:'flex', flexDirection:'column',
    paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 16px)' : 0,
  }

  return (
    <>
      <div onClick={e => e.target === e.currentTarget && onClose()} style={overlayStyle}>
        <div style={cardStyle}>

          {/* Drag handle (mobile) */}
          {isMobile && (
            <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
              <div style={{ width:36, height:4, borderRadius:999, background:'#e2e8f0' }}/>
            </div>
          )}

          {/* Header */}
          <div style={{ padding: isMobile ? '8px 20px 14px' : '22px 24px 14px',
            borderBottom:'1px solid #f0fdf4', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:16, fontWeight:900, color:'#0f172a' }}>
                {entry ? "Modifier l'entrée" : 'Nouvelle entrée'}
              </div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>
                {entry ? 'Mettez à jour les informations' : 'Ajoutez un nouveau mot de passe'}
              </div>
            </div>
            <button onClick={onClose}
              style={{ width:32, height:32, borderRadius:10, border:'none', background:'#f1f5f9',
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                color:'#64748b', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background='#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background='#f1f5f9'}>
              <X size={15}/>
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSave}
            style={{ padding: isMobile ? '16px 20px 28px' : '20px 24px 24px',
              display:'flex', flexDirection:'column', gap:16 }}>

            {/* Bannière hors ligne */}
            {!isOnline && (
              <div style={{ display:'flex', alignItems:'center', gap:10,
                padding:'11px 14px', borderRadius:12,
                background:'linear-gradient(135deg,#fffbeb,#fef3c7)',
                border:'1px solid #fde68a' }}>
                <WifiOff size={14} color="#d97706" style={{ flexShrink:0 }}/>
                <span style={{ fontSize:12, fontWeight:700, color:'#92400e', lineHeight:1.4 }}>
                  Hors ligne — la sauvegarde sera possible dès le retour de la connexion.
                </span>
              </div>
            )}

            {/* Catégorie */}
            <div>
              <Label>Catégorie</Label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {CATEGORIES.map(({ id, label, icon:Icon, grad, shadow }) => {
                  const active = category === id
                  return (
                    <button key={id} type="button" onClick={() => setCategory(id)}
                      style={{ display:'flex', alignItems:'center', gap:6,
                        padding: isMobile ? '8px 12px' : '7px 12px',
                        borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer',
                        border: active ? 'none' : '1.5px solid #e2e8f0',
                        background: active ? grad : '#f8fafc',
                        color: active ? 'white' : '#64748b',
                        boxShadow: active ? `0 4px 12px ${shadow}` : 'none' }}>
                      <Icon size={12}/>{label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Site */}
            <div>
              <Label>Site / Service</Label>
              <input type="text" value={site} onChange={e => setSite(e.target.value)}
                placeholder="ex : Google, Wave, BHS..."
                maxLength={100}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
            </div>

            {/* Identifiant */}
            <div>
              <Label>Identifiant</Label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Email ou nom d'utilisateur"
                maxLength={150}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
            </div>

            {/* Mot de passe */}
            <div>
              <Label>Mot de passe</Label>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ position:'relative', flex:1 }}>
                  <input type={showPwd ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    maxLength={500}
                    style={{ ...inputStyle, fontFamily:'monospace', paddingRight:42 }}
                    onFocus={onFocus} onBlur={onBlur}/>
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex' }}>
                    {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                <button type="button" onClick={() => setShowGen(true)}
                  style={{ width:44, height:44, borderRadius:12, border:'none', background:O,
                    color:'white', cursor:'pointer', display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0,
                    boxShadow:'0 4px 14px rgba(217,119,6,0.40)' }}>
                  <Key size={16} strokeWidth={2.5}/>
                </button>
              </div>

              {/* Barres force */}
              {password && strengthCfg && (
                <div style={{ marginTop:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:10, color:'#64748b', fontWeight:700 }}>Force</span>
                    <span style={{ fontSize:10, fontWeight:900, color:strengthCfg.color }}>{strength.label}</span>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ flex:1, height:5, borderRadius:999, transition:'background .3s',
                        background: n <= strengthCfg.bars ? strengthCfg.color : '#e2e8f0' }}/>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label>Notes <span style={{ fontWeight:400, textTransform:'none', color:'#d1d5db', letterSpacing:0 }}>(optionnel)</span></Label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Informations supplémentaires..." rows={2}
                maxLength={500}
                style={{ ...inputStyle, resize:'none', fontFamily:'inherit' }}
                onFocus={onFocus} onBlur={onBlur}/>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{ display:'flex', gap:10, background:'#fef2f2', border:'1px solid #fecaca',
                borderRadius:12, padding:'12px 14px' }}>
                <span style={{ color:'#ef4444', fontSize:14 }}>⚠</span>
                <p style={{ fontSize:12, color:'#dc2626', margin:0, fontWeight:500 }}>{error}</p>
              </div>
            )}

            {/* Boutons */}
            <div style={{ display:'flex', gap:10, paddingTop:4 }}>
              <button type="button" onClick={onClose}
                style={{ flex:1, padding:'13px', borderRadius:14, border:'1px solid #e2e8f0',
                  background:'#f8fafc', color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Annuler
              </button>
              <button type="submit" disabled={loading || !isOnline}
                style={{ flex:1, padding:'13px', borderRadius:14, border:'none',
                  background: !isOnline ? '#e2e8f0' : G,
                  color: !isOnline ? '#94a3b8' : 'white',
                  fontWeight:700, fontSize:13,
                  cursor: !isOnline ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: !isOnline ? 'none' : '0 4px 18px rgba(34,197,94,0.40)' }}>
                {loading ? 'Sauvegarde…' : !isOnline ? 'Hors ligne' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showGen && (
        <GeneratorModal onClose={() => setShowGen(false)}
          onUse={p => { setPassword(p); setShowGen(false) }}/>
      )}
    </>
  )
}
