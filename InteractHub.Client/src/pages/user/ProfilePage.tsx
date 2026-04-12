import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

// Components
import Navbar from "../../components/Navigation";
import ProfileHeader from "../../components/ProfileHeader";
import FriendList from "../../components/ListFriends";
import PostList from "../../components/ContainerPost";
import InfoContainer from "../../components/InfoContainer";
import ProfileUpdateForm from "../../components/Profileupdateform";
import PostingForm from "../../components/PostingForm";
import PostFilterBar, { type SortOrder, type StatusFilter } from "../../components/PostFilterBar";
import PostManagerModal from "../../components/PostManagerModal";

// Services & Types
import { userService } from "../../services/userService";
import type { User } from "../../schemas/user.schema";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const navigate = useNavigate();
  const { id: paramId } = useParams();

  // ── 1. Fetch dữ liệu ───────────────────────────────────────
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await userService.getProfile(paramId);
        const data = res.data;

        setUser(data);

        if (!paramId) {
          setLoggedInUser(data);
          localStorage.setItem("interact_hub_user", JSON.stringify(data));
        } else {
          const storedUser = localStorage.getItem("interact_hub_user");
          if (storedUser) setLoggedInUser(JSON.parse(storedUser));
        }
      } catch (err: any) {
        console.error("Lỗi fetch user profile:", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [paramId, navigate]);

  // ── 2. Xử lý sau khi update thành công ────────────────────
  const handleSubmitSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    setLoggedInUser(updatedUser);
    setTimeout(() => setShowModal(false), 1000);
  };

  // ── 3. Loading ─────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1877f2] border-t-transparent" />
      </div>
    );
  }

  const isOwnProfilePage = !paramId || user.Id === loggedInUser?.Id;

  return (
    <div className="min-h-screen bg-[#18191a] text-white">
      <Navbar />

      <ProfileHeader
        userId={user.Id}
        isOwnProfile={isOwnProfilePage}
        onEditProfileClick={() => setShowModal(true)}
      />

      <main className="max-w-[1200px] mx-auto mt-4 px-4 pb-10">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* CỘT TRÁI */}
          <aside className="w-full lg:w-[40%] space-y-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-[#242526] p-4 rounded-xl border border-[#3e4042] shadow-sm">
                <h3 className="text-xl font-bold mb-2">Giới thiệu</h3>
                <p className="text-center text-gray-300 mb-4 italic">
                  {user.Bio || "Chưa có tiểu sử"}
                </p>
                <InfoContainer
                  user={user}
                  isOwnProfile={isOwnProfilePage}
                />
              </div>

              <div className="bg-[#242526] p-4 rounded-xl border border-[#3e4042] shadow-sm">
                <FriendList />
              </div>
            </div>
          </aside>

          {/* CỘT PHẢI */}
          <section className="w-full lg:w-[60%] space-y-4">
            {isOwnProfilePage && (
              <div className="px-2">
                <PostingForm user={user} />
              </div>
            )}

            <PostFilterBar
              sort={sort}
              status={statusFilter}
              onSortChange={setSort}
              onStatusChange={setStatusFilter}
              onManageClick={() => setShowManager(true)}
            />

            <PostList
              userId={user.Id}
              sort={sort}
              statusFilter={statusFilter}
            />
          </section>
        </div>
      </main>

      {/* MODAL CHỈNH SỬA HỒ SƠ */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#242526] rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden
                          relative shadow-2xl border border-[#3e4042] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#3e4042] shrink-0">
              <h2 className="text-2xl font-bold text-white">Chỉnh sửa trang cá nhân</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-[#3a3b3c] text-gray-400 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#1c1d1e]">
              <ProfileUpdateForm
                initialData={user}
                onSubmitSuccess={handleSubmitSuccess}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ BÀI VIẾT */}
      {showManager && (
        <PostManagerModal
          userId={user.Id}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;