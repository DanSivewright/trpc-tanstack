import { createContext, useContext, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocation, useNavigate } from "@tanstack/react-router"
import type { User } from "firebase/auth"
import { signOut } from "firebase/auth"

import {
  clearAuthCookie,
  getAuthCookie,
  setAuthCookie,
} from "@/lib/auth-cookies"
import { auth } from "@/lib/firebase/client"
import { fetcher } from "@/lib/query"
import { useTRPC } from "@/lib/trpc/react"
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

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  // const me = useQuery(trpc.people.me.queryOptions())

  const authQuery = useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const authCookies = await getAuthCookie()
      console.log("authCookies:::", authCookies)

      if (!user) {
        return null
      }

      // const me = await queryClient.ensureQueryData(
      //   trpc.people.me.queryOptions()
      // )
      // console.log("me:::", me)
      const currentToken = await user.getIdToken()
      const lastStoredToken = authCookies.token

      // if (me?.uid !== authCookies.uid) {
      //   void signOut(auth).then(() => clearAuthCookie())
      //   navigate({ to: "/login" })
      // }

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
            },
          })
          return {
            token: newAuth,
            uid: me?.uid ?? null,
            tenantId: user.tenantId ?? null,
          }
        }
      }

      return {
        token: lastStoredToken,
        tenantId: user.tenantId ?? null,
        uid: authCookies?.uid ?? null,
      }
    },
    staleTime: 1000 * 60 * 50,
    refetchInterval: 1000 * 60 * 50,
    enabled: loading === false,
  })

  // const queryClient = useQueryClient()

  // useEffect(() => {
  //   async function setUidForCookie(uid: string) {
  //     const authCookies = await getAuthCookie()
  //     await setAuthCookie({
  //       data: { ...authCookies, uid },
  //     })
  //     await queryClient.invalidateQueries({
  //       queryKey: ["token"],
  //     })
  //   }
  //   if (me.data && authQuery.data && !me.isLoading && !authQuery.isLoading) {
  //     console.log("ran now:::")
  //     if (
  //       me.data.company?.tenantId !== authQuery.data.tenantId ||
  //       me?.data?.uid !== authQuery.data.uid
  //     ) {
  //       void setUidForCookie(me.data.uid)
  //     }
  //   }
  // }, [me.data, me.isLoading, authQuery.data, authQuery.isLoading])

  useEffect(() => {
    if (error != null || (user == null && !loading)) {
      void signOut(auth).then(() => clearAuthCookie())
      navigate({ to: "/login" })
    }
  }, [user, loading, error, pathname])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {authQuery.isSuccess && children}
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
