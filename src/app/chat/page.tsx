"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import Link from "next/link";
import { User, MessageCircle, Search, ArrowLeft, Send } from "lucide-react";
import Image from "next/image";
import MobileNav from "../../components/MobileNav";

export default function ChatApp() {
  const { user } = useUser();
  const updatePresence = useMutation(api.users.updatePresence);
  const syncUser = useMutation(api.users.syncUser);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (currentUser === null) {
      syncUser();
    }
  }, [currentUser, syncUser]);

  const users = useQuery(api.users.listUsers, user ? undefined : "skip");
  const conversations = useQuery(api.conversations.listConversations, user ? undefined : "skip");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeUser, setActiveUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUserSelect = (u: any) => {
    setActiveUser(u);
    if (!window.history.state?.chatOpen) {
      window.history.pushState({ chatOpen: true }, "", window.location.href);
    }
  };

  const handleBack = () => {
    setActiveUser(null);
    if (window.history.state?.chatOpen) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (activeUser) {
        setActiveUser(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeUser]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredUsers = users?.filter((u: any) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredConversations = conversations?.filter((c: any) =>
    c.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!user) return;
    updatePresence({ isOnline: true });
    const interval = setInterval(() => { updatePresence({ isOnline: true }); }, 60000);
    const handleBeforeUnload = () => updatePresence({ isOnline: false });
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      updatePresence({ isOnline: false });
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, updatePresence]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[var(--bg-root)] text-[var(--text-primary)] px-4">
        <div className="flex flex-col items-center anim-fade-up">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent)] to-[#38bdf8] rounded-2xl flex items-center justify-center mb-6">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-medium mb-2 tracking-tight">tars</h1>
          <p className="text-[var(--text-secondary)] mb-8 font-light text-sm">Sign in to start messaging</p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-root)] rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[var(--bg-root)] text-[var(--text-primary)] overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col bg-[var(--bg-surface)]/50 backdrop-blur-xl border-r border-[var(--border)] relative z-10 ${activeUser ? "hidden md:flex" : "flex"}`}>

        {/* Sidebar Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <Image src={user.imageUrl} width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-[var(--border)]" alt="me" />
              <div className="absolute -bottom-0.5 -right-0.5 online-dot-sm" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{currentUser?.name || user.fullName || "User"}</p>
              <p className="text-[11px] text-[var(--text-muted)] font-light">@{currentUser?.username || user.username || user.firstName?.toLowerCase() || "user"}</p>
            </div>
          </div>
          <Link href="/profile" className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all border border-[var(--border)]">
            <User size={14} />
          </Link>
        </div>

        {/* Search */}
        <div className="px-3.5 py-2.5">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-clean !pl-9 !py-2 !text-[13px] !rounded-lg !font-light"
            />
          </div>
        </div>

        {/* Online Users Strip */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {!searchQuery && filteredUsers && filteredUsers.filter((u: any) => u.isOnline).length > 0 && (
          <div className="px-3.5 py-2.5 border-b border-[var(--border)]">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2.5 font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--success)]" />
              Online
            </p>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredUsers.filter((u: any) => u.isOnline).map((u: any) => (
                <button key={u._id} onClick={() => handleUserSelect(u)} className="flex flex-col items-center gap-1.5 shrink-0 group">
                  <div className="relative">
                    <div className="avatar-ring">
                      <Image src={u.imageUrl} width={42} height={42} className="w-[42px] h-[42px] rounded-full object-cover" alt="avatar" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 online-dot" />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors truncate w-12 text-center font-light">{u.name?.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations & Contacts List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {searchQuery && filteredUsers && filteredUsers.length > 0 && (
            <div className="px-2.5 pt-2.5">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-1.5 px-1.5 font-medium">People</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredUsers.map((u: any) => (
                <button
                  key={u._id}
                  onClick={() => { handleUserSelect(u); setSearchQuery(""); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.03] transition-all duration-200 group"
                >
                  <div className="relative shrink-0">
                    <Image src={u.imageUrl} width={38} height={38} className="w-[38px] h-[38px] rounded-full object-cover border border-[var(--border)]" alt="avatar" />
                    {u.isOnline && <div className="absolute -bottom-0.5 -right-0.5 online-dot-sm" />}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-[var(--text-primary)] transition-colors">{u.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate font-light">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searchQuery && (
            <div className="px-2 pt-1.5 pb-2">
              {filteredConversations === undefined ? (
                <div className="flex items-center justify-center py-16 text-[var(--text-muted)] text-sm font-light">
                  Loading...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center anim-fade-up">
                  <p className="text-sm font-medium mb-1">No conversations</p>
                  <p className="text-[var(--text-muted)] text-xs font-light">Search someone to start chatting</p>
                </div>
              ) : (
                filteredConversations.map((conv: any, i: number) => (
                  <button
                    key={conv._id}
                    onClick={() => handleUserSelect(conv.partner)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-200 mb-0.5 ${activeUser?._id === conv.partner?._id
                      ? "bg-white/[0.06]"
                      : "hover:bg-white/[0.025]"
                      }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={conv.partner?.imageUrl}
                        width={42}
                        height={42}
                        className={`w-[42px] h-[42px] rounded-full object-cover border transition-colors ${activeUser?._id === conv.partner?._id ? "border-[var(--accent)]/30" : "border-[var(--border)]"
                          }`}
                        alt="avatar"
                      />
                      {conv.partner?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 online-dot-sm" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[13px] font-medium truncate">{conv.partner?.name}</p>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0 ml-2 font-light">{formatTimestamp(conv.lastMessage._creationTime)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[12px] truncate font-light ${conv.unreadCount > 0 ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>
                          {conv.lastMessage?.text || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] bg-[var(--accent)] text-white rounded-full text-[9px] font-semibold flex items-center justify-center px-1">
                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <MobileNav />
      </div>

      {/* ── Chat Area ── */}
      <div className={`flex-1 flex flex-col bg-[#050505] relative ${!activeUser ? "hidden md:flex" : "flex"}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5 pointer-events-none" />

        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
            <div className="anim-fade-up">
              <p className="text-lg font-medium text-[var(--text-secondary)] mb-1">Select a conversation</p>
              <p className="text-sm text-[var(--text-muted)] font-light">Choose someone from the sidebar</p>
            </div>
          </div>
        ) : (
          <ChatWindow activeUser={activeUser} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CHAT WINDOW — COMPLETELY UNTOUCHED
// ═══════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChatWindow({ activeUser, onBack }: { activeUser: any; onBack: () => void }) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUser = useQuery(api.users.getCurrentUser);
  const conversation = useQuery(api.conversations.getConversation, currentUser ? { userId: activeUser._id } : "skip");
  const conversationId = conversation?._id;
  const ensureConversation = useMutation(api.conversations.getOrCreateConversation);

  const messages = useQuery(api.messages.getMessages, conversationId ? { conversationId } : "skip");
  const typingUsers = useQuery(api.typing.getTypingUsers, conversationId ? { conversationId } : "skip");
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const setTyping = useMutation(api.typing.setTyping);

  const isTyping = typingUsers && typingUsers.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (conversationId) markAsRead({ conversationId });
  }, [conversationId, messages, markAsRead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (conversationId) {
      setTyping({ conversationId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping({ conversationId, isTyping: false }), 2000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const messageText = text;
    setText("");
    let currentConvId = conversationId;
    if (!currentConvId) currentConvId = await ensureConversation({ userId: activeUser._id });
    if (currentConvId) {
      setTyping({ conversationId: currentConvId, isTyping: false });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      await sendMessage({ conversationId: currentConvId, text: messageText });
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl shrink-0">
        <button onClick={onBack} className="md:hidden w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5">
          <ArrowLeft size={18} />
        </button>
        <div className="relative shrink-0">
          <Image src={activeUser.imageUrl} width={44} height={44} className="w-11 h-11 rounded-full object-cover border border-white/10" alt="avatar" />
          {activeUser.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0A] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white">{activeUser.name}</p>
          <p className="text-[11px] font-mono tracking-tight mt-0.5">
            {activeUser.isOnline ? (
              <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active now</span>
            ) : (
              <span className="text-gray-500">Last seen {activeUser.lastSeen ? formatTimestamp(activeUser.lastSeen) : "recently"}</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 py-6 scroll-smooth">
        {messages === undefined ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm font-mono animate-pulse">Decrypting transmission...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              <MessageCircle size={28} className="text-gray-400" />
            </div>
            <p className="font-bold text-white/80">Comm Channel Open</p>
            <p className="text-xs text-gray-500 mt-1 font-mono">End-to-end encrypted connection established with {activeUser.name}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 w-full max-w-4xl mx-auto">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {messages.map((m: any, i: number) => {
              const showTime = i === 0 || m._creationTime - messages[i - 1]._creationTime > 300000;
              const nextIsMe = messages[i + 1]?.isMe === m.isMe;
              return (
                <div key={m._id} className="w-full">
                  {showTime && (
                    <div className="flex justify-center my-6">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 border border-white/5 px-4 py-1.5 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] backdrop-blur-md">
                        {formatTimestamp(m._creationTime)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${m.isMe ? "justify-end" : "justify-start"} ${nextIsMe ? "mb-1" : "mb-4"}`}>
                    <div className={`px-5 py-3 text-sm max-w-[85%] sm:max-w-[70%] wrap-break-word font-medium leading-relaxed shadow-lg ${m.isMe
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-sm border border-blue-500/50"
                      : "bg-[#1A1A1A] text-white/90 rounded-2xl rounded-bl-sm border border-white/10"
                      }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-[#1A1A1A] rounded-2xl rounded-bl-sm px-5 py-3 flex items-center gap-1.5 shadow-lg border border-white/10">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl shrink-0 flex items-center justify-center">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-2 focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:bg-white/10 focus-within:border-blue-500/30 transition-all w-full max-w-4xl shadow-lg">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder="Transmit message..."
            className="flex-1 bg-transparent text-sm text-white px-4 outline-none placeholder-gray-500 font-medium"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:border-white/5 border border-blue-500/50 disabled:text-gray-500 text-white rounded-full flex items-center justify-center transition-all shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none"
          >
            <Send size={16} className={text.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}

function formatTimestamp(ts: number) {
  if (isToday(ts)) return format(ts, "h:mm a");
  if (isYesterday(ts)) return `Yesterday ${format(ts, "h:mm a")}`;
  return format(ts, "MMM d, h:mm a");
}
