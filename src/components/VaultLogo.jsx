/**
 * VaultLogo — Coffre-fort SVG personnalisé, libre de droits (créé sur mesure)
 * Props :
 *   size       : taille en px (défaut 40)
 *   gradient   : booléen, applique le dégradé vert-ocre (défaut true)
 *   color      : couleur fixe si gradient=false (défaut '#22c55e')
 *   className  : classe CSS optionnelle
 */
export default function VaultLogo({ size = 40, gradient = true, color = '#22c55e', style = {} }) {
  const id = `vg-${size}`   // id unique pour les defs SVG

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <defs>
        {gradient && (
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#d97706"/>
          </linearGradient>
        )}
      </defs>

      {/* Corps du coffre */}
      <rect x="8" y="12" width="72" height="68" rx="10" ry="10"
        fill={gradient ? `url(#${id})` : color}/>

      {/* Reflet haut */}
      <rect x="8" y="12" width="72" height="22" rx="10" ry="10"
        fill="rgba(255,255,255,0.15)"/>

      {/* Panneau intérieur */}
      <rect x="16" y="22" width="56" height="48" rx="7" ry="7"
        fill="rgba(0,0,0,0.18)"/>

      {/* Roue / cadran central */}
      <circle cx="44" cy="46" r="15" fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
      <circle cx="44" cy="46" r="7" fill="rgba(255,255,255,0.20)"
        stroke="rgba(255,255,255,0.70)" strokeWidth="2"/>
      {/* Rayons du cadran */}
      <line x1="44" y1="31" x2="44" y2="36" stroke="rgba(255,255,255,0.70)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="44" y1="56" x2="44" y2="61" stroke="rgba(255,255,255,0.70)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="29" y1="46" x2="34" y2="46" stroke="rgba(255,255,255,0.70)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="54" y1="46" x2="59" y2="46" stroke="rgba(255,255,255,0.70)" strokeWidth="2" strokeLinecap="round"/>
      {/* Point central */}
      <circle cx="44" cy="46" r="2.5" fill="rgba(255,255,255,0.85)"/>

      {/* Poignée / levier */}
      <rect x="59" y="42" width="10" height="8" rx="4" ry="4"
        fill="rgba(255,255,255,0.30)" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5"/>

      {/* Pieds du coffre */}
      <rect x="20" y="78" width="12" height="8" rx="3" ry="3"
        fill={gradient ? `url(#${id})` : color}/>
      <rect x="48" y="78" width="12" height="8" rx="3" ry="3"
        fill={gradient ? `url(#${id})` : color}/>

      {/* Charnières */}
      <rect x="6" y="24" width="4" height="8" rx="2"
        fill="rgba(255,255,255,0.35)"/>
      <rect x="6" y="58" width="4" height="8" rx="2"
        fill="rgba(255,255,255,0.35)"/>
    </svg>
  )
}
