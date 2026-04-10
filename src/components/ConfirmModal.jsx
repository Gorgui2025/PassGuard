import { Trash2 } from 'lucide-react'
import useBreakpoint from '../hooks/useBreakpoint'

export default function ConfirmModal({ site, onConfirm, onCancel }) {
  const { isMobile } = useBreakpoint()

  const overlayStyle = {
    position:'fixed', inset:0, zIndex:210,
    display:'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: isMobile ? 'stretch' : 'center',
    padding: isMobile ? 0 : 24,
    background:'rgba(15,23,42,0.55)', backdropFilter:'blur(8px)',
  }
  const cardStyle = {
    background:'white',
    width:'100%',
    maxWidth: isMobile ? '100%' : 380,
    padding: isMobile ? '0 24px 32px' : '28px',
    boxShadow:'0 -4px 40px rgba(0,0,0,0.18)',
    borderRadius: isMobile ? '20px 20px 0 0' : 24,
    animation: isMobile ? 'pgSlideUp .25s ease' : 'pgFadeIn .2s ease',
    paddingBottom: isMobile ? 'max(32px, env(safe-area-inset-bottom, 32px))' : '28px',
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onCancel()} style={overlayStyle}>
      <div style={cardStyle}>

        {/* Drag handle (mobile) */}
        {isMobile && (
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 16px' }}>
            <div style={{ width:36, height:4, borderRadius:999, background:'#e2e8f0' }}/>
          </div>
        )}

        {/* Icône */}
        <div style={{ width:52, height:52, borderRadius:16, background:'#fef2f2',
          display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
          <Trash2 size={24} color="#ef4444"/>
        </div>

        <h2 style={{ fontSize:17, fontWeight:900, color:'#0f172a', margin:'0 0 8px' }}>
          Supprimer cette entrée ?
        </h2>
        <p style={{ fontSize:13, color:'#64748b', margin:'0 0 8px', lineHeight:1.65 }}>
          Vous êtes sur le point de supprimer
        </p>
        <div style={{ padding:'10px 14px', borderRadius:12, background:'#fef2f2',
          border:'1px solid #fecaca', marginBottom:18 }}>
          <span style={{ fontSize:14, fontWeight:800, color:'#dc2626' }}>« {site} »</span>
        </div>
        <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 22px', lineHeight:1.6 }}>
          Cette action est <strong style={{ color:'#64748b' }}>irréversible</strong>. Le mot de passe sera définitivement supprimé.
        </p>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel}
            style={{ flex:1, padding:'13px', borderRadius:14, border:'1.5px solid #e2e8f0',
              background:'#f8fafc', color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background='#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background='#f8fafc'}>
            Annuler
          </button>
          <button onClick={onConfirm}
            style={{ flex:1, padding:'13px', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white',
              fontWeight:700, fontSize:13, cursor:'pointer',
              boxShadow:'0 4px 14px rgba(239,68,68,0.38)' }}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
