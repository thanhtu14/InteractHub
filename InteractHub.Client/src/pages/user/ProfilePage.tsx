import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import Navbar from "../../components/Navigation";
import ProfileHeader from "../../components/ProfileHeader";
import ListFriendsByID from "../../components/ListFriendsByID";
import PostList from "../../components/ContainerPost";
import InfoContainer from "../../components/InfoContainer";
import ProfileUpdateForm from "../../components/Profileupdateform";
import PostingForm from "../../components/PostingForm";

// ── Interface khớp với UserDto từ Backend ─────────────────────
interface User {
  Id: string;
  Username: string;
  Email: string;
  Phone?: string;
  AvatarUrl?: string;
  CoverUrl?: string;
  Bio?: string;
  Gender?: string;
  DateOfBirth?: string;
  CreatedAt?: string;
  Roles: string[];
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const token = localStorage.getItem("interact_hub_token");

  // ── Fetch dữ liệu user ────────────────────────────────────
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const url = paramId
          ? `https://localhost:7069/api/users/${paramId}`
          : `https://localhost:7069/api/users/me`;

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        if (res.ok) {
          const data: User = await res.json();
          setUser(data);

          if (!paramId) {
            setLoggedInUser(data);
            localStorage.setItem("interact_hub_user", JSON.stringify(data));
          } else {
            // Lấy thêm thông tin người dùng đang đăng nhập để so sánh
            const storedUser = localStorage.getItem("interact_hub_user");
            if (storedUser) setLoggedInUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.error("Lỗi kết nối API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [paramId, token, navigate]);

  // ── Callback khi update thành công ────────────────────────
  const handleSubmitSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    setLoggedInUser(updatedUser);
    // Đóng modal sau 1.5s để người dùng thấy toast
    setTimeout(() => setShowModal(false), 1500);
  };

  // ── Loading state ─────────────────────────────────────────
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
      <Navbar user={loggedInUser ?? user} />

      <ProfileHeader
        userId={user.Id}
        isOwnProfile={isOwnProfilePage}
        onEditProfileClick={() => setShowModal(true)}
      />

      <main className="max-w-[1100px] mx-auto mt-4 px-4 pb-10">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Sidebar */}
          <aside className="w-full lg:w-[40%] space-y-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-[#242526] p-4 rounded-xl border border-[#3e4042] shadow-sm">
                <h3 className="text-xl font-bold mb-2">Giới thiệu</h3>
                <p className="text-center text-gray-300 mb-4">
                  {user.Bio || "Chưa có tiểu sử"}
                </p>
                <InfoContainer
                  user={user}             // user là state hoặc props từ ProfilePage
                  isOwnProfile={isOwnProfilePage} // boolean, tùy chọn
                />
              </div>

              <div className="bg-[#242526] p-4 rounded-xl border border-[#3e4042] shadow-sm">
                <ListFriendsByID userId={user.Id} />
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <section className="w-full lg:w-[60%] space-y-4">
            {isOwnProfilePage && (
              <div className="px-2">
                <PostingForm user={user} />
              </div>
            )}

            <div className="bg-[#242526] p-4 rounded-xl flex items-center justify-between border border-[#3e4042] shadow-sm">
              <h3 className="text-lg font-bold">Bài viết</h3>
            </div>

            <PostList userId={user.Id} />
          </section>
        </div>
      </main>

      {/* ── Modal chỉnh sửa hồ sơ ── */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#242526] rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative shadow-2xl border border-[#3e4042] flex flex-col">

            {/* Header modal */}
            <div className="flex items-center justify-between p-5 border-b border-[#3e4042] shrink-0">
              <h2 className="text-2xl font-bold text-white">
                Chỉnh sửa trang cá nhân
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-[#3a3b3c] text-gray-400 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Body modal */}
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
    </div>
  );
};

export default ProfilePage;