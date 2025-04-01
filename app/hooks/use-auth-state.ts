import { useEffect } from "react"
import { onAuthStateChanged, type Auth, type User } from "firebase/auth"

import useLoadingValue from "./use-loading-value"

export type LoadingHook<T, E> = [T | undefined, boolean, E | undefined]
export type AuthStateHook = LoadingHook<User | null, Error>

type AuthStateOptions = {
  onUserChanged?: (user: User | null) => Promise<void>
}

export default (auth: Auth, options?: AuthStateOptions): AuthStateHook => {
  const { error, loading, setError, setValue, value } = useLoadingValue<
    User | null,
    Error
  >(() => auth.currentUser)

  useEffect(() => {
    const listener = onAuthStateChanged(
      auth,
      async (user) => {
        if (options?.onUserChanged) {
          // onUserChanged function to process custom claims on any other trigger function
          try {
            await options.onUserChanged(user)
          } catch (e) {
            setError(e as Error)
          }
        }
        setValue(user)
      },
      setError
    )

    return () => {
      listener()
    }
  }, [auth])

  return [value, loading, error]
}
