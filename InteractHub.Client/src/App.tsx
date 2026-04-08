// import "./App.css";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/login.tsx";
// import HomePage from "./pages/HomePage.tsx";
// import FriendPage from "./pages/friendPage.tsx";
// import ProfilePage from "./pages/ProfilePage.tsx";
// import ProtectedRoute from "./components/ProtectedRoute.tsx"
// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<Login />} />

//         {/* Các Route cần bảo vệ */}
//         <Route path="/homepage" element={
//           <ProtectedRoute><HomePage /></ProtectedRoute>
//         } /> 

//         <Route path="/friendpage" element={
//           <ProtectedRoute><FriendPage /></ProtectedRoute>
//         } />

//         <Route path="/profilepage" element={
//           <ProtectedRoute><ProfilePage /></ProtectedRoute>
//         } />

//         <Route path="/profile/:id" element={
//           <ProtectedRoute><ProfilePage /></ProtectedRoute>
//         } />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import { UserRoutes } from "./routes/UserRoute";
import { AdminRoutes } from "./routes/AdminRoute";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import OAuthCallbackPage from "./pages/OAuthCallbackPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        {UserRoutes}
        {AdminRoutes}
      </Routes>
    </Router>
  );
}

export default App;