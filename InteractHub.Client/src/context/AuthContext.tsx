import { createContext } from "react";

// Định nghĩa chuẩn PascalCase từ Backend ASP.NET
export interface User {
  Id: string;
  Username: string;
  Email: string;
  Roles: string[];
  Gender?: string;
  Phone?: string | null;
  AvatarUrl?: string | null;  // ✅ thêm null
  CoverUrl?: string | null;   // ✅ thêm null
  Bio?: string | null;        // ✅ thêm null
  DateOfBirth?: string | null;// ✅ thêm null
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; // Quan trọng để tránh bị đá ra Login khi vừa load trang
  login: (userData: User, newToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);