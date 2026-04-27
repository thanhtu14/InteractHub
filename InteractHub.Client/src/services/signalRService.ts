import * as signalR from "@microsoft/signalr";
import type { MessageItem } from "./messageService";

const HUB_URL = "https://localhost:7069/hubs/chat";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private _handlers = new Map<string, (...args: unknown[]) => void>();

  build(token: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }

  async start() {
    if (!this.connection) return;
    if (
      this.connection.state === signalR.HubConnectionState.Connected ||
      this.connection.state === signalR.HubConnectionState.Connecting
    )
      return;
    try {
      await this.connection.start();
      console.log("✅ SignalR connected");
    } catch (err) {
      console.error("❌ SignalR connection error:", err);
    }
  }

  async stop() {
    if (!this.connection) return;
    await this.connection.stop();
    this._handlers.clear();
    this.connection = null;
    console.log("🔌 SignalR disconnected");
  }

  // ── ReceiveMessage ────────────────────────────────────────────
  onReceiveMessage(
    callback: (message: MessageItem) => void,
    key = "__default__"
  ) {
    const handlerKey = `ReceiveMessage:${key}`;
    const existing = this._handlers.get(handlerKey);
    if (existing) this.connection?.off("ReceiveMessage", existing);

    const handler = callback as (...args: unknown[]) => void;
    this._handlers.set(handlerKey, handler);
    this.connection?.on("ReceiveMessage", handler);
  }

  offReceiveMessage(key = "__default__") {
    const handlerKey = `ReceiveMessage:${key}`;
    const handler = this._handlers.get(handlerKey);
    if (handler) {
      this.connection?.off("ReceiveMessage", handler);
      this._handlers.delete(handlerKey);
    }
  }

  // ── MessagesRead ──────────────────────────────────────────────
  onMessagesRead(
    callback: (data: { conversationId: number; readBy: string }) => void,
    key = "__default__"
  ) {
    const handlerKey = `MessagesRead:${key}`;
    const existing = this._handlers.get(handlerKey);
    if (existing) this.connection?.off("MessagesRead", existing);

    const handler = callback as (...args: unknown[]) => void;
    this._handlers.set(handlerKey, handler);
    this.connection?.on("MessagesRead", handler);
  }

  offMessagesRead(key = "__default__") {
    const handlerKey = `MessagesRead:${key}`;
    const handler = this._handlers.get(handlerKey);
    if (handler) {
      this.connection?.off("MessagesRead", handler);
      this._handlers.delete(handlerKey);
    }
  }

  // ── MessageDeleted ────────────────────────────────────────────
  onMessageDeleted(
    callback: (messageId: number) => void,
    key = "__default__"
  ) {
    const handlerKey = `MessageDeleted:${key}`;
    const existing = this._handlers.get(handlerKey);
    if (existing) this.connection?.off("MessageDeleted", existing);

    const handler = callback as (...args: unknown[]) => void;
    this._handlers.set(handlerKey, handler);
    this.connection?.on("MessageDeleted", handler);
  }

  offMessageDeleted(key = "__default__") {
    const handlerKey = `MessageDeleted:${key}`;
    const handler = this._handlers.get(handlerKey);
    if (handler) {
      this.connection?.off("MessageDeleted", handler);
      this._handlers.delete(handlerKey);
    }
  }

  // ── Typing ────────────────────────────────────────────────────
  async sendTypingIndicator(conversationId: string, receiverId: string) {
    if (!this.connection) return;
    try {
      await this.connection.invoke("TypingIndicator", conversationId, receiverId);
    } catch (err) {
      console.error("TypingIndicator error:", err);
    }
  }

  onUserTyping(
    callback: (data: { conversationId: string; senderId: string }) => void,
    key = "__default__"
  ) {
    const handlerKey = `UserTyping:${key}`;
    const existing = this._handlers.get(handlerKey);
    if (existing) this.connection?.off("UserTyping", existing);

    const handler = callback as (...args: unknown[]) => void;
    this._handlers.set(handlerKey, handler);
    this.connection?.on("UserTyping", handler);
  }

  offUserTyping(key = "__default__") {
    const handlerKey = `UserTyping:${key}`;
    const handler = this._handlers.get(handlerKey);
    if (handler) {
      this.connection?.off("UserTyping", handler);
      this._handlers.delete(handlerKey);
    }
  }

  getState() {
    return this.connection?.state;
  }
}

export const signalRService = new SignalRService();