"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";

import { MessageCircle, Search, ArrowLeft, Send, MoreHorizontal, Edit2, Trash2, X, Smile, Reply, Users, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileNav from "../../components/MobileNav";
import CreateGroupModal from "../../components/CreateGroupModal";
import GroupChatWindow from "../../components/GroupChatWindow";

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
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Restore active chat from sessionStorage (e.g. after returning from profile)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("tars_active_chat");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.type === "user" && data.data) setActiveUser(data.data);
        else if (data.type === "group" && data.data) setActiveGroup(data.data);
      }
    } catch { }
  }, []);

  // Persist active chat to sessionStorage whenever it changes
  useEffect(() => {
    if (activeUser) {
      sessionStorage.setItem("tars_active_chat", JSON.stringify({ type: "user", data: activeUser }));
    } else if (activeGroup) {
      sessionStorage.setItem("tars_active_chat", JSON.stringify({ type: "group", data: activeGroup }));
    }
    // Don't clear on null — we only clear explicitly in handleBack
  }, [activeUser, activeGroup]);

  const handleUserSelect = (u: any) => {
    setActiveUser(u);
    setActiveGroup(null);
    if (!window.history.state?.chatOpen) {
      window.history.pushState({ chatOpen: true }, "", window.location.href);
    }
  };

  const handleGroupSelect = (conv: any) => {
    setActiveGroup(conv);
    setActiveUser(null);
    if (!window.history.state?.chatOpen) {
      window.history.pushState({ chatOpen: true }, "", window.location.href);
    }
  };

  const handleBack = () => {
    setActiveUser(null);
    setActiveGroup(null);
    sessionStorage.removeItem("tars_active_chat");
    if (window.history.state?.chatOpen) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (activeUser || activeGroup) {
        setActiveUser(null);
        setActiveGroup(null);
        sessionStorage.removeItem("tars_active_chat");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeUser, activeGroup]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredUsers = users?.filter((u: any) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredConversations = conversations?.filter((c: any) => {
    if (c.isGroup) {
      return c.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return (
      c.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const isAnyActive = activeUser || activeGroup;

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
      <div className={`w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col bg-[var(--bg-surface)]/50 backdrop-blur-xl border-r border-[var(--border)] relative z-10 ${isAnyActive ? "hidden md:flex" : "flex"}`}>

        {/* Sidebar Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <Image src={user.imageUrl} width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-[var(--border)]" alt="me" />
              <div className="absolute -bottom-0.5 -right-0.5 online-dot-sm" />
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-tight">{currentUser?.name || user.fullName || "User"}</p>
              <p className="text-[12px] text-[var(--text-muted)]">@{currentUser?.username || user.username || user.firstName?.toLowerCase() || "user"}</p>
            </div>
          </div>
          <button onClick={() => setShowCreateGroup(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 hover:brightness-110 text-white text-[11px] font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95" title="New Group">
            <Plus size={13} /> New Group
          </button>
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

          {/* Group search results */}
          {searchQuery && filteredConversations && filteredConversations.filter((c: any) => c.isGroup).length > 0 && (
            <div className="px-2.5 pt-2">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-1.5 px-1.5 font-medium">Groups</p>
              {filteredConversations.filter((c: any) => c.isGroup).map((conv: any) => (
                <button
                  key={conv._id}
                  onClick={() => { handleGroupSelect(conv); setSearchQuery(""); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.03] transition-all duration-200 group"
                >
                  <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 border border-violet-500/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {conv.groupName?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-[var(--text-primary)] transition-colors">{conv.groupName}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate font-light">{conv.memberCount} members</p>
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
                filteredConversations.map((conv: any, i: number) => {
                  const isGroup = conv.isGroup;
                  const isActive = isGroup
                    ? activeGroup?._id === conv._id
                    : activeUser?._id === conv.partner?._id;

                  return (
                    <button
                      key={conv._id}
                      onClick={() => isGroup ? handleGroupSelect(conv) : handleUserSelect(conv.partner)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-200 mb-0.5 ${isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.025]"}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="relative shrink-0">
                        {isGroup ? (
                          <div className={`w-[42px] h-[42px] rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 border flex items-center justify-center transition-colors text-white font-bold text-base ${isActive ? "border-violet-500/40" : "border-violet-500/20"}`}>
                            {conv.groupName?.charAt(0)?.toUpperCase() || "G"}
                          </div>
                        ) : (
                          <>
                            <Image
                              src={conv.partner?.imageUrl}
                              width={42}
                              height={42}
                              className={`w-[42px] h-[42px] rounded-full object-cover border transition-colors ${isActive ? "border-[var(--accent)]/30" : "border-[var(--border)]"}`}
                              alt="avatar"
                            />
                            {conv.partner?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 online-dot-sm" />}
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[14px] font-semibold truncate">
                            {isGroup ? conv.groupName : conv.partner?.name}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-[11px] text-[var(--text-muted)] shrink-0 ml-2">{formatTimestamp(conv.lastMessage._creationTime)}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[12.5px] truncate ${conv.unreadCount > 0 ? "text-[var(--text-secondary)] font-medium" : "text-[var(--text-muted)]"}`}>
                            {isGroup && conv.memberCount && !conv.lastMessage && (
                              <span>{conv.memberCount} members</span>
                            )}
                            {conv.lastMessage?.isDeleted ? (
                              <span className="italic">This message was deleted</span>
                            ) : conv.lastMessage ? (
                              <span>
                                {isGroup && conv.lastMessageSenderName ? `${conv.lastMessageSenderName}: ` : ""}
                                {conv.lastMessage.text}
                              </span>
                            ) : !isGroup ? "No messages yet" : null}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 min-w-[18px] h-[18px] bg-[var(--accent)] text-white rounded-full text-[9px] font-semibold flex items-center justify-center px-1">
                              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <MobileNav />
      </div>

      {/* ── Chat Area ── */}
      <div className={`flex-1 flex flex-col bg-[#050505] relative ${!isAnyActive ? "hidden md:flex" : "flex"}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5 pointer-events-none" />

        {!isAnyActive ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
            <div className="anim-fade-up">
              <p className="text-lg font-medium text-[var(--text-secondary)] mb-1">Select a conversation</p>
              <p className="text-sm text-[var(--text-muted)] font-light">Choose someone from the sidebar</p>
            </div>
          </div>
        ) : activeGroup ? (
          <GroupChatWindow groupConv={activeGroup} onBack={handleBack} />
        ) : (
          <ChatWindow activeUser={activeUser} onBack={handleBack} />
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(convId) => {
            setShowCreateGroup(false);
            // Refresh will happen automatically via Convex reactivity
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// CHAT WINDOW
// ═══════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChatWindow({ activeUser, onBack }: { activeUser: any; onBack: () => void }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
  const [reactionMenuMessageId, setReactionMenuMessageId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<{ id: string, text: string, senderName: string } | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current.get(messageId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 1500);
    }
  };

  const currentUser = useQuery(api.users.getCurrentUser);
  const conversation = useQuery(api.conversations.getConversation, currentUser ? { userId: activeUser._id } : "skip");
  const conversationId = conversation?._id;
  const ensureConversation = useMutation(api.conversations.getOrCreateConversation);

  const messages = useQuery(api.messages.getMessages, conversationId ? { conversationId } : "skip");
  const typingUsers = useQuery(api.typing.getTypingUsers, conversationId ? { conversationId } : "skip");
  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const markAsRead = useMutation(api.messages.markAsRead);
  const setTyping = useMutation(api.typing.setTyping);

  const isTyping = typingUsers && typingUsers.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (conversationId) markAsRead({ conversationId });
  }, [conversationId, messages, markAsRead]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // Don't close if the click is inside an action menu
      const target = e.target as HTMLElement;
      if (target.closest('[data-action-menu]')) return;
      setActiveMenuMessageId(null);
      setReactionMenuMessageId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

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

    if (editingMessageId) {
      await editMessage({ messageId: editingMessageId as any, newText: messageText });
      setEditingMessageId(null);
      return;
    }

    let currentConvId = conversationId;
    if (!currentConvId) currentConvId = await ensureConversation({ userId: activeUser._id });
    if (currentConvId) {
      setTyping({ conversationId: currentConvId, isTyping: false });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      const payload: any = { conversationId: currentConvId, text: messageText };
      if (replyingToMessage) {
        payload.replyTo = replyingToMessage.id as any;
        setReplyingToMessage(null);
      }
      await sendMessage(payload);
    }
  };

  const handleEditInitiate = (id: string, currentText: string) => {
    setEditingMessageId(id);
    setReplyingToMessage(null);
    setText(currentText);
    setActiveMenuMessageId(null);
  };

  const handleReplyInitiate = (id: string, text: string, senderName: string) => {
    setReplyingToMessage({ id, text, senderName });
    setEditingMessageId(null);
    setActiveMenuMessageId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage({ messageId: id as any });
    }
    setActiveMenuMessageId(null);
  };

  const REACT_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];
  const handleReaction = async (id: string, emoji: string) => {
    await toggleReaction({ messageId: id as any, emoji });
    setActiveMenuMessageId(null);
    setReactionMenuMessageId(null);
  };

  return (
    <div className="flex flex-col h-full relative z-10 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl shrink-0">
        <button onClick={onBack} className="md:hidden w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5">
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => router.push(`/profile/${activeUser._id}`)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="relative shrink-0">
            <Image src={activeUser.imageUrl} width={44} height={44} className="w-11 h-11 rounded-full object-cover border border-white/10" alt="avatar" />
            {activeUser.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0A] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-bold text-sm text-white">{activeUser.name}</p>
            <p className="text-[11px] font-mono tracking-tight mt-0.5">
              {activeUser.isOnline ? (
                <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active now</span>
              ) : (
                <span className="text-gray-500">Last seen {activeUser.lastSeen ? formatTimestamp(activeUser.lastSeen) : "recently"}</span>
              )}
            </p>
          </div>
        </button>
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
                <div key={m._id} ref={(el) => { if (el) messageRefs.current.set(m._id, el); }} className={`w-full transition-all duration-500 ${highlightedMessageId === m._id ? "ring-1 ring-violet-500/50 rounded-2xl bg-violet-500/5" : ""}`}>
                  {showTime && (
                    <div className="flex justify-center my-6">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 border border-white/5 px-4 py-1.5 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] backdrop-blur-md">
                        {formatTimestamp(m._creationTime)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${m.isMe ? "justify-end" : "justify-start"} ${nextIsMe ? "mb-1" : "mb-4"}`}>
                    <div className={`relative group flex ${m.isMe ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[85%] sm:max-w-[70%]`}>

                      {/* Message Bubble */}
                      <div
                        onContextMenu={(e) => { e.preventDefault(); setActiveMenuMessageId(m._id); }}
                        onClick={(e) => {
                          // Don't toggle menu if click originated from an action menu element
                          if ((e.target as HTMLElement).closest('[data-action-menu]')) return;
                          setActiveMenuMessageId(activeMenuMessageId === m._id ? null : m._id);
                        }}
                        className={`relative px-5 py-3 text-sm wrap-break-word font-medium leading-relaxed shadow-lg transition-transform ${m.isMe
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-500/50 " + (nextIsMe ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-br-sm")
                          : "bg-[#1A1A1A] text-white/90 border border-white/10 " + (nextIsMe ? "rounded-2xl rounded-tl-sm" : "rounded-2xl rounded-bl-sm")
                          }`}>
                        {m.isDeleted ? (
                          <span className="italic text-white/60">This message was deleted</span>
                        ) : (
                          <div className="flex flex-col">
                            {m.replyToMessage && (
                              <div onClick={(e) => { e.stopPropagation(); scrollToMessage(m.replyToMessage._id); }} className={`mb-2.5 rounded-xl overflow-hidden cursor-pointer transition-all hover:brightness-110 ${m.isMe
                                ? "bg-white/10 backdrop-blur-sm"
                                : "bg-white/[0.06] backdrop-blur-sm"
                                }`}>
                                <div className="flex">
                                  {/* Accent bar */}
                                  <div className={`w-1 shrink-0 rounded-l-xl ${m.isMe
                                    ? "bg-gradient-to-b from-white/60 to-white/20"
                                    : "bg-gradient-to-b from-blue-400 to-blue-600"
                                    }`} />
                                  <div className="flex flex-col gap-0.5 px-3 py-2 min-w-0">
                                    <span className={`text-[11px] font-bold tracking-wide ${m.isMe ? "text-white/80" : "text-blue-400"
                                      }`}>{m.replyToMessage.senderName}</span>
                                    <span className="text-[12px] text-white/60 truncate leading-snug">{m.replyToMessage.text}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-end gap-2">
                              <span>{m.text}</span>
                              {m.isEdited && <span className="text-[10px] text-white/50 italic shrink-0 break-normal">(edited)</span>}
                            </div>
                          </div>
                        )}

                        {/* Reactions Display */}
                        {m.reactions && m.reactions.length > 0 && (
                          <div className={`absolute -bottom-3 ${m.isMe ? "right-2" : "left-2"} flex gap-1 z-10`}>
                            {/* group reactions by emoji */}
                            {Array.from(new Set(m.reactions.map((r: any) => r.emoji))).map((emoji: unknown) => {
                              const count = m.reactions.filter((r: any) => r.emoji === emoji).length;
                              const hasReacted = m.reactions.some((r: any) => r.emoji === emoji && r.userId === currentUser?._id);
                              return (
                                <button
                                  key={emoji as string}
                                  onClick={(e) => { e.stopPropagation(); handleReaction(m._id, emoji as string); }}
                                  className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border shadow-sm transition-transform hover:scale-110 ${hasReacted
                                    ? "bg-blue-600/20 border-blue-500/30 text-blue-400"
                                    : "bg-[#1A1A1A] border-white/10 text-white/80"
                                    }`}
                                >
                                  <span>{emoji as string}</span>
                                  {count > 1 && <span className="font-semibold">{count}</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Action Menu (Desktop Hover / Mobile Tap) */}
                      {!m.isDeleted && (
                        <div data-action-menu className={`relative flex items-center ${activeMenuMessageId === m._id ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"} transition-opacity`}>
                          <button
                            data-action-menu
                            onClick={(e) => { e.stopPropagation(); setActiveMenuMessageId(activeMenuMessageId === m._id ? null : m._id); }}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {/* Action Dropdown */}
                          {activeMenuMessageId === m._id && (
                            <div data-action-menu className={`absolute top-full mt-1 ${m.isMe ? "right-0" : "left-0"} bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden flex flex-col p-1`}>

                              {/* Reactions Strip */}
                              {reactionMenuMessageId === m._id ? (
                                <div className="flex items-center justify-between p-2 gap-2 bg-white/5 rounded-lg mb-1" onMouseDown={(e) => e.stopPropagation()}>
                                  {REACT_EMOJIS.map(emoji => (
                                    <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(m._id, emoji); }} className="hover:scale-125 transition-transform text-lg">
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => { e.stopPropagation(); setReactionMenuMessageId(m._id); }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded-lg text-white/80 transition-colors"
                                >
                                  <Smile size={14} /> Add Reaction
                                </button>
                              )}

                              <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); handleReplyInitiate(m._id, m.text, m.isMe ? (currentUser?.name || "Me") : (activeUser?.name || "User")); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded-lg text-white/80 transition-colors"
                              >
                                <Reply size={14} /> Reply
                              </button>

                              {m.isMe && (
                                <>
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => { e.stopPropagation(); handleEditInitiate(m._id, m.text); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded-lg text-white/80 transition-colors"
                                  >
                                    <Edit2 size={14} /> Edit
                                  </button>
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => { e.stopPropagation(); handleDelete(m._id); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

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
      <div className="px-4 sm:px-6 py-4 border-t border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl shrink-0 flex flex-col items-center justify-center">
        {editingMessageId && (
          <div className="w-full max-w-4xl flex items-center mb-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-md transition-all">
            {/* Gradient accent bar */}
            <div className="w-1 self-stretch bg-gradient-to-b from-amber-400 to-orange-500 shrink-0" />
            <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Edit2 size={14} className="text-amber-400" />
              </div>
              <span className="text-[12px] font-bold text-amber-400 tracking-wide">Editing Message</span>
            </div>
            <button
              onClick={() => { setEditingMessageId(null); setText(""); }}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all mr-2 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {replyingToMessage && (
          <div className="w-full max-w-4xl flex items-center mb-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 duration-200">
            {/* Gradient accent bar */}
            <div className="w-1 self-stretch bg-gradient-to-b from-blue-400 to-indigo-500 shrink-0" />
            <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Reply size={14} className="text-blue-400" />
              </div>
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-[11px] font-bold text-blue-400 tracking-wide leading-tight">Replying to {replyingToMessage.senderName}</span>
                <span className="text-[12px] truncate text-white/50 leading-tight max-w-[220px] sm:max-w-md">{replyingToMessage.text}</span>
              </div>
            </div>
            <button
              onClick={() => { setReplyingToMessage(null); }}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all mr-2 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-2 focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:bg-white/10 focus-within:border-blue-500/30 transition-all w-full max-w-4xl shadow-lg">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder={editingMessageId ? "Edit your message..." : "Transmit message..."}
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
