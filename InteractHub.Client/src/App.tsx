import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.tsx";
import HomePage from "./pages/HomePage.tsx";
import FriendPage from "./pages/friendPage.tsx";
import Profilepage from "./pages/ProfilePage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import OAuthCallbackPage from "./pages/OAuthCallbackPage.tsx"; // 1. Import trang callback

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* 2. Route nhận Token từ Google/GitHub (Không bọc ProtectedRoute) */}
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Các Route cần bảo vệ */}
        <Route path="/homepage" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>
        } /> 
        
        <Route path="/friendpage" element={
          <ProtectedRoute><FriendPage /></ProtectedRoute>
        } />

        <Route path="/profilepage" element={
          <ProtectedRoute><Profilepage /></ProtectedRoute>
        } />

        <Route path="/profile/:id" element={
          <ProtectedRoute><Profilepage /></ProtectedRoute>
        } />

        {/* 3. Trang 404 (Tùy chọn nhưng nên có) */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;