// import React, { useState, useRef, useEffect } from "react";
// import EmojiPicker, { Theme } from 'emoji-picker-react';
// import { 
//   FaTimes, FaImage, FaUserFriends, FaSmile, FaGlobeAsia,
//   FaLock, FaCaretDown, FaCheck, FaPlus, FaSave, FaHashtag
// } from "react-icons/fa";
// import { postService } from "../services/postService";
// import { hashtagService } from "../services/hashtagService";
// import { toast } from "react-toastify";

// interface PostModalProps {
//   user?: any;
//   onClose: () => void;
//   onPostCreated?: () => void; 
// }

// interface SelectedMedia {
//   file: File;
//   preview: string;
//   type: 'image' | 'video';
// }

// const SERVER_BASE_URL = "https://localhost:7069";

// const PostModal: React.FC<PostModalProps> = ({ user, onClose, onPostCreated }) => {
//   // ── States ──
//   const [postTitle, setPostTitle] = useState("");
//   const [postContent, setPostContent] = useState("");
//   const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
//   const [showImageUpload, setShowImageUpload] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [status, setStatus] = useState(1); 
//   const [showStatusMenu, setShowStatusMenu] = useState(false);

//   // Hashtag States
//   const [allHashtags, setAllHashtags] = useState<string[]>([]);
//   const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
//   const [suggestionIndex, setSuggestionIndex] = useState(0);
//   const [hashtagQuery, setHashtagQuery] = useState<{ start: number; text: string } | null>(null);

//   // ── Refs ──
//   const statusMenuRef = useRef<HTMLDivElement>(null);
//   const emojiPickerRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const currentUser = user || JSON.parse(localStorage.getItem("interact_hub_user") || "{}");

//   const statusOptions = [
//     { id: 1, label: "Công khai", icon: <FaGlobeAsia size={14} />, desc: "Bất kỳ ai cũng có thể xem" },
//     { id: 2, label: "Bạn bè", icon: <FaUserFriends size={14} />, desc: "Bạn bè trên hệ thống" },
//     { id: 3, label: "Riêng tư", icon: <FaLock size={14} />, desc: "Chỉ mình bạn xem được" },
//   ];

//   // ── CSS CHUNG (Rất quan trọng để không bị lệch chữ) ──
//   const sharedTextStyle = "w-full min-h-[120px] text-lg leading-relaxed font-sans p-0 m-0 border-none resize-none focus:outline-none break-words whitespace-pre-wrap";

//   // ── Effects ──
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) setShowStatusMenu(false);
//       if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) setShowEmojiPicker(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     return () => selectedMedia.forEach(item => URL.revokeObjectURL(item.preview));
//   }, [selectedMedia]);

//   // Load hashtags từ API
//   useEffect(() => {
//     const fetchTags = async () => {
//       try {
//         const res = await hashtagService.getAllHashtags();
//         const rawData = res.data || [];
//         if (Array.isArray(rawData)) {
//           const tags = rawData.reduce((acc: string[], item: any) => {
//             if (item.tag) {
//               const formattedTag = item.tag.startsWith('#') ? item.tag : `#${item.tag}`;
//               acc.push(formattedTag);
//             }
//             return acc;
//           }, []);
//           setAllHashtags(Array.from(new Set(tags)));
//         }
//       } catch (e) {
//         console.error("Load hashtag failed", e);
//       }
//     };
//     fetchTags();
//   }, []);

//   // ── Hashtag Logic ──
//   const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const value = e.target.value;
//     const selectionStart = e.target.selectionStart;
//     setPostContent(value);

//     const lastHashIndex = value.lastIndexOf('#', selectionStart - 1);
//     if (lastHashIndex !== -1) {
//       const textAfterHash = value.substring(lastHashIndex + 1, selectionStart);
//       if (!textAfterHash.includes(' ') && !textAfterHash.includes('\n')) {
//         setHashtagQuery({ start: lastHashIndex, text: textAfterHash });
//         const filtered = allHashtags.filter(tag => 
//           tag.toLowerCase().includes(`#${textAfterHash.toLowerCase()}`)
//         );
//         setFilteredSuggestions(filtered);
//         setSuggestionIndex(0);
//         return;
//       }
//     }
//     setHashtagQuery(null);
//     setFilteredSuggestions([]);
//   };

//   const selectHashtag = (tag: string) => {
//     if (!hashtagQuery) return;
//     const before = postContent.substring(0, hashtagQuery.start);
//     const after = postContent.substring(textareaRef.current?.selectionStart || 0);
//     const newContent = `${before}${tag} ${after}`;
//     setPostContent(newContent);
//     setHashtagQuery(null);
//     setFilteredSuggestions([]);
//     setTimeout(() => textareaRef.current?.focus(), 0);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (filteredSuggestions.length > 0) {
//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         setSuggestionIndex(prev => (prev + 1) % filteredSuggestions.length);
//       } else if (e.key === 'ArrowUp') {
//         e.preventDefault();
//         setSuggestionIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
//       } else if (e.key === 'Enter' || e.key === 'Tab') {
//         e.preventDefault();
//         selectHashtag(filteredSuggestions[suggestionIndex]);
//       } else if (e.key === 'Escape') {
//         setHashtagQuery(null);
//         setFilteredSuggestions([]);
//       }
//     }
//   };

//   const getHighlightedText = (text: string) => {
//     if (!text) return "";
//     const parts = text.split(/(\s+)/);
//     return parts.map((part, i) => (
//       part.startsWith("#") && part.length > 1 
//         ? <span key={i} className="text-[#1877f2] font-semibold">{part}</span> 
//         : <span key={i}>{part}</span>
//     ));
//   };

//   const onEmojiClick = (emojiObject: any) => {
//     setPostContent(prev => prev + emojiObject.emoji);
//     setTimeout(() => textareaRef.current?.focus(), 0);
//   };

//   const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files) {
//       const newMedia = Array.from(files).map(file => ({
//         file,
//         preview: URL.createObjectURL(file),
//         type: file.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video'
//       }));
//       setSelectedMedia(prev => [...prev, ...newMedia]);
//       setShowImageUpload(true);
//     }
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const removeMedia = (index: number) => {
//     setSelectedMedia(prev => prev.filter((_, i) => i !== index));
//   };

//   const handlePostSubmit = async () => {
//     if (!postTitle.trim() && !postContent.trim() && selectedMedia.length === 0) return;
//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("Title", postTitle.trim()); 
//       formData.append("Content", postContent.trim());
//       formData.append("Status", status.toString());
//       formData.append("OriginalPostId", "");
//       selectedMedia.forEach(item => formData.append("Files", item.file));

//       const data = await postService.createPost(formData);
//       if(data.status === 200) {
//         toast.success("Bài viết đã được đăng thành công!");
//       }
//       onPostCreated?.(); 
//       onClose();
//     } catch (error: any) {
//       alert(error.response?.data?.message || "Có lỗi xảy ra khi đăng bài");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-[#e4e6eb]">
//       <div className="bg-[var(--color-bg)] w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col border border-[var(--color-border)] animate-in fade-in zoom-in duration-300">

//         {/* Header */}
//         <div className="relative flex items-center justify-center border-b border-[var(--color-border)] px-4 py-4">
//           <h3 className="text-xl font-bold text-[var(--color-text)]">Tạo bài viết</h3>
//           <button onClick={onClose} className="absolute right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-bg)] hover:bg-[var(--color-bg)] text-[var-] transition-colors">
//             <FaTimes size={18} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-4 overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-[#3e4042]">
//           <div className="flex items-center gap-3 mb-5">
//             <img 
//               src={currentUser?.AvatarUrl ? (currentUser.AvatarUrl.startsWith('http') ? currentUser.AvatarUrl : `${SERVER_BASE_URL}${currentUser.AvatarUrl}`) : "/images/default-avatar.png"} 
//               alt="avatar" 
//               className="w-12 h-12 rounded-full object-cover border border-[var(--color-border)] shadow-md" 
//             />
//             <div className="flex flex-col">
//               <p className="font-bold text-[var(--color-text)] leading-tight">{currentUser?.FullName || currentUser?.Username || "Thành viên"}</p>
//               <div className="relative" ref={statusMenuRef}>
//                 <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="bg-[var(--color-bg)] px-2.5 py-1 rounded-lg flex items-center gap-2 hover:bg-[var(--color-bg)] transition-all mt-1 border border-[var(--color-border)]      ">
//                   <span className="text-[var(--color-text)]">{statusOptions.find(opt => opt.id === status)?.icon}</span>
//                   <span className="text-[var(--color-text)] text-[12px] font-semibold">{statusOptions.find(opt => opt.id === status)?.label}</span>
//                   <FaCaretDown size={10} className="text-[var(--color-text)]" />
//                 </button>
//                 {showStatusMenu && (
//                   <div className="absolute top-full left-0 mt-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl z-[110] w-[280px] p-2 animate-in fade-in slide-in-from-top-2">
//                     {statusOptions.map((opt) => (
//                       <div key={opt.id} onClick={() => { setStatus(opt.id); setShowStatusMenu(false); }} className="flex items-center justify-between p-2 hover:bg-[var(--color-bg)] rounded-xl cursor-pointer transition-colors">
//                         <div className="flex items-center gap-3">
//                           <div className="w-9 h-9 bg-[var(--color-text)] rounded-full flex items-center justify-center text-[var(--color-text)]">{opt.icon}</div>
//                           <div>
//                             <p className="text-[var(--color-text)] text-sm font-bold">{opt.label}</p>
//                             <p className="text-[var(--color-text)] text-[11px]">{opt.desc}</p>
//                           </div>
//                         </div>
//                         {status === opt.id && <FaCheck size={12} className="text-[#1877f2]" />}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <input 
//             type="text" 
//             placeholder="Tiêu đề bài viết (không bắt buộc)..." 
//             value={postTitle} 
//             onChange={(e) => setPostTitle(e.target.value)} 
//             className="w-full bg-[var(--color-bg)] text-[var(--color-text)] caret-[var(--color-text)] text-xl font-bold placeholder:text-[var(--color-hover)] mb-3 focus:outline-none" 
//           />

//           <div className="relative min-h-[120px] w-full">
//             {/* LỚP HIGHLIGHT (DƯỚI) */}
//             <div 
//               className={`absolute inset-0 pointer-events-none z-0 text-[var(--color-text)] ${sharedTextStyle}`}
//               aria-hidden="true"
//             >
//               {getHighlightedText(postContent)}
//             </div>

//             {/* LỚP TEXTAREA (TRÊN) */}
//             <textarea
//               ref={textareaRef}
//               placeholder={`${currentUser?.FullName || 'Vinh'} ơi, bạn đang nghĩ gì thế?`}
//               value={postContent}
//               onChange={handleTextareaChange}
//               onKeyDown={handleKeyDown}
//               /* text-transparent giúp ẩn chữ gốc, chỉ hiện lớp highlight phía dưới */
//               className={`relative z-10 bg-[var(--color-bg)] caret-[var(--color-text)] ${sharedTextStyle} ${
//                 postContent.length > 0 ? "text-[var(--color-hover)]" : "text-[var(--color-hover)]"
//               }`}
//             />

//             {/* Hashtag Suggestions UI */}
//             {filteredSuggestions.length > 0 && (
//               <div className="absolute z-[160] left-0 bottom-full mb-2 w-64 bg-[var(--color-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
//                 <div className="p-2 border-b border-[var(--color-border)] flex items-center gap-2 text-xs text-[var(--color-text)] font-bold uppercase tracking-wider">
//                   <FaHashtag /> Gợi ý Hashtag
//                 </div>
//                 <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#4e4f50]">
//                   {filteredSuggestions.map((tag, index) => (
//                     <div
//                       key={tag}
//                       onMouseDown={(e) => { e.preventDefault(); selectHashtag(tag); }}
//                       className={`px-4 py-2 cursor-pointer flex items-center justify-between transition-colors ${index === suggestionIndex ? 'bg-[var(--color-bg)] text-[var(--color-text)]' : 'hover:bg-[var(--color-bg)] text-[var(--color-text)]'}`}
//                     >
//                       <span className="font-medium">{tag}</span>
//                       {index === suggestionIndex && <span className="text-[10px] bg-white/20 px-1 rounded">Enter</span>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="absolute bottom-2 right-2 flex items-center z-20">
//                <div className="relative" ref={emojiPickerRef}>
//                   <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-[#8a8d91] hover:text-[#f7b928] transition-colors p-2">
//                     <FaSmile size={24} />
//                   </button>
//                   {showEmojiPicker && (
//                     <div className="absolute bottom-full right-0 mb-3 z-[150] shadow-2xl scale-90 origin-bottom-right">
//                       <EmojiPicker theme={Theme.DARK} onEmojiClick={onEmojiClick} width={320} height={400} />
//                     </div>
//                   )}
//                </div>
//             </div>
//           </div>

//           {showImageUpload && selectedMedia.length > 0 && (
//             <div className="relative mt-4 border border-border rounded-xl p-2 bg-[var(--color-bg)] group/upload">
//               <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
//                 {selectedMedia.slice(0, 4).map((item, idx) => (
//                   <div key={idx} className="relative h-40 border border-border overflow-hidden group">
//                     {item.type === 'video' ? <video src={item.preview} className="w-full h-full object-cover" /> : <img src={item.preview} className="w-full h-full object-cover" />}
//                     <button onClick={() => removeMedia(idx)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-[var(--color-text)] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"><FaTimes size={10} /></button>
//                   </div>
//                 ))}
//               </div>
//               <div onClick={() => fileInputRef.current?.click()} className="absolute top-4 right-4 w-10 h-10 bg-[var(--color-bg)] hover:bg-[var(--color-bg)] rounded-full flex items-center justify-center cursor-pointer border-2 border-[#242526] z-30 shadow-xl text-[var(--color-text)] transition-all">
//                  <FaPlus size={16} />
//               </div>
//             </div>
//           )}

//           <div className="mt-6 border border-[var(--color-text)] rounded-xl p-4 flex items-center justify-between bg-[var(--color-bg)]/20">
//             <span className="text-sm font-bold text-[var(--color-text)]">Thêm vào bài viết</span>
//             <div className="flex gap-1">
//               <button type="button" onClick={() => { setShowImageUpload(true); fileInputRef.current?.click(); }} className="p-2.5 hover:bg-[var(--color-bg)] rounded-full transition-all group" title="Ảnh/Video">
//                 <FaImage size={22} className="text-[#45bd62] group-hover:scale-110 transition-transform" />
//               </button>
//               <button type="button" className="p-2.5 hover:bg-[var(--color-bg)] rounded-full transition-all group" title="Gắn thẻ bạn bè">
//                 <FaUserFriends size={22} className="text-[#1877f2] group-hover:scale-110 transition-transform" />
//               </button>
//               <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 hover:bg-[var(--color-bg)] rounded-full transition-all text-[#f7b928] group" title="Cảm xúc">
//                 <FaSmile size={22} className="group-hover:scale-110 transition-transform" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-4">
//           <button
//             onClick={handlePostSubmit}
//             disabled={(!postContent.trim() && !postTitle.trim() && selectedMedia.length === 0) || isLoading}
//             className="w-full bg-[var(--color-bg)] hover:bg-[var(--color-bg)] disabled:bg-[var(--color-bg)] disabled:text-[#8a8d91] text-[var(--color-text)] font-bold py-3 rounded-xl transition-all flex items-center justify-center text-base shadow-lg active:scale-[0.98]"
//           >
//             {isLoading ? (
//               <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
//             ) : (
//               <span className="flex items-center gap-2 text-[var(--color-text)]"><FaSave /> Đăng bài ngay</span>
//             )}
//           </button>
//         </div>
//       </div>
//       <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
//     </div>
//   );
// };

// export default PostModal;

import React, { useState, useRef, useEffect } from "react";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { 
  FaTimes, FaImage, FaUserFriends, FaSmile, FaGlobeAsia,
  FaLock, FaCaretDown, FaCheck, FaPlus, FaSave, FaHashtag
} from "react-icons/fa";
import { postService } from "../services/postService";
import { hashtagService } from "../services/hashtagService";
import { toast } from "react-toastify";

interface PostModalProps {
  user?: any;
  onClose: () => void;
  onPostCreated?: () => void; 
}

interface SelectedMedia {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const SERVER_BASE_URL = "https://localhost:7069";

const PostModal: React.FC<PostModalProps> = ({ user, onClose, onPostCreated }) => {
  // ── States ──
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [status, setStatus] = useState(1); 
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  // Hashtag States
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [hashtagQuery, setHashtagQuery] = useState<{ start: number; text: string } | null>(null);

  // ── Refs ──
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUser = user || JSON.parse(localStorage.getItem("interact_hub_user") || "{}");

  const statusOptions = [
    { id: 1, label: "Công khai", icon: <FaGlobeAsia size={14} />, desc: "Bất kỳ ai cũng có thể xem" },
    { id: 2, label: "Bạn bè", icon: <FaUserFriends size={14} />, desc: "Bạn bè trên hệ thống" },
    { id: 3, label: "Riêng tư", icon: <FaLock size={14} />, desc: "Chỉ mình bạn xem được" },
  ];

  // ── CSS CHUNG (Rất quan trọng để không bị lệch chữ) ──
  const sharedTextStyle = "w-full min-h-[120px] text-lg leading-relaxed font-sans p-0 m-0 border-none resize-none focus:outline-none break-words whitespace-pre-wrap";

  // ── Effects ──
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) setShowStatusMenu(false);
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) setShowEmojiPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => selectedMedia.forEach(item => URL.revokeObjectURL(item.preview));
  }, [selectedMedia]);

  // Load hashtags từ API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await hashtagService.getAllHashtags();
        const rawData = res.data || [];
        if (Array.isArray(rawData)) {
          const tags = rawData.reduce((acc: string[], item: any) => {
            if (item.tag) {
              const formattedTag = item.tag.startsWith('#') ? item.tag : `#${item.tag}`;
              acc.push(formattedTag);
            }
            return acc;
          }, []);
          setAllHashtags(Array.from(new Set(tags)));
        }
      } catch (e) {
        console.error("Load hashtag failed", e);
      }
    };
    fetchTags();
  }, []);

  // ── Hashtag Logic ──
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setPostContent(value);

    const lastHashIndex = value.lastIndexOf('#', selectionStart - 1);
    if (lastHashIndex !== -1) {
      const textAfterHash = value.substring(lastHashIndex + 1, selectionStart);
      if (!textAfterHash.includes(' ') && !textAfterHash.includes('\n')) {
        setHashtagQuery({ start: lastHashIndex, text: textAfterHash });
        const filtered = allHashtags.filter(tag => 
          tag.toLowerCase().includes(`#${textAfterHash.toLowerCase()}`)
        );
        setFilteredSuggestions(filtered);
        setSuggestionIndex(0);
        return;
      }
    }
    setHashtagQuery(null);
    setFilteredSuggestions([]);
  };

  const selectHashtag = (tag: string) => {
    if (!hashtagQuery) return;
    const before = postContent.substring(0, hashtagQuery.start);
    const after = postContent.substring(textareaRef.current?.selectionStart || 0);
    const newContent = `${before}${tag} ${after}`;
    setPostContent(newContent);
    setHashtagQuery(null);
    setFilteredSuggestions([]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectHashtag(filteredSuggestions[suggestionIndex]);
      } else if (e.key === 'Escape') {
        setHashtagQuery(null);
        setFilteredSuggestions([]);
      }
    }
  };

  const getHighlightedText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => (
      part.startsWith("#") && part.length > 1 
        ? <span key={i} className="text-[var(--color-blue)] font-semibold">{part}</span> 
        : <span key={i}>{part}</span>
    ));
  };

  const onEmojiClick = (emojiObject: any) => {
    setPostContent(prev => prev + emojiObject.emoji);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newMedia = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video'
      }));
      setSelectedMedia(prev => [...prev, ...newMedia]);
      setShowImageUpload(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async () => {
    if (!postTitle.trim() && !postContent.trim() && selectedMedia.length === 0) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("Title", postTitle.trim()); 
      formData.append("Content", postContent.trim());
      formData.append("Status", status.toString());
      formData.append("OriginalPostId", "");
      selectedMedia.forEach(item => formData.append("Files", item.file));

      const data = await postService.createPost(formData);
      if(data.status === 200) {
        toast.success("Bài viết đã được đăng thành công!");
      }
      onPostCreated?.(); 
      onClose();
    } catch (error: any) {
        toast.error("Có lỗi xảy ra khi đăng bài viết!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-[#e4e6eb]">
      <div className="bg-[var(--color-bg)] w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col border border-[var(--color-border)] animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="relative flex items-center justify-center border-b border-[var(--color-border)] px-4 py-4">
          <h3 className="text-xl font-bold text-[var(--color-text)]">Tạo bài viết</h3>
          <button onClick={onClose} className="absolute right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-bg)] hover:bg-[var(--color-hover)] text-[var(--color-text)] transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-[#3e4042]">
          <div className="flex items-center gap-3 mb-5">
            <img 
              src={currentUser?.AvatarUrl ? (currentUser.AvatarUrl.startsWith('http') ? currentUser.AvatarUrl : `${SERVER_BASE_URL}${currentUser.AvatarUrl}`) : "/images/default-avatar.png"} 
              alt="avatar" 
              className="w-12 h-12 rounded-full object-cover border border-[var(--color-border)] shadow-md" 
            />
            <div className="flex flex-col">
              <p className="font-bold text-[var(--color-text)] leading-tight">{currentUser?.FullName || currentUser?.Username || "Thành viên"}</p>
              <div className="relative" ref={statusMenuRef}>
                <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="bg-[var(--color-bg)] px-2.5 py-1 rounded-lg flex items-center gap-2 hover:bg-[var(--color-hover)] transition-all mt-1 border border-[var(--color-border)]">
                  <span className="text-[var(--color-blue)]">{statusOptions.find(opt => opt.id === status)?.icon}</span>
                  <span className="text-[var(--color-text)] text-[12px] font-semibold">{statusOptions.find(opt => opt.id === status)?.label}</span>
                  <FaCaretDown size={10} className="text-[var(--color-text)]" />
                </button>
                {showStatusMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl z-[110] w-[280px] p-2 animate-in fade-in slide-in-from-top-2">
                    {statusOptions.map((opt) => (
                      <div key={opt.id} onClick={() => { setStatus(opt.id); setShowStatusMenu(false); }} className="flex items-center justify-between p-2 hover:bg-[var(--color-hover)] rounded-xl cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[var(--color-bg)] rounded-full flex items-center justify-center text-[var(--color-blue)]">{opt.icon}</div>
                          <div>
                            <p className="text-[var(--color-text)] text-sm font-bold">{opt.label}</p>
                            <p className="text-[var(--color-text)] text-[11px]">{opt.desc}</p>
                          </div>
                        </div>
                        {status === opt.id && <FaCheck size={12} className="text-[#1877f2]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <input 
            type="text" 
            placeholder="Tiêu đề bài viết (không bắt buộc)..." 
            value={postTitle} 
            onChange={(e) => setPostTitle(e.target.value)} 
            className="w-full bg-transparent text-[var(--color-text)] text-xl font-bold placeholder:text-[var(--color-text)] mb-3 focus:outline-none" 
          />

          <div className="relative min-h-[120px] w-full">
            {/* LỚP HIGHLIGHT (DƯỚI) */}
            <div 
              className={`absolute inset-0 pointer-events-none z-0 text-[var(--color-text)] ${sharedTextStyle}`}
              aria-hidden="true"
            >
              {getHighlightedText(postContent)}
            </div>

            {/* LỚP TEXTAREA (TRÊN) */}
            <textarea
              ref={textareaRef}
              placeholder={`${currentUser?.FullName || 'Bạn'} đang nghĩ gì thế?`}
              value={postContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              /* text-transparent giúp ẩn chữ gốc, chỉ hiện lớp highlight phía dưới */
              className={`relative z-10 bg-transparent caret-[var(--color-text)] ${sharedTextStyle} ${
                postContent.length > 0 ? "text-[var(--color-text)]" : "text-[var(--color-text)]"
              }`}
            />
            
            {/* Hashtag Suggestions UI */}
            {filteredSuggestions.length > 0 && (
              <div className="absolute z-[160] left-0 bottom-full mb-2 w-64 bg-[var(--color-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
                <div className="p-2 border-b border-[var(--color-border)] flex items-center gap-2 text-xs text-[var(--color-text)] font-bold uppercase tracking-wider">
                  <FaHashtag /> Gợi ý Hashtag
                </div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#4e4f50]">
                  {filteredSuggestions.map((tag, index) => (
                    <div
                      key={tag}
                      onMouseDown={(e) => { e.preventDefault(); selectHashtag(tag); }}
                      className={`px-4 py-2 cursor-pointer flex items-center justify-between transition-colors ${index === suggestionIndex ? 'bg-[var(--color-bg)] text-white' : 'hover:bg-[var(--color-hover)]  text-[var(--color-text)]'}`}
                    >
                      <span className="font-medium">{tag}</span>
                      {index === suggestionIndex && <span className="text-[10px] bg-white/20 px-1 rounded">Enter</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 flex items-center z-20">
               <div className="relative" ref={emojiPickerRef}>
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-[var(--color-text)] hover:text-[var(--color-blue)] transition-colors p-2">
                    <FaSmile size={24} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-3 z-[150] shadow-2xl scale-90 origin-bottom-right">
                      <EmojiPicker theme={Theme.DARK} onEmojiClick={onEmojiClick} width={320} height={400} />
                    </div>
                  )}
               </div>
            </div>
          </div>

          {showImageUpload && selectedMedia.length > 0 && (
            <div className="relative mt-4 border border-border rounded-xl p-2 bg-bg group/upload">
              <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
                {selectedMedia.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="relative h-40 border border-border overflow-hidden group">
                    {item.type === 'video' ? <video src={item.preview} className="w-full h-full object-cover" /> : <img src={item.preview} className="w-full h-full object-cover" />}
                    <button onClick={() => removeMedia(idx)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"><FaTimes size={10} /></button>
                  </div>
                ))}
              </div>
              <div onClick={() => fileInputRef.current?.click()} className="absolute top-4 right-4 w-10 h-10 bg-bg hover:bg-bg rounded-full flex items-center justify-center cursor-pointer border-2 border-[#242526] z-30 shadow-xl text-white transition-all">
                 <FaPlus size={16} />
              </div>
            </div>
          )}

          <div className="mt-6 border border-border rounded-xl p-4 flex items-center justify-between bg-bg/20">
            <span className="text-sm font-bold text-[var(--color-text)]">Thêm vào bài viết</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => { setShowImageUpload(true); fileInputRef.current?.click(); }} className="p-2.5 hover:bg-bg rounded-full transition-all group" title="Ảnh/Video">
                <FaImage size={22} className="text-[#45bd62] group-hover:scale-110 transition-transform" />
              </button>
              <button type="button" className="p-2.5 hover:bg-bg rounded-full transition-all group" title="Gắn thẻ bạn bè">
                <FaUserFriends size={22} className="text-[#1877f2] group-hover:scale-110 transition-transform" />
              </button>
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 hover:bg-bg rounded-full transition-all text-[#f7b928] group" title="Cảm xúc">
                <FaSmile size={22} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4">
          <button
            onClick={handlePostSubmit}
            disabled={(!postContent.trim() && !postTitle.trim() && selectedMedia.length === 0) || isLoading}
            className="w-full bg-[var(--color-blue)] hover:bg-[var(--color-blue2)] disabled:bg-[var(--color-hover1)] disabled:text-[var(--color-text)] text-[var(--color-text)] font-bold py-3 rounded-xl transition-all flex items-center justify-center text-base shadow-lg active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-[var(--color-blue)] border-t-[var(--color-blue)] animate-spin rounded-full"></div>
            ) : (
              <span className="flex items-center gap-2"><FaSave /> Đăng bài ngay</span>
            )}
          </button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
    </div>
  );
};

export default PostModal;