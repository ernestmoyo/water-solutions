import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { user, isAuthenticated, isLoading, fetchUser, login, logout, register } =
    useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  return { user, isAuthenticated, isLoading, login, logout, register };
}

export function useRequireAuth() {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.isAuthenticated) {
      window.location.href = "/login";
    }
  }, [auth.isAuthenticated]);
  return auth;
}
