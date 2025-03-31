import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

interface TokenInfo {
  token: string | null;
  expirationTime: number | null;
}

export function useTokenManager() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    token: null,
    expirationTime: null,
  });

  const refreshToken = async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(true);
    // Firebase tokens expire in 1 hour (3600 seconds)
    const expirationTime = Date.now() + 3500 * 1000; // Refresh 100 seconds before expiration
    setTokenInfo({ token, expirationTime });
    return token;
  };

  useEffect(() => {
    // Set up token refresh
    const checkAndRefreshToken = async () => {
      if (!tokenInfo.expirationTime || Date.now() >= tokenInfo.expirationTime) {
        await refreshToken();
      }
    };

    void checkAndRefreshToken();

    // Check token expiration every minute
    const interval = setInterval(checkAndRefreshToken, 60 * 1000);
    return () => clearInterval(interval);
  }, [tokenInfo.expirationTime]);

  return { token: tokenInfo.token, refreshToken };
}
