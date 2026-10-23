import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { fetchProfile, signOut as authSignOut } from '@/services/auth'
import { USER_ROLES } from '@/utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileReady, setProfileReady] = useState(false)

  const loadProfile = useCallback(async (userId) => {
    setProfileReady(false)
    const { data } = await fetchProfile(userId)
    setProfile(data)
    setProfileReady(true)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) await loadProfile(user.id)
  }, [user?.id, loadProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        loadProfile(nextUser.id).finally(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setProfile(null)
        setProfileReady(false)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        setLoading(true)
        loadProfile(nextUser.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setProfileReady(false)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    const { error } = await authSignOut()
    if (!error) {
      setUser(null)
      setProfile(null)
      setProfileReady(false)
    }
    return error
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileReady,
      isAdmin: profile?.role === USER_ROLES.ADMIN,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, profileReady, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}
