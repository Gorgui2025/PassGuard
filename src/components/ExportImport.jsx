import { useState, useRef } from 'react'
import { Download, Upload, FileText, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { encrypt, decrypt } from '../utils/crypto'
import { supabase } from '../supabase'

const G = 'linear-gradient(135deg,#22c55e,#15803d)'
const O = 'linear-gradient(135deg,#f59e0b,#b45309)'

export default function ExportImport({ passwords, onImported }) {
  const { user, masterPassword } = useAuth()
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState(null)  // { added, skipped }
  const [importError, setImportError]   = useState('')
  const fileRef = useRef(null)

  /* ── EXPORT JSON chiffré ── */
  const exportJSON = () => {
    setExporting(true)
    try {
      const payload = passwords.map(p => ({
        site: p.site,
        username: p.username,
        password: decrypt(p.password_enc, masterPassword),
        category: p.category,
        notes: p.notes,
        created_at: p.created_at,
      }))
      const encrypted = encrypt(JSON.stringify(payload), masterPassword)
      const blob = new Blob([JSON.stringify({ version:1, data: encrypted })],
        { type:'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `passguard-backup-${new Date().toISOString().slice(0,10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silencieux
    }
    setExporting(false)
  }

  /* ── EXPORT CSV (lisible) ── */
  const exportCSV = () => {
    const rows = [['Site','Identifiant','Mot de passe','Catégorie','Notes']]
    passwords.forEach(p => {
      rows.push([
        p.site || '',
        p.username || '',
        decrypt(p.password_enc, masterPassword),
        p.category || '',
        (p.notes || '').replace(/\n/g,' '),
      ])
    })
    const csv  = rows.map(r => r.map(v => `"${v.replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type:'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `passguard-export-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── IMPORT JSON chiffré ── */
  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(''); setImportResult(null); setImporting(true)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)

      if (!parsed?.data) throw new Error('Format de fichier invalide.')

      const decrypted = decrypt(parsed.data, masterPassword)
      if (!decrypted) throw new Error('Mot de passe maître incorrect ou fichier corrompu.')

      const entries = JSON.parse(decrypted)
      if (!Array.isArray(entries)) throw new Error('Contenu du fichier invalide.')

      let added = 0, skipped = 0
      for (const entry of entries) {
        if (!entry.site || !entry.password) { skipped++; continue }
        const { error } = await supabase.from('passwords').insert({
          site:         entry.site,
          username:     entry.username || '',
          password_enc: encrypt(entry.password, masterPassword),
          category:     entry.category || 'autres',
          notes:        entry.notes || '',
          user_id:      user.id,
          created_at:   new Date().toISOString(),
          updated_at:   new Date().toISOString(),
        })
        if (error) skipped++
        else added++
      }

      setImportResult({ added, skipped })
      if (added > 0) onImported()

    } catch (err) {
      setImportError(err.message || 'Erreur lors de l\'import.')
    }

    setImporting(false)
    e.target.value = ''
  }

  const Card = ({ children, grad, border, bg }) => (
    <div style={{ borderRadius:18, overflow:'hidden',
      border: `1px solid ${border}`, background: bg,
      boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
      {children}
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Section Export */}
      <div style={{ fontSize:11, fontWeight:800, color:'#475569', textTransform:'uppercase',
        letterSpacing:1.5, marginBottom:4 }}>Exporter</div>

      {/* Export JSON chiffré */}
      <Card border="#bbf7d0" bg="linear-gradient(135deg,#f0fdf4,#dcfce7)">
        <div style={{ padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:G, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 10px rgba(34,197,94,0.28)' }}>
              <Shield size={18} color="white"/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:'#15803d' }}>Sauvegarde chiffrée (.json)</div>
              <div style={{ fontSize:12, color:'#16a34a', marginTop:3, lineHeight:1.6 }}>
                Chiffré avec votre mot de passe maître. Seul vous pouvez le déchiffrer.
                Idéal pour migrer vers un autre appareil.
              </div>
            </div>
          </div>
          <button onClick={exportJSON} disabled={exporting || passwords.length === 0}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 18px',
              borderRadius:12, border:'none', background:G, color:'white',
              fontWeight:700, fontSize:13, cursor: passwords.length === 0 ? 'not-allowed' : 'pointer',
              opacity: passwords.length === 0 ? 0.5 : 1,
              boxShadow:'0 4px 14px rgba(34,197,94,0.30)' }}>
            <Download size={15}/> {exporting ? 'Export…' : `Exporter ${passwords.length} entrée${passwords.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </Card>

      {/* Export CSV */}
      <Card border="#fde68a" bg="linear-gradient(135deg,#fffbeb,#fef9ee)">
        <div style={{ padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:O, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 10px rgba(217,119,6,0.28)' }}>
              <FileText size={18} color="white"/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:'#b45309' }}>Export tableur (.csv)</div>
              <div style={{ fontSize:12, color:'#d97706', marginTop:3, lineHeight:1.6 }}>
                Non chiffré — lisible dans Excel ou Google Sheets. À stocker en lieu sûr.
              </div>
            </div>
          </div>
          <button onClick={exportCSV} disabled={passwords.length === 0}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 18px',
              borderRadius:12, border:'none', background:O, color:'white',
              fontWeight:700, fontSize:13, cursor: passwords.length === 0 ? 'not-allowed' : 'pointer',
              opacity: passwords.length === 0 ? 0.5 : 1,
              boxShadow:'0 4px 14px rgba(217,119,6,0.28)' }}>
            <Download size={15}/> Exporter en CSV
          </button>
        </div>
      </Card>

      {/* Section Import */}
      <div style={{ fontSize:11, fontWeight:800, color:'#475569', textTransform:'uppercase',
        letterSpacing:1.5, marginTop:8, marginBottom:4 }}>Importer</div>

      <Card border="#e2e8f0" bg="white">
        <div style={{ padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#4f46e5)',
              flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 10px rgba(99,102,241,0.28)' }}>
              <Upload size={18} color="white"/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:'#1e293b' }}>Restaurer une sauvegarde</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:3, lineHeight:1.6 }}>
                Importez un fichier .json exporté depuis PassGuard.
                Votre mot de passe maître actuel sera utilisé pour déchiffrer.
              </div>
            </div>
          </div>

          <input ref={fileRef} type="file" accept=".json"
            onChange={handleImport} style={{ display:'none' }}/>
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 18px',
              borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc',
              color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer',
              opacity: importing ? 0.7 : 1 }}>
            <Upload size={15}/> {importing ? 'Import en cours…' : 'Choisir un fichier .json'}
          </button>

          {/* Résultat import */}
          {importResult && (
            <div style={{ marginTop:14, padding:'12px 14px', borderRadius:12,
              background:'#f0fdf4', border:'1px solid #bbf7d0',
              display:'flex', alignItems:'center', gap:8 }}>
              <CheckCircle2 size={16} color="#16a34a"/>
              <span style={{ fontSize:13, color:'#15803d', fontWeight:600 }}>
                {importResult.added} entrée{importResult.added > 1 ? 's' : ''} importée{importResult.added > 1 ? 's' : ''}
                {importResult.skipped > 0 && ` · ${importResult.skipped} ignorée${importResult.skipped > 1 ? 's' : ''}`}
              </span>
            </div>
          )}

          {importError && (
            <div style={{ marginTop:14, padding:'12px 14px', borderRadius:12,
              background:'#fef2f2', border:'1px solid #fecaca',
              display:'flex', alignItems:'flex-start', gap:8 }}>
              <AlertTriangle size={15} color="#ef4444" style={{ flexShrink:0, marginTop:1 }}/>
              <span style={{ fontSize:13, color:'#dc2626', fontWeight:500 }}>{importError}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
