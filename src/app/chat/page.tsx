"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import Link from "next/link";
import { Home, User, MessageCircle, Search, ArrowLeft, Send } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <MessageCircle size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Tars Chat</h1>
          <p className="text-gray-400 mb-8 text-center font-light">Sign in to start messaging</p>
          <SignInButton mode="modal">
            <button className="px-8 py-3 bg-white text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden selection:bg-blue-500/30">

      {/* Sidebar */}
      <div className={`w-full md:w-85 lg:w-95 shrink-0 flex flex-col bg-[#0A0A0A]/90 backdrop-blur-xl border-r border-white/5 relative z-10 ${activeUser ? "hidden md:flex" : "flex"}`}>

        {/* Sidebar Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Image src={user.imageUrl} width={40} height={40} className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent transition-all border border-white/10" alt="me" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0A]" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight text-white/90">{user.fullName || "User"}</p>
              <p className="text-xs text-blue-400 opacity-80">@{user.username || user.firstName?.toLowerCase() || "user"}</p>
            </div>
          </div>
          <Link href="/profile" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5">
            <User size={16} />
          </Link>
        </div>

        {/* Search */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search network..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none placeholder-gray-500 focus:ring-1 focus:ring-blue-500/50 border border-white/5 transition-all focus:bg-white/10"
            />
          </div>
        </div>

        {/* Online Users Strip */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {!searchQuery && filteredUsers && filteredUsers.filter((u: any) => u.isOnline).length > 0 && (
          <div className="px-4 py-4 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Active Now</p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredUsers.filter((u: any) => u.isOnline).map((u: any) => (
                <button key={u._id} onClick={() => setActiveUser(u)} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className="relative">
                    <Image src={u.imageUrl} width={48} height={48} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all border border-white/10" alt="avatar" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0A0A0A] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <span className="text-[11px] text-gray-400 group-hover:text-white transition-colors truncate w-14 text-center">{u.name?.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations & Contacts */}
        <div className="flex-1 overflow-y-auto scrollbar-hide relative">
          {searchQuery && filteredUsers && filteredUsers.length > 0 && (
            <div className="px-3 pt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Network Directory</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredUsers.map((u: any) => (
                <button
                  key={u._id}
                  onClick={() => { setActiveUser(u); setSearchQuery(""); }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors mb-1 group"
                >
                  <div className="relative shrink-0">
                    <Image src={u.imageUrl} width={44} height={44} className="w-11 h-11 rounded-full object-cover border border-white/10 group-hover:border-white/20 transition-colors" alt="avatar" />
                    {u.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0A]" />}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-sm truncate text-white/90 group-hover:text-white">{u.name}</p>
                    <p className="text-xs text-blue-400/80 truncate">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searchQuery && (
            <div className="px-3 pt-3 pb-3">
              {filteredConversations === undefined ? (
                <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Synchronizing network...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                    <MessageCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-white/80 font-medium text-sm">Inbox Zero</p>
                  <p className="text-gray-500 text-xs mt-1">Search the network to start chatting</p>
                </div>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filteredConversations.map((conv: any) => (
                  <button
                    key={conv._id}
                    onClick={() => setActiveUser(conv.partner)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 mb-1 border ${activeUser?._id === conv.partner?._id ? "bg-white/10 border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" : "bg-transparent border-transparent hover:bg-white/5"
                      }`}
                  >
                    <div className="relative shrink-0">
                      <Image src={conv.partner?.imageUrl} width={48} height={48} className={`w-12 h-12 rounded-full object-cover border transition-colors ${activeUser?._id === conv.partner?._id ? "border-blue-500/50" : "border-white/10"}`} alt="avatar" />
                      {conv.partner?.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0A0A0A]" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold text-sm truncate ${activeUser?._id === conv.partner?._id ? "text-white" : "text-white/90"}`}>{conv.partner?.name}</p>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-gray-500 font-mono shrink-0 ml-2 tracking-tighter">{formatTimestamp(conv.lastMessage._creationTime)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-white font-medium" : "text-gray-500"} ${activeUser?._id === conv.partner?._id ? "opacity-100" : ""}`}>
                          {conv.lastMessage?.text || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] bg-blue-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
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

        {/* Bottom Nav (mobile only) */}
        <MobileNav />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#050505] relative ${!activeUser ? "hidden md:flex" : "flex"}`}>
        {/* Abstract background effect for chat area */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5 pointer-events-none" />

        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 glass-panel border-0 m-4 rounded-[2rem]">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500 blur-[120px] opacity-10" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500 blur-[120px] opacity-10" />

            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              <MessageCircle size={32} className="text-gray-400" />
            </div>
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Secure Comm Link</p>
            <p className="text-sm text-gray-500 mt-2 font-mono">Awaiting connection. Select a node from the directory.</p>
          </div>
        ) : (
          <ChatWindow activeUser={activeUser} onBack={() => setActiveUser(null)} />
        )}
      </div>
    </div>
  );
}

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
              <div className="flex justify-start mb-4 items-center gap-2">
                <div className="bg-[#1A1A1A] rounded-2xl rounded-bl-sm px-5 py-3 flex items-center gap-1.5 shadow-lg border border-white/10">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-gray-500 font-mono italic">
                  {activeUser.name?.split(" ")[0]} is typing...
                </span>
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
