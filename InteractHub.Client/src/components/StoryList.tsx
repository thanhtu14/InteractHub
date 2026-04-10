import React, { useRef, useEffect } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface StoryItemProps {
  user: {
    id: string | number;
    fullName?: string;
    avatarUrl?: string;
  };
}

const StoryList: React.FC<StoryItemProps> = ({ user }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Attach native wheel event với passive: false để có thể gọi preventDefault()
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // 🔥 SCROLL BUTTON
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const mockStories = [
    { id: 2, fullName: "Minh Thu", avatar: "https://i.pravatar.cc/150?u=thu", bg: "https://picsum.photos/300/500?1" },
    { id: 3, fullName: "Quốc Anh", avatar: "https://i.pravatar.cc/150?u=anh", bg: "https://picsum.photos/300/500?2" },
    { id: 4, fullName: "Hồng Nhung", avatar: "https://i.pravatar.cc/150?u=nhung", bg: "https://picsum.photos/300/500?3" },
    { id: 5, fullName: "Phương", avatar: "https://i.pravatar.cc/150?u=phuong", bg: "https://picsum.photos/300/500?4" },
    { id: 6, fullName: "Lan", avatar: "https://i.pravatar.cc/150?u=lan", bg: "https://picsum.photos/300/500?5" },
    { id: 7, fullName: "Nam", avatar: "https://i.pravatar.cc/150?u=nam", bg: "https://picsum.photos/300/500?6" },
  ];

  return (
    <div className="relative w-full py-2">

      {/* 🔥 LEFT ARROW */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                   w-9 h-9 rounded-full bg-[#3a3b3c]
                   flex items-center justify-center
                   text-white hover:bg-[#4e4f50] transition shadow"
      >
        <FaChevronLeft />
      </button>

      {/* 🔥 RIGHT ARROW */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                   w-9 h-9 rounded-full bg-[#3a3b3c]
                   flex items-center justify-center
                   text-white hover:bg-[#4e4f50] transition shadow"
      >
        <FaChevronRight />
      </button>

      {/* 🔥 SCROLL CONTAINER */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 px-2 scroll-smooth"
      >
        {/* CREATE STORY */}
        <div className="w-40 h-62 flex-shrink-0 bg-[#242526] rounded-xl overflow-hidden shadow-lg border border-[#3e4042] group cursor-pointer relative">
          <img
            src={user.avatarUrl || "https://via.placeholder.com/150"}
            alt="my avatar"
            className="w-full h-40 object-cover group-hover:scale-110 transition"
          />
          <div className="absolute inset-x-0 bottom-0 bg-[#242526] pt-1 pb-3 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-logocolor rounded-full flex items-center justify-center ring-4 ring-[#242526]">
              <FaPlus className="text-white text-xl" />
            </div>
            <p className="text-white text-sm font-bold mt-6 px-1 truncate">
              Tạo tin
            </p>
          </div>
        </div>

        {/* STORY LIST */}
        {mockStories.map((story) => (
          <div
            key={story.id}
            className="w-40 h-62 flex-shrink-0 bg-[#242526] rounded-xl overflow-hidden shadow-lg border border-[#3e4042] group cursor-pointer relative"
          >
            <img
              src={story.bg}
              alt="story background"
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />

            <img
              src={story.avatar}
              alt={story.fullName}
              className="absolute top-3 left-3 w-10 h-10 rounded-full object-cover ring-4 ring-logocolor"
            />

            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-end">
              <p className="text-white text-sm font-semibold truncate">
                {story.fullName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryList;