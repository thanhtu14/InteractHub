import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, type IMessage } from "@stomp/stompjs";

// 1. Định nghĩa cấu trúc User và Message
interface User {
  username: string;
}

interface ChatMessage {
  from: string;
  content: string;
}

interface ChatBoxProps {
  user: User | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  
  // 2. Khai báo kiểu dữ liệu cho useRef
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    if (!user) return;

    // Khởi tạo socket và client
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        
        // Subscribe nhận tin nhắn
        client.subscribe("/topic/messages", (msg: IMessage) => {
          const newMessage: ChatMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    stompClient.current = client;
    client.activate();

    // Cleanup khi unmount
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [user]);

  const sendMessage = (): void => {
    // Kiểm tra kết nối trước khi gửi
    if (input.trim() && stompClient.current?.connected) {
      const chatMessage: ChatMessage = { 
        from: user!.username, 
        content: input 
      };

      stompClient.current.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMessage),
      });
      
      setInput("");
    }
  };

  if (!user) return null;

  return (
    <div style={{
      background: "#222", color: "#fff", padding: 16, borderRadius: 8,
      width: 320, position: "fixed", bottom: 20, right: 20, zIndex: 999
    }}>
      <h4 style={{ marginTop: 0 }}>Chat</h4>
      <div style={{ 
        height: 200, overflowY: "auto", background: "#333", 
        marginBottom: 8, padding: 8, borderRadius: 4 
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 4 }}>
            <b style={{ color: "#4db8ff" }}>{msg.from}:</b> {msg.content}
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          style={{ flex: 1, marginRight: 8, padding: "4px 8px" }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={sendMessage} style={{ cursor: "pointer" }}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatBox;