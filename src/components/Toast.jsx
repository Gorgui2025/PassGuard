import { useEffect } from 'react'
import { CheckCheck, AlertTriangle, Info, X } from 'lucide-react'

export default function Toast({ toasts, onRemove }) {
  return (
    <div style={{ position:'fixed', top:20, right:20, zIndex:300,
      display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove}/>
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3200)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  const cfg = {
    success: { bg:'#f0fdf4', border:'#bbf7d0', icon:<CheckCheck size={14} color="#16a34a"/>, iconBg:'#dcfce7' },
    error:   { bg:'#fef2f2', border:'#fecaca', icon:<AlertTriangle size={14} color="#ef4444"/>, iconBg:'#fee2e2' },
    info:    { bg:'#f8fafc', border:'#e2e8f0', icon:<Info size={14} color="#64748b"/>,         iconBg:'#f1f5f9' },
  }[toast.type || 'success']

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, padding:'12px 14px 12px 12px',
      borderRadius:14, background:cfg.bg, border:`1px solid ${cfg.border}`,
      boxShadow:'0 8px 32px rgba(0,0,0,0.10)', pointerEvents:'all',
      minWidth:240, maxWidth:320, animation:'pgSlideIn .22s ease',
    }}>
      <div style={{ width:28, height:28, borderRadius:8, background:cfg.iconBg,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {cfg.icon}
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:'#1e293b', flex:1, lineHeight:1.4 }}>
        {toast.message}
      </span>
      <button onClick={() => onRemove(toast.id)}
        style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8',
          display:'flex', alignItems:'center', padding:2, flexShrink:0 }}>
        <X size={13}/>
      </button>
    </div>
  )
}
