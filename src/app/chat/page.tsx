"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";

export default function ChatApp() {
  const { user, isLoaded } = useUser();
  const updatePresence = useMutation(api.users.updatePresence);

  // Conditionally execute query only when user is fully loaded and signed in
  const users = useQuery(api.users.listUsers, user ? undefined : "skip");
  const conversations = useQuery(api.conversations.listConversations, user ? undefined : "skip");

  const [activeUser, setActiveUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users?.filter((u: any) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations?.filter((c: any) =>
    c.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Presence effect
  useEffect(() => {
    if (!user) return;
    updatePresence({ isOnline: true });

    const interval = setInterval(() => {
      updatePresence({ isOnline: true });
    }, 60000);

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white font-sans">
        <h1 className="text-4xl font-bold mb-8">Welcome to Tars Live Chat</h1>
        <div className="bg-neutral-800 p-8 rounded-xl shadow-lg text-center">
          <p className="text-neutral-400 mb-6 max-w-sm">Connect with others in real-time. Please sign in to access your conversations and start chatting.</p>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full">
              Sign In to Continue
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-neutral-800 bg-neutral-900 ${activeUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={user.imageUrl} className="w-10 h-10 rounded-full" alt="profile" />
            <span className="font-medium truncate max-w-[120px]">{user.fullName || "User"}</span>
          </div>
          <SignOutButton>
            <button className="text-sm text-neutral-400 hover:text-white transition-colors">
              Sign Out
            </button>
          </SignOutButton>
        </div>

        <div className="p-3 border-b border-neutral-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] text-sm text-white rounded-lg pl-9 pr-3 py-2 outline-none border border-neutral-800 focus:border-neutral-600 transition-colors placeholder-neutral-500"
            />
            <svg className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredConversations === undefined ? (
            <div className="text-center p-4 text-neutral-500">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-4 mt-8">
              <p className="text-neutral-400 text-sm">{searchQuery ? 'No matching conversations' : 'No conversations yet.'}</p>
              {!searchQuery && <p className="text-neutral-500 text-xs mt-1">Select a user below to start!</p>}
            </div>
          ) : (
            <div>
              <h3 className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Recent Chats</h3>
              {filteredConversations.map((conv: any) => (
                <button
                  key={conv._id}
                  onClick={() => setActiveUser(conv.partner)}
                  className={`w-full text-left p-3 flex items-center gap-3 rounded-xl transition-colors ${activeUser?._id === conv.partner?._id ? 'bg-neutral-800' : 'hover:bg-neutral-800/60'}`}
                >
                  <div className="relative">
                    <img src={conv.partner?.imageUrl} className="w-11 h-11 rounded-full bg-neutral-800" alt="avatar" />
                    {conv.partner?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold truncate text-white">{conv.partner?.name || "Unknown"}</span>
                        {conv.partner?.username && <span className="text-[10px] text-neutral-500 truncate">@{conv.partner.username}</span>}
                      </div>
                      {conv.lastMessage && (
                        <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
                          {formatTimestamp(conv.lastMessage._creationTime)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-white font-medium" : "text-neutral-400"}`}>
                        {conv.lastMessage.text}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h3 className="px-3 pt-2 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">All Contacts</h3>
            {filteredUsers === undefined ? (
              <div className="text-center p-4 text-neutral-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-4 text-neutral-500">No users found.</div>
            ) : (
              filteredUsers.map((u: any) => (
                <button
                  key={u._id}
                  onClick={() => setActiveUser(u)}
                  className={`w-full text-left p-3 flex items-center gap-3 rounded-xl transition-colors ${activeUser?._id === u._id ? 'bg-neutral-800' : 'hover:bg-neutral-800/60'}`}
                >
                  <div className="relative">
                    <img src={u.imageUrl} className="w-10 h-10 rounded-full bg-neutral-800" alt="avatar" />
                    {u.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-900" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 truncate">
                    <span className="font-medium truncate text-white">{u.name || "Unknown"}</span>
                    {u.username && <span className="text-[11px] text-neutral-400 truncate">@{u.username}</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#0a0a0a] ${!activeUser ? 'hidden md:flex' : 'flex'}`}>
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
            <div className="w-20 h-20 bg-neutral-900/50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium tracking-wide">Select a conversation to start chatting</p>
          </div>
        ) : (
          <ChatWindow activeUser={activeUser} onBack={() => setActiveUser(null)} />
        )}
      </div>
    </div>
  );
}

function ChatWindow({ activeUser, onBack }: { activeUser: any, onBack: () => void }) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversation = useQuery(api.conversations.getConversation, { userId: activeUser._id });
  const conversationId = conversation?._id;
  const ensureConversation = useMutation(api.conversations.getOrCreateConversation);

  const messages = useQuery(api.messages.getMessages, conversationId ? { conversationId } : "skip");
  const typingUsers = useQuery(api.typing.getTypingUsers, conversationId ? { conversationId } : "skip");
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const setTyping = useMutation(api.typing.setTyping);

  const isTyping = typingUsers && typingUsers.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (conversationId) {
      markAsRead({ conversationId });
    }
  }, [conversationId, messages, markAsRead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    if (conversationId) {
      setTyping({ conversationId, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setTyping({ conversationId, isTyping: false });
      }, 2000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text;
    setText("");

    let currentConvId = conversationId;
    if (!currentConvId) {
      currentConvId = await ensureConversation({ userId: activeUser._id });
    }

    if (currentConvId) {
      setTyping({ conversationId: currentConvId, isTyping: false });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      await sendMessage({ conversationId: currentConvId, text: messageText });
    }
  };

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center gap-4 bg-[#0d0d0d]">
        <button className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white" onClick={onBack}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="relative">
          <img src={activeUser.imageUrl} className="w-10 h-10 rounded-full bg-neutral-800" alt="avatar" />
          {activeUser.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d0d]" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-white tracking-wide">{activeUser.name}</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {activeUser.isOnline ? 'Online now' : `Last seen ${activeUser.lastSeen ? formatTimestamp(activeUser.lastSeen) : 'recently'}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div ref={scrollRef} className="h-full flex flex-col space-y-5 relative z-10 w-full pb-8">
          {messages === undefined ? (
            <div className="flex-1 flex items-center justify-center text-neutral-500 h-full">
              <span className="animate-pulse">Loading chat history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 h-full">
              <div className="bg-neutral-900/40 px-6 py-4 rounded-xl border border-neutral-800/50 mb-4 items-center flex flex-col">
                <p className="font-medium text-neutral-400">No messages yet.</p>
                <p className="text-sm text-neutral-500 mt-1">Start the conversation with {activeUser.name}!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => {
                const showTime = i === 0 || m._creationTime - messages[i - 1]._creationTime > 300000; // 5 mins
                return (
                  <div key={m._id} className={`flex flex-col w-full ${m.isMe ? 'items-end' : 'items-start'}`}>
                    {showTime && (
                      <div className="flex w-full justify-center mb-4 mt-2">
                        <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase bg-neutral-900/50 px-3 py-1 rounded-full">
                          {formatTimestamp(m._creationTime)}
                        </span>
                      </div>
                    )}
                    <div className={`px-5 py-3 text-[15px] leading-relaxed max-w-[80%] break-words shadow-sm ${m.isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md' : 'bg-[#1a1a1a] text-neutral-100 rounded-2xl rounded-tl-md border border-neutral-800/80'}`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex flex-col items-start w-full">
                  <div className="px-5 py-4 bg-[#1a1a1a] rounded-2xl rounded-tl-md border border-neutral-800/80 flex items-center gap-1.5 w-fit">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#0d0d0d] border-t border-neutral-800/80">
        <form onSubmit={handleSend} className="flex gap-3 max-w-5xl mx-auto">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-[#1a1a1a] hover:bg-[#202020] focus:bg-[#202020] text-white rounded-2xl px-5 py-3.5 outline-none focus:ring-1 focus:ring-blue-500/50 border border-neutral-800 placeholder-neutral-500 transition-all text-[15px]"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}

function formatTimestamp(ts: number) {
  if (isToday(ts)) return format(ts, "h:mm a");
  if (isYesterday(ts)) return `Yesterday, ${format(ts, "h:mm a")}`;
  return format(ts, "MMM d, h:mm a");
}
