import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
import VaultLogo from '../components/VaultLogo'
import {
  Users, Crown, Plus, Trash2, RefreshCw, LogOut,
  CheckCircle2, XCircle, Clock, ArrowLeft, Shield,
  TrendingUp, AlertTriangle, X
} from 'lucide-react'

const ADMIN_EMAIL = 'gorguindoye.2017@gmail.com'

const G  = 'linear-gradient(135deg,#22c55e,#15803d)'
const GO = 'linear-gradient(135deg,#22c55e,#d97706)'
const O  = 'linear-gradient(135deg,#f59e0b,#b45309)'

const PLANS = [
  { id:'pro',      label:'Pro',      color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', price:1500  },
  { id:'famille',  label:'Famille',  color:'#d97706', bg:'#fffbeb', border:'#fde68a', price:3500  },
  { id:'business', label:'Business', color:'#6366f1', bg:'#f5f3ff', border:'#ddd6fe', price:15000 },
]

const DURATIONS = [
  { label:'1 mois',  months:1  },
  { label:'3 mois',  months:3  },
  { label:'6 mois',  months:6  },
  { label:'1 an',    months:12 },
]

function addMonths(months) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
}

function isExpired(iso) {
  if (!iso) return false
  return new Date(iso) < new Date()
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [subs, setSubs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  /* Formulaire */
  const [email, setEmail]       = useState('')
  const [plan, setPlan]         = useState('pro')
  const [duration, setDuration] = useState(1)

  /* ── Sécurité : accès admin uniquement ── */
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) navigate('/')
  }, [user, navigate])

  /* ── Charger les abonnements ── */
  const fetchSubs = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setSubs(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  /* ── Ajouter un abonnement ── */
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Email obligatoire.')
    setSaving(true); setError(''); setSuccess('')
    const { error: err } = await supabase.from('subscriptions').insert({
      user_email: email.trim().toLowerCase(),
      plan,
      active: true,
      expires_at: addMonths(duration),
    })
    if (err) {
      setError('Erreur : ' + err.message)
    } else {
      setSuccess(`Abonnement ${plan} activé pour ${email}`)
      setEmail(''); setPlan('pro'); setDuration(1)
      setShowForm(false)
      fetchSubs()
    }
    setSaving(false)
  }

  /* ── Activer / Désactiver ── */
  const toggleActive = async (sub) => {
    await supabase.from('subscriptions').update({ active: !sub.active }).eq('id', sub.id)
    fetchSubs()
  }

  /* ── Supprimer ── */
  const deleteSub = async (id) => {
    await supabase.from('subscriptions').delete().eq('id', id)
    fetchSubs()
  }

  /* ── Stats ── */
  const active  = subs.filter(s => s.active && !isExpired(s.expires_at))
  const expired = subs.filter(s => isExpired(s.expires_at))
  const revenue = active.reduce((sum, s) => {
    const p = PLANS.find(pl => pl.id === s.plan)
    return sum + (p?.price || 0)
  }, 0)

  const inputStyle = {
    width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #e2e8f0',
    background:'#ffffff', fontSize:13, color:'#1e293b', outline:'none',
    boxSizing:'border-box', transition:'border-color .2s',
  }

  if (user?.email !== ADMIN_EMAIL) return null

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>

      {/* ── Header ── */}
      <header style={{ background:'white', borderBottom:'1px solid #e5f7ec',
        padding:'14px 24px', display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:50,
        boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <VaultLogo size={36} gradient={true}/>
          <div>
            <div style={{ fontSize:16, fontWeight:900, background:GO,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PassGuard</div>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700,
              textTransform:'uppercase', letterSpacing:1 }}>Console Admin</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => {
              const mp = sessionStorage.getItem('mp')
              navigate(mp ? '/app' : '/login', { replace: true })
            }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
              borderRadius:10, border:'1.5px solid #e2e8f0', background:'white',
              color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            <ArrowLeft size={14}/> Dashboard
          </button>
          <button onClick={logout}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
              borderRadius:10, border:'none', background:'#fef2f2',
              color:'#ef4444', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            <LogOut size={14}/> Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── Stats ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
          gap:16, marginBottom:28 }}>
          {[
            { icon:Users,     label:'Total abonnements', value:subs.length,    color:'#6366f1', bg:'#f5f3ff', border:'#ddd6fe' },
            { icon:CheckCircle2, label:'Actifs',          value:active.length,  color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
            { icon:XCircle,   label:'Expirés',            value:expired.length, color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
            { icon:TrendingUp,label:'Revenu mensuel est.',value:`${revenue.toLocaleString()} FCFA`, color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
          ].map(({ icon:Icon, label, value, color, bg, border }) => (
            <div key={label} style={{ background:'white', borderRadius:18, padding:'20px',
              border:`1px solid ${border}`, boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:bg, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={16} color={color}/>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:'#64748b' }}>{label}</span>
              </div>
              <div style={{ fontSize:24, fontWeight:900, color:'#0f172a' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Barre actions ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <h2 style={{ fontSize:18, fontWeight:900, color:'#0f172a', margin:0 }}>
            Abonnements
          </h2>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={fetchSubs}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px',
                borderRadius:10, border:'1.5px solid #e2e8f0', background:'white',
                color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              <RefreshCw size={14}/> Actualiser
            </button>
            <button onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px',
                borderRadius:10, border:'none', background:G, color:'white',
                fontWeight:700, fontSize:13, cursor:'pointer',
                boxShadow:'0 4px 14px rgba(34,197,94,0.30)' }}>
              <Plus size={14}/> Nouvel abonnement
            </button>
          </div>
        </div>

        {/* ── Message succès ── */}
        {success && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
            borderRadius:12, background:'#f0fdf4', border:'1px solid #bbf7d0',
            marginBottom:16 }}>
            <CheckCircle2 size={15} color="#16a34a"/>
            <span style={{ fontSize:13, color:'#15803d', fontWeight:600 }}>{success}</span>
            <button onClick={() => setSuccess('')}
              style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
              <X size={14}/>
            </button>
          </div>
        )}

        {/* ── Formulaire ajout ── */}
        {showForm && (
          <div style={{ background:'white', borderRadius:18, padding:'24px',
            border:'1px solid #e5f7ec', marginBottom:20,
            boxShadow:'0 4px 20px rgba(34,197,94,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:900, color:'#0f172a' }}>
                Activer un abonnement
              </h3>
              <button onClick={() => setShowForm(false)}
                style={{ background:'#f1f5f9', border:'none', borderRadius:8,
                  width:30, height:30, cursor:'pointer', display:'flex',
                  alignItems:'center', justifyContent:'center', color:'#64748b' }}>
                <X size={14}/>
              </button>
            </div>
            <form onSubmit={handleAdd}
              style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, alignItems:'end' }}>

              <div>
                <div style={{ fontSize:11, fontWeight:800, color:'#475569',
                  textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>Email utilisateur</div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ex: user@gmail.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor='#22c55e' }}
                  onBlur={e  => { e.target.style.borderColor='#e2e8f0' }}/>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:800, color:'#475569',
                  textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>Plan</div>
                <select value={plan} onChange={e => setPlan(e.target.value)} style={inputStyle}>
                  {PLANS.map(p => (
                    <option key={p.id} value={p.id}>{p.label} — {p.price.toLocaleString()} FCFA/mois</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:800, color:'#475569',
                  textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>Durée</div>
                <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={inputStyle}>
                  {DURATIONS.map(d => (
                    <option key={d.months} value={d.months}>{d.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={saving}
                style={{ padding:'11px 20px', borderRadius:12, border:'none', background:G,
                  color:'white', fontWeight:700, fontSize:13, cursor:'pointer',
                  opacity:saving ? 0.7 : 1, boxShadow:'0 4px 14px rgba(34,197,94,0.30)',
                  whiteSpace:'nowrap' }}>
                {saving ? 'Activation…' : 'Activer'}
              </button>
            </form>

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12,
                padding:'10px 14px', borderRadius:10, background:'#fef2f2', border:'1px solid #fecaca' }}>
                <AlertTriangle size={14} color="#ef4444"/>
                <span style={{ fontSize:12, color:'#dc2626' }}>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Tableau abonnements ── */}
        <div style={{ background:'white', borderRadius:18, overflow:'hidden',
          border:'1px solid #e5f7ec', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>

          {/* En-tête tableau */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',
            padding:'12px 20px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
            {['Email', 'Plan', 'Statut', 'Expiration', 'Actions'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:800, color:'#94a3b8',
                textTransform:'uppercase', letterSpacing:1.2 }}>{h}</div>
            ))}
          </div>

          {/* Lignes */}
          {loading && (
            <div style={{ padding:'40px', textAlign:'center', color:'#94a3b8', fontSize:13 }}>
              Chargement…
            </div>
          )}

          {!loading && subs.length === 0 && (
            <div style={{ padding:'50px', textAlign:'center' }}>
              <Crown size={40} color="#e2e8f0" style={{ marginBottom:12 }}/>
              <div style={{ fontSize:14, fontWeight:700, color:'#94a3b8' }}>
                Aucun abonnement pour l'instant
              </div>
              <div style={{ fontSize:12, color:'#cbd5e1', marginTop:6 }}>
                Cliquez sur "Nouvel abonnement" pour en ajouter un.
              </div>
            </div>
          )}

          {!loading && subs.map((sub, i) => {
            const planInfo  = PLANS.find(p => p.id === sub.plan)
            const expired   = isExpired(sub.expires_at)
            const isActive  = sub.active && !expired

            return (
              <div key={sub.id}
                style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',
                  padding:'14px 20px', alignItems:'center',
                  borderBottom: i < subs.length - 1 ? '1px solid #f8fafc' : 'none',
                  background: i % 2 === 0 ? 'white' : '#fafafa',
                  transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#f0fdf4'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}>

                {/* Email */}
                <div style={{ fontSize:13, fontWeight:600, color:'#0f172a',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  paddingRight:12 }}>{sub.user_email}</div>

                {/* Plan */}
                <div>
                  <span style={{ fontSize:12, fontWeight:800, padding:'3px 10px',
                    borderRadius:999, background: planInfo?.bg || '#f1f5f9',
                    color: planInfo?.color || '#64748b',
                    border:`1px solid ${planInfo?.border || '#e2e8f0'}` }}>
                    {planInfo?.label || sub.plan}
                  </span>
                </div>

                {/* Statut */}
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%',
                    background: isActive ? '#22c55e' : expired ? '#f97316' : '#ef4444' }}/>
                  <span style={{ fontSize:12, fontWeight:700,
                    color: isActive ? '#16a34a' : expired ? '#ea580c' : '#dc2626' }}>
                    {isActive ? 'Actif' : expired ? 'Expiré' : 'Désactivé'}
                  </span>
                </div>

                {/* Expiration */}
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <Clock size={12} color={expired ? '#f97316' : '#94a3b8'}/>
                  <span style={{ fontSize:12, color: expired ? '#ea580c' : '#64748b', fontWeight:600 }}>
                    {formatDate(sub.expires_at)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => toggleActive(sub)} title={sub.active ? 'Désactiver' : 'Activer'}
                    style={{ width:30, height:30, borderRadius:8, border:'none', cursor:'pointer',
                      background: sub.active ? '#fef2f2' : '#f0fdf4',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {sub.active
                      ? <XCircle size={14} color="#ef4444"/>
                      : <CheckCircle2 size={14} color="#16a34a"/>}
                  </button>
                  <button onClick={() => deleteSub(sub.id)} title="Supprimer"
                    style={{ width:30, height:30, borderRadius:8, border:'none', cursor:'pointer',
                      background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Trash2 size={14} color="#ef4444"/>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Note SQL ── */}
        <div style={{ marginTop:20, padding:'16px 20px', borderRadius:14,
          background:'linear-gradient(135deg,#fffbeb,#fef9ee)', border:'1px solid #fde68a' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
            <Shield size={15} color="#d97706" style={{ flexShrink:0, marginTop:1 }}/>
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:'#92400e', marginBottom:4 }}>
                Table Supabase requise
              </div>
              <div style={{ fontSize:11, color:'#b45309', lineHeight:1.7, fontFamily:'monospace',
                background:'#fef3c7', padding:'8px 12px', borderRadius:8, marginTop:6 }}>
                {`CREATE TABLE subscriptions (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_email TEXT NOT NULL,\n  plan TEXT NOT NULL DEFAULT 'pro',\n  active BOOLEAN DEFAULT true,\n  expires_at TIMESTAMPTZ,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);`}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
