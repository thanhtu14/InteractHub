import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  FaPaperPlane,
  FaImage,
  FaTimes,
  FaPlay,
  FaMinus,
} from "react-icons/fa";
import { messageService, type MessageItem } from "../services/messageService";
import { resolveUrl } from "../utils/urlUtils";
import { useAuth } from "../context/useAuth";
import { signalRService } from "../services/signalRService";
import PostCard from "./PostCard";

// ── TYPES ─────────────────────────────────────────────────────────
export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface MessageContent {
  text?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface Message {
  id: string;
  senderId: string | undefined;
  content: MessageContent;
  createdAt: string;
  rawTime: Date;
  isRead: boolean;
}

export interface MessageGroup {
  senderId: string | undefined;
  messages: Message[];
  groupTime: string;
  dateLabel: string;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
  isVideo: boolean;
}

// ── HELPERS ───────────────────────────────────────────────────────
const formatTime = (date: Date): string =>
  date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

const formatDateLabel = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "Hôm nay";
  if (d.getTime() === yesterday.getTime()) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ── MAPPER ────────────────────────────────────────────────────────
const mapToUIMessage = (m: MessageItem): Message => {
  const imageUrls =
    m.medias
      ?.filter((x) => x.mediaType === 1)
      .map((x) => resolveUrl(x.mediaUrl))
      .filter((url): url is string => !!url) ?? [];
  const videoUrls =
    m.medias
      ?.filter((x) => x.mediaType === 2)
      .map((x) => resolveUrl(x.mediaUrl))
      .filter((url): url is string => !!url) ?? [];
  const rawTime = new Date(m.createdAt);
  return {
    id: String(m.id),
    senderId: m.senderId,
    content: { text: m.content, imageUrls, videoUrls },
    createdAt: formatTime(rawTime),
    rawTime,
    isRead: m.isRead,
  };
};

// ── GROUP LOGIC ───────────────────────────────────────────────────
const groupMessages = (messages: Message[]): MessageGroup[] => {
  if (!messages.length) return [];
  const groups: MessageGroup[] = [];
  let current: MessageGroup = {
    senderId: messages[0].senderId,
    messages: [messages[0]],
    groupTime: messages[0].createdAt,
    dateLabel: formatDateLabel(messages[0].rawTime),
  };
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    const diff =
      (msg.rawTime.getTime() - messages[i - 1].rawTime.getTime()) / 60000;
    if (msg.senderId === current.senderId && diff <= 3) {
      current.messages.push(msg);
      current.groupTime = msg.createdAt;
      current.dateLabel = formatDateLabel(msg.rawTime);
    } else {
      groups.push(current);
      current = {
        senderId: msg.senderId,
        messages: [msg],
        groupTime: msg.createdAt,
        dateLabel: formatDateLabel(msg.rawTime),
      };
    }
  }
  groups.push(current);
  return groups;
};

// ── DATE SEPARATOR ────────────────────────────────────────────────
const DateSeparator: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 my-4 px-2">
    <div className="flex-1 h-px bg-[#3e4042]" />
    <span className="text-[11px] text-gray-500 font-medium flex-shrink-0 select-none">
      {label}
    </span>
    <div className="flex-1 h-px bg-[#3e4042]" />
  </div>
);

// ── MESSAGE TEXT ──────────────────────────────────────────────────
const MessageText: React.FC<{ text: string }> = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex);
  const postUrl = matches?.find((url) => url.includes("/post/"));
  const displayTitle = text
    .replace("Đã chia sẻ bài viết:", "")
    .replace(urlRegex, "")
    .trim();
  return (
    <div className="flex flex-col">
      <div className="whitespace-pre-wrap">
        {parts.map((part, i) =>
          urlRegex.test(part) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-inherit hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </div>
      {postUrl && (
        <PostCard url={postUrl} title={displayTitle || "Xem bài viết"} />
      )}
    </div>
  );
};

// ── MESSAGE GROUP UI ──────────────────────────────────────────────
const MessageGroupUI: React.FC<{
  group: MessageGroup;
  isMe: boolean;
  senderAvatar?: string;
  lastReadMessageId?: string;
  lastReadAvatar?: string;
}> = ({ group, isMe, senderAvatar, lastReadMessageId, lastReadAvatar }) => {
  const [showTime, setShowTime] = useState(false);
  return (
    <div
      className={`flex gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"} items-end`}
    >
      {!isMe && (
        <div className="w-8 flex-shrink-0">
          <img
            src={senderAvatar || "/assets/img/icons8-user-default-64.png"}
            className="w-8 h-8 rounded-full object-cover"
            alt=""
          />
        </div>
      )}
      <div className={`flex flex-col gap-1 max-w-[280px] ${isMe ? "items-end" : "items-start"}`}>
        {group.messages.map((msg, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === group.messages.length - 1;
          const isSeen = isMe && msg.id === lastReadMessageId;
          const br = isMe
            ? [
                "rounded-2xl",
                isFirst && group.messages.length > 1 ? "rounded-br-md" : "",
                !isLast && !isFirst ? "rounded-r-md" : "",
                isLast && group.messages.length > 1 ? "rounded-br-2xl" : "",
              ].join(" ")
            : [
                "rounded-2xl",
                isFirst && group.messages.length > 1 ? "rounded-bl-md" : "",
                !isLast && !isFirst ? "rounded-l-md" : "",
                isLast && group.messages.length > 1 ? "rounded-bl-2xl" : "",
              ].join(" ");
          return (
            <div key={msg.id} className="flex flex-col gap-0.5">
              <div onClick={() => setShowTime((v) => !v)} className="cursor-pointer">
                {msg.content.text && (
                  <div className={`px-4 py-2 text-[15px] leading-snug break-words ${br} ${isMe ? "bg-[#1877f2] text-white" : "bg-[#3a3b3c] text-white"}`}>
                    <MessageText text={msg.content.text} />
                  </div>
                )}
                {(msg.content.imageUrls?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {msg.content.imageUrls!.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        className="max-w-[200px] max-h-[200px] rounded-xl object-cover border border-[#3e4042] cursor-zoom-in hover:opacity-90 transition"
                        alt="media"
                        onClick={(e) => { e.stopPropagation(); window.open(url, "_blank"); }}
                      />
                    ))}
                  </div>
                )}
                {(msg.content.videoUrls?.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    {msg.content.videoUrls!.map((url, i) => (
                      <video key={i} src={url} controls
                        className="max-w-[220px] rounded-xl border border-[#3e4042]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ))}
                  </div>
                )}
              </div>
              {showTime && isLast && (
                <span className={`text-[11px] text-gray-500 px-1 ${isMe ? "text-right" : "text-left"}`}
                  style={{ animation: "fadeIn 0.15s ease" }}>
                  {msg.createdAt}
                </span>
              )}
              {isSeen && lastReadAvatar && (
                <div className="flex justify-end mt-0.5">
                  <img src={lastReadAvatar} className="w-4 h-4 rounded-full border border-gray-600" alt="seen" />
                </div>
              )}
            </div>
          );
        })}
        <span className={`text-[11px] text-gray-500 px-1 ${isMe ? "text-right" : "text-left"}`}>
          {group.groupTime}
        </span>
      </div>
      {isMe && <div className="w-8 flex-shrink-0" />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// ── CHAT WINDOW ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
const PAGE_SIZE = 20;
const DEFAULT_W = 360;
const DEFAULT_H = 520;
const MIN_W = 280;
const MIN_H = 360;
const MAX_W = 720;
const MAX_H = 900;

const ChatWindow: React.FC<{
  conversation: Conversation;
  onClose?: () => void;
  onMinimize?: () => void; // ← gọi khi bấm nút "−"
}> = ({ conversation, onClose, onMinimize }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [sending, setSending] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // ── Size & position ───────────────────────────────────────────
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const [pos, setPos] = useState({
    x: window.innerWidth - DEFAULT_W - 16,
    y: window.innerHeight - DEFAULT_H - 16,
  });

  // ── Infinite scroll ───────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);
  const shouldScrollBottomRef = useRef(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & resize refs
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef({ resizing: false, startX: 0, startY: 0, origW: 0, origH: 0, origX: 0, origY: 0, dir: "" });

  const { user } = useAuth();
  const currentUserId = user?.Id;

  // ── Load trang đầu ───────────────────────────────────────────
  useEffect(() => {
    if (!conversation.id) return;
    setMessages([]);
    setPage(1);
    setHasMore(false);
    shouldScrollBottomRef.current = true;
    messageService
      .getMessages(Number(conversation.id), 1, PAGE_SIZE)
      .then((res) => {
        setMessages(res.data.messages.map(mapToUIMessage));
        setHasMore(res.data.hasMore);
      })
      .catch(console.error);
    messageService.markAsRead(Number(conversation.id)).catch(console.error);
  }, [conversation.id]);

  // ── Load thêm tin cũ ─────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? 0;
    shouldScrollBottomRef.current = false;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await messageService.getMessages(Number(conversation.id), nextPage, PAGE_SIZE);
      setMessages((prev) => [...res.data.messages.map(mapToUIMessage), ...prev]);
      setHasMore(res.data.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, conversation.id]);

  useEffect(() => {
    if (shouldScrollBottomRef.current) return;
    const c = scrollRef.current;
    if (!c) return;
    c.scrollTop += c.scrollHeight - prevScrollHeightRef.current;
  }, [messages]);

  useEffect(() => {
    if (!shouldScrollBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const onScroll = () => {
      if (c.scrollTop <= 60) loadMore();
      setShowScrollBottom(c.scrollHeight - c.scrollTop - c.clientHeight > 300);
    };
    c.addEventListener("scroll", onScroll, { passive: true });
    return () => c.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  // ── Realtime ──────────────────────────────────────────────────
  useEffect(() => {
    signalRService.onReceiveMessage((newMsg) => {
      if (String(newMsg.conversationId) !== String(conversation.id)) return;
      shouldScrollBottomRef.current = true;
      setMessages((prev) => {
        if (prev.some((m) => m.id === String(newMsg.id))) return prev;
        return [...prev, mapToUIMessage(newMsg)];
      });
      messageService.markAsRead(Number(conversation.id)).catch(console.error);
    }, "chatWindow");

    signalRService.onMessagesRead(({ conversationId }) => {
      if (String(conversationId) !== String(conversation.id)) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === String(currentUserId) ? { ...m, isRead: true } : m
        )
      );
    }, "chatWindow");

    return () => {
      signalRService.offReceiveMessage("chatWindow");
      signalRService.offMessagesRead("chatWindow");
    };
  }, [conversation.id, currentUserId]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  // ── DRAG ─────────────────────────────────────────────────────
  const onDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - size.w, dragRef.current.origX + e.clientX - dragRef.current.startX)),
        y: Math.max(0, Math.min(window.innerHeight - size.h, dragRef.current.origY + e.clientY - dragRef.current.startY)),
      });
    };
    const onUp = () => { dragRef.current.dragging = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [size]);

  // ── RESIZE ───────────────────────────────────────────────────
  const onResizeMouseDown = (e: React.MouseEvent, dir: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { resizing: true, startX: e.clientX, startY: e.clientY, origW: size.w, origH: size.h, origX: pos.x, origY: pos.y, dir };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = resizeRef.current;
      if (!r.resizing) return;
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;
      let nW = r.origW, nH = r.origH, nX = r.origX, nY = r.origY;
      if (r.dir.includes("e")) nW = Math.max(MIN_W, Math.min(MAX_W, r.origW + dx));
      if (r.dir.includes("s")) nH = Math.max(MIN_H, Math.min(MAX_H, r.origH + dy));
      if (r.dir.includes("w")) { nW = Math.max(MIN_W, Math.min(MAX_W, r.origW - dx)); nX = r.origX + (r.origW - nW); }
      if (r.dir.includes("n")) { nH = Math.max(MIN_H, Math.min(MAX_H, r.origH - dy)); nY = r.origY + (r.origH - nH); }
      setSize({ w: nW, h: nH });
      setPos({ x: nX, y: nY });
    };
    const onUp = () => { resizeRef.current.resizing = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // ── File handling ─────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setSelectedFiles((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
      })),
    ]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Send ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if ((!inputText.trim() && selectedFiles.length === 0) || sending) return;
    setSending(true);
    shouldScrollBottomRef.current = true;
    try {
      if (inputText.trim()) {
        const res = await messageService.sendMessage(Number(conversation.id), inputText.trim());
        setMessages((prev) => [...prev, mapToUIMessage(res.data)]);
      }
      for (const { file, previewUrl } of selectedFiles) {
        const res = await messageService.sendMessage(Number(conversation.id), undefined, file);
        URL.revokeObjectURL(previewUrl);
        setMessages((prev) => [...prev, mapToUIMessage(res.data)]);
      }
      setInputText("");
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const lastReadMessageId = useMemo(
    () => [...messages].reverse().find((m) => String(m.senderId) === String(currentUserId) && m.isRead)?.id,
    [messages, currentUserId]
  );
  const groups = useMemo(() => groupMessages(messages), [messages]);
  const groupsWithSep = useMemo(
    () => groups.map((group, i) => ({ group, showSep: i === 0 || groups[i - 1].dateLabel !== group.dateLabel })),
    [groups]
  );

  return (
    <div
      className="fixed z-50 flex flex-col bg-[#18191a] rounded-2xl shadow-2xl border border-[#3e4042] overflow-hidden select-none"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      {/* ── Resize handles ── */}
      <div onMouseDown={(e) => onResizeMouseDown(e, "n")} className="absolute top-0 left-2 right-2 h-1 cursor-n-resize z-20" />
      <div onMouseDown={(e) => onResizeMouseDown(e, "s")} className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize z-20" />
      <div onMouseDown={(e) => onResizeMouseDown(e, "w")} className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize z-20" />
      <div onMouseDown={(e) => onResizeMouseDown(e, "e")} className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize z-20" />
      <div onMouseDown={(e) => onResizeMouseDown(e, "nw")} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-20" />
      <div onMouseDown={(e) => onResizeMouseDown(e, "ne")} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-20" />
      <div onMouseDown={(e) => onResizeMouseDown(e, "sw")} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-20" />
      <div onMouseDown={(e) => onResizeMouseDown(e, "se")} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-20" />

      {/* ── HEADER ── */}
      <div
        onMouseDown={onDragMouseDown}
        className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-[#242526] cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <img
            src={resolveUrl(conversation.avatar) || "/assets/img/icons8-user-default-64.png"}
            className="w-9 h-9 rounded-full object-cover"
            alt=""
          />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{conversation.name}</p>
            <p className="text-[11px] text-green-500">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Nút thu nhỏ → gọi onMinimize lên MainLayout */}
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-gray-300 hover:text-white transition"
              title="Thu nhỏ"
            >
              <FaMinus size={10} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#3a3b3c] hover:bg-red-500 text-gray-300 hover:text-white transition"
              title="Đóng"
            >
              <FaTimes size={10} />
            </button>
          )}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 no-scrollbar relative">
        {loadingMore && (
          <div className="flex justify-center py-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#1877f2] border-t-transparent animate-spin" />
          </div>
        )}
        {!hasMore && messages.length > 0 && !loadingMore && (
          <p className="text-center text-gray-600 text-[11px] py-2 select-none">Đây là tin nhắn đầu tiên</p>
        )}
        {groupsWithSep.map(({ group, showSep }, i) => (
          <React.Fragment key={i}>
            {showSep && <DateSeparator label={group.dateLabel} />}
            <MessageGroupUI
              group={group}
              isMe={String(group.senderId) === String(currentUserId)}
              senderAvatar={resolveUrl(conversation.avatar)}
              lastReadMessageId={lastReadMessageId}
              lastReadAvatar={resolveUrl(conversation.avatar)}
            />
          </React.Fragment>
        ))}
        <div ref={bottomRef} />
        {showScrollBottom && (
          <button
            onClick={() => { shouldScrollBottomRef.current = true; bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#242526] border border-[#3e4042]
                       rounded-full flex items-center justify-center text-[#1877f2] shadow-lg hover:bg-[#3a3b3c] transition-all"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
          </button>
        )}
      </div>

      {/* ── FILE PREVIEW ── */}
      {selectedFiles.length > 0 && (
        <div className="flex gap-2 p-2 bg-[#242526] border-t border-[#3e4042] overflow-x-auto no-scrollbar">
          {selectedFiles.map(({ previewUrl, isVideo }, index) => (
            <div key={index} className="relative w-14 h-14 flex-shrink-0 group">
              {isVideo ? (
                <div className="relative w-full h-full">
                  <video src={previewUrl} className="w-full h-full object-cover rounded-lg border border-gray-600" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <FaPlay size={12} className="text-white" />
                  </div>
                </div>
              ) : (
                <img src={previewUrl} className="w-full h-full object-cover rounded-lg border border-gray-600" alt="preview" />
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
              >
                <FaTimes size={7} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── INPUT ── */}
      <div className="px-3 py-2 border-t border-[#3e4042] bg-[#242526] flex-shrink-0">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleFileChange} />
          <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-blue-400 transition flex-shrink-0">
            <FaImage size={18} />
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Aa"
            rows={1}
            className="flex-1 bg-[#3a3b3c] text-white rounded-2xl px-4 py-2 resize-none outline-none max-h-[100px] text-sm"
          />
          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && selectedFiles.length === 0) || sending}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          >
            {sending ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#1877f2] border-t-transparent animate-spin" />
            ) : (
              <FaPaperPlane size={18} className={inputText.trim() || selectedFiles.length > 0 ? "text-blue-500" : "text-gray-600"} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;