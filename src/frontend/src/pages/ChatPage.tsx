import { useMyProfile } from "@/hooks/useBackend";
import {
  useConversations,
  useMarkMessagesRead,
  useMessages,
  useSendMessage,
} from "@/hooks/useBackend";
import type { Conversation, MessagePublic, UserId } from "@/types";
import { MessageSquare, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

function colorFromName(name: string): string {
  const hues = [210, 180, 35, 150, 270, 320, 60];
  let sum = 0;
  for (const c of name) sum += c.charCodeAt(0);
  const hue = hues[sum % hues.length];
  return `oklch(0.55 0.12 ${hue})`;
}

// ─── Conversation item ────────────────────────────────────────────────────────

function ConversationItem({
  convo,
  isActive,
  onClick,
}: {
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const unread = Number(convo.unreadCount) > 0;
  const accent = colorFromName(convo.partnerName);

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid="chat.conversation_item"
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
        isActive ? "bg-primary/10 border-r-2 border-primary" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
        style={{ background: accent }}
        aria-hidden="true"
      >
        {getInitial(convo.partnerName)}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-sm truncate ${
              unread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground"
            }`}
          >
            {convo.partnerName}
          </span>
          {convo.lastTimestamp != null && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTimestamp(convo.lastTimestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p
            className={`text-xs truncate ${
              unread ? "text-foreground font-medium" : "text-muted-foreground"
            }`}
          >
            {convo.lastMessage ?? "No messages yet"}
          </p>
          {unread && (
            <span
              data-ocid="chat.unread_badge"
              className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {Number(convo.unreadCount) > 9 ? "9+" : Number(convo.unreadCount)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isMine,
  myAvatar,
  partnerName,
}: {
  msg: MessagePublic;
  isMine: boolean;
  myAvatar: string;
  partnerName: string;
}) {
  const accent = colorFromName(partnerName);

  return (
    <div
      className={`flex gap-2.5 items-end ${isMine ? "flex-row-reverse" : "flex-row"}`}
      data-ocid="chat.message_bubble"
    >
      {/* Avatar */}
      {!isMine && (
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mb-0.5"
          style={{ background: accent }}
          aria-hidden="true"
        >
          {getInitial(partnerName)}
        </div>
      )}
      {isMine && (
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground mb-0.5"
          aria-hidden="true"
        >
          {myAvatar}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isMine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border text-foreground rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {formatTimestamp(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Empty conversation placeholder ──────────────────────────────────────────

function EmptyChat() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
      data-ocid="chat.empty_state"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <MessageSquare className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          No conversation selected
        </h3>
        <p className="text-sm text-muted-foreground">
          Pick a conversation from the list to start chatting.
        </p>
      </div>
    </div>
  );
}

// ─── Active chat panel ────────────────────────────────────────────────────────

function ActiveChatPanel({
  partnerId,
  partnerName,
  myInitial,
}: {
  partnerId: UserId;
  partnerName: string;
  myInitial: string;
}) {
  const { data: messages = [], isLoading } = useMessages(partnerId, null);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const { data: myProfile } = useMyProfile();
  const myId = myProfile?.id?.toText();

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const markReadMutate = markRead.mutate;

  // Mark as read when panel mounts / partner changes
  useEffect(() => {
    markReadMutate(partnerId);
  }, [partnerId, markReadMutate]);

  const messagesCount = messages.length;
  const prevCountRef = useRef(0);
  // Scroll to bottom on new messages
  if (prevCountRef.current !== messagesCount) {
    prevCountRef.current = messagesCount;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate({ receiverId: partnerId, content: trimmed });
    setInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const accent = colorFromName(partnerName);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: accent }}
        >
          {getInitial(partnerName)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{partnerName}</p>
          <p className="text-xs text-muted-foreground">
            Skill exchange partner
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0"
        data-ocid="chat.messages_panel"
      >
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex gap-2 items-end ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
              >
                <div className="w-7 h-7 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div
                  className="h-10 rounded-2xl bg-muted animate-pulse"
                  style={{ width: `${140 + i * 40}px` }}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 text-center"
            data-ocid="chat.messages_empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No messages yet. Say hello! 👋
            </p>
          </div>
        )}

        {!isLoading &&
          messages.map((msg) => (
            <MessageBubble
              key={msg.id.toString()}
              msg={msg}
              isMine={msg.senderId.toText() === myId}
              myAvatar={myInitial}
              partnerName={partnerName}
            />
          ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            data-ocid="chat.message_input"
            className="flex-1 resize-none bg-muted/60 border border-input rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors min-h-[42px] max-h-[120px] leading-relaxed"
            style={{ overflowY: "auto" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            data-ocid="chat.send_button"
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

// ─── ChatPage ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { data: conversations = [], isLoading: convLoading } =
    useConversations();
  const { data: myProfile } = useMyProfile();
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  // Deep-link: ?userId=<principal>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    if (userId) setActivePartnerId(userId);
  }, []);

  // Auto-select first conversation if none active
  useEffect(() => {
    if (!activePartnerId && conversations.length > 0) {
      setActivePartnerId(conversations[0].partnerId.toText());
    }
  }, [conversations, activePartnerId]);

  const activeConvo = conversations.find(
    (c) => c.partnerId.toText() === activePartnerId,
  );

  const myInitial = getInitial(myProfile?.name ?? "Me");

  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden"
      data-ocid="chat.page"
    >
      {/* ── Left: conversation list ── */}
      <aside
        className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-card"
        data-ocid="chat.conversations_panel"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground font-display">
            Messages
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto"
          data-ocid="chat.conversations_list"
        >
          {convLoading && (
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-2.5 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!convLoading && conversations.length === 0 && (
            <div
              className="flex flex-col items-center justify-center gap-3 py-12 px-5 text-center"
              data-ocid="chat.conversations_empty_state"
            >
              <MessageSquare className="w-10 h-10 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">
                No conversations yet. Match with someone to start chatting.
              </p>
            </div>
          )}

          {!convLoading &&
            conversations.map((convo, idx) => (
              <div
                key={convo.partnerId.toText()}
                data-ocid={`chat.conversation_item.${idx + 1}`}
              >
                <ConversationItem
                  convo={convo}
                  isActive={convo.partnerId.toText() === activePartnerId}
                  onClick={() => setActivePartnerId(convo.partnerId.toText())}
                />
                <div className="mx-4 border-b border-border/60 last:border-0" />
              </div>
            ))}
        </div>
      </aside>

      {/* ── Right: active chat ── */}
      <main
        className="flex-1 flex flex-col min-w-0 bg-background"
        data-ocid="chat.active_panel"
      >
        {activeConvo ? (
          <ActiveChatPanel
            key={activeConvo.partnerId.toText()}
            partnerId={activeConvo.partnerId}
            partnerName={activeConvo.partnerName}
            myInitial={myInitial}
          />
        ) : (
          <EmptyChat />
        )}
      </main>
    </div>
  );
}
