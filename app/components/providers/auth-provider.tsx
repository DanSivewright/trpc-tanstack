import { createContext, useContext, useEffect } from "react"
import { auth } from "@/integrations/firebase/client"
import { RiLoaderFill } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "@tanstack/react-router"
import type { User } from "firebase/auth"
import { signOut } from "firebase/auth"

import {
  clearAuthCookie,
  getAuthCookie,
  setAuthCookie,
} from "@/lib/auth-cookies"
import { fetcher } from "@/lib/query"
import useAuthState from "@/hooks/use-auth-state"

type AuthContextType = {
  user: User | null | undefined
  loading: boolean
  error: Error | null | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const [user, loading, error] = useAuthState(auth)
  const navigate = useNavigate()

  const authQuery = useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const authCookies = await getAuthCookie()

      if (!user) {
        return null
      }

      const currentToken = await user.getIdToken()
      const lastStoredToken = authCookies.token

      if (!lastStoredToken || lastStoredToken !== currentToken) {
        const newAuth = await user.getIdToken(true)
        const me = await fetcher({
          key: "people:me",
          ctx: {
            token: newAuth,
            tenantId: user.tenantId ?? null,
          },
          input: null,
        })
        if (!newAuth || typeof newAuth !== "string") {
          void signOut(auth).then(() => clearAuthCookie())
          navigate({ to: "/login" })
        } else {
          await setAuthCookie({
            data: {
              token: newAuth,
              uid: me?.uid ?? null,
              tenantId: user.tenantId ?? null,
              companyUid: me?.company?.uid ?? null,
            },
          })
          return {
            token: newAuth,
            uid: me?.uid ?? null,
            tenantId: user.tenantId ?? null,
            companyUid: me?.company?.uid ?? null,
          }
        }
      }

      return {
        token: lastStoredToken,
        tenantId: user.tenantId ?? null,
        uid: authCookies?.uid ?? null,
        companyUid: authCookies?.companyUid ?? null,
      }
    },
    staleTime: 1000 * 60 * 50,
    refetchInterval: 1000 * 60 * 50,
    enabled: loading === false,
  })

  useEffect(() => {
    if (error != null || (user == null && !loading)) {
      void signOut(auth).then(() => clearAuthCookie())
      navigate({ to: "/login" })
    }
  }, [user, loading, error, pathname])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {authQuery.isSuccess && !authQuery.isLoading && !authQuery.isFetching ? (
        children
      ) : (
        <RiLoaderFill className="animate-spin" />
      )}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider")
  }
  return context
}

export { AuthProvider, useAuth }
