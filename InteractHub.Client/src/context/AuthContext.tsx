import { createContext } from "react";

// Định nghĩa chuẩn PascalCase từ Backend ASP.NET
export interface User {
  Id: string;
  Username: string;
  Email: string;
  Roles: string[];
  AvatarUrl?: string;
  CoverUrl?: string;
  Bio?: string;
  DateOfBirth?: string;
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