import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useCallback } from "react";

export function useAuth() {
  const {
    identity,
    login,
    clear,
    loginStatus,
    isInitializing,
    isLoggingIn,
    isAuthenticated,
    isLoginError,
    loginError,
  } = useInternetIdentity();

  const logout = useCallback(() => {
    clear();
  }, [clear]);

  return {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
    loginStatus,
    login,
    logout,
    principalText: identity?.getPrincipal().toText() ?? null,
  };
}
