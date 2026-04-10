import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { decrypt } from '../utils/crypto'
import useBreakpoint from '../hooks/useBreakpoint'
import {
  Plus, Search, LogOut,
  Copy, Pencil, Trash2, Eye, EyeOff,
  Key, CreditCard, Mail, Users, Briefcase, ShoppingBag, LayoutGrid,
  Settings, Activity, Wrench, Lock, Lightbulb, CheckCheck, Zap,
  ArrowDownAZ, ArrowUpAZ, Clock, Shield, AlertTriangle, X as XIcon,
  ArrowLeft,
} from 'lucide-react'
import AddEditModal   from '../components/AddEditModal'
import VaultLogo      from '../components/VaultLogo'
import GeneratorModal from '../components/GeneratorModal'
import Toast          from '../components/Toast'
import ConfirmModal   from '../components/ConfirmModal'
import UpgradeModal   from '../components/UpgradeModal'
import ExportImport   from '../components/ExportImport'

const FREE_LIMIT = 10

const G  = 'linear-gradient(135deg,#22c55e,#15803d)'
const O  = 'linear-gradient(135deg,#f59e0b,#b45309)'
const GO = 'linear-gradient(135deg,#22c55e,#d97706)'

const CATS = [
  { id:'all',      label:'Tout',     icon:LayoutGrid,  color:'#64748b', active:G  },
  { id:'banque',   label:'Banques',  icon:CreditCard,  color:'#16a34a', active:G  },
  { id:'email',    label:'Emails',   icon:Mail,        color:'#d97706', active:O  },
  { id:'social',   label:'Réseaux',  icon:Users,       color:'#b45309', active:O  },
  { id:'travail',  label:'Travail',  icon:Briefcase,   color:'#d97706', active:O  },
  { id:'shopping', label:'Shopping', icon:ShoppingBag, color:'#16a34a', active:G  },
  { id:'autres',   label:'Autres',   icon:Key,         color:'#64748b', active:'linear-gradient(135deg,#6b7280,#374151)' },
]
const BOTTOM_NAV = [
  { id:'passwords', label:'Coffre',     icon:Lock     },
  { id:'tools',     label:'Outils',     icon:Wrench   },
  { id:'activity',  label:'Activité',   icon:Activity },
  { id:'settings',  label:'Paramètres', icon:Settings },
]
const CS = {
  banque:   { border:'#16a34a', grad:'linear-gradient(135deg,#4ade80,#16a34a)' },
  email:    { border:'#d97706', grad:'linear-gradient(135deg,#fbbf24,#d97706)' },
  social:   { border:'#b45309', grad:'linear-gradient(135deg,#f59e0b,#92400e)' },
  travail:  { border:'#f59e0b', grad:'linear-gradient(135deg,#fcd34d,#d97706)' },
  shopping: { border:'#22c55e', grad:'linear-gradient(135deg,#86efac,#22c55e)' },
  autres:   { border:'#9ca3af', grad:'linear-gradient(135deg,#d1d5db,#6b7280)' },
}
const TIPS = [
  "Utilisez un mot de passe unique pour chaque compte.",
  "Activez la double authentification (2FA) sur vos comptes importants.",
  "Ne partagez jamais votre mot de passe maître.",
  "Changez vos mots de passe tous les 3 à 6 mois.",
]

const ADMIN_EMAIL = 'gorguindoye.2017@gmail.com'

export default function Dashboard() {
  const { user, logout, masterPassword } = useAuth()
  const { isCompact, isMobile, isTablet } = useBreakpoint()
  const navigate = useNavigate()


  const [passwords, setPasswords]       = useState([])
  const [loadingPw, setLoadingPw]       = useState(true)
  const [search, setSearch]             = useState('')
  const [showSearch, setShowSearch]     = useState(false)
  const [cat, setCat]                   = useState('all')
  const [tab, setTab]                   = useState('passwords')
  const [sort, setSort]                 = useState('recent')
  const [showModal, setShowModal]       = useState(false)
  const [editEntry, setEditEntry]       = useState(null)
  const [showGen, setShowGen]           = useState(false)
  const [revealedId, setRevealedId]     = useState(null)
  const [copiedId, setCopiedId]         = useState(null)
  const [toasts, setToasts]             = useState([])
  const [confirmEntry, setConfirmEntry] = useState(null)
  const [showUpgrade, setShowUpgrade]   = useState(false)
  const [locked, setLocked]             = useState(false)
  const [online, setOnline]             = useState(navigator.onLine)
  const toastCounter                    = useRef(0)
  const clipboardTimer                  = useRef(null)
  const lockTimer                       = useRef(null)
  const editEntryRef                    = useRef(null)

  const tip      = TIPS[new Date().getDay() % TIPS.length]
  const initials = (user.email?.split('@')[0] || '').slice(0,2).toUpperCase()

  /* ── CSS animations ── */
  useEffect(() => {
    if (document.getElementById('pg-animations')) return
    const s = document.createElement('style')
    s.id = 'pg-animations'
    s.textContent = `
      @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      @keyframes pgSlideIn { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
      @keyframes pgFadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pgSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      ::-webkit-scrollbar { width:4px; height:4px }
      ::-webkit-scrollbar-track { background:transparent }
      ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:999px }
      .pg-hidescroll::-webkit-scrollbar { display:none }
    `
    document.head.appendChild(s)
  }, [])

  /* ── Raccourcis clavier ── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { setShowModal(false); setShowGen(false); setConfirmEntry(null); setShowSearch(false) }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openAdd() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  /* ── Toasts ── */
  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastCounter.current
    setToasts(prev => [...prev, { id, message, type }])
  }, [])
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  /* ── Données ── */
  const fetchPw = useCallback(async () => {
    const { data } = await supabase.from('passwords').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) {
      const prev = passwords.length
      setPasswords(data)
      /* Toast d'alerte à 8/10 (seulement quand on vient d'ajouter une entrée) */
      if (data.length === FREE_LIMIT - 2 && prev < FREE_LIMIT - 2) {
        addToast(`Attention — il ne vous reste que 2 entrées disponibles. Passez au plan Pro pour un coffre illimité.`, 'info')
      }
    }
    setLoadingPw(false)
  }, [user, passwords.length, addToast])

  useEffect(() => {
    fetchPw()
    const ch = supabase.channel('pw')
      .on('postgres_changes', { event:'*', schema:'public', table:'passwords',
        filter:`user_id=eq.${user.id}` }, fetchPw)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchPw, user])

  const handleSaved = useCallback(() => {
    fetchPw()
    addToast(editEntryRef.current ? 'Entrée modifiée ✓' : 'Entrée ajoutée ✓')
  }, [fetchPw, addToast])

  /* ── Détection online / offline ── */
  useEffect(() => {
    const goOnline  = () => { setOnline(true);  fetchPw(); addToast('Connexion rétablie — données synchronisées ✓', 'success') }
    const goOffline = () => { setOnline(false); addToast('Hors ligne — données en cache affichées', 'info') }
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [fetchPw, addToast])

  const openAdd  = () => {
    if (passwords.length >= FREE_LIMIT) { setShowUpgrade(true); return }
    editEntryRef.current = null; setEditEntry(null); setShowModal(true)
  }
  const openEdit = (e) => { editEntryRef.current = e; setEditEntry(e); setShowModal(true) }

  /* ── Filtres ── */
  const filtered = passwords.filter(p =>
    (cat === 'all' || p.category === cat) &&
    (!search || p.site?.toLowerCase().includes(search.toLowerCase())
             || p.username?.toLowerCase().includes(search.toLowerCase()))
  )
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'az') return (a.site||'').localeCompare(b.site||'')
    if (sort === 'za') return (b.site||'').localeCompare(a.site||'')
    return 0
  })

  /* ── Vidage presse-papier après 30s ── */
  const doCopy = (entry) => {
    navigator.clipboard.writeText(decrypt(entry.password_enc, masterPassword))
    setCopiedId(entry.id)
    setTimeout(() => setCopiedId(null), 2000)
    addToast('Mot de passe copié ! Effacé dans 30s')
    clearTimeout(clipboardTimer.current)
    clipboardTimer.current = setTimeout(() => {
      navigator.clipboard.writeText('').catch(() => {})
      addToast('Presse-papier vidé automatiquement', 'info')
    }, 30000)
  }

  /* ── Auto-verrouillage après 5min d'inactivité ── */
  useEffect(() => {
    const reset = () => {
      clearTimeout(lockTimer.current)
      lockTimer.current = setTimeout(() => setLocked(true), 5 * 60 * 1000)
    }
    const events = ['mousemove','keydown','touchstart','click','scroll']
    events.forEach(ev => window.addEventListener(ev, reset))
    reset()
    return () => {
      events.forEach(ev => window.removeEventListener(ev, reset))
      clearTimeout(lockTimer.current)
      clearTimeout(clipboardTimer.current)
    }
  }, [])
  const doDelete = async () => {
    if (!confirmEntry) return
    const name = confirmEntry.site
    await supabase.from('passwords').delete().eq('id', confirmEntry.id)
    setConfirmEntry(null); fetchPw()
    addToast(`"${name}" supprimé`, 'info')
  }

  /* ══════════════════════════════════════
     COMPOSANTS INTERNES
  ══════════════════════════════════════ */

  /* ── Sidebar desktop ── */
  const Sidebar = () => (
    <aside style={{ width: isTablet ? 72 : 240, minWidth: isTablet ? 72 : 240,
      background:'white', borderRight:'1px solid #e5f7ec',
      display:'flex', flexDirection:'column', height:'100vh', flexShrink:0, overflowY:'auto',
      transition:'width .2s' }}>

      {/* Logo */}
      <div style={{ padding: isTablet ? '20px 0' : '24px 20px 16px',
        borderBottom:'1px solid #f0fdf4', display:'flex', justifyContent: isTablet ? 'center' : 'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap: isTablet ? 0 : 10 }}>
          <VaultLogo size={isTablet ? 36 : 38} gradient={true}/>
          {!isTablet && (
            <div>
              <div style={{ fontSize:16, fontWeight:900, background:GO,
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PassGuard</div>
              <div style={{ fontSize:10, color:'#94a3b8', marginTop:1 }}>Gestionnaire sécurisé</div>
            </div>
          )}
        </div>
      </div>

      {/* Retour landing */}
      <div style={{ padding: isTablet ? '8px 6px' : '8px 12px' }}>
        <button onClick={() => navigate('/')} title="Retour à l'accueil"
          style={{ width:'100%', display:'flex', alignItems:'center',
            justifyContent: isTablet ? 'center' : 'flex-start',
            gap:7, padding: isTablet ? '8px 0' : '8px 10px',
            borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc',
            color:'#64748b', fontWeight:600, fontSize:12, cursor:'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#22c55e'; e.currentTarget.style.color='#16a34a' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#64748b' }}>
          <ArrowLeft size={13}/>
          {!isTablet && 'Page d\'accueil'}
        </button>
      </div>

      {/* Stats (desktop only) */}
      {!isTablet && (
        <div style={{ margin:'16px 16px 8px', padding:'14px 16px', borderRadius:16,
          background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1px solid #bbf7d0' }}>
          <div style={{ fontSize:10, color:'#16a34a', fontWeight:800, textTransform:'uppercase', letterSpacing:1 }}>Total</div>
          <div style={{ fontSize:28, fontWeight:900, color:'#15803d', marginTop:2 }}>
            {loadingPw
              ? <div style={{ width:40, height:28, borderRadius:6, background:'linear-gradient(90deg,#f0fdf4 25%,#dcfce7 50%,#f0fdf4 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
              : <>{passwords.length}<span style={{ fontSize:13, fontWeight:600, color:'#86efac', marginLeft:6 }}>entrées</span></>
            }
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ padding: isTablet ? '8px 6px' : '8px 10px', flex:1 }}>
        {!isTablet && (
          <div style={{ fontSize:9, fontWeight:900, color:'#cbd5e1', textTransform:'uppercase',
            letterSpacing:2, padding:'4px 10px 8px' }}>Navigation</div>
        )}
        {[
          { id:'passwords', label:'Mots de passe', icon:Lock     },
          { id:'tools',     label:'Outils',        icon:Wrench   },
          { id:'activity',  label:'Activité',      icon:Activity },
          { id:'settings',  label:'Paramètres',    icon:Settings },
        ].map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={() => setTab(id)} title={isTablet ? label : ''}
            style={{ width:'100%', display:'flex', alignItems:'center',
              justifyContent: isTablet ? 'center' : 'flex-start',
              gap: isTablet ? 0 : 10, padding: isTablet ? '12px 0' : '10px 12px',
              borderRadius:12, border:'none', cursor:'pointer', marginBottom:2,
              textAlign:'left', fontWeight:700, fontSize:13,
              background: tab === id ? G : 'transparent',
              color:      tab === id ? 'white' : '#64748b',
              boxShadow:  tab === id ? '0 4px 12px rgba(34,197,94,0.25)' : 'none' }}>
            <Icon size={isTablet ? 20 : 16} strokeWidth={tab === id ? 2.5 : 1.8}/>
            {!isTablet && label}
          </button>
        ))}

        {/* Catégories (desktop only) */}
        {!isTablet && tab === 'passwords' && (
          <>
            <div style={{ fontSize:9, fontWeight:900, color:'#cbd5e1', textTransform:'uppercase',
              letterSpacing:2, padding:'16px 10px 8px' }}>Catégories</div>
            {CATS.map(({ id, label, icon:Icon, color, active }) => {
              const isActive = cat === id
              const count = id === 'all' ? passwords.length : passwords.filter(p => p.category === id).length
              return (
                <button key={id} onClick={() => setCat(id)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                    borderRadius:12, border:'none', cursor:'pointer', marginBottom:2,
                    textAlign:'left', fontSize:13, fontWeight:600,
                    background: isActive ? active : 'transparent',
                    color:      isActive ? 'white' : '#64748b' }}>
                  <Icon size={14} style={{ color: isActive ? 'white' : color }}/>
                  <span style={{ flex:1 }}>{label}</span>
                  <span style={{ fontSize:11, fontWeight:800, padding:'1px 7px', borderRadius:999,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color:      isActive ? 'white' : '#94a3b8' }}>{count}</span>
                </button>
              )
            })}
          </>
        )}
      </div>

      {/* Lien Mon équipe */}
      <div style={{ padding: isTablet ? '4px 6px' : '4px 10px' }}>
        <button onClick={() => navigate('/team')} title="Mon équipe"
          style={{ width:'100%', display:'flex', alignItems:'center',
            justifyContent: isTablet ? 'center' : 'flex-start',
            gap:7, padding: isTablet ? '8px 0' : '8px 10px',
            borderRadius:10, border:'1.5px solid #ddd6fe', background:'#f5f3ff',
            color:'#6366f1', fontWeight:700, fontSize:12, cursor:'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background='#ede9fe'; e.currentTarget.style.borderColor='#6366f1' }}
          onMouseLeave={e => { e.currentTarget.style.background='#f5f3ff'; e.currentTarget.style.borderColor='#ddd6fe' }}>
          <Users size={13}/>
          {!isTablet && 'Mon équipe'}
        </button>
      </div>

      {/* Lien admin (uniquement pour l'administrateur) */}
      {user?.email === ADMIN_EMAIL && (
        <div style={{ padding: isTablet ? '4px 6px' : '4px 10px' }}>
          <button onClick={() => navigate('/admin')} title="Console Admin"
            style={{ width:'100%', display:'flex', alignItems:'center',
              justifyContent: isTablet ? 'center' : 'flex-start',
              gap:7, padding: isTablet ? '8px 0' : '8px 10px',
              borderRadius:10, border:'1.5px solid #ddd6fe', background:'#f5f3ff',
              color:'#6366f1', fontWeight:700, fontSize:12, cursor:'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background='#ede9fe'; e.currentTarget.style.borderColor='#6366f1' }}
            onMouseLeave={e => { e.currentTarget.style.background='#f5f3ff'; e.currentTarget.style.borderColor='#ddd6fe' }}>
            <Shield size={13}/>
            {!isTablet && 'Console Admin'}
          </button>
        </div>
      )}

      {/* Badge AES-256 + statut sync */}
      {!isTablet && (
        <>
          <div style={{ margin:'0 12px 4px', padding:'10px 14px', borderRadius:12,
            background:'linear-gradient(135deg,#f0fdf4,#fef9ee)', border:'1px solid #bbf7d0',
            display:'flex', alignItems:'center', gap:8 }}>
            <Shield size={14} color="#16a34a"/>
            <span style={{ fontSize:11, fontWeight:700, color:'#16a34a' }}>Chiffrement AES-256</span>
          </div>
          <div style={{ margin:'0 12px 10px', padding:'8px 14px', borderRadius:12,
            background: online ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${online ? '#bbf7d0' : '#fecaca'}`,
            display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', flexShrink:0,
              background: online ? '#22c55e' : '#ef4444',
              boxShadow: online ? '0 0 0 2px rgba(34,197,94,0.25)' : '0 0 0 2px rgba(239,68,68,0.25)' }}/>
            <span style={{ fontSize:11, fontWeight:700, color: online ? '#16a34a' : '#dc2626' }}>
              {online ? 'Synchronisé' : 'Hors ligne'}
            </span>
          </div>

          {/* ── Barre de progression entrées ── */}
          {(() => {
            const count   = passwords.length
            const pct     = Math.min((count / FREE_LIMIT) * 100, 100)
            const isFull  = count >= FREE_LIMIT
            const isWarn  = count >= FREE_LIMIT - 2 && !isFull
            const barColor = isFull ? '#ef4444' : isWarn ? '#f59e0b' : '#22c55e'
            return (
              <div style={{ margin:'0 12px 10px', padding:'12px 14px', borderRadius:12,
                background: isFull ? '#fef2f2' : isWarn ? '#fffbeb' : '#f8fafc',
                border: `1px solid ${isFull ? '#fecaca' : isWarn ? '#fde68a' : '#e2e8f0'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:'#475569' }}>Entrées</span>
                  <span style={{ fontSize:11, fontWeight:900,
                    color: isFull ? '#dc2626' : isWarn ? '#d97706' : '#334155' }}>
                    {count} / {FREE_LIMIT}
                  </span>
                </div>
                <div style={{ height:6, borderRadius:999, background:'#e2e8f0', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:999, transition:'width .4s ease',
                    width:`${pct}%`, background: barColor }}/>
                </div>
                {isFull && (
                  <div style={{ fontSize:10, color:'#dc2626', fontWeight:700, marginTop:5 }}>
                    Limite atteinte — passez au Pro
                  </div>
                )}
                {isWarn && (
                  <div style={{ fontSize:10, color:'#d97706', fontWeight:700, marginTop:5 }}>
                    Plus que {FREE_LIMIT - count} entrée{FREE_LIMIT - count > 1 ? 's' : ''} disponible{FREE_LIMIT - count > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )
          })()}
        </>
      )}

      {/* Utilisateur */}
      <div style={{ padding: isTablet ? '8px 6px' : '12px', borderTop:'1px solid #f0fdf4' }}>
        {!isTablet && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderRadius:12, background:'#f8fafc', marginBottom:6 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:GO, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:11 }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div title={user.email} style={{ fontSize:11, fontWeight:700, color:'#334155',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
              <div style={{ fontSize:10, color:'#94a3b8' }}>Compte gratuit</div>
            </div>
          </div>
        )}
        <button onClick={logout} title="Déconnexion"
          style={{ width:'100%', display:'flex', alignItems:'center',
            justifyContent: isTablet ? 'center' : 'flex-start',
            gap:8, padding: isTablet ? '10px 0' : '8px 12px',
            borderRadius:12, border:'none', cursor:'pointer', background:'transparent', color:'#ef4444', fontWeight:700, fontSize:13 }}
          onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <LogOut size={isTablet ? 20 : 15}/>
          {!isTablet && 'Déconnexion'}
        </button>
      </div>
    </aside>
  )

  /* ── Header mobile ── */
  const MobileHeader = () => (
    <header style={{ background:'rgba(255,255,255,0.97)', backdropFilter:'blur(12px)',
      borderBottom:'1px solid #e5f7ec', position:'sticky', top:0, zIndex:20 }}>
      {/* Ligne 1 : logo + actions */}
      <div style={{ display:'flex', alignItems:'center', padding:'12px 16px 8px', gap:10 }}>
        <button onClick={() => navigate('/')}
          style={{ width:32, height:32, borderRadius:9, border:'1.5px solid #e2e8f0',
            background:'#f8fafc', cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', color:'#64748b', flexShrink:0 }}>
          <ArrowLeft size={14}/>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
          <VaultLogo size={32} gradient={true}/>
          <span style={{ fontSize:15, fontWeight:900, background:GO,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PassGuard</span>
        </div>
        <button onClick={() => setShowSearch(s => !s)}
          style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0',
            background: showSearch ? '#f0fdf4' : 'white', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            color: showSearch ? '#16a34a' : '#64748b' }}>
          {showSearch ? <XIcon size={15}/> : <Search size={15}/>}
        </button>
        <button onClick={openAdd}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
            borderRadius:10, border:'none', background:G, color:'white',
            cursor:'pointer', fontSize:13, fontWeight:700,
            boxShadow:'0 3px 10px rgba(34,197,94,0.35)' }}>
          <Plus size={14} strokeWidth={2.5}/> Ajouter
        </button>
      </div>
      {/* Barre de recherche expansible */}
      {showSearch && (
        <div style={{ padding:'0 16px 12px', animation:'pgFadeIn .15s ease' }}>
          <div style={{ position:'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>
            <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{ width:'100%', padding:'10px 12px 10px 34px', borderRadius:12,
                border:'1.5px solid #22c55e', background:'#f8fafc', fontSize:13,
                outline:'none', boxSizing:'border-box',
                boxShadow:'0 0 0 3px rgba(34,197,94,0.12)' }}/>
          </div>
        </div>
      )}
    </header>
  )

  /* ── Pills catégories (mobile/tablette) ── */
  const CategoryPills = () => (
    <div className="pg-hidescroll" style={{ display:'flex', gap:8, padding:'12px 16px',
      overflowX:'auto', background:'white', borderBottom:'1px solid #f1f5f9', flexShrink:0 }}>
      {CATS.map(({ id, label, icon:Icon, color, active }) => {
        const isActive = cat === id
        const count = id === 'all' ? passwords.length : passwords.filter(p => p.category === id).length
        return (
          <button key={id} onClick={() => setCat(id)}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px 6px 10px',
              borderRadius:999, border:'none', cursor:'pointer', whiteSpace:'nowrap',
              flexShrink:0, fontSize:12, fontWeight:700,
              background: isActive ? active : '#f1f5f9',
              color:      isActive ? 'white' : '#64748b',
              boxShadow:  isActive ? '0 2px 8px rgba(34,197,94,0.25)' : 'none' }}>
            <Icon size={12} style={{ color: isActive ? 'white' : color }}/>
            {label}
            <span style={{ marginLeft:3, fontSize:10, fontWeight:800, padding:'0 5px', borderRadius:999,
              background: isActive ? 'rgba(255,255,255,0.28)' : '#e2e8f0',
              color:      isActive ? 'white' : '#94a3b8' }}>{count}</span>
          </button>
        )
      })}
    </div>
  )

  /* ── Bottom nav (mobile) ── */
  const BottomNav = () => (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'white',
      borderTop:'1px solid #e5f7ec', display:'flex', zIndex:100,
      paddingBottom:'env(safe-area-inset-bottom, 0px)',
      boxShadow:'0 -4px 20px rgba(0,0,0,0.06)' }}>
      {BOTTOM_NAV.map(({ id, label, icon:Icon }) => (
        <button key={id} onClick={() => setTab(id)}
          style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            gap:3, padding:'10px 0 8px', border:'none', background:'transparent', cursor:'pointer',
            color: tab === id ? '#15803d' : '#94a3b8', transition:'color .15s' }}>
          <div style={{ width:36, height:28, display:'flex', alignItems:'center', justifyContent:'center',
            borderRadius:8, background: tab === id ? '#f0fdf4' : 'transparent',
            transition:'background .15s' }}>
            <Icon size={20} strokeWidth={tab === id ? 2.5 : 1.8}/>
          </div>
          <span style={{ fontSize:10, fontWeight: tab === id ? 800 : 600 }}>{label}</span>
        </button>
      ))}
    </nav>
  )

  /* ── Skeleton card ── */
  const SkeletonCard = () => (
    <div style={{ background:'white', borderRadius:16, padding:'14px 16px', display:'flex',
      alignItems:'center', gap:14, borderLeft:'4px solid #e2e8f0',
      boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ width:46, height:46, borderRadius:14, flexShrink:0,
        background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
        backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
      <div style={{ flex:1 }}>
        <div style={{ height:13, width:'55%', borderRadius:6, marginBottom:9,
          background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
          backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
        <div style={{ height:10, width:'35%', borderRadius:6,
          background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
          backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {[1,2,3,4].map(n => (
          <div key={n} style={{ width:28, height:28, borderRadius:8,
            background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
            backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
        ))}
      </div>
    </div>
  )

  /* ══════════════════════════════════════
     CONTENU PRINCIPAL (partagé)
  ══════════════════════════════════════ */
  const MainContent = () => (
    <main style={{ flex:1, overflowY:'auto', paddingBottom: isCompact ? 100 : 28 }}>
    <div style={{ maxWidth: isCompact ? '100%' : 860, margin:'0 auto',
      padding: isCompact ? '16px' : '28px 32px' }}>

      {/* ── Bannière hors ligne ── */}
      {!online && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
          borderRadius:14, background:'linear-gradient(135deg,#fef2f2,#fff1f1)',
          border:'1px solid #fecaca', marginBottom:16, animation:'pgFadeIn .2s ease' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#dc2626' }}>Hors ligne </span>
            <span style={{ fontSize:12, color:'#f87171' }}>— vos données sont affichées depuis le cache. Les modifications seront synchronisées au retour de la connexion.</span>
          </div>
        </div>
      )}

      {/* ── Bannière approche limite (8-9/10) ── */}
      {passwords.length >= FREE_LIMIT - 2 && passwords.length < FREE_LIMIT && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
          borderRadius:14, background:'linear-gradient(135deg,#fffbeb,#fef3c7)',
          border:'1.5px solid #fde68a', marginBottom:16, animation:'pgFadeIn .2s ease' }}>
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:800, color:'#92400e' }}>
              Plus que {FREE_LIMIT - passwords.length} entrée{FREE_LIMIT - passwords.length > 1 ? 's' : ''} disponible{FREE_LIMIT - passwords.length > 1 ? 's' : ''} !{' '}
            </span>
            <span style={{ fontSize:12, color:'#b45309' }}>
              Passez au plan Pro pour un coffre illimité.
            </span>
          </div>
          <button onClick={() => setShowUpgrade(true)}
            style={{ padding:'7px 14px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#f59e0b,#d97706)',
              color:'white', fontWeight:800, fontSize:12, cursor:'pointer',
              whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(217,119,6,0.35)' }}>
            Passer Pro
          </button>
        </div>
      )}

      {/* ── Bannière limite atteinte (10/10) ── */}
      {passwords.length >= FREE_LIMIT && (
        <div style={{ borderRadius:16, overflow:'hidden', marginBottom:20,
          boxShadow:'0 4px 20px rgba(239,68,68,0.15)', animation:'pgFadeIn .2s ease' }}>
          <div style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)',
            padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <Lock size={18} color="white" style={{ flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:900, color:'white' }}>
                Limite de {FREE_LIMIT} entrées atteinte
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.85)', marginTop:2 }}>
                Vous ne pouvez plus ajouter de mots de passe sur le plan gratuit.
              </div>
            </div>
          </div>
          <div style={{ background:'white', padding:'16px 20px',
            border:'1.5px solid #fecaca', borderTop:'none' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
              {[
                { icon:'∞', label:'Entrées illimitées' },
                { icon:'📱', label:'Multi-appareils' },
                { icon:'📤', label:'Export sécurisé' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ textAlign:'center', padding:'10px 8px',
                  borderRadius:12, background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#15803d' }}>{label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowUpgrade(true)}
              style={{ width:'100%', padding:'13px', borderRadius:12, border:'none',
                background:'linear-gradient(135deg,#22c55e,#15803d)',
                color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
                boxShadow:'0 6px 20px rgba(34,197,94,0.40)' }}>
              Passer au plan Pro — 1 500 FCFA/mois
            </button>
          </div>
        </div>
      )}

      {/* ══ TAB : MOTS DE PASSE ══ */}
      {tab === 'passwords' && (
        <>
          {/* Titre + tri */}
          <div style={{ marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <div>
              <h1 style={{ fontSize: isCompact ? 18 : 20, fontWeight:900, color:'#0f172a', margin:0 }}>
                {CATS.find(c => c.id === cat)?.label || 'Tout'}
              </h1>
              <p style={{ fontSize:13, color:'#94a3b8', margin:'3px 0 0' }}>
                {loadingPw ? 'Chargement…' : `${filtered.length} entrée${filtered.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {!loadingPw && passwords.length > 1 && (
              <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:12, padding:4 }}>
                {[
                  { id:'recent', icon:Clock,       label:'Récent' },
                  { id:'az',     icon:ArrowDownAZ, label:'A→Z'    },
                  { id:'za',     icon:ArrowUpAZ,   label:'Z→A'    },
                ].map(({ id, icon:Icon, label }) => (
                  <button key={id} onClick={() => setSort(id)}
                    style={{ padding:'5px 8px', borderRadius:9, border:'none', cursor:'pointer',
                      display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700,
                      background: sort === id ? 'white' : 'transparent',
                      color:      sort === id ? '#15803d' : '#94a3b8',
                      boxShadow:  sort === id ? '0 2px 6px rgba(0,0,0,0.08)' : 'none' }}>
                    <Icon size={13}/>{!isMobile && label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skeleton */}
          {loadingPw && (
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxWidth: isCompact ? '100%' : 720 }}>
              {[1,2,3].map(n => <SkeletonCard key={n}/>)}
            </div>
          )}

          {/* Onboarding */}
          {!loadingPw && passwords.length === 0 && (
            <div style={{ maxWidth: isCompact ? '100%' : 720, animation:'pgFadeIn .35s ease' }}>
              <div style={{ borderRadius:20, padding: isCompact ? '20px' : '28px', background:'white',
                boxShadow:'0 4px 24px rgba(34,197,94,0.10)', border:'1px solid #bbf7d0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                  <VaultLogo size={48} gradient={true}/>
                  <div>
                    <div style={{ fontSize:16, fontWeight:900, color:'#0f172a' }}>Bienvenue dans PassGuard</div>
                    <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Démarrez en 3 étapes simples</div>
                  </div>
                </div>
                {[
                  { n:1, title:'Ajoutez votre premier mot de passe', desc: isCompact ? 'Bouton "+ Ajouter" ci-dessus' : 'Cliquez sur "+ Ajouter" ou Ctrl+N', cta:true },
                  { n:2, title:'Testez le générateur',               desc:'Créez des mots de passe forts', cta:false },
                  { n:3, title:'Notez votre mot de passe maître',    desc:'Il est la clé de tout votre coffre', cta:false },
                ].map(({ n, title, desc, cta }) => (
                  <div key={n} onClick={() => cta && openAdd()}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                      borderRadius:14, marginBottom: n < 3 ? 8 : 0, cursor: cta ? 'pointer' : 'default',
                      background: n === 1 ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : '#f8fafc',
                      border: n === 1 ? '1px solid #bbf7d0' : '1px solid #f1f5f9' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:900, fontSize:12,
                      background: n === 1 ? G : '#e2e8f0',
                      color: n === 1 ? 'white' : '#94a3b8' }}>{n}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:'#1e293b' }}>{title}</div>
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{desc}</div>
                    </div>
                    {cta && <span style={{ fontSize:14, color:'#16a34a', fontWeight:700 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* État vide contextualisé */}
          {!loadingPw && passwords.length > 0 && sorted.length === 0 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
              padding:'50px 0', textAlign:'center', animation:'pgFadeIn .3s ease' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <h3 style={{ fontWeight:800, color:'#475569', margin:'0 0 8px', fontSize:15 }}>
                {search ? `Aucun résultat pour "${search}"` : `Aucune entrée dans "${CATS.find(c=>c.id===cat)?.label}"`}
              </h3>
              <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 20px', padding:'0 20px' }}>
                {search ? 'Essayez un autre mot-clé.' : 'Cette catégorie est vide pour l\'instant.'}
              </p>
              <button onClick={() => { setCat('all'); setSearch(''); setShowSearch(false) }}
                style={{ padding:'10px 22px', borderRadius:12, border:'1.5px solid #e2e8f0',
                  background:'white', color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Voir toutes les entrées ({passwords.length})
              </button>
            </div>
          )}

          {/* Liste */}
          {!loadingPw && sorted.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:8,
              maxWidth: isCompact ? '100%' : 720 }}>
              {sorted.map(entry => {
                const isRevealed = revealedId === entry.id
                const isCopied   = copiedId === entry.id
                const cs         = CS[entry.category] || CS.autres
                const initial    = (entry.site?.charAt(0) || '?').toUpperCase()
                return (
                  <div key={entry.id}
                    style={{ background:'white', borderRadius:16, padding: isMobile ? '12px 12px' : '14px 16px',
                      display:'flex', alignItems:'center', gap: isMobile ? 10 : 14,
                      borderLeft:`4px solid ${cs.border}`,
                      boxShadow:'0 2px 8px rgba(0,0,0,0.05)', transition:'box-shadow .2s',
                      animation:'pgFadeIn .25s ease' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'}>
                    <div style={{ width: isMobile ? 40 : 46, height: isMobile ? 40 : 46,
                      borderRadius:13, background:cs.grad, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ color:'white', fontWeight:900, fontSize: isMobile ? 16 : 18 }}>{initial}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize: isMobile ? 13 : 14, color:'#0f172a' }}>{entry.site}</div>
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:2,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {entry.username || '—'}
                      </div>
                      {!isMobile && (
                        <div style={{ fontFamily:'monospace', fontSize:12, color:'#cbd5e1', marginTop:4, letterSpacing:3 }}>
                          {isRevealed ? decrypt(entry.password_enc, masterPassword) : '••••••••••'}
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', gap: isMobile ? 2 : 4 }}>
                      <Btn onClick={() => setRevealedId(isRevealed ? null : entry.id)}>
                        {isRevealed ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </Btn>
                      <Btn onClick={() => doCopy(entry)} green={isCopied}>
                        {isCopied ? <CheckCheck size={14}/> : <Copy size={14}/>}
                      </Btn>
                      <Btn onClick={() => openEdit(entry)}>
                        <Pencil size={14}/>
                      </Btn>
                      <Btn onClick={() => setConfirmEntry(entry)} red>
                        <Trash2 size={14}/>
                      </Btn>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Conseil sécurité */}
          {!loadingPw && (
            <div style={{ maxWidth: isCompact ? '100%' : 720, marginTop:16, borderRadius:16, padding:'14px 16px',
              background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'1px solid #fde68a',
              display:'flex', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:11, background:O, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 10px rgba(217,119,6,0.28)' }}>
                <Lightbulb size={16} color="white"/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:900, color:'#92400e',
                  textTransform:'uppercase', letterSpacing:1.5, marginBottom:3 }}>Conseil de sécurité</div>
                <div style={{ fontSize:12, color:'#b45309', lineHeight:1.6 }}>{tip}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ TAB : OUTILS ══ */}
      {tab === 'tools' && (
        <div style={{ maxWidth: isCompact ? '100%' : 560 }}>
          <h1 style={{ fontSize: isCompact ? 18 : 20, fontWeight:900, color:'#0f172a', margin:'0 0 16px' }}>Outils</h1>

          {/* Générateur */}
          <div style={{ fontSize:11, fontWeight:800, color:'#475569', textTransform:'uppercase',
            letterSpacing:1.5, marginBottom:8 }}>Générateur</div>
          <button onClick={() => setShowGen(true)}
            style={{ width:'100%', background:'white', borderRadius:18, padding:'20px',
              display:'flex', alignItems:'center', gap:16, border:'1px solid #fde68a',
              cursor:'pointer', boxShadow:'0 4px 16px rgba(217,119,6,0.10)', marginBottom:24 }}>
            <div style={{ width:50, height:50, borderRadius:15, background:O, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 14px rgba(217,119,6,0.35)' }}>
              <Key size={22} color="white" strokeWidth={2.5}/>
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontWeight:800, color:'#0f172a', fontSize: isMobile ? 14 : 15 }}>Générateur de mot de passe</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>Créez des mots de passe forts et uniques</div>
            </div>
          </button>

          {/* Export / Import */}
          <ExportImport passwords={passwords} onImported={() => { fetchPw(); addToast('Importation réussie ✓') }}/>
        </div>
      )}

      {/* ══ TAB : ACTIVITÉ ══ */}
      {tab === 'activity' && (
        <>
          <h1 style={{ fontSize: isCompact ? 18 : 20, fontWeight:900, color:'#0f172a', margin:'0 0 16px' }}>Activité</h1>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'50px 0', textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:20,
              background:'linear-gradient(135deg,#f0fdf4,#d1fae5)',
              display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
              <Activity size={30} color="#86efac" strokeWidth={1.5}/>
            </div>
            <h3 style={{ fontWeight:800, color:'#475569', margin:'0 0 8px' }}>Aucune activité</h3>
            <p style={{ fontSize:13, color:'#94a3b8' }}>Votre historique d'activité apparaîtra ici.</p>
          </div>
        </>
      )}

      {/* ══ TAB : PARAMÈTRES ══ */}
      {tab === 'settings' && (
        <>
          <h1 style={{ fontSize: isCompact ? 18 : 20, fontWeight:900, color:'#0f172a', margin:'0 0 16px' }}>Paramètres</h1>
          <div style={{ maxWidth: isCompact ? '100%' : 480, display:'flex', flexDirection:'column', gap:12 }}>

            {/* Profil */}
            <div style={{ background:'white', borderRadius:18, padding:'18px 20px',
              boxShadow:'0 2px 12px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:GO, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'white', fontWeight:900, fontSize:15,
                boxShadow:'0 4px 14px rgba(34,197,94,0.28)' }}>{initials}</div>
              <div style={{ minWidth:0 }}>
                <div title={user.email} style={{ fontWeight:700, fontSize:14, color:'#0f172a',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
                <span style={{ fontSize:11, background:'#f1f5f9', color:'#64748b',
                  padding:'3px 10px', borderRadius:999, fontWeight:600 }}>Compte gratuit</span>
              </div>
            </div>

            {/* Compteur */}
            <div style={{ background:'white', borderRadius:18, padding:'16px 20px',
              boxShadow:'0 2px 12px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#f1f5f9', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Lock size={18} color="#64748b"/>
              </div>
              <span style={{ fontSize:14, color:'#475569', fontWeight:600, flex:1 }}>Mots de passe sauvegardés</span>
              <span style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>{passwords.length}</span>
            </div>

            {/* Chiffrement */}
            <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius:18,
              padding:'16px 20px', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:G, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 10px rgba(34,197,94,0.25)' }}>
                <Shield size={18} color="white"/>
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#15803d' }}>Chiffrement AES-256</div>
                <div style={{ fontSize:12, color:'#16a34a', marginTop:1 }}>Données chiffrées côté client</div>
              </div>
            </div>

            {/* Avertissement mot de passe maître */}
            <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius:18,
              padding:'18px 20px', border:'1px solid #fde68a' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:12, background:O, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 10px rgba(217,119,6,0.28)' }}>
                  <AlertTriangle size={18} color="white"/>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#92400e', marginBottom:6 }}>
                    Mot de passe maître — Critique
                  </div>
                  <div style={{ fontSize:12, color:'#b45309', lineHeight:1.75 }}>
                    S'il est perdu, vos mots de passe deviennent <strong>définitivement inaccessibles</strong>.
                    Notez-le et conservez-le en lieu sûr.
                  </div>
                </div>
              </div>
            </div>

            {/* Support WhatsApp */}
            <a href="https://wa.me/221779819588?text=Bonjour%20PassGuard%2C%20j%27ai%20besoin%20d%27aide%20concernant%20mon%20compte."
              target="_blank" rel="noopener noreferrer"
              style={{ background:'linear-gradient(135deg,#f0fdf8,#e8fdf2)', borderRadius:18,
                padding:'16px 20px', display:'flex', alignItems:'center', gap:14,
                border:'1px solid #bbf7d0', textDecoration:'none',
                boxShadow:'0 2px 8px rgba(37,211,102,0.08)' }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#25D366', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 10px rgba(37,211,102,0.30)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#15803d' }}>Support WhatsApp</div>
                <div style={{ fontSize:12, color:'#16a34a', marginTop:1 }}>Contactez-nous directement</div>
              </div>
            </a>

            {/* Déconnexion */}
            <button onClick={logout}
              style={{ background:'white', borderRadius:18, padding:'16px 20px',
                display:'flex', alignItems:'center', gap:14,
                border:'1px solid #fecaca', cursor:'pointer',
                boxShadow:'0 2px 8px rgba(239,68,68,0.06)' }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#fef2f2', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <LogOut size={18} color="#ef4444"/>
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:'#ef4444' }}>Déconnexion</span>
            </button>
          </div>
        </>
      )}
    </div>
    </main>
  )

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */

  /* ── Écran de verrouillage ── */
  if (locked) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'linear-gradient(145deg,#0f172a,#1e293b)', padding:24 }}>
        <div style={{ background:'white', borderRadius:24, padding:'40px 32px', textAlign:'center',
          maxWidth:360, width:'100%', boxShadow:'0 32px 80px rgba(0,0,0,0.40)' }}>
          <div style={{ margin:'0 auto 20px', display:'flex', justifyContent:'center' }}>
            <VaultLogo size={64} gradient={true}/>
          </div>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0f172a', marginBottom:8 }}>
            Session verrouillée
          </h2>
          <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:24 }}>
            Votre session a été verrouillée après 5 minutes d'inactivité.
          </p>
          <button onClick={() => setLocked(false)}
            style={{ width:'100%', padding:'14px', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#22c55e,#15803d)', color:'white',
              fontWeight:800, fontSize:14, cursor:'pointer',
              boxShadow:'0 8px 24px rgba(34,197,94,0.35)' }}>
            Déverrouiller
          </button>
          <button onClick={logout}
            style={{ width:'100%', marginTop:10, padding:'13px', borderRadius:14,
              border:'1.5px solid #fecaca', background:'white', color:'#ef4444',
              fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Se déconnecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden',
      background:'linear-gradient(160deg,#f0fdf4,#fef9ee,#fef3c7)' }}>

      {/* Sidebar (desktop + tablette) */}
      {!isMobile && <Sidebar/>}

      <div style={{ flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

        {/* Header */}
        {isCompact ? <MobileHeader/> : (
          <header style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)',
            borderBottom:'1px solid #e5f7ec', padding:'16px 28px',
            display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:10 }}>
            <div style={{ flex:1, position:'relative', maxWidth:400 }}>
              <Search size={15} color="#94a3b8" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher… (Ctrl+N pour ajouter)"
                style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:14,
                  border:'1px solid #e2e8f0', background:'#f8fafc', fontSize:13,
                  outline:'none', boxSizing:'border-box' }}
                onFocus={e => { e.target.style.borderColor='#22c55e'; e.target.style.boxShadow='0 0 0 3px rgba(34,197,94,0.12)' }}
                onBlur={e  => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }}/>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
              <button onClick={() => setShowGen(true)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:14,
                  border:'1px solid #e2e8f0', background:'white', cursor:'pointer',
                  fontSize:13, fontWeight:700, color:'#64748b' }}>
                <Zap size={15} color="#f59e0b"/> Générateur
              </button>
              <button onClick={openAdd}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:14,
                  border:'none', background:G, color:'white', cursor:'pointer',
                  fontSize:13, fontWeight:700, boxShadow:'0 4px 14px rgba(34,197,94,0.35)' }}>
                <Plus size={15} strokeWidth={2.5}/> Ajouter
              </button>
            </div>
          </header>
        )}

        {/* Pills catégories (mobile + tablette, uniquement onglet passwords) */}
        {isCompact && tab === 'passwords' && <CategoryPills/>}

        {/* Contenu */}
        <MainContent/>
      </div>

      {/* Bottom nav (mobile seulement) */}
      {isMobile && <BottomNav/>}

      {/* Modals */}
      {showModal    && <AddEditModal entry={editEntry} onClose={() => setShowModal(false)} onSaved={handleSaved}/>}
      {showGen      && <GeneratorModal onClose={() => setShowGen(false)}/>}
      {confirmEntry && <ConfirmModal site={confirmEntry.site} onConfirm={doDelete} onCancel={() => setConfirmEntry(null)}/>}
      {showUpgrade  && <UpgradeModal onClose={() => setShowUpgrade(false)} current={passwords.length} limit={FREE_LIMIT}/>}

      <Toast toasts={toasts} onRemove={removeToast}/>
    </div>
  )
}

function Btn({ children, onClick, green, red }) {
  return (
    <button onClick={onClick}
      style={{ padding:7, borderRadius:10, border:'none', background:'transparent', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        color: green ? '#16a34a' : red ? '#fca5a5' : '#d1d5db' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = red ? '#fef2f2' : '#f1f5f9'
        e.currentTarget.style.color = red ? '#ef4444' : '#475569'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = green ? '#16a34a' : red ? '#fca5a5' : '#d1d5db'
      }}>
      {children}
    </button>
  )
}
