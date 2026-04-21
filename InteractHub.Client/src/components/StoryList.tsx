import React, { useRef, useEffect, useState } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { storyService, type StoryItem } from "../services/storyService";
import { friendshipService } from "../services/friendshipService";
import { resolveUrl } from "../utils/urlUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn
import { getTimeAgo } from "../utils/timeUtils";

interface StoryListProps {
  user: {
    id: string | number;
    fullName?: string;
    avatarUrl?: string;
    AvatarUrl?: string;
  } | null;
}

const API_URL = "https://localhost:7069";

const getFullUrl = (path: string | undefined) => {
    if (!path || path === "") return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const StoryList: React.FC<StoryListProps> = ({ user }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [friendIds, setFriendIds] = useState<string[]>([]);
    const [viewingUserIndex, setViewingUserIndex] = useState<number | null>(null);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);

    // ── Load stories ─────────────────────────────────────────
    useEffect(() => {
        storyService.getAll()
            .then((res) => setStories(res.data))
            .catch((err) => console.error("Lỗi khi tải story:", err));
    }, []);
console.log("Loaded Stories:", stories); // ✅ Debug: Kiểm tra dữ liệu đã tải
    // ── Load friends ─────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        friendshipService.getFriendsList(String(user.id))
            .then((res) => {
                const ids = res.data.map((f) => String(f.Id));
                setFriendIds(ids);
            })
            .catch((err) => console.error("Lỗi khi tải bạn bè:", err));
    }, [user?.id]);

    if (!user) return null;

    // ── Gom nhóm story theo user ─────────────────────────────
const groupedStories = stories
    .filter((story) => {
        const storyUserId = String(story.UserId);
        const myId = String(user?.id);
        return storyUserId === myId || friendIds.includes(storyUserId);
    })
    .reduce((acc, story) => {
        const key = String(story.UserId);
        if (!acc[key]) {
            acc[key] = {
                userName: story.FullName || "Người dùng",
                profilePicture: story.ProfilePicture,
                items: [],
            };
        }
        acc[key].items.push(story);
        return acc;
    }, {} as Record<string, { userName: string; profilePicture?: string; items: StoryItem[] }>);

// Chuyển thành mảng và sắp xếp lại: Story của chính mình luôn ở đầu tiên
const userList = Object.values(groupedStories);

// Sắp xếp: Story của người dùng hiện tại luôn đứng đầu
const myIdStr = String(user?.id);
userList.sort((a, b) => {
    const aIsMe = String(a.items[0]?.UserId) === myIdStr;
    const bIsMe = String(b.items[0]?.UserId) === myIdStr;

    if (aIsMe && !bIsMe) return -1;   // Story của mình lên đầu
    if (!aIsMe && bIsMe) return 1;
    return 0;
});

    // ── Handlers ─────────────────────────────────────────────
    const handleNext = () => {
        if (viewingUserIndex === null) return;
        const currentUserStories = userList[viewingUserIndex].items;
        if (activeStoryIndex < currentUserStories.length - 1) {
            setActiveStoryIndex((prev) => prev + 1);
        } else if (viewingUserIndex < userList.length - 1) {
            setViewingUserIndex((prev) => prev! + 1);
            setActiveStoryIndex(0);
        } else {
            closeViewer();
        }
    };

    const handlePrev = () => {
        if (viewingUserIndex === null) return;
        if (activeStoryIndex > 0) {
            setActiveStoryIndex((prev) => prev - 1);
        } else if (viewingUserIndex > 0) {
            const prevIdx = viewingUserIndex - 1;
            setViewingUserIndex(prevIdx);
            setActiveStoryIndex(userList[prevIdx].items.length - 1);
        }
    };

    const closeViewer = () => {
        setViewingUserIndex(null);
        setActiveStoryIndex(0);
    };

    const scroll = (direction: "left" | "right") => {
        scrollRef.current?.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleCreateStory = async () => {
        if (!file && !content) return;
        const formData = new FormData();
        formData.append("Content", content);
        if (file) formData.append("File", file);

        try {
            const res = await storyService.create(formData);
            setStories((prev) => [res.data, ...prev]);
            handleCancel();
        } catch (err: unknown) {
            const error = err as { message: string };
            alert(error.message);
        }
    };

    const handleCancel = () => {
        setShowCreate(false);
        setContent("");
        setFile(null);
        setPreview(null);
    };

    const handleDelete = async (storyId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tin này không?")) return;
        try {
            await storyService.delete(storyId);
            setStories((prev) => prev.filter((s) => s.Id !== storyId));
            if (viewingUserIndex !== null && userList[viewingUserIndex].items.length <= 1) {
                closeViewer();
            } else {
                setActiveStoryIndex(0);
            }
        } catch (err: unknown) {
            const error = err as { message: string };
            alert(error.message);
        }
    };

    return (
        <div className="relative w-full group px-2">
            <button onClick={() => scroll("left")} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#3e4042] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FaChevronLeft />
            </button>
            <button onClick={() => scroll("right")} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#3e4042] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FaChevronRight />
            </button>

            {/* SCROLL CONTAINER */}
            <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 px-2 scroll-smooth">

                {/* CREATE STORY */}
                <div className="w-40 h-62 flex-shrink-0 bg-[#242526] rounded-xl overflow-hidden shadow-lg border border-[#3e4042] group cursor-pointer relative">
                    <img
                        src={resolveUrl(user?.avatarUrl)}
                        alt="my avatar"
                        className="w-full h-40 object-cover group-hover:scale-110 transition"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#242526] pt-1 pb-3 text-center">
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center ring-4 ring-[#242526] cursor-pointer"
                            onClick={() => setShowCreate(true)}
                        >
                            <FaPlus className="text-white text-xl" />
                        </div>
                        <p className="text-white text-sm font-bold mt-6 px-1 truncate">Tạo tin</p>
                    </div>
                </div>

                {/* DANH SÁCH STORY */}
                {userList.map((group, uIdx) => (
                    <div
                        key={uIdx}
                        onClick={() => { setViewingUserIndex(uIdx); setActiveStoryIndex(0); }}
                        className="relative w-28 h-48 md:w-36 md:h-64 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group shadow-lg"
                    >
                        <img src={getFullUrl(group.items[0].MediaUrl)} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="story" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                        <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-[3px] border-blue-600 p-[2px] bg-[#242526]">
                            <img src={resolveUrl(group.profilePicture)} className="w-full h-full rounded-full object-cover" alt="avatar" />
                        </div>
                        <p className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-semibold truncate">{group.userName}</p>
                    </div>
                ))}
            </div>

            {/* VIEWER */}
            {viewingUserIndex !== null && (
                <div className="fixed inset-0 z-[1000] bg-[#18191a] flex items-center justify-center">
                    <button onClick={closeViewer} className="absolute top-5 right-5 text-white/70 hover:text-white text-4xl z-[1010]">&times;</button>
                    <button onClick={handlePrev} className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center z-[1010]"><FaChevronLeft /></button>
                    <button onClick={handleNext} className="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center z-[1010]"><FaChevronRight /></button>

                    <div className="relative w-full max-w-[420px] h-[95vh] bg-black shadow-2xl flex flex-col overflow-hidden rounded-lg">
                        {/* Progress bar */}
                        <div className="absolute top-4 left-4 right-4 flex gap-1 z-[1020]">
                            {userList[viewingUserIndex].items.map((_, i) => (
                                <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className={`h-full bg-white transition-all ${i <= activeStoryIndex ? "w-full" : "w-0"}`} />
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-[1020]">
                            <div className="flex items-center gap-3">
                                <img
                                    src={getFullUrl(userList[viewingUserIndex].profilePicture)}
                                    className="w-10 h-10 rounded-full border border-white/50 object-cover"
                                    alt="avatar"
                                />
                                <span className="text-white font-bold text-sm">
                                    {userList[viewingUserIndex].userName}
                                </span>
                                <span className="text-white/70 text-[11px]">
                {getTimeAgo(userList[viewingUserIndex].items[activeStoryIndex].CreatedAt)} trước
            </span>
                            </div>
                            {String(userList[viewingUserIndex].items[activeStoryIndex].UserId).toLowerCase() ===
                                String(user?.id).toLowerCase() && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(userList[viewingUserIndex].items[activeStoryIndex].Id);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-xs font-bold"
                                >
                                    Xóa tin
                                </button>
                            )}
                        </div>

                        {/* Media */}
                        <div className="flex-1 flex items-center justify-center bg-zinc-900">
                            {userList[viewingUserIndex].items[activeStoryIndex].MediaUrl?.toLowerCase().match(/\.(mp4|mov|avi)$/) ? (
                                <video
                                    src={getFullUrl(userList[viewingUserIndex].items[activeStoryIndex].MediaUrl)}
                                    autoPlay
                                    className="max-h-full w-full object-contain"
                                />
                            ) : (
                                <img
                                    src={getFullUrl(userList[viewingUserIndex].items[activeStoryIndex].MediaUrl)}
                                    className="max-h-full object-contain"
                                    alt="story"
                                />
                            )}
                        </div>

                        {/* Content */}
                        {userList[viewingUserIndex].items[activeStoryIndex].Content && (
                            <div className="absolute bottom-12 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/80 to-transparent text-center">
                                <p className="text-white text-base font-medium">
                                    {userList[viewingUserIndex].items[activeStoryIndex].Content}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL TẠO TIN */}
            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#242526] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-white text-xl font-bold text-center w-full">Tạo tin</h3>
                            <button onClick={handleCancel} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Bạn đang nghĩ gì?"
                                className="w-full bg-[#3a3b3c] text-white rounded-lg p-3 outline-none h-32 mb-4"
                            />
                            <input type="file" id="file-upload" hidden onChange={handleFileChange} accept="image/*,video/*" />
                            <label htmlFor="file-upload" className="block w-full text-center py-3 bg-[#3a3b3c] text-blue-500 rounded-lg cursor-pointer font-semibold border border-gray-600">
                                {file ? `📂 ${file.name}` : "🖼️ Thêm ảnh hoặc video"}
                            </label>
                            {preview && (
                                <div className="mt-4 h-48 bg-black rounded-lg overflow-hidden">
                                    <img src={preview} className="w-full h-full object-contain" alt="Preview" />
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex gap-3">
                            <button onClick={handleCancel} className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-bold">Hủy</button>
                            <button onClick={handleCreateStory} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Chia sẻ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryList;