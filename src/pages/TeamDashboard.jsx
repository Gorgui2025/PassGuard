import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
import useTeam from '../hooks/useTeam'
import useBreakpoint from '../hooks/useBreakpoint'
import VaultLogo from '../components/VaultLogo'
import {
  ArrowLeft, LogOut, Users, Plus, Trash2, RefreshCw,
  CheckCircle2, Clock, Crown, Shield, X, UserPlus,
  AlertTriangle, Building2
} from 'lucide-react'

const G   = 'linear-gradient(135deg,#22c55e,#15803d)'
const GO  = 'linear-gradient(135deg,#22c55e,#d97706)'
const B   = 'linear-gradient(135deg,#475569,#1e293b)'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
}

export default function TeamDashboard() {
  const { user, logout } = useAuth()
  const { isMobile } = useBreakpoint()
  const navigate = useNavigate()

  const [isBusiness, setIsBusiness]   = useState(null) // null=loading, true/false
  const [teamName, setTeamName]       = useState('')
  const [creating, setCreating]       = useState(false)
  const [createError, setCreateError] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting]       = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  const { team, members, myMembership, loading, createTeam, inviteMember, removeMember, acceptInvite, refreshTeam } = useTeam(user?.email)

  const ADMIN_EMAIL = 'gorguindoye.2017@gmail.com'

  /* ── Vérifie abonnement Business (admin bypass automatique) ── */
  useEffect(() => {
    const checkBusiness = async () => {
      // L'admin principal a toujours accès
      if (user.email === ADMIN_EMAIL) { setIsBusiness(true); return }
      const { data } = await supabase.from('subscriptions')
        .select('*').eq('user_email', user.email).eq('plan', 'business').eq('active', true)
        .gt('expires_at', new Date().toISOString()).maybeSingle()
      setIsBusiness(!!data)
    }
    if (user?.email) checkBusiness()
  }, [user])

  /* ── Créer équipe ── */
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!teamName.trim()) return setCreateError('Le nom de l\'équipe est obligatoire.')
    setCreating(true); setCreateError('')
    try {
      await createTeam(teamName)
      setTeamName('')
    } catch (err) { setCreateError(err.message) }
    setCreating(false)
  }

  /* ── Inviter membre ── */
  const handleInvite = async (e) => {
    e.preventDefault()
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setInviteError('Email invalide.')
    if (email === user.email)
      return setInviteError('Vous ne pouvez pas vous inviter vous-même.')
    setInviting(true); setInviteError(''); setInviteSuccess('')
    try {
      await inviteMember(email)
      setInviteSuccess(`Invitation envoyée à ${email}`)
      setInviteEmail('')
    } catch (err) { setInviteError(err.message) }
    setInviting(false)
  }

  /* ── Retirer membre ── */
  const handleRemove = async (member) => {
    setActionError('')
    try { await removeMember(member.id) }
    catch (err) { setActionError(err.message) }
  }

  /* ── Accepter invitation ── */
  const handleAccept = async () => {
    try { await acceptInvite() }
    catch (err) { setActionError(err.message) }
  }

  const isOwner = myMembership?.role === 'owner'

  /* ── Header commun ── */
  const Header = () => (
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
            textTransform:'uppercase', letterSpacing:1 }}>Espace Équipe</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => navigate('/app')}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
            borderRadius:10, border:'1.5px solid #e2e8f0', background:'white',
            color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          <ArrowLeft size={14}/> Mon coffre
        </button>
        <button onClick={logout}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
            borderRadius:10, border:'none', background:'#fef2f2',
            color:'#ef4444', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          <LogOut size={14}/>
          {!isMobile && 'Déconnexion'}
        </button>
      </div>
    </header>
  )

  /* ── Chargement vérification Business ── */
  if (isBusiness === null || loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
        <Header/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh' }}>
          <div style={{ width:40, height:40, borderRadius:'50%',
            border:'4px solid #f0fdf4', borderTopColor:'#22c55e',
            animation:'spin 0.8s linear infinite' }}/>
          <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  /* ── Plan non Business ── */
  if (!isBusiness) {
    return (
      <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
        <Header/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          minHeight:'80vh', padding:24 }}>
          <div style={{ background:'white', borderRadius:24, padding:'40px 32px',
            textAlign:'center', maxWidth:400, width:'100%',
            boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ width:64, height:64, borderRadius:20, background:B,
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px', boxShadow:'0 8px 24px rgba(99,102,241,0.30)' }}>
              <Building2 size={28} color="white"/>
            </div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0f172a', marginBottom:8 }}>
              Fonctionnalité Business
            </h2>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.75, marginBottom:24 }}>
              L'espace équipe est réservé au plan Business. Contactez-nous pour activer votre abonnement.
            </p>
            <a href="https://wa.me/221779819588?text=Bonjour%20PassGuard%2C%20je%20souhaite%20activer%20le%20plan%20Business."
              target="_blank" rel="noopener noreferrer"
              style={{ display:'block', width:'100%', padding:'13px', borderRadius:14,
                background:'#25D366', color:'white', fontWeight:800, fontSize:14,
                textDecoration:'none', marginBottom:10, boxSizing:'border-box',
                boxShadow:'0 6px 18px rgba(37,211,102,0.35)' }}>
              Contacter via WhatsApp
            </a>
            <button onClick={() => navigate('/app')}
              style={{ width:'100%', padding:'13px', borderRadius:14,
                border:'1.5px solid #e2e8f0', background:'white',
                color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Retour au coffre
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Invitation en attente ── */
  if (myMembership?.status === 'pending') {
    return (
      <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
        <Header/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          minHeight:'80vh', padding:24 }}>
          <div style={{ background:'white', borderRadius:24, padding:'40px 32px',
            textAlign:'center', maxWidth:420, width:'100%',
            boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ width:64, height:64, borderRadius:20,
              background:'linear-gradient(135deg,#fffbeb,#fef3c7)',
              border:'2px solid #fde68a',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px' }}>
              <UserPlus size={28} color="#d97706"/>
            </div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0f172a', marginBottom:8 }}>
              Invitation reçue
            </h2>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.75, marginBottom:8 }}>
              Vous avez été invité à rejoindre l'équipe
            </p>
            <div style={{ fontSize:18, fontWeight:900, color:'#0f172a', marginBottom:8 }}>
              {team?.name}
            </div>
            <p style={{ fontSize:12, color:'#94a3b8', marginBottom:24 }}>
              par {team?.owner_email}
            </p>
            <div style={{ padding:'12px 16px', borderRadius:14,
              background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
              border:'1px solid #bbf7d0', marginBottom:24, textAlign:'left' }}>
              <div style={{ fontSize:12, color:'#15803d', lineHeight:1.7 }}>
                🔒 <strong>Vos mots de passe restent privés.</strong> Rejoindre cette équipe ne donne
                accès à aucun de vos mots de passe personnels.
              </div>
            </div>
            {actionError && (
              <div style={{ padding:'10px 14px', borderRadius:10, background:'#fef2f2',
                border:'1px solid #fecaca', fontSize:12, color:'#dc2626',
                marginBottom:14 }}>{actionError}</div>
            )}
            <button onClick={handleAccept}
              style={{ width:'100%', padding:'14px', borderRadius:14, border:'none',
                background:G, color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
                boxShadow:'0 8px 24px rgba(34,197,94,0.35)', marginBottom:10 }}>
              Rejoindre l'équipe
            </button>
            <button onClick={() => navigate('/app')}
              style={{ width:'100%', padding:'13px', borderRadius:14,
                border:'1.5px solid #e2e8f0', background:'white',
                color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Plus tard
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Pas encore d'équipe (owner Business sans team) ── */
  if (!team && isOwner === false && myMembership === null) {
    return (
      <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
        <Header/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          minHeight:'80vh', padding:24 }}>
          <div style={{ background:'white', borderRadius:24, padding:'40px 32px',
            textAlign:'center', maxWidth:420, width:'100%',
            boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ width:64, height:64, borderRadius:20, background:B,
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px', boxShadow:'0 8px 24px rgba(99,102,241,0.28)' }}>
              <Users size={28} color="white"/>
            </div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0f172a', marginBottom:8 }}>
              Créez votre équipe
            </h2>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.75, marginBottom:24 }}>
              Donnez un nom à votre espace équipe et commencez à inviter vos collaborateurs.
            </p>
            <form onSubmit={handleCreate} style={{ textAlign:'left' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#475569',
                textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>
                Nom de l'équipe
              </div>
              <input type="text" value={teamName}
                onChange={e => { setTeamName(e.target.value); setCreateError('') }}
                placeholder="ex : MonEntreprise SN, Équipe RH…"
                style={{ width:'100%', padding:'13px 16px', borderRadius:14, boxSizing:'border-box',
                  border: createError ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                  fontSize:14, color:'#1e293b', outline:'none', background:'#f8fafc',
                  marginBottom: createError ? 8 : 16 }}/>
              {createError && (
                <div style={{ fontSize:12, color:'#dc2626', marginBottom:12 }}>⚠ {createError}</div>
              )}
              <button type="submit" disabled={creating}
                style={{ width:'100%', padding:'14px', borderRadius:14, border:'none',
                  background:B, color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
                  opacity: creating ? 0.7 : 1,
                  boxShadow:'0 8px 24px rgba(99,102,241,0.30)' }}>
                {creating ? 'Création…' : 'Créer mon équipe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  /* ── Vue principale ── */
  const activeMembers  = members.filter(m => m.status === 'active')
  const pendingMembers = members.filter(m => m.status === 'pending')

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Header/>

      <div style={{ maxWidth:860, margin:'0 auto', padding: isMobile ? '16px' : '28px 24px' }}>

        {/* ── Info équipe ── */}
        <div style={{ background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
          borderRadius:20, padding:'22px 24px', marginBottom:24,
          border:'1px solid #cbd5e1', display:'flex', alignItems:'center',
          justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:B, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 14px rgba(99,102,241,0.30)' }}>
              <Building2 size={22} color="white"/>
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:900, color:'#0f172a' }}>{team?.name}</div>
              <div style={{ fontSize:12, color:'#475569', fontWeight:600, marginTop:2 }}>
                Créée le {formatDate(team?.created_at)}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ padding:'6px 14px', borderRadius:999,
              background:'linear-gradient(135deg,#475569,#1e293b)',
              color:'white', fontSize:11, fontWeight:800,
              textTransform:'uppercase', letterSpacing:1.2 }}>
              Business
            </div>
            <button onClick={refreshTeam}
              style={{ width:34, height:34, borderRadius:10, border:'1.5px solid #cbd5e1',
                background:'white', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', color:'#475569' }}>
              <RefreshCw size={14}/>
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Membres actifs', value: activeMembers.length,  color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', icon:CheckCircle2 },
            { label:'Invitations',    value: pendingMembers.length, color:'#d97706', bg:'#fffbeb', border:'#fde68a', icon:Clock        },
            { label:'Total membres',  value: members.length,        color:'#475569', bg:'#f8fafc', border:'#cbd5e1', icon:Users        },
          ].map(({ label, value, color, bg, border, icon:Icon }) => (
            <div key={label} style={{ background:'white', borderRadius:16, padding:'16px',
              border:`1px solid ${border}`, boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
              textAlign:'center' }}>
              <Icon size={18} color={color} style={{ marginBottom:6 }}/>
              <div style={{ fontSize:22, fontWeight:900, color:'#0f172a' }}>{value}</div>
              <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Formulaire invitation (owner seulement) ── */}
        {isOwner && (
          <div style={{ background:'white', borderRadius:18, padding:'20px 24px',
            border:'1px solid #e5f7ec', marginBottom:24,
            boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#0f172a', marginBottom:14,
              display:'flex', alignItems:'center', gap:8 }}>
              <UserPlus size={15} color="#475569"/> Inviter un collaborateur
            </div>
            <form onSubmit={handleInvite}
              style={{ display:'flex', gap:10, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              <input type="email" value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteError(''); setInviteSuccess('') }}
                placeholder="email@collaborateur.com"
                style={{ flex:1, padding:'11px 14px', borderRadius:12, boxSizing:'border-box',
                  border: inviteError ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                  fontSize:13, color:'#1e293b', outline:'none', background:'#f8fafc',
                  minWidth: isMobile ? '100%' : 0 }}/>
              <button type="submit" disabled={inviting}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 20px',
                  borderRadius:12, border:'none', background:B, color:'white',
                  fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap',
                  opacity: inviting ? 0.7 : 1,
                  width: isMobile ? '100%' : 'auto', justifyContent:'center',
                  boxShadow:'0 4px 14px rgba(99,102,241,0.28)' }}>
                <Plus size={14}/> {inviting ? 'Envoi…' : 'Inviter'}
              </button>
            </form>
            {inviteError && (
              <div style={{ fontSize:12, color:'#dc2626', marginTop:8, fontWeight:600 }}>
                ⚠ {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div style={{ fontSize:12, color:'#16a34a', marginTop:8, fontWeight:600,
                display:'flex', alignItems:'center', gap:6 }}>
                <CheckCircle2 size={13}/> {inviteSuccess}
              </div>
            )}
          </div>
        )}

        {/* ── Avertissement erreur action ── */}
        {actionError && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
            borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca',
            marginBottom:16 }}>
            <AlertTriangle size={14} color="#ef4444"/>
            <span style={{ fontSize:13, color:'#dc2626' }}>{actionError}</span>
            <button onClick={() => setActionError('')}
              style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
              <X size={14}/>
            </button>
          </div>
        )}

        {/* ── Liste des membres ── */}
        <div style={{ background:'white', borderRadius:18, overflow:'hidden',
          border:'1px solid #e5f7ec', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>

          <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9',
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#0f172a',
              display:'flex', alignItems:'center', gap:8 }}>
              <Users size={15} color="#475569"/> Membres de l'équipe
            </div>
          </div>

          {/* En-tête tableau desktop */}
          {!isMobile && (
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 80px',
              padding:'10px 20px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
              {['Email', 'Rôle', 'Statut', ''].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:800, color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:1.2 }}>{h}</div>
              ))}
            </div>
          )}

          {members.length === 0 && (
            <div style={{ padding:'40px', textAlign:'center', color:'#94a3b8', fontSize:13 }}>
              Aucun membre pour l'instant. Invitez vos collaborateurs.
            </div>
          )}

          {members.map((member, i) => {
            const isMe = member.user_email === user.email
            const isPending = member.status === 'pending'
            const isRowOwner = member.role === 'owner'

            if (isMobile) {
              return (
                <div key={member.id} style={{ padding:'14px 16px',
                  borderBottom: i < members.length - 1 ? '1px solid #f8fafc' : 'none',
                  display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:12, flexShrink:0,
                    background: isRowOwner ? B : 'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {isRowOwner ? <Crown size={16} color="white"/> : <Users size={14} color="#64748b"/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {member.user_email} {isMe && <span style={{ color:'#94a3b8', fontWeight:400 }}>(vous)</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999,
                        background: isRowOwner ? '#f1f5f9' : '#f1f5f9',
                        color: isRowOwner ? '#475569' : '#64748b' }}>
                        {isRowOwner ? 'Admin' : 'Membre'}
                      </span>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999,
                        background: isPending ? '#fffbeb' : '#f0fdf4',
                        color: isPending ? '#d97706' : '#16a34a',
                        display:'flex', alignItems:'center', gap:4 }}>
                        {isPending ? <Clock size={9}/> : <CheckCircle2 size={9}/>}
                        {isPending ? 'Invité' : 'Actif'}
                      </span>
                    </div>
                  </div>
                  {isOwner && !isMe && !isRowOwner && (
                    <button onClick={() => handleRemove(member)} title="Retirer"
                      style={{ width:30, height:30, borderRadius:8, border:'none',
                        background:'#fef2f2', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Trash2 size={13} color="#ef4444"/>
                    </button>
                  )}
                </div>
              )
            }

            return (
              <div key={member.id}
                style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 80px',
                  padding:'13px 20px', alignItems:'center',
                  borderBottom: i < members.length - 1 ? '1px solid #f8fafc' : 'none',
                  background: i % 2 === 0 ? 'white' : '#fafafa',
                  transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}>

                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:10, flexShrink:0,
                    background: isRowOwner ? B : '#f1f5f9',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {isRowOwner ? <Crown size={13} color="white"/> : <Users size={12} color="#64748b"/>}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'#0f172a',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {member.user_email}
                    {isMe && <span style={{ color:'#94a3b8', fontWeight:400, marginLeft:6 }}>(vous)</span>}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize:12, fontWeight:800, padding:'3px 10px', borderRadius:999,
                    background: isRowOwner ? '#f1f5f9' : '#f1f5f9',
                    color: isRowOwner ? '#475569' : '#475569' }}>
                    {isRowOwner ? 'Admin' : 'Membre'}
                  </span>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%',
                    background: isPending ? '#f59e0b' : '#22c55e' }}/>
                  <span style={{ fontSize:12, fontWeight:700,
                    color: isPending ? '#d97706' : '#16a34a' }}>
                    {isPending ? 'Invité' : 'Actif'}
                  </span>
                </div>

                <div style={{ display:'flex', justifyContent:'center' }}>
                  {isOwner && !isMe && !isRowOwner && (
                    <button onClick={() => handleRemove(member)} title="Retirer le membre"
                      style={{ width:30, height:30, borderRadius:8, border:'none',
                        background:'#fef2f2', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Trash2 size={13} color="#ef4444"/>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Note sécurité ── */}
        <div style={{ marginTop:20, padding:'14px 18px', borderRadius:14,
          background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1px solid #bbf7d0',
          display:'flex', alignItems:'flex-start', gap:10 }}>
          <Shield size={14} color="#16a34a" style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12, color:'#15803d', lineHeight:1.7 }}>
            <strong>Vos mots de passe restent privés.</strong> Chaque membre chiffre ses données avec son propre mot de passe maître. Aucun mot de passe n'est partagé entre membres de l'équipe.
          </div>
        </div>

      </div>
    </div>
  )
}
