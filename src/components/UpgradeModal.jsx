import { useNavigate } from 'react-router-dom'
import { X, Zap, CheckCircle2, Lock } from 'lucide-react'

const G  = 'linear-gradient(135deg,#22c55e,#15803d)'
const O  = 'linear-gradient(135deg,#f59e0b,#b45309)'
const GO = 'linear-gradient(135deg,#22c55e,#d97706)'

export default function UpgradeModal({ onClose, current, limit }) {
  const navigate = useNavigate()

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center',
        justifyContent:'center', padding:24,
        background:'rgba(15,23,42,0.60)', backdropFilter:'blur(10px)' }}>

      <div style={{ background:'white', borderRadius:24, width:'100%', maxWidth:420,
        boxShadow:'0 32px 80px rgba(0,0,0,0.22)', overflow:'hidden',
        animation:'pgFadeIn .22s ease' }}>

        {/* Header dégradé */}
        <div style={{ background:GO, padding:'28px 28px 24px', position:'relative' }}>
          <button onClick={onClose}
            style={{ position:'absolute', top:16, right:16, width:30, height:30, borderRadius:8,
              border:'none', background:'rgba(255,255,255,0.20)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
            <X size={14}/>
          </button>
          <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.20)',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
            <Lock size={26} color="white" strokeWidth={2}/>
          </div>
          <h2 style={{ fontSize:20, fontWeight:900, color:'white', marginBottom:6 }}>
            Limite atteinte
          </h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.85)', lineHeight:1.6 }}>
            Vous avez atteint la limite de <strong>{limit} entrées</strong> du plan gratuit
            ({current}/{limit}).
          </p>
        </div>

        <div style={{ padding:'24px 28px 28px' }}>

          {/* Progress bar */}
          <div style={{ marginBottom:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#475569' }}>Utilisation</span>
              <span style={{ fontSize:12, fontWeight:800, color:'#ef4444' }}>{current}/{limit}</span>
            </div>
            <div style={{ height:8, borderRadius:999, background:'#f1f5f9', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:999,
                background:'linear-gradient(90deg,#22c55e,#ef4444)',
                width:`${Math.min((current/limit)*100, 100)}%`,
                transition:'width .4s ease' }}/>
            </div>
          </div>

          {/* Avantages Pro */}
          <div style={{ padding:'16px', borderRadius:16, background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
            border:'1px solid #bbf7d0', marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:900, color:'#16a34a', textTransform:'uppercase',
              letterSpacing:1.5, marginBottom:12 }}>Plan Pro — 1 500 FCFA/mois</div>
            {[
              'Entrées illimitées',
              'Multi-appareils illimités',
              'Export / Import sécurisé',
              'Historique des modifications',
              'Support prioritaire',
            ].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <CheckCircle2 size={14} color="#16a34a"/>
                <span style={{ fontSize:13, color:'#475569', fontWeight:500 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button onClick={() => { navigate('/#tarifs'); onClose() }}
              style={{ padding:'14px', borderRadius:14, border:'none', background:G,
                color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 8px 24px rgba(34,197,94,0.35)' }}>
              <Zap size={16}/> Passer au plan Pro
            </button>
            <button onClick={onClose}
              style={{ padding:'13px', borderRadius:14, border:'1.5px solid #e2e8f0',
                background:'#f8fafc', color:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Continuer sans mettre à jour
            </button>
          </div>

          <p style={{ textAlign:'center', fontSize:11, color:'#94a3b8', marginTop:14 }}>
            Sans engagement · Paiement Wave & Orange Money
          </p>
        </div>
      </div>
    </div>
  )
}
