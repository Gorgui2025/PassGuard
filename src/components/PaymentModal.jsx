import { useState } from 'react'
import { X, Copy, CheckCircle2, Smartphone, MessageCircle, ArrowRight, AlertCircle } from 'lucide-react'
import useBreakpoint from '../hooks/useBreakpoint'

/* ── Constantes ─────────────────────────────────────────────────────────── */
const WAVE_NUMBER  = '77 981 95 88'
const OM_NUMBER    = '77 981 95 88'
const WA_NUMBER    = '221779819588'

/* Génère une référence unique : PG-AAAAMMJJ-XXXX */
function generateRef() {
  const d     = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let r = ''
  for (let i = 0; i < 4; i++) r += chars[Math.floor(Math.random() * chars.length)]
  return `PG-${d}-${r}`
}

export default function PaymentModal({ plan, onClose }) {
  const { isMobile }        = useBreakpoint()
  const [method, setMethod] = useState(null)   // 'wave' | 'om'
  const [step, setStep]     = useState(1)       // 1=choix méthode  2=instructions  3=confirmation
  const [copied, setCopied] = useState(null)
  const [ref]               = useState(generateRef)

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const waMessage = encodeURIComponent(
    `Bonjour PassGuard 👋\n\n` +
    `Je viens d'effectuer un paiement pour activer mon abonnement.\n\n` +
    `📦 Plan      : ${plan.name}\n` +
    `💰 Montant   : ${plan.price} FCFA\n` +
    `💳 Méthode   : ${method === 'wave' ? 'Wave' : 'Orange Money'}\n` +
    `🔖 Référence : ${ref}\n` +
    `📧 Email     : (votre email PassGuard)\n\n` +
    `Merci de confirmer l'activation de mon abonnement.`
  )

  const G     = 'linear-gradient(135deg,#22c55e,#15803d)'
  const WAVE  = '#1570ef'
  const OM    = '#f97316'

  /* ─── Info row avec copie ─────────────────────────────────────── */
  const InfoRow = ({ label, value, copyKey }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'11px 14px', borderRadius:12,
      background:'#f8fafc', border:'1px solid #e2e8f0', marginBottom:8 }}>
      <div>
        <div style={{ fontSize:10, fontWeight:800, color:'#94a3b8',
          textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:15, fontWeight:900, color:'#0f172a', fontFamily:'monospace' }}>{value}</div>
      </div>
      <button onClick={() => copy(value.replace(/\s/g,''), copyKey)}
        style={{ width:34, height:34, borderRadius:10, border:'1.5px solid #e2e8f0',
          background: copied === copyKey ? '#f0fdf4' : 'white',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          color: copied === copyKey ? '#16a34a' : '#64748b', transition:'all .2s' }}>
        {copied === copyKey ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
      </button>
    </div>
  )

  /* ─── Étape 1 : choix de la méthode ──────────────────────────── */
  const StepChoix = () => (
    <>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:800, color:'#94a3b8',
          textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>
          Plan sélectionné
        </div>
        <div style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>{plan.name}</div>
        <div style={{ fontSize:28, fontWeight:900, color:'#16a34a', marginTop:4 }}>
          {plan.price} <span style={{ fontSize:13, color:'#64748b', fontWeight:600 }}>FCFA</span>
          <span style={{ fontSize:12, color:'#94a3b8', fontWeight:500 }}> {plan.period && `/ ${plan.period.replace('FCFA / ','')}`}</span>
        </div>
      </div>

      <div style={{ fontSize:13, fontWeight:700, color:'#334155', marginBottom:12, textAlign:'center' }}>
        Choisissez votre mode de paiement
      </div>

      {/* Wave */}
      <button onClick={() => { setMethod('wave'); setStep(2) }}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:14,
          padding:'16px 18px', borderRadius:16, border:'2px solid #dbeafe',
          background:'linear-gradient(135deg,#eff6ff,#dbeafe)',
          cursor:'pointer', marginBottom:12, textAlign:'left', transition:'all .2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor=WAVE}
        onMouseLeave={e => e.currentTarget.style.borderColor='#dbeafe'}>
        <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
          background:'linear-gradient(135deg,#1570ef,#0ea5e9)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 12px rgba(21,112,239,0.35)' }}>
          <span style={{ fontSize:22 }}>🌊</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:'#1e3a5f' }}>Wave</div>
          <div style={{ fontSize:12, color:'#3b82f6', fontWeight:600 }}>Paiement instantané</div>
        </div>
        <ArrowRight size={16} color="#3b82f6"/>
      </button>

      {/* Orange Money */}
      <button onClick={() => { setMethod('om'); setStep(2) }}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:14,
          padding:'16px 18px', borderRadius:16, border:'2px solid #fed7aa',
          background:'linear-gradient(135deg,#fff7ed,#fed7aa)',
          cursor:'pointer', textAlign:'left', transition:'all .2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor=OM}
        onMouseLeave={e => e.currentTarget.style.borderColor='#fed7aa'}>
        <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
          background:'linear-gradient(135deg,#f97316,#ea580c)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 12px rgba(249,115,22,0.35)' }}>
          <span style={{ fontSize:22 }}>🟠</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:'#7c2d12' }}>Orange Money</div>
          <div style={{ fontSize:12, color:'#f97316', fontWeight:600 }}>Transfert mobile</div>
        </div>
        <ArrowRight size={16} color="#f97316"/>
      </button>
    </>
  )

  /* ─── Étape 2 : instructions de paiement ─────────────────────── */
  const StepInstructions = () => {
    const isWave   = method === 'wave'
    const accentC  = isWave ? WAVE : OM
    const accentBg = isWave ? '#eff6ff' : '#fff7ed'
    const number   = isWave ? WAVE_NUMBER : OM_NUMBER

    return (
      <>
        {/* Bandeau méthode */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
          borderRadius:14, background: accentBg,
          border:`1.5px solid ${isWave ? '#bfdbfe' : '#fed7aa'}`, marginBottom:20 }}>
          <span style={{ fontSize:24 }}>{isWave ? '🌊' : '🟠'}</span>
          <div>
            <div style={{ fontSize:14, fontWeight:900, color: isWave ? '#1e3a5f' : '#7c2d12' }}>
              Paiement via {isWave ? 'Wave' : 'Orange Money'}
            </div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:1 }}>
              Suivez les étapes ci-dessous
            </div>
          </div>
        </div>

        {/* Étapes */}
        {[
          {
            n:1,
            title: isWave ? 'Ouvrez votre app Wave' : 'Ouvrez votre app Orange Money',
            desc:  isWave
              ? 'Appuyez sur "Envoyer" puis entrez le numéro ci-dessous'
              : 'Allez dans "Transfert" → "Envoyer de l\'argent"',
          },
          {
            n:2,
            title:'Entrez le numéro bénéficiaire',
            desc: null,
            content: <InfoRow label="Numéro PassGuard" value={number} copyKey="number"/>
          },
          {
            n:3,
            title:'Entrez le montant exact',
            desc: null,
            content: <InfoRow label="Montant à envoyer" value={`${plan.price} FCFA`} copyKey="amount"/>
          },
          {
            n:4,
            title:'Mentionnez la référence dans le motif',
            desc:'Ajoutez cette référence en commentaire/motif du paiement',
            content: <InfoRow label="Votre référence unique" value={ref} copyKey="ref"/>
          },
        ].map(({ n, title, desc, content }) => (
          <div key={n} style={{ display:'flex', gap:12, marginBottom:16 }}>
            <div style={{ width:26, height:26, borderRadius:999, flexShrink:0,
              background:`linear-gradient(135deg,${accentC},${isWave?'#0ea5e9':'#c2410c'})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:900, color:'white', marginTop:1 }}>{n}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#0f172a', marginBottom: desc||content ? 4 : 0 }}>
                {title}
              </div>
              {desc && <div style={{ fontSize:12, color:'#64748b', marginBottom: content ? 8 : 0 }}>{desc}</div>}
              {content}
            </div>
          </div>
        ))}

        {/* Avertissement */}
        <div style={{ display:'flex', gap:10, padding:'12px 14px', borderRadius:12,
          background:'#fffbeb', border:'1px solid #fde68a', marginBottom:20 }}>
          <AlertCircle size={14} color="#d97706" style={{ flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:12, color:'#92400e', margin:0, lineHeight:1.6 }}>
            Conservez votre capture d'écran du paiement. Elle pourra être demandée pour vérification.
          </p>
        </div>

        <button onClick={() => setStep(3)}
          style={{ width:'100%', padding:'14px', borderRadius:14, border:'none',
            background: `linear-gradient(135deg,${accentC},${isWave?'#0ea5e9':'#c2410c'})`,
            color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
            boxShadow:`0 6px 20px ${isWave?'rgba(21,112,239,0.35)':'rgba(249,115,22,0.35)'}` }}>
          J'ai effectué le paiement →
        </button>

        <button onClick={() => setStep(1)}
          style={{ width:'100%', marginTop:10, padding:'11px', borderRadius:12,
            border:'1.5px solid #e2e8f0', background:'white', color:'#64748b',
            fontWeight:600, fontSize:13, cursor:'pointer' }}>
          ← Changer de méthode
        </button>
      </>
    )
  }

  /* ─── Étape 3 : confirmation WhatsApp ────────────────────────── */
  const StepConfirmation = () => (
    <>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ width:64, height:64, borderRadius:20,
          background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          border:'2px solid #bbf7d0',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 16px' }}>
          <CheckCircle2 size={30} color="#16a34a"/>
        </div>
        <div style={{ fontSize:17, fontWeight:900, color:'#0f172a', marginBottom:6 }}>
          Paiement effectué ?
        </div>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, margin:0 }}>
          Envoyez-nous une confirmation WhatsApp. Notre équipe activera votre abonnement sous <strong>24h</strong>.
        </p>
      </div>

      {/* Récapitulatif */}
      <div style={{ padding:'14px 16px', borderRadius:14,
        background:'linear-gradient(135deg,#f8fafc,#f1f5f9)',
        border:'1px solid #e2e8f0', marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:800, color:'#94a3b8',
          textTransform:'uppercase', letterSpacing:1.2, marginBottom:10 }}>
          Récapitulatif
        </div>
        {[
          { label:'Plan',      value: plan.name },
          { label:'Montant',   value: `${plan.price} FCFA` },
          { label:'Méthode',   value: method === 'wave' ? 'Wave' : 'Orange Money' },
          { label:'Référence', value: ref },
        ].map(({ label, value }) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between',
            fontSize:13, marginBottom:6 }}>
            <span style={{ color:'#64748b', fontWeight:600 }}>{label}</span>
            <span style={{ color:'#0f172a', fontWeight:800, fontFamily: label==='Référence' ? 'monospace' : 'inherit' }}>{value}</span>
          </div>
        ))}
      </div>

      <a href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
        target="_blank" rel="noopener noreferrer"
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          width:'100%', padding:'15px', borderRadius:14, border:'none',
          background:'#25D366', color:'white', fontWeight:800, fontSize:15,
          textDecoration:'none', boxSizing:'border-box',
          boxShadow:'0 6px 20px rgba(37,211,102,0.40)' }}>
        <MessageCircle size={18}/>
        Envoyer la confirmation WhatsApp
      </a>

      <div style={{ marginTop:12, padding:'10px 14px', borderRadius:12,
        background:'#fffbeb', border:'1px solid #fde68a',
        fontSize:12, color:'#92400e', lineHeight:1.6, textAlign:'center' }}>
        📱 Un message pré-rempli s'ouvrira dans WhatsApp.<br/>
        <strong>Ajoutez votre email PassGuard</strong> avant d'envoyer.
      </div>

      <button onClick={onClose}
        style={{ width:'100%', marginTop:12, padding:'11px', borderRadius:12,
          border:'1.5px solid #e2e8f0', background:'white', color:'#64748b',
          fontWeight:600, fontSize:13, cursor:'pointer' }}>
        Fermer
      </button>
    </>
  )

  /* ─── Render principal ────────────────────────────────────────── */
  const titles = ['Souscrire au plan', 'Instructions de paiement', 'Confirmer le paiement']

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:300,
        display:'flex', alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent:'center', padding: isMobile ? 0 : 24,
        background:'rgba(15,23,42,0.60)', backdropFilter:'blur(8px)' }}>

      <div style={{ background:'white', width:'100%', maxWidth: isMobile ? '100%' : 440,
        maxHeight: isMobile ? '92vh' : '90vh', overflowY:'auto',
        borderRadius: isMobile ? '24px 24px 0 0' : 24,
        animation: isMobile ? 'pgSlideUp .28s ease' : 'pgFadeIn .2s ease',
        paddingBottom: isMobile ? 'env(safe-area-inset-bottom,16px)' : 0 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: isMobile ? '16px 20px 14px' : '22px 24px 14px',
          borderBottom:'1px solid #f1f5f9', position:'sticky', top:0, background:'white', zIndex:1 }}>

          {/* Indicateur d'étapes */}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{ width: step === n ? 20 : 7, height:7, borderRadius:999,
                background: n <= step ? '#22c55e' : '#e2e8f0',
                transition:'all .3s' }}/>
            ))}
            <span style={{ fontSize:12, color:'#94a3b8', fontWeight:600, marginLeft:6 }}>
              {titles[step-1]}
            </span>
          </div>

          <button onClick={onClose}
            style={{ width:32, height:32, borderRadius:10, border:'none',
              background:'#f1f5f9', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}
            onMouseEnter={e => e.currentTarget.style.background='#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background='#f1f5f9'}>
            <X size={15}/>
          </button>
        </div>

        {/* Contenu */}
        <div style={{ padding: isMobile ? '20px 20px 28px' : '24px' }}>
          {step === 1 && <StepChoix/>}
          {step === 2 && <StepInstructions/>}
          {step === 3 && <StepConfirmation/>}
        </div>
      </div>
    </div>
  )
}
