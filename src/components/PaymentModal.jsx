import { useState } from 'react'
import { X, Copy, CheckCircle2, MessageCircle, Camera, Smartphone } from 'lucide-react'
import useBreakpoint from '../hooks/useBreakpoint'

const PHONE     = '77 981 95 88'
const WA_NUMBER = '221779819588'

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
  const [step, setStep]     = useState(1)      // 1=choix  2=instructions  3=email  4=whatsapp
  const [copied, setCopied] = useState(null)
  const [ref]               = useState(generateRef)
  const [email, setEmail]   = useState('')
  const [emailError, setEmailError] = useState('')

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2500)
  }

  const isWave  = method === 'wave'
  const accent  = isWave ? '#1570ef' : '#f97316'
  const accentL = isWave ? '#eff6ff' : '#fff7ed'
  const accentB = isWave ? '#bfdbfe' : '#fed7aa'
  const emoji   = isWave ? '🌊' : '🟠'
  const label   = isWave ? 'Wave' : 'Orange Money'

  const waText = encodeURIComponent(
    `Bonjour PassGuard 👋\n\n` +
    `Paiement effectué pour le plan *${plan.name}*.\n\n` +
    `📧 Email     : ${email}\n` +
    `💰 Montant   : ${plan.price} FCFA\n` +
    `💳 Méthode   : ${label}\n` +
    `🔖 Référence : ${ref}\n\n` +
    `📸 Capture du paiement en pièce jointe.\n\n` +
    `Merci d'activer mon abonnement.`
  )

  /* ── Bouton copier réutilisable ── */
  const CopyRow = ({ label: lbl, value, id, mono }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 }}>{lbl}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 12,
        background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 900, color: '#0f172a',
          fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? 1 : 0 }}>
          {value}
        </span>
        <button onClick={() => copy(value.replace(/\s/g, ''), id)}
          style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            border: `1.5px solid ${copied === id ? '#bbf7d0' : '#e2e8f0'}`,
            background: copied === id ? '#f0fdf4' : 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: copied === id ? '#16a34a' : '#64748b', transition: 'all .2s' }}>
          {copied === id
            ? <CheckCircle2 size={15} color="#16a34a"/>
            : <Copy size={15}/>}
        </button>
      </div>
      {copied === id && (
        <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 4 }}>
          ✓ Copié !
        </div>
      )}
    </div>
  )

  /* ── ÉTAPE 1 : Choisir la méthode ── */
  const StepChoix = () => (
    <>
      {/* Résumé plan */}
      <div style={{ textAlign: 'center', padding: '16px 0 22px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Plan choisi</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{plan.name}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a', marginTop: 4 }}>
          {plan.price} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>FCFA</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
          marginTop: 10, padding: '5px 14px', borderRadius: 999,
          background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d',
            fontFamily: 'monospace', letterSpacing: 1 }}>{ref}</span>
          <button onClick={() => copy(ref, 'ref-top')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: copied === 'ref-top' ? '#16a34a' : '#64748b', display: 'flex' }}>
            {copied === 'ref-top'
              ? <CheckCircle2 size={12} color="#16a34a"/>
              : <Copy size={12}/>}
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
          Votre référence unique — gardez-la précieusement
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 800, color: '#334155',
        textAlign: 'center', marginBottom: 14 }}>
        Choisissez votre moyen de paiement
      </div>

      {/* Wave */}
      <button onClick={() => { setMethod('wave'); setStep(2) }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 20px', borderRadius: 16, marginBottom: 12,
          background: 'linear-gradient(135deg,#1570ef,#0ea5e9)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          boxShadow: '0 6px 20px rgba(21,112,239,0.35)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: 'rgba(255,255,255,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26 }}>🌊</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>Wave</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 2 }}>
            Ouvrez Wave → Envoyer → entrez le numéro
          </div>
        </div>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.70)' }}>›</span>
      </button>

      {/* Orange Money */}
      <button onClick={() => { setMethod('om'); setStep(2) }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 20px', borderRadius: 16,
          background: 'linear-gradient(135deg,#f97316,#ea580c)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          boxShadow: '0 6px 20px rgba(249,115,22,0.35)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: 'rgba(255,255,255,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26 }}>🟠</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>Orange Money</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 2 }}>
            Ouvrez OM → Transfert → entrez le numéro
          </div>
        </div>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.70)' }}>›</span>
      </button>
    </>
  )

  /* ── ÉTAPE 2 : Instructions de paiement ── */
  const StepInstructions = () => (
    <>
      {/* Bandeau méthode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 14,
        background: accentL, border: `1.5px solid ${accentB}`, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 900,
            color: isWave ? '#1e3a5f' : '#7c2d12' }}>Paiement {label}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
            Suivez les 3 étapes ci-dessous
          </div>
        </div>
      </div>

      {/* Étapes numérotées */}
      {[
        {
          n: 1,
          title: `Ouvrez votre app ${label}`,
          desc: isWave
            ? 'Appuyez sur "Envoyer de l\'argent"'
            : 'Allez dans "Transfert" → "Envoyer"',
          icon: <Smartphone size={14} color={accent}/>,
        },
        {
          n: 2,
          title: 'Copiez et entrez ce numéro',
          desc: null,
          content: <CopyRow label="Numéro bénéficiaire" value={PHONE} id="phone" mono/>,
        },
        {
          n: 3,
          title: 'Entrez le montant exact',
          desc: null,
          content: <CopyRow label="Montant à envoyer" value={`${plan.price} FCFA`} id="amount"/>,
        },
        {
          n: 4,
          title: 'Mentionnez la référence en motif',
          desc: null,
          content: <CopyRow label="Référence de paiement" value={ref} id="ref" mono/>,
        },
      ].map(({ n, title, desc, content, icon }) => (
        <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, flexShrink: 0,
            background: `linear-gradient(135deg,${accent},${isWave ? '#0ea5e9' : '#c2410c'})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, color: 'white', marginTop: 1 }}>{n}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a',
              marginBottom: desc || content ? 5 : 0 }}>{title}</div>
            {desc && (
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: content ? 8 : 0 }}>{desc}</div>
            )}
            {content}
          </div>
        </div>
      ))}

      {/* Avertissement */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 12,
        background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 20 }}>
        <Camera size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }}/>
        <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.7 }}>
          <strong>Prenez une capture d'écran</strong> du paiement confirmé.
          Vous devrez l'envoyer avec votre confirmation WhatsApp.
        </p>
      </div>

      <button onClick={() => setStep(3)}
        style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: `linear-gradient(135deg,${accent},${isWave ? '#0ea5e9' : '#c2410c'})`,
          color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
          boxShadow: `0 6px 20px ${isWave ? 'rgba(21,112,239,0.35)' : 'rgba(249,115,22,0.35)'}`,
          marginBottom: 10 }}>
        ✓ J'ai payé → Étape suivante
      </button>

      <button onClick={() => setStep(1)}
        style={{ width: '100%', padding: '11px', borderRadius: 12,
          border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b',
          fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        ← Changer de méthode
      </button>
    </>
  )

  /* ── ÉTAPE 3 : Saisie email ── */
  const StepEmail = () => {
    const handleNext = () => {
      const trimmed = email.trim().toLowerCase()
      if (!trimmed) return setEmailError('Votre email est obligatoire.')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
        return setEmailError('Adresse email invalide.')
      setEmail(trimmed)
      setEmailError('')
      setStep(4)
    }

    return (
      <>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: `linear-gradient(135deg,${accent},${isWave ? '#0ea5e9' : '#c2410c'})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26 }}>{emoji}</div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
            Votre email PassGuard
          </div>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>
            Entrez l'email associé à votre compte PassGuard.<br/>
            Il nous permettra d'<strong>activer votre abonnement</strong>.
          </p>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#475569',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            Email PassGuard
          </div>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError('') }}
            placeholder="vous@exemple.com"
            autoFocus
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, boxSizing: 'border-box',
              border: `1.5px solid ${emailError ? '#ef4444' : '#e2e8f0'}`,
              fontSize: 14, color: '#1e293b', outline: 'none', background: '#f8fafc' }}
            onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}20` }}
            onBlur={e  => { e.target.style.borderColor = emailError ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
            onKeyDown={e => e.key === 'Enter' && handleNext()}
          />
          {emailError && (
            <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginTop: 6 }}>
              ⚠ {emailError}
            </div>
          )}
        </div>

        <div style={{ padding: '11px 14px', borderRadius: 12,
          background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 20, marginTop: 12 }}>
          <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.6 }}>
            🔒 Cet email sera inclus dans votre message WhatsApp et utilisé uniquement pour activer votre abonnement.
          </p>
        </div>

        <button onClick={handleNext}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg,${accent},${isWave ? '#0ea5e9' : '#c2410c'})`,
            color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            boxShadow: `0 6px 20px ${isWave ? 'rgba(21,112,239,0.35)' : 'rgba(249,115,22,0.35)'}`,
            marginBottom: 10 }}>
          Continuer →
        </button>

        <button onClick={() => setStep(2)}
          style={{ width: '100%', padding: '11px', borderRadius: 12,
            border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b',
            fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          ← Retour aux instructions
        </button>
      </>
    )
  }

  /* ── ÉTAPE 4 : Confirmation WhatsApp ── */
  const StepWhatsApp = () => (
    <>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px',
          background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          border: '2px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={32} color="#16a34a"/>
        </div>
        <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
          Paiement effectué ?
        </div>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>
          Envoyez la confirmation sur WhatsApp.<br/>
          Votre abonnement sera activé sous <strong>24h</strong>.
        </p>
      </div>

      {/* Récap */}
      <div style={{ padding: '14px 16px', borderRadius: 14,
        background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 20 }}>
        {[
          { l: 'Email',     v: email },
          { l: 'Plan',      v: plan.name },
          { l: 'Montant',   v: `${plan.price} FCFA` },
          { l: 'Méthode',   v: label },
          { l: 'Référence', v: ref },
        ].map(({ l, v }) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: 13, paddingBottom: 8, marginBottom: 8,
            borderBottom: l !== 'Référence' ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>{l}</span>
            <span style={{ color: '#0f172a', fontWeight: 800,
              fontFamily: l === 'Référence' ? 'monospace' : 'inherit',
            wordBreak: l === 'Email' ? 'break-all' : 'normal' }}>{v}</span>
          </div>
        ))}
      </div>

      <a href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '15px', borderRadius: 14,
          background: '#25D366', color: 'white', fontWeight: 800, fontSize: 15,
          textDecoration: 'none', boxSizing: 'border-box',
          boxShadow: '0 6px 20px rgba(37,211,102,0.40)', marginBottom: 10 }}>
        <MessageCircle size={18}/>
        Envoyer sur WhatsApp
      </a>

      <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center',
        lineHeight: 1.6, marginBottom: 12 }}>
        Le message est pré-rempli. <strong style={{ color: '#475569' }}>
        Ajoutez votre email</strong> et <strong style={{ color: '#475569' }}>
        attachez la capture</strong> avant d'envoyer.
      </div>

      <button onClick={onClose}
        style={{ width: '100%', padding: '11px', borderRadius: 12,
          border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b',
          fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        Fermer
      </button>
    </>
  )

  /* ── Render ── */
  const titles = ['Mode de paiement', 'Instructions', 'Votre email', 'Confirmation']

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center', padding: isMobile ? 0 : 24,
        background: 'rgba(15,23,42,0.60)', backdropFilter: 'blur(8px)' }}>

      <div style={{ background: 'white', width: '100%', maxWidth: isMobile ? '100%' : 430,
        maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto',
        borderRadius: isMobile ? '24px 24px 0 0' : 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '16px 20px 12px' : '20px 24px 12px',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ height: 7, borderRadius: 999, transition: 'all .3s',
                width: step === n ? 20 : 7,
                background: n <= step ? '#22c55e' : '#e2e8f0' }}/>
            ))}
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginLeft: 4 }}>
              {titles[step - 1]}
            </span>
          </div>

          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, border: 'none',
              background: '#f1f5f9', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
            <X size={15}/>
          </button>
        </div>

        {/* Contenu */}
        <div style={{ padding: isMobile ? '20px 20px 28px' : '20px 24px 24px' }}>
          {step === 1 && <StepChoix/>}
          {step === 2 && <StepInstructions/>}
          {step === 3 && <StepEmail/>}
          {step === 4 && <StepWhatsApp/>}
        </div>
      </div>
    </div>
  )
}
