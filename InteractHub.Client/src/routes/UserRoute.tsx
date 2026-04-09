import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/user/HomePage";
import FriendPage from "../pages/user/FriendPage";
import ProfilePage from "../pages/user/ProfilePage";

export const UserRoutes = (
    <>
        <Route path="/homepage" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
        } />

        <Route path="/friendpage" element={
            <ProtectedRoute><FriendPage /></ProtectedRoute>
        } />

        <Route path="/myprofile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        <Route path="/profile/:id" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
    </>
);