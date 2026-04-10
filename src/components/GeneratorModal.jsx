import { useState, useCallback } from 'react'
import { X, Copy, RefreshCw, CheckCheck, Key } from 'lucide-react'
import { generatePassword, passwordStrength } from '../utils/crypto'
import useBreakpoint from '../hooks/useBreakpoint'

const G = 'linear-gradient(135deg,#22c55e,#15803d)'
const O = 'linear-gradient(135deg,#f59e0b,#b45309)'

const STRENGTH_BARS = {
  'Très faible': { bars:1, color:'#ef4444' },
  'Faible':      { bars:2, color:'#f97316' },
  'Moyen':       { bars:3, color:'#eab308' },
  'Fort':        { bars:4, color:'#22c55e' },
  'Très fort':   { bars:5, color:'#16a34a' },
}

export default function GeneratorModal({ onClose, onUse }) {
  const { isMobile } = useBreakpoint()
  const [length, setLength]   = useState(16)
  const [uppercase, setUpper] = useState(true)
  const [lowercase, setLower] = useState(true)
  const [numbers, setNums]    = useState(true)
  const [symbols, setSyms]    = useState(true)
  const [copied, setCopied]   = useState(false)
  const [pwd, setPwd]         = useState(() =>
    generatePassword(16, { uppercase:true, lowercase:true, numbers:true, symbols:true })
  )

  const generate = useCallback(() => {
    if (!uppercase && !lowercase && !numbers && !symbols) return
    setPwd(generatePassword(length, { uppercase, lowercase, numbers, symbols }))
    setCopied(false)
  }, [length, uppercase, lowercase, numbers, symbols])

  const copy = () => {
    navigator.clipboard.writeText(pwd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength    = passwordStrength(pwd)
  const strengthCfg = STRENGTH_BARS[strength.label] || STRENGTH_BARS['Moyen']

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize:11, fontWeight:800, color:'#475569', textTransform:'uppercase',
      letterSpacing:1.5, marginBottom:10 }}>{children}</div>
  )

  const Toggle = ({ label, checked, onChange }) => (
    <button type="button" onClick={onChange}
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 14px', borderRadius:12,
        border: checked ? 'none' : '1.5px solid #e2e8f0',
        background: checked ? G : '#f8fafc',
        color: checked ? 'white' : '#334155',
        fontSize:13, fontWeight:700, cursor:'pointer', width:'100%',
        boxShadow: checked ? '0 4px 12px rgba(34,197,94,0.28)' : 'none',
        transition:'all .15s' }}>
      <span>{label}</span>
      <div style={{ width:32, height:18, borderRadius:999, position:'relative', flexShrink:0, marginLeft:8,
        background: checked ? 'rgba(255,255,255,0.30)' : '#cbd5e1', transition:'background .2s' }}>
        <div style={{ position:'absolute', top:3, width:12, height:12, borderRadius:'50%', transition:'all .2s',
          background: checked ? 'white' : '#64748b',
          right: checked ? 3 : 'auto', left: checked ? 'auto' : 3 }}/>
      </div>
    </button>
  )

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
    maxWidth: isMobile ? '100%' : 390,
    maxHeight: isMobile ? '88vh' : '90vh',
    overflowY: isMobile ? 'auto' : 'hidden',
    boxShadow:'0 -4px 40px rgba(0,0,0,0.18)',
    borderRadius: isMobile ? '20px 20px 0 0' : 24,
    animation: isMobile ? 'pgSlideUp .28s ease' : 'pgFadeIn .2s ease',
    paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 16px)' : 0,
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={overlayStyle}>
      <div style={cardStyle}>

        {/* Drag handle (mobile) */}
        {isMobile && (
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
            <div style={{ width:36, height:4, borderRadius:999, background:'#e2e8f0' }}/>
          </div>
        )}

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: isMobile ? '8px 20px 14px' : '20px 24px 14px',
          borderBottom:'1px solid #f0fdf4' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:O,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 14px rgba(217,119,6,0.35)' }}>
              <Key size={17} color="white" strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ fontWeight:900, color:'#0f172a', fontSize:15 }}>Générateur</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>Mot de passe sécurisé</div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ width:32, height:32, borderRadius:10, border:'none', background:'#f1f5f9',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}
            onMouseEnter={e => e.currentTarget.style.background='#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background='#f1f5f9'}>
            <X size={15}/>
          </button>
        </div>

        <div style={{ padding: isMobile ? '16px 20px 28px' : '20px 24px 24px',
          display:'flex', flexDirection:'column', gap:18 }}>

          {/* Affichage mot de passe */}
          <div style={{ borderRadius:16, padding:'16px', border:'1px solid #bbf7d0',
            background:'linear-gradient(135deg,#f0fdf4,#fef9ee)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <p style={{ flex:1, fontFamily:'monospace', color:'#1e293b', fontSize:13,
                wordBreak:'break-all', lineHeight:1.7, margin:0, fontWeight:600 }}>{pwd}</p>
              <button onClick={generate}
                style={{ width:34, height:34, borderRadius:10, border:'1px solid #bbf7d0',
                  background:'white', cursor:'pointer', display:'flex', alignItems:'center',
                  justifyContent:'center', color:'#16a34a', flexShrink:0 }}
                onMouseEnter={e => e.currentTarget.style.background='#f0fdf4'}
                onMouseLeave={e => e.currentTarget.style.background='white'}>
                <RefreshCw size={14}/>
              </button>
            </div>
            {/* Barres */}
            <div style={{ marginTop:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:'#475569', fontWeight:700 }}>Force</span>
                <span style={{ fontSize:11, fontWeight:900, color:strengthCfg.color }}>{strength.label}</span>
              </div>
              <div style={{ display:'flex', gap:4 }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ flex:1, height:5, borderRadius:999, transition:'background .3s',
                    background: n <= strengthCfg.bars ? strengthCfg.color : '#e2e8f0' }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Longueur */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <SectionLabel>Longueur</SectionLabel>
              <span style={{ fontSize:13, fontWeight:900, padding:'3px 10px', borderRadius:8,
                background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>
                {length} car.
              </span>
            </div>
            <input type="range" min={8} max={32} value={length}
              onChange={e => { setLength(Number(e.target.value)); generate() }}
              style={{ width:'100%', cursor:'pointer', accentColor:'#22c55e' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>8</span>
              <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>32</span>
            </div>
          </div>

          {/* Options */}
          <div>
            <SectionLabel>Options</SectionLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <Toggle label="Majuscules" checked={uppercase} onChange={() => { setUpper(!uppercase); generate() }}/>
              <Toggle label="Minuscules" checked={lowercase} onChange={() => { setLower(!lowercase); generate() }}/>
              <Toggle label="Chiffres"   checked={numbers}   onChange={() => { setNums(!numbers);   generate() }}/>
              <Toggle label="Symboles"   checked={symbols}   onChange={() => { setSyms(!symbols);   generate() }}/>
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={copy}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                padding:'13px', borderRadius:14, fontSize:13, fontWeight:700, cursor:'pointer',
                ...(copied
                  ? { background:G, color:'white', border:'none', boxShadow:'0 4px 16px rgba(34,197,94,0.40)' }
                  : { background:'#f0fdf4', color:'#16a34a', border:'1.5px solid #bbf7d0' })
              }}>
              {copied ? <CheckCheck size={15}/> : <Copy size={15}/>}
              {copied ? 'Copié !' : 'Copier'}
            </button>
            {onUse && (
              <button onClick={() => { onUse(pwd); onClose() }}
                style={{ flex:1, padding:'13px', borderRadius:14, border:'none', background:O,
                  color:'white', fontWeight:700, fontSize:13, cursor:'pointer',
                  boxShadow:'0 4px 16px rgba(217,119,6,0.40)' }}>
                Utiliser
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
