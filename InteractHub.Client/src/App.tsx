import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.tsx";
import HomePage from "./pages/HomePage.tsx";
import FriendPage from "./pages/friendPage.tsx";
import Profilepage from "./pages/ProfilePage.tsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* Chuyển hướng về trang Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/homepage" element={<HomePage />} /> 
        <Route path="/friendpage" element={<FriendPage />} />
        {/* Trang cá nhân chính mình */}
        <Route path="/profilepage" element={<Profilepage />} />
        {/* Trang cá nhân của người khác */}
        <Route path="/profile/:id" element={<Profilepage />} />
      </Routes>
    </Router>
  );
}

export default App;
