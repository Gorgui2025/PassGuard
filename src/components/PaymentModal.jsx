import { useState } from 'react'
import { X, Copy, CheckCircle2, MessageCircle, Camera } from 'lucide-react'
import useBreakpoint from '../hooks/useBreakpoint'

/* ── Constantes ─────────────────────────────────────────────────────────── */
const WAVE_PHONE = '221779819588'   // numéro Wave (format international sans +)
const OM_PHONE   = '77 981 95 88'  // numéro Orange Money (format local)
const WA_NUMBER  = '221779819588'

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
  const [step, setStep]     = useState(1)     // 1=choix  2=confirmation
  const [method, setMethod] = useState(null)  // 'wave' | 'om'
  const [copied, setCopied] = useState(null)
  const [ref]               = useState(generateRef)

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  /* Lien Wave : ouvre l'app Wave avec numéro bénéficiaire et montant pré-rempli */
  const waveLink = `https://pay.wave.com/send?phone=${WAVE_PHONE}&amount=${plan.price.replace(/\s/g,'')}&note=${ref}`

  /* Message WhatsApp pré-rempli */
  const waMessage = encodeURIComponent(
    `Bonjour PassGuard 👋\n\n` +
    `Je viens de payer le plan *${plan.name}*.\n\n` +
    `💰 Montant   : ${plan.price} FCFA\n` +
    `💳 Méthode   : ${method === 'wave' ? 'Wave' : 'Orange Money'}\n` +
    `🔖 Référence : ${ref}\n` +
    `📧 Mon email : (remplacez par votre email PassGuard)\n\n` +
    `📸 Capture du paiement en pièce jointe.\n\n` +
    `Merci d'activer mon abonnement.`
  )

  /* ── Étape 1 : choix du moyen de paiement ────────────────────── */
  const StepChoix = () => (
    <>
      {/* Récapitulatif plan */}
      <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8',
          textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>Plan choisi</div>
        <div style={{ fontSize:22, fontWeight:900, color:'#0f172a' }}>{plan.name}</div>
        <div style={{ fontSize:26, fontWeight:900, color:'#16a34a', marginTop:4 }}>
          {plan.price} <span style={{ fontSize:13, color:'#64748b', fontWeight:600 }}>FCFA</span>
        </div>
        <div style={{ display:'inline-block', marginTop:8, padding:'4px 12px', borderRadius:999,
          background:'#f0fdf4', border:'1px solid #bbf7d0',
          fontSize:11, fontWeight:700, color:'#15803d' }}>
          Réf : {ref}
        </div>
      </div>

      <div style={{ fontSize:13, fontWeight:800, color:'#334155',
        textAlign:'center', marginBottom:16 }}>
        Comment souhaitez-vous payer ?
      </div>

      {/* Bouton Wave */}
      <a href={waveLink} target="_blank" rel="noopener noreferrer"
        onClick={() => { setMethod('wave'); setTimeout(() => setStep(2), 400) }}
        style={{ display:'flex', alignItems:'center', gap:14, width:'100%',
          padding:'18px 20px', borderRadius:16, marginBottom:12,
          background:'linear-gradient(135deg,#1570ef,#0ea5e9)',
          textDecoration:'none', boxSizing:'border-box',
          boxShadow:'0 6px 20px rgba(21,112,239,0.40)', cursor:'pointer' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.20)',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:24 }}>🌊</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:'white' }}>Payer avec Wave</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.80)', marginTop:2 }}>
            L'app Wave s'ouvre avec le montant pré-rempli
          </div>
        </div>
        <div style={{ fontSize:20, color:'rgba(255,255,255,0.70)' }}>→</div>
      </a>

      {/* Bouton Orange Money */}
      <button onClick={() => { setMethod('om'); setStep(2) }}
        style={{ display:'flex', alignItems:'center', gap:14, width:'100%',
          padding:'18px 20px', borderRadius:16,
          background:'linear-gradient(135deg,#f97316,#ea580c)',
          border:'none', boxSizing:'border-box', cursor:'pointer',
          boxShadow:'0 6px 20px rgba(249,115,22,0.40)' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.20)',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:24 }}>🟠</span>
        </div>
        <div style={{ flex:1, textAlign:'left' }}>
          <div style={{ fontSize:15, fontWeight:900, color:'white' }}>Payer avec Orange Money</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.80)', marginTop:2 }}>
            Transfert vers notre numéro Orange Money
          </div>
        </div>
        <div style={{ fontSize:20, color:'rgba(255,255,255,0.70)' }}>→</div>
      </button>
    </>
  )

  /* ── Étape 2 : après paiement → screenshot + WhatsApp ────────── */
  const StepConfirm = () => {
    const isWave  = method === 'wave'
    const accent  = isWave ? '#1570ef' : '#f97316'
    const accentL = isWave ? '#eff6ff' : '#fff7ed'
    const accentB = isWave ? '#bfdbfe' : '#fed7aa'

    return (
      <>
        {/* Bandeau méthode choisie */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
          borderRadius:14, background:accentL, border:`1.5px solid ${accentB}`, marginBottom:20 }}>
          <span style={{ fontSize:22 }}>{isWave ? '🌊' : '🟠'}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color: isWave ? '#1e3a5f' : '#7c2d12' }}>
              Paiement {isWave ? 'Wave' : 'Orange Money'}
            </div>
            <div style={{ fontSize:11, color:'#64748b' }}>Réf : <strong style={{ fontFamily:'monospace' }}>{ref}</strong></div>
          </div>
          <button onClick={() => copy(ref, 'ref')}
            style={{ marginLeft:'auto', width:30, height:30, borderRadius:8,
              border:'1px solid #e2e8f0', background:'white', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
            {copied === 'ref' ? <CheckCircle2 size={13} color="#16a34a"/> : <Copy size={13}/>}
          </button>
        </div>

        {/* Orange Money : afficher le numéro */}
        {!isWave && (
          <div style={{ padding:'14px 16px', borderRadius:14, background:'#fff7ed',
            border:'1.5px solid #fed7aa', marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#94a3b8',
              textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
              Envoyez {plan.price} FCFA à ce numéro
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:24, fontWeight:900, color:'#7c2d12',
                  fontFamily:'monospace', letterSpacing:2 }}>{OM_PHONE}</div>
                <div style={{ fontSize:11, color:'#ea580c', fontWeight:600, marginTop:2 }}>
                  Mentionnez la référence {ref} en motif
                </div>
              </div>
              <button onClick={() => copy(OM_PHONE.replace(/\s/g,''), 'number')}
                style={{ width:38, height:38, borderRadius:10, border:'1.5px solid #fed7aa',
                  background:'white', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#f97316' }}>
                {copied === 'number' ? <CheckCircle2 size={15} color="#16a34a"/> : <Copy size={15}/>}
              </button>
            </div>
          </div>
        )}

        {/* Instruction screenshot */}
        <div style={{ display:'flex', gap:12, padding:'14px 16px', borderRadius:14,
          background:'linear-gradient(135deg,#fefce8,#fef9c3)',
          border:'1.5px solid #fde68a', marginBottom:20 }}>
          <Camera size={20} color="#ca8a04" style={{ flexShrink:0, marginTop:1 }}/>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:'#713f12', marginBottom:4 }}>
              Prenez une capture d'écran
            </div>
            <div style={{ fontSize:12, color:'#92400e', lineHeight:1.7 }}>
              Après avoir payé, faites une capture d'écran de la confirmation de paiement.
              Vous devrez l'attacher dans WhatsApp.
            </div>
          </div>
        </div>

        {/* Bouton WhatsApp */}
        <a href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            width:'100%', padding:'15px', borderRadius:14,
            background:'#25D366', color:'white', fontWeight:800, fontSize:15,
            textDecoration:'none', boxSizing:'border-box',
            boxShadow:'0 6px 20px rgba(37,211,102,0.40)', marginBottom:10 }}>
          <MessageCircle size={18}/>
          Confirmer sur WhatsApp
        </a>

        <div style={{ fontSize:12, color:'#94a3b8', textAlign:'center',
          lineHeight:1.6, marginBottom:14 }}>
          Un message pré-rempli s'ouvrira. <strong style={{ color:'#475569' }}>Ajoutez votre email</strong> et attachez la capture d'écran avant d'envoyer.
        </div>

        <button onClick={() => setStep(1)}
          style={{ width:'100%', padding:'11px', borderRadius:12,
            border:'1.5px solid #e2e8f0', background:'white', color:'#64748b',
            fontWeight:600, fontSize:13, cursor:'pointer' }}>
          ← Changer de méthode
        </button>
      </>
    )
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:300,
        display:'flex', alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent:'center', padding: isMobile ? 0 : 24,
        background:'rgba(15,23,42,0.60)', backdropFilter:'blur(8px)' }}>

      <div style={{ background:'white', width:'100%', maxWidth: isMobile ? '100%' : 420,
        maxHeight: isMobile ? '92vh' : '90vh', overflowY:'auto',
        borderRadius: isMobile ? '24px 24px 0 0' : 24,
        animation: isMobile ? 'pgSlideUp .28s ease' : 'pgFadeIn .2s ease',
        paddingBottom: isMobile ? 'env(safe-area-inset-bottom,16px)' : 0 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: isMobile ? '16px 20px 12px' : '20px 24px 12px',
          borderBottom:'1px solid #f1f5f9',
          position:'sticky', top:0, background:'white', zIndex:1 }}>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Indicateur étapes */}
            {[1,2].map(n => (
              <div key={n} style={{ width: step===n ? 24 : 8, height:8, borderRadius:999,
                background: n <= step ? '#22c55e' : '#e2e8f0', transition:'all .3s' }}/>
            ))}
            <span style={{ fontSize:12, color:'#64748b', fontWeight:600, marginLeft:4 }}>
              {step === 1 ? 'Choisir le paiement' : 'Confirmer'}
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
        <div style={{ padding: isMobile ? '20px 20px 28px' : '20px 24px 24px' }}>
          {step === 1 && <StepChoix/>}
          {step === 2 && <StepConfirm/>}
        </div>
      </div>
    </div>
  )
}
