import useAuthState from "@/hooks/use-auth-state";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { createContext, useContext, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useTokenManager } from "@/hooks/use-token-manager";

type AuthContextType = {
  user: User | null | undefined;
  loading: boolean;
  error: Error | null | undefined;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [user, loading, error] = useAuthState(auth);
  const { token } = useTokenManager();
  const navigate = useNavigate();

  useEffect(() => {
    if (error != null || (user == null && !loading)) {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("tenantId");
      window.localStorage.removeItem("tokenExpiration");
      signOut(auth);
      navigate({ to: "/login" });
    }
  }, [user, loading, error, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, error, token }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
