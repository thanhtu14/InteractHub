import { UserRoutes } from "./routes/UserRoute";
import { AdminRoutes } from "./routes/AdminRoute";
import LoginRoute from "./components/LoginRoute";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginRoute><Login /></LoginRoute>} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        {UserRoutes}
        {AdminRoutes}
      </Routes>

      {/* 🔥 Toast global */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        newestOnTop
      />
    </Router>
  );
}

export default App;