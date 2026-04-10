/**
 * Limiteur de tentatives de connexion côté client.
 * Stocke les tentatives en localStorage (par adresse email).
 * Bloque pendant LOCKOUT_MS après MAX_ATTEMPTS échecs consécutifs.
 */

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 5 * 60 * 1000   // 5 minutes

function storageKey(email) {
  // Encode l'email en base64 pour éviter les caractères spéciaux dans la clé
  try { return `pg_rl_${btoa(email.trim().toLowerCase())}` }
  catch { return `pg_rl_${email.trim().toLowerCase()}` }
}

/**
 * Vérifie si l'email est bloqué.
 * @returns {{ blocked: boolean, lockedUntil?: number, remaining?: number }}
 */
export function checkRateLimit(email) {
  if (!email) return { blocked: false, remaining: MAX_ATTEMPTS }

  const raw = localStorage.getItem(storageKey(email))
  if (!raw) return { blocked: false, remaining: MAX_ATTEMPTS }

  let data
  try { data = JSON.parse(raw) } catch { return { blocked: false, remaining: MAX_ATTEMPTS } }

  // Verrou expiré → on nettoie
  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    localStorage.removeItem(storageKey(email))
    return { blocked: false, remaining: MAX_ATTEMPTS }
  }

  // Toujours bloqué
  if (data.lockedUntil) {
    return { blocked: true, lockedUntil: data.lockedUntil }
  }

  return { blocked: false, remaining: MAX_ATTEMPTS - (data.count || 0) }
}

/**
 * Enregistre un échec de connexion. Verrouille si MAX_ATTEMPTS atteint.
 * @returns {{ count: number, lockedUntil?: number }}
 */
export function recordFailedAttempt(email) {
  if (!email) return { count: 1 }

  const key = storageKey(email)
  let data
  try { data = JSON.parse(localStorage.getItem(key) || '{}') }
  catch { data = {} }

  data.count = (data.count || 0) + 1

  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_MS
  }

  localStorage.setItem(key, JSON.stringify(data))
  return data
}

/**
 * Réinitialise le compteur (après connexion réussie).
 */
export function clearRateLimit(email) {
  if (!email) return
  localStorage.removeItem(storageKey(email))
}

export { MAX_ATTEMPTS, LOCKOUT_MS }
