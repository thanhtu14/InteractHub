import { useContext } from "react";
import AuthContext, { type AuthContextType } from "./AuthContext";

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  }
  return context;
};

export default useAuth;