import React, {
  createContext,
  useState,
  type ReactNode,
} from "react";

// ── 1. Kiểu dữ liệu User ─────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
}

// ── 2. Kiểu dữ liệu Context ──────────────────────────────────
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, newToken: string) => void;
  logout: () => void;
}

// ── 3. Helpers đọc localStorage ──────────────────────────────
const getStoredToken = (): string | null => {
  return localStorage.getItem("interact_hub_token");
};

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem("interact_hub_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── 4. Tạo Context ───────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── 5. Provider ──────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Khởi tạo trực tiếp từ localStorage — không cần useEffect
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser]   = useState<User | null>(getStoredUser);

  const login = (userData: User, newToken: string) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("interact_hub_token", newToken);
    localStorage.setItem("interact_hub_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("interact_hub_token");
    localStorage.removeItem("interact_hub_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;