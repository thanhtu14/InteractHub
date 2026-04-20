import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../pages/MainLayout";
import HomePage from "../pages/user/HomePage";
import FriendPage from "../pages/user/FriendPage";
import ProfilePage from "../pages/user/ProfilePage";
import PostDetailPage from "../pages/user/PostDetailPage";

export const UserRoutes = (
    <>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/friendpage" element={<FriendPage />} />
            <Route path="/myprofile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
        </Route>
    </>
);