import React, { createContext, useContext, useState, useEffect,type ReactNode } from "react";

// 1. Định nghĩa kiểu dữ liệu User theo yêu cầu hệ thống
interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
}

// 2. Định nghĩa các giá trị mà Context sẽ cung cấp cho toàn App
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Tự động kiểm tra Token khi load lại trang (F2: Token Storage)
  useEffect(() => {
    const storedToken = localStorage.getItem("interact_hub_token");
    const storedUser = localStorage.getItem("interact_hub_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // 4. Hàm xử lý khi đăng nhập thành công
  const login = (userData: User, token: string) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("interact_hub_token", token);
    localStorage.setItem("interact_hub_user", JSON.stringify(userData));
  };

  // 5. Hàm xử lý đăng xuất
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("interact_hub_token");
    localStorage.removeItem("interact_hub_user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      isLoading, 
      login, 
      logout 
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng Auth nhanh hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};