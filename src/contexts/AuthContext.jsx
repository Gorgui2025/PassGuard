import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser]                     = useState(null)
  const [masterPassword, setMasterPassword] = useState(() => sessionStorage.getItem('mp') || '')
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    // Nettoyer le hash uniquement si ce n'est pas une confirmation email
    // (type=signup est géré par HashRedirect dans App.jsx → /confirm)
    const hash = window.location.hash
    if (hash.includes('access_token') && !hash.includes('type=signup')) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    // Récupérer la session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    // Écouter les changements d'auth — ignorer SIGNED_OUT si on a déjà un user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session?.user) {
        setUser(session.user)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // Si session présente → l'utilisateur est directement connecté
    if (data.session) {
      sessionStorage.setItem('mp', password)
      setMasterPassword(password)
    }
    return data
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    sessionStorage.setItem('mp', password)
    setMasterPassword(password)
    return data
  }

  const logout = async () => {
    sessionStorage.removeItem('mp')
    setMasterPassword('')
    await supabase.auth.signOut()
  }

  const restoreMasterPassword = (pwd) => {
    sessionStorage.setItem('mp', pwd)
    setMasterPassword(pwd)
  }

  return (
    <AuthContext.Provider value={{ user, masterPassword, loading, register, login, logout, restoreMasterPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
