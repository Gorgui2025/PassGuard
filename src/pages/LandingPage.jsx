import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock, Smartphone, Globe, Zap, Users, Briefcase,
  CheckCircle2, ArrowRight, Star, ChevronDown, Menu, X,
  Eye, Copy, Key, RefreshCw, Shield, Cpu, Cloud,
} from 'lucide-react'
import VaultLogo from '../components/VaultLogo'
import PaymentModal from '../components/PaymentModal'

const G   = 'linear-gradient(135deg,#22c55e,#15803d)'
const GO  = 'linear-gradient(135deg,#22c55e,#d97706)'
const O   = 'linear-gradient(135deg,#f59e0b,#b45309)'
const BG  = 'linear-gradient(160deg,#f0fdf4 0%,#fefce8 50%,#fff7ed 100%)'

/* ── utilitaire breakpoint ── */
function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

const FEATURES = [
  { icon:Lock,       title:'Chiffrement AES-256',       desc:'Vos mots de passe sont chiffrés localement. Personne — pas même nous — ne peut y accéder.',        color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  { icon:Smartphone, title:'Multi-appareils',           desc:'Accédez à votre coffre depuis votre téléphone, tablette ou ordinateur, en temps réel.',            color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
  { icon:Zap,        title:'Générateur intégré',        desc:'Créez instantanément des mots de passe forts et uniques pour chaque compte.',                      color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' },
  { icon:Globe,      title:'Conçu pour l\'Afrique',     desc:'Paiement Wave, Orange Money, Free Money. Interface pensée pour le contexte africain.',             color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  { icon:Eye,        title:'Zéro connaissance',         desc:'Architecture Zero-Knowledge : vos données sont illisibles côté serveur, même en cas de fuite.',    color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0' },
  { icon:Cloud,      title:'Sauvegarde automatique',    desc:'Synchronisation sécurisée en temps réel. Vos entrées sont toujours disponibles et à jour.',        color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
]

const PLANS = [
  {
    id:'free', name:'Gratuit', price:'0', period:'pour toujours', popular:false,
    color:'#64748b', grad:'linear-gradient(135deg,#f8fafc,#f1f5f9)', border:'#e2e8f0',
    btnBg:'#f1f5f9', btnColor:'#475569', btnBorder:'1.5px solid #e2e8f0',
    features:[
      'Jusqu\'à 10 entrées',
      '1 appareil uniquement',
      'Générateur de mots de passe',
      'Chiffrement AES-256',
      'Interface en français',
    ],
    missing:['Multi-appareils','Export / Import','Support prioritaire'],
  },
  {
    id:'pro', name:'Pro', price:'1 500', period:'FCFA / mois', popular:true,
    sub:'ou 12 000 FCFA/an (économisez 18 000 FCFA)',
    color:'#15803d', grad:G, border:'transparent',
    btnBg:'white', btnColor:'#15803d', btnBorder:'none',
    features:[
      'Entrées illimitées',
      'Multi-appareils illimités',
      'Générateur de mots de passe',
      'Chiffrement AES-256',
      'Export / Import sécurisé',
      'Historique des modifications',
      'Support prioritaire',
    ],
    missing:[],
  },
  {
    id:'famille', name:'Famille', price:'3 500', period:'FCFA / mois', popular:false,
    color:'#d97706', grad:O, border:'transparent',
    btnBg:'white', btnColor:'#b45309', btnBorder:'none',
    features:[
      'Jusqu\'à 5 membres',
      'Coffre partagé famille',
      'Gestion par le chef de famille',
      'Toutes les fonctions Pro',
      'Multi-appareils illimités',
      'Support prioritaire',
    ],
    missing:[],
  },
  {
    id:'business', name:'Business', price:'3 000', period:'FCFA / utilisateur / mois', popular:false,
    sub:'Minimum 5 utilisateurs — 15 000 FCFA/mois',
    color:'#0f172a', grad:'linear-gradient(135deg,#1e293b,#0f172a)', border:'transparent',
    btnBg:'white', btnColor:'#0f172a', btnBorder:'none',
    features:[
      'Espace équipe dédié',
      'Tableau de bord équipe',
      'Invitations par email',
      'Rôles Owner / Membre',
      'Toutes les fonctions Pro',
      'Support WhatsApp prioritaire',
    ],
    missing:[
      'Coffre partagé (bientôt)',
      'Audit de sécurité (bientôt)',
    ],
  },
]

const PAYMENTS = [
  { name:'Wave',         color:'#2563eb', bg:'#eff6ff', logo:'🌊', available:true  },
  { name:'Orange Money', color:'#ea580c', bg:'#fff7ed', logo:'🟠', available:true  },
  { name:'Free Money',   color:'#dc2626', bg:'#fef2f2', logo:'🔴', available:false },
  { name:'MTN MoMo',     color:'#ca8a04', bg:'#fefce8', logo:'📱', available:false },
  { name:'Stripe',       color:'#6366f1', bg:'#eef2ff', logo:'💳', available:false },
  { name:'PayPal',       color:'#1d4ed8', bg:'#eff6ff', logo:'🅿️', available:false },
]

const TESTIMONIALS = [
  { name:'Aminata D.',  role:'Freelance, Dakar',         text:'Enfin un gestionnaire de mots de passe qui accepte Wave ! Simple, rapide, sécurisé.', stars:5 },
  { name:'Kofi A.',     role:'Entrepreneur, Abidjan',    text:'L\'interface est claire, les prix sont raisonnables. Je l\'ai recommandé à toute mon équipe.', stars:5 },
  { name:'Ibrahim S.',  role:'Développeur, Bamako',      text:'Le chiffrement AES-256 côté client me donne confiance. C\'est rare de voir ça expliqué clairement.', stars:5 },
]

const FAQS = [
  { q:'Que se passe-t-il si j\'oublie mon mot de passe maître ?', a:'Pour des raisons de sécurité, votre mot de passe maître n\'est jamais stocké sur nos serveurs. Si vous le perdez, vos données chiffrées deviennent inaccessibles. Nous recommandons de le noter sur papier et de le conserver en lieu sûr.' },
  { q:'Mes mots de passe sont-ils vraiment en sécurité ?', a:'Oui. Le chiffrement AES-256 est effectué sur votre appareil avant que les données soient envoyées à nos serveurs. Même en cas de fuite, les données sont illisibles sans votre mot de passe maître.' },
  { q:'Puis-je changer de plan à tout moment ?', a:'Oui, vous pouvez passer d\'un plan à l\'autre à n\'importe quel moment. La différence est calculée au prorata.' },
  { q:'Y a-t-il une application mobile ?', a:'L\'application web est optimisée pour mobile et fonctionne comme une appli native. Une application iOS et Android est en cours de développement.' },
  { q:'Comment fonctionne le paiement par Wave ou Orange Money ?', a:'Vous recevez une demande de paiement sur votre numéro mobile money. Une fois validé, votre plan est activé immédiatement.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const width    = useWidth()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const [menuOpen, setMenuOpen]         = useState(false)
  const [openFaq, setOpenFaq]           = useState(null)
  const [billingAnnual, setBillingAnnual] = useState(false)
  const [paymentPlan, setPaymentPlan]   = useState(null)

  // Inject styles
  useEffect(() => {
    if (document.getElementById('lp-styles')) return
    const s = document.createElement('style')
    s.id = 'lp-styles'
    s.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0 }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif }
      @keyframes lpFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes lpFade  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes lpGlow  { 0%,100%{box-shadow:0 0 30px rgba(34,197,94,0.20)} 50%{box-shadow:0 0 60px rgba(34,197,94,0.40)} }
      .lp-fade { animation: lpFade .6s ease forwards }
      .lp-float { animation: lpFloat 3s ease-in-out infinite }
      .lp-glow  { animation: lpGlow  3s ease-in-out infinite }
      .lp-hover-lift { transition: transform .2s, box-shadow .2s }
      .lp-hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.12) !important }
      .lp-link { color: #475569; text-decoration: none; font-weight: 600; font-size: 14px; transition: color .15s }
      .lp-link:hover { color: #16a34a }
      ::-webkit-scrollbar { width: 4px }
      ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px }
    `
    document.head.appendChild(s)
  }, [])

  const proMonthly  = 1500
  const proAnnual   = Math.round(12000 / 12)
  const famMonthly  = 3500
  const famAnnual   = Math.round((3500 * 12 * 0.8) / 12)

  const Section = ({ id, children, bg, style = {} }) => (
    <section id={id} style={{ padding: isMobile ? '60px 20px' : '90px 40px', background: bg || 'transparent', ...style }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>{children}</div>
    </section>
  )

  const SectionBadge = ({ children, color = '#16a34a', bg = '#f0fdf4' }) => (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px',
      borderRadius:999, background:bg, border:`1px solid ${color}22`,
      fontSize:11, fontWeight:800, color, textTransform:'uppercase', letterSpacing:1.5,
      marginBottom:16 }}>
      {children}
    </div>
  )

  const SectionTitle = ({ children, center = true }) => (
    <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight:900, color:'#0f172a',
      lineHeight:1.2, textAlign: center ? 'center' : 'left', marginBottom:12 }}>
      {children}
    </h2>
  )

  const SectionSub = ({ children }) => (
    <p style={{ fontSize: isMobile ? 15 : 17, color:'#64748b', lineHeight:1.7,
      textAlign:'center', maxWidth:600, margin:'0 auto 52px' }}>
      {children}
    </p>
  )

  /* ════════════════════════════════════
     NAV
  ════════════════════════════════════ */
  const Nav = () => (
    <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.95)',
      backdropFilter:'blur(16px)', borderBottom:'1px solid #f0fdf4',
      padding: isMobile ? '14px 20px' : '16px 40px' }}>
      <div style={{ maxWidth:1140, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <VaultLogo size={36} gradient={true}/>
          <span style={{ fontSize:18, fontWeight:900, background:GO,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PassGuard</span>
        </div>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            <a href="#fonctionnalites" className="lp-link">Fonctionnalités</a>
            <a href="#tarifs"          className="lp-link">Tarifs</a>
            <a href="#faq"             className="lp-link">FAQ</a>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {!isMobile && (
            <button onClick={() => navigate('/login')}
              style={{ padding:'9px 20px', borderRadius:12, border:'1.5px solid #e2e8f0',
                background:'white', color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Se connecter
            </button>
          )}
          <button onClick={() => navigate('/login')}
            style={{ padding:'9px 20px', borderRadius:12, border:'none', background:G,
              color:'white', fontWeight:700, fontSize:13, cursor:'pointer',
              boxShadow:'0 4px 14px rgba(34,197,94,0.35)' }}>
            {isMobile ? 'Démarrer' : 'Essai gratuit'}
          </button>
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ width:36, height:36, borderRadius:10, border:'1.5px solid #e2e8f0',
                background:'white', cursor:'pointer', display:'flex', alignItems:'center',
                justifyContent:'center', color:'#64748b' }}>
              {menuOpen ? <X size={16}/> : <Menu size={16}/>}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ paddingTop:16, paddingBottom:8, borderTop:'1px solid #f0fdf4', marginTop:14,
          display:'flex', flexDirection:'column', gap:4 }}>
          {[['Fonctionnalités','#fonctionnalites'],['Tarifs','#tarifs'],['FAQ','#faq']].map(([label, href]) => (
            <a key={label} href={href} className="lp-link"
              onClick={() => setMenuOpen(false)}
              style={{ padding:'10px 4px', display:'block' }}>{label}</a>
          ))}
          <button onClick={() => navigate('/login')}
            style={{ marginTop:8, padding:'11px', borderRadius:12, border:'1.5px solid #e2e8f0',
              background:'white', color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Se connecter
          </button>
        </div>
      )}
    </nav>
  )

  /* ════════════════════════════════════
     HERO
  ════════════════════════════════════ */
  const Hero = () => (
    <section style={{ background:BG, padding: isMobile ? '60px 20px 80px' : '100px 40px 120px',
      position:'relative', overflow:'hidden' }}>
      {/* Cercles déco */}
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(34,197,94,0.08),transparent 70%)',
        top:-100, right:-100, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(245,158,11,0.07),transparent 70%)',
        bottom:-50, left:-100, pointerEvents:'none' }}/>

      <div style={{ maxWidth:1140, margin:'0 auto', textAlign:'center', position:'relative' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <VaultLogo size={28} gradient={true}/>
          <span style={{ fontSize:11, fontWeight:800, color:'#16a34a', textTransform:'uppercase', letterSpacing:1.5 }}>
            Sécurité de niveau bancaire
          </span>
        </div>

        <h1 style={{ fontSize: isMobile ? 34 : isTablet ? 46 : 60,
          fontWeight:900, color:'#0f172a', lineHeight:1.1,
          marginBottom:24, letterSpacing:-1 }}>
          Protégez vos mots de passe
          <br/>
          <span style={{ background:GO, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            avec confiance
          </span>
        </h1>

        <p style={{ fontSize: isMobile ? 16 : 19, color:'#64748b', lineHeight:1.7,
          maxWidth:580, margin:'0 auto 40px' }}>
          Le gestionnaire de mots de passe conçu pour l'Afrique.
          Chiffrement AES-256, paiement Wave & Orange Money, interface en français.
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:52 }}>
          <button onClick={() => navigate('/login')}
            style={{ display:'flex', alignItems:'center', gap:8, padding: isMobile ? '14px 28px' : '16px 36px',
              borderRadius:16, border:'none', background:G, color:'white',
              fontWeight:800, fontSize: isMobile ? 15 : 16, cursor:'pointer',
              boxShadow:'0 8px 28px rgba(34,197,94,0.40)' }}>
            Commencer gratuitement <ArrowRight size={16}/>
          </button>
          <button
            onClick={() => document.getElementById('tarifs')?.scrollIntoView({ behavior:'smooth' })}
            style={{ display:'flex', alignItems:'center', gap:8, padding: isMobile ? '14px 28px' : '16px 36px',
              borderRadius:16, border:'1.5px solid #e2e8f0', background:'white',
              color:'#475569', fontWeight:700, fontSize: isMobile ? 15 : 16, cursor:'pointer' }}>
            Voir les tarifs
          </button>
        </div>

        {/* Social proof */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {[1,2,3,4,5].map(n => <Star key={n} size={14} fill="#f59e0b" color="#f59e0b"/>)}
            <span style={{ fontSize:13, fontWeight:700, color:'#475569' }}>4.9/5</span>
          </div>
          <div style={{ width:1, height:16, background:'#e2e8f0' }}/>
          <span style={{ fontSize:13, color:'#94a3b8', fontWeight:600 }}>Chiffrement côté client garanti</span>
          <div style={{ width:1, height:16, background:'#e2e8f0' }}/>
          <span style={{ fontSize:13, color:'#94a3b8', fontWeight:600 }}>Aucune carte requise</span>
        </div>

        {/* App mockup */}
        <div className="lp-float" style={{ marginTop:64, display:'inline-block' }}>
          <div className="lp-glow" style={{ background:'white', borderRadius:24,
            padding:20, boxShadow:'0 30px 80px rgba(0,0,0,0.12)',
            border:'1px solid #f0fdf4', maxWidth:360, margin:'0 auto', textAlign:'left' }}>
            {/* Fausse sidebar + contenu */}
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16,
              paddingBottom:12, borderBottom:'1px solid #f0fdf4' }}>
              <VaultLogo size={32} gradient={true}/>
              <div>
                <div style={{ fontWeight:900, fontSize:13, background:GO,
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PassGuard</div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>3 entrées protégées</div>
              </div>
              <div style={{ marginLeft:'auto', width:22, height:22, borderRadius:6,
                background:G, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CheckCircle2 size={12} color="white"/>
              </div>
            </div>
            {[
              { site:'Wave', cat:'banque',   color:'#2563eb', grad:'linear-gradient(135deg,#3b82f6,#2563eb)' },
              { site:'Gmail', cat:'email',   color:'#d97706', grad:'linear-gradient(135deg,#fbbf24,#d97706)' },
              { site:'LinkedIn', cat:'travail', color:'#f59e0b', grad:'linear-gradient(135deg,#fcd34d,#d97706)' },
            ].map(({ site, grad }) => (
              <div key={site} style={{ display:'flex', alignItems:'center', gap:10,
                padding:'10px 0', borderBottom:'1px solid #f8fafc' }}>
                <div style={{ width:36, height:36, borderRadius:11, background:grad, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'white', fontWeight:900, fontSize:14 }}>{site[0]}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{site}</div>
                  <div style={{ fontFamily:'monospace', fontSize:11, color:'#cbd5e1', letterSpacing:2 }}>••••••••••••</div>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  <div style={{ width:26, height:26, borderRadius:8, background:'#f1f5f9',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Copy size={11} color="#94a3b8"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )

  /* ════════════════════════════════════
     STATS BAND
  ════════════════════════════════════ */
  const StatsBand = () => (
    <div style={{ background:'#0f172a', padding: isMobile ? '40px 20px' : '50px 40px' }}>
      <div style={{ maxWidth:1140, margin:'0 auto',
        display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)',
        gap: isMobile ? '32px 20px' : 40, textAlign:'center' }}>
        {[
          { val:'AES-256',    label:'Chiffrement militaire' },
          { val:'0',          label:'Accès serveur à vos données' },
          { val:'6+',         label:'Moyens de paiement' },
          { val:'< 2€',       label:'Plan Pro par mois' },
        ].map(({ val, label }) => (
          <div key={label}>
            <div style={{ fontSize: isMobile ? 28 : 36, fontWeight:900, background:GO,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6 }}>{val}</div>
            <div style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )

  /* ════════════════════════════════════
     FEATURES
  ════════════════════════════════════ */
  const Features = () => (
    <Section id="fonctionnalites" bg="white">
      <div style={{ textAlign:'center' }}>
        <SectionBadge><Cpu size={11}/> Fonctionnalités</SectionBadge>
        <SectionTitle>Tout ce dont vous avez besoin,<br/>rien de superflu</SectionTitle>
        <SectionSub>PassGuard se concentre sur l'essentiel : sécurité maximale, simplicité d'usage, tarifs accessibles.</SectionSub>
      </div>
      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)',
        gap:20 }}>
        {FEATURES.map(({ icon:Icon, title, desc, color, bg, border }) => (
          <div key={title} className="lp-hover-lift"
            style={{ padding:'24px', borderRadius:20, background:bg,
              border:`1px solid ${border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'white',
              display:'flex', alignItems:'center', justifyContent:'center',
              marginBottom:16, boxShadow:`0 4px 14px ${color}28`,
              border:`1px solid ${border}` }}>
              <Icon size={20} color={color} strokeWidth={2}/>
            </div>
            <h3 style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:8 }}>{title}</h3>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7 }}>{desc}</p>
          </div>
        ))}
      </div>
    </Section>
  )

  /* ════════════════════════════════════
     PLANS
  ════════════════════════════════════ */
  const Pricing = () => (
    <Section id="tarifs" bg={BG}>
      <div style={{ textAlign:'center' }}>
        <SectionBadge color="#d97706" bg="#fffbeb"><Key size={11}/> Tarifs</SectionBadge>
        <SectionTitle>Des prix pensés pour l'Afrique</SectionTitle>
        <SectionSub>Jusqu'à 18× moins cher que 1Password. Payez avec Wave, Orange Money ou carte bancaire.</SectionSub>
      </div>

      {/* Toggle annuel / mensuel */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:44 }}>
        <span style={{ fontSize:13, fontWeight:700, color: billingAnnual ? '#94a3b8' : '#0f172a' }}>Mensuel</span>
        <button onClick={() => setBillingAnnual(!billingAnnual)}
          style={{ width:52, height:28, borderRadius:999, border:'none', cursor:'pointer',
            background: billingAnnual ? G : '#e2e8f0', position:'relative', transition:'background .2s' }}>
          <div style={{ position:'absolute', top:4, width:20, height:20, borderRadius:'50%',
            background:'white', transition:'left .2s',
            left: billingAnnual ? 28 : 4, boxShadow:'0 2px 6px rgba(0,0,0,0.15)' }}/>
        </button>
        <span style={{ fontSize:13, fontWeight:700, color: billingAnnual ? '#0f172a' : '#94a3b8' }}>
          Annuel
        </span>
        {billingAnnual && (
          <span style={{ fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:999,
            background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>
            Économisez jusqu'à 33%
          </span>
        )}
      </div>

      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4,1fr)',
        gap: isMobile ? 16 : 20, alignItems:'start' }}>
        {PLANS.map(plan => {
          const displayPrice = plan.id === 'pro' && billingAnnual ? proAnnual
            : plan.id === 'famille' && billingAnnual ? famAnnual
            : plan.price
          const isColored = plan.id !== 'free'
          return (
            <div key={plan.id} className="lp-hover-lift"
              style={{ borderRadius:24, padding: plan.popular ? '0' : '24px',
                background: isColored ? plan.grad : 'white',
                border: plan.popular ? 'none' : `1.5px solid ${plan.border || '#e2e8f0'}`,
                boxShadow: plan.popular ? '0 20px 60px rgba(34,197,94,0.30)' : '0 4px 20px rgba(0,0,0,0.06)',
                position:'relative', overflow:'hidden' }}>

              {/* Badge populaire */}
              {plan.popular && (
                <div style={{ background:'rgba(255,255,255,0.20)', textAlign:'center',
                  padding:'8px', fontSize:11, fontWeight:900, color:'rgba(255,255,255,0.9)',
                  letterSpacing:2, textTransform:'uppercase' }}>
                  ⭐ Le plus populaire
                </div>
              )}

              <div style={{ padding:'24px' }}>
                {/* Nom */}
                <div style={{ fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:2,
                  color: isColored ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginBottom:8 }}>
                  {plan.name}
                </div>

                {/* Prix */}
                <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:4 }}>
                  <span style={{ fontSize: plan.id === 'free' ? 36 : 32, fontWeight:900,
                    color: isColored ? 'white' : '#0f172a' }}>
                    {typeof displayPrice === 'number' ? displayPrice.toLocaleString('fr-FR') : displayPrice}
                  </span>
                  {plan.id !== 'free' && (
                    <span style={{ fontSize:12, color: isColored ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                      fontWeight:600, lineHeight:1.3 }}>
                      FCFA<br/>/{billingAnnual ? 'mois' : 'mois'}
                    </span>
                  )}
                </div>
                {plan.id === 'free' && (
                  <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600, marginBottom:2 }}>pour toujours</div>
                )}
                {plan.sub && (
                  <div style={{ fontSize:11, color: isColored ? 'rgba(255,255,255,0.6)' : '#94a3b8',
                    marginBottom:4, lineHeight:1.5 }}>{plan.sub}</div>
                )}
                {plan.id === 'pro' && billingAnnual && (
                  <div style={{ fontSize:11, fontWeight:800, color: isColored ? 'rgba(255,255,255,0.9)' : '#16a34a',
                    marginBottom:4 }}>12 000 FCFA facturé annuellement</div>
                )}

                <div style={{ height:1, background: isColored ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                  margin:'18px 0' }}/>

                {/* Features */}
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                      <CheckCircle2 size={15} color={ isColored ? 'rgba(255,255,255,0.85)' : '#16a34a' }
                        style={{ flexShrink:0, marginTop:1 }}/>
                      <span style={{ fontSize:13, color: isColored ? 'rgba(255,255,255,0.9)' : '#475569',
                        fontWeight:500, lineHeight:1.4 }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:8, opacity:0.4 }}>
                      <div style={{ width:15, height:15, flexShrink:0, marginTop:1,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ width:10, height:1.5, background:'#94a3b8', borderRadius:999 }}/>
                      </div>
                      <span style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Bouton */}
                <button
                  onClick={() => {
                    if (plan.id === 'free') navigate('/login')
                    else setPaymentPlan(plan)
                  }}
                  style={{ width:'100%', padding:'13px', borderRadius:14, cursor:'pointer',
                    fontWeight:800, fontSize:14, border: plan.btnBorder || 'none',
                    background: isColored ? plan.btnBg : G,
                    color: isColored ? plan.btnColor : 'white',
                    boxShadow: isColored
                      ? (plan.id === 'free' ? 'none' : '0 4px 14px rgba(255,255,255,0.20)')
                      : '0 4px 14px rgba(34,197,94,0.30)',
                    transition:'opacity .15s' }}>
                  {plan.id === 'free' ? 'Démarrer gratuitement' :
                   plan.id === 'business' ? 'Souscrire au Business' : 'Choisir ce plan'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Note comparaison */}
      <div style={{ marginTop:32, textAlign:'center', padding:'16px 24px', borderRadius:16,
        background:'white', border:'1px solid #bbf7d0', display:'inline-block',
        fontSize:13, color:'#64748b', fontWeight:500 }}>
        💡 <strong style={{ color:'#15803d' }}>18× moins cher</strong> que 1Password ·&nbsp;
        <strong style={{ color:'#15803d' }}>8× moins cher</strong> que Dashlane ·&nbsp;
        Paiement mobile money disponible
      </div>
    </Section>
  )

  /* ════════════════════════════════════
     PAIEMENTS
  ════════════════════════════════════ */
  const Payments = () => (
    <Section bg="white">
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <SectionBadge color="#d97706" bg="#fffbeb"><RefreshCw size={11}/> Paiements</SectionBadge>
        <SectionTitle>Payez comme vous voulez</SectionTitle>
        <SectionSub>Nous acceptons tous les moyens de paiement populaires en Afrique de l'Ouest et au-delà.</SectionSub>
      </div>
      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
        gap:14, maxWidth:640, margin:'0 auto' }}>
        {PAYMENTS.map(({ name, color, bg, logo, available }) => (
          <div key={name} className={available ? 'lp-hover-lift' : ''}
            style={{ padding:'18px 16px', borderRadius:18, position:'relative',
              background: available ? bg : '#f8fafc',
              border: available ? `1px solid ${color}20` : '1px solid #e2e8f0',
              textAlign:'center', boxShadow: available ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
              opacity: available ? 1 : 0.55 }}>
            <div style={{ fontSize:28, marginBottom:10,
              filter: available ? 'none' : 'grayscale(1)' }}>{logo}</div>
            <div style={{ fontSize:14, fontWeight:800,
              color: available ? color : '#94a3b8' }}>{name}</div>
            {!available && (
              <div style={{ marginTop:6, display:'inline-block', fontSize:10, fontWeight:800,
                color:'#94a3b8', background:'#e2e8f0', borderRadius:999,
                padding:'2px 8px', letterSpacing:0.5 }}>
                Bientôt
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )

  /* ════════════════════════════════════
     TÉMOIGNAGES
  ════════════════════════════════════ */
  const Testimonials = () => (
    <Section bg={BG}>
      <div style={{ textAlign:'center', marginBottom:44 }}>
        <SectionBadge><Star size={11}/> Témoignages</SectionBadge>
        <SectionTitle>Ils nous font confiance</SectionTitle>
      </div>
      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
        gap:20 }}>
        {TESTIMONIALS.map(({ name, role, text, stars }) => (
          <div key={name} className="lp-hover-lift"
            style={{ padding:'24px', borderRadius:20, background:'white',
              border:'1px solid #f0fdf4', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', gap:2, marginBottom:14 }}>
              {[...Array(stars)].map((_,i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b"/>)}
            </div>
            <p style={{ fontSize:14, color:'#475569', lineHeight:1.75, marginBottom:18,
              fontStyle:'italic' }}>"{text}"</p>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:GO,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'white', fontWeight:900, fontSize:13 }}>
                {name[0]}
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:'#0f172a' }}>{name}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>{role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )

  /* ════════════════════════════════════
     FAQ
  ════════════════════════════════════ */
  const Faq = () => (
    <Section id="faq" bg="white">
      <div style={{ textAlign:'center', marginBottom:44 }}>
        <SectionBadge><Shield size={11}/> FAQ</SectionBadge>
        <SectionTitle>Questions fréquentes</SectionTitle>
      </div>
      <div style={{ maxWidth:720, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
        {FAQS.map(({ q, a }, i) => (
          <div key={i} style={{ borderRadius:16, border:'1.5px solid #f1f5f9',
            background: openFaq === i ? '#f8fafc' : 'white',
            overflow:'hidden', transition:'background .15s' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'18px 20px', background:'none', border:'none', cursor:'pointer',
                textAlign:'left', gap:12 }}>
              <span style={{ fontSize:14, fontWeight:700, color:'#0f172a', lineHeight:1.4 }}>{q}</span>
              <ChevronDown size={16} color="#94a3b8" style={{ flexShrink:0,
                transition:'transform .2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}/>
            </button>
            {openFaq === i && (
              <div style={{ padding:'0 20px 18px', fontSize:13, color:'#64748b', lineHeight:1.75 }}>
                {a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )

  /* ════════════════════════════════════
     CTA FINAL
  ════════════════════════════════════ */
  const CtaFinal = () => (
    <section style={{ padding: isMobile ? '60px 20px' : '90px 40px',
      background:'#0f172a', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(34,197,94,0.10),transparent 70%)',
        top:-200, left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }}/>
      <div style={{ maxWidth:640, margin:'0 auto', textAlign:'center', position:'relative' }}>
        <div style={{ margin:'0 auto 24px', display:'flex', justifyContent:'center' }}>
          <VaultLogo size={64} gradient={true}/>
        </div>
        <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight:900, color:'white',
          marginBottom:16, lineHeight:1.2 }}>
          Commencez à protéger<br/>vos mots de passe aujourd'hui
        </h2>
        <p style={{ fontSize: isMobile ? 15 : 17, color:'#94a3b8', lineHeight:1.7, marginBottom:40 }}>
          Gratuit pour toujours jusqu'à 10 entrées. Aucune carte bancaire requise. Activez en 2 minutes.
        </p>
        <button onClick={() => navigate('/login')}
          style={{ display:'inline-flex', alignItems:'center', gap:10,
            padding: isMobile ? '16px 32px' : '18px 44px',
            borderRadius:16, border:'none', background:G, color:'white',
            fontWeight:800, fontSize: isMobile ? 16 : 18, cursor:'pointer',
            boxShadow:'0 8px 32px rgba(34,197,94,0.45)' }}>
          Créer mon compte gratuit <ArrowRight size={18}/>
        </button>
        <p style={{ marginTop:20, fontSize:12, color:'#475569' }}>
          ✓ Sans engagement · ✓ Chiffrement AES-256 · ✓ Paiement Wave & Orange Money
        </p>
      </div>
    </section>
  )

  /* ════════════════════════════════════
     FOOTER
  ════════════════════════════════════ */
  const Footer = () => (
    <footer style={{ background:'#0f172a', borderTop:'1px solid #1e293b',
      padding: isMobile ? '40px 20px' : '60px 40px 40px' }}>
      <div style={{ maxWidth:1140, margin:'0 auto' }}>
        <div style={{ display:'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)',
          gap: isMobile ? 36 : 40, marginBottom: isMobile ? 36 : 52 }}>

          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <VaultLogo size={34} gradient={true}/>
              <span style={{ fontSize:16, fontWeight:900, background:GO,
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PassGuard</span>
            </div>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:16 }}>
              Le gestionnaire de mots de passe sécurisé conçu pour l'Afrique francophone.
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px',
              borderRadius:10, background:'#1e293b', display:'inline-flex' }}>
              <Shield size={13} color="#22c55e"/>
              <span style={{ fontSize:11, fontWeight:700, color:'#22c55e' }}>AES-256 · Zero-Knowledge</span>
            </div>
          </div>

          {/* Liens */}
          {[
            { title:'Produit', links:['Fonctionnalités','Tarifs','Sécurité','FAQ'] },
            { title:'Paiement', links:['Wave','Orange Money','Free Money','Stripe'] },
            { title:'Contact', links:['Support WhatsApp','Partenariats','Business','Twitter'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize:12, fontWeight:800, color:'#475569', textTransform:'uppercase',
                letterSpacing:1.5, marginBottom:16 }}>{title}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {links.map(l => (
                  <a key={l}
                    href={l === 'Support WhatsApp' ? 'https://wa.me/221779819588?text=Bonjour%20PassGuard%2C%20j%27ai%20besoin%20d%27aide.' : '#'}
                    target={l === 'Support WhatsApp' ? '_blank' : undefined}
                    rel={l === 'Support WhatsApp' ? 'noopener noreferrer' : undefined}
                    style={{ fontSize:13, color: l === 'Support WhatsApp' ? '#25D366' : '#64748b',
                      textDecoration:'none', fontWeight: l === 'Support WhatsApp' ? 700 : 500,
                      transition:'color .15s', display:'flex', alignItems:'center', gap:5 }}
                    onMouseEnter={e => e.currentTarget.style.color='#22c55e'}
                    onMouseLeave={e => e.currentTarget.style.color = l === 'Support WhatsApp' ? '#25D366' : '#64748b'}>
                    {l === 'Support WhatsApp' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    )}
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop:'1px solid #1e293b', paddingTop:24,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:12, color:'#475569' }}>© 2026 PassGuard · Tous droits réservés</span>
          <span style={{ fontSize:12, color:'#334155' }}>Conçu avec passion pour l'Afrique</span>
        </div>
      </div>
    </footer>
  )

  const WA_LINK = 'https://wa.me/221779819588?text=Bonjour%20PassGuard%2C%20j%27ai%20besoin%20d%27aide.'

  return (
    <div style={{ minHeight:'100vh', background:'white' }}>
      <Nav/>
      <Hero/>
      <StatsBand/>
      <Features/>
      <Pricing/>
      <Payments/>
      <Testimonials/>
      <Faq/>
      <CtaFinal/>
      <Footer/>

      {/* ── Modal de paiement ── */}
      {paymentPlan && (
        <PaymentModal plan={paymentPlan} onClose={() => setPaymentPlan(null)}/>
      )}

      {/* ── Bouton WhatsApp flottant ── */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
        title="Contacter le support PassGuard sur WhatsApp"
        style={{ position:'fixed', bottom: isMobile ? 80 : 28, right:20, zIndex:500,
          display:'flex', alignItems:'center', gap:10,
          background:'#25D366', borderRadius:999,
          padding: isMobile ? '12px 16px' : '13px 20px',
          boxShadow:'0 6px 24px rgba(37,211,102,0.45)',
          textDecoration:'none', transition:'transform .2s, box-shadow .2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow='0 10px 30px rgba(37,211,102,0.55)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)';    e.currentTarget.style.boxShadow='0 6px 24px rgba(37,211,102,0.45)' }}>
        {/* Icône WhatsApp SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {!isMobile && (
          <span style={{ color:'white', fontWeight:800, fontSize:13 }}>Support WhatsApp</span>
        )}
      </a>
    </div>
  )
}
