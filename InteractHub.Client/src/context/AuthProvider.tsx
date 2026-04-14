import React, { useState,type ReactNode } from "react";
import { AuthContext,type User } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Giải pháp: Đọc trực tiếp từ localStorage khi khởi tạo (Lazy Initialization)
  // React chỉ chạy các hàm này DUY NHẤT một lần khi app khởi động
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("interact_hub_token");
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("interact_hub_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("interact_hub_user");
        return null;
      }
    }
    return null;
  });

  // isLoading bây giờ có thể mặc định là false vì dữ liệu đã có ngay từ đầu
  const [isLoading] = useState(false);

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

  const isAdmin = user?.Roles?.includes("Admin") ?? false;

  return (
    <AuthContext.Provider 
      value={{ user, token, isAuthenticated: !!token, isAdmin, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};