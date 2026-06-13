"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string; plan?: string } | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; plan?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check session and fallback to localStorage
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      setUser({
        email: session.user.email || "",
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        plan: (session.user as any).plan || "FREE",
      });
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      // Check if user is logged in via localStorage
      const storedAuth = localStorage.getItem("wishlist_auth");
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          setUser(authData);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem("wishlist_auth");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }
  }, [session, status]);

  // Protect dashboard routes
  useEffect(() => {
    if (!isLoading) {
      const isDashboardRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/goals") || pathname?.startsWith("/simulator") || pathname?.startsWith("/portfolio") || pathname?.startsWith("/reports") || pathname?.startsWith("/settings");
      
      if (isDashboardRoute && !isAuthenticated) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, pathname, isLoading, router]);

  const login = (email: string, name: string) => {
    const authData = { email, name };
    localStorage.setItem("wishlist_auth", JSON.stringify(authData));
    setUser(authData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem("wishlist_auth");
    setUser(null);
    setIsAuthenticated(false);
    if (status === "authenticated") {
      await nextAuthSignOut({ callbackUrl: "/" });
    } else {
      router.push("/");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-surface-900 flex items-center justify-center"><div className="text-text-primary">Loading...</div></div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
