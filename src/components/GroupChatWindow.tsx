"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { MessageCircle, ArrowLeft, Send, MoreHorizontal, Edit2, Trash2, X, Smile, Reply, Users, Info } from "lucide-react";
import Image from "next/image";
import GroupInfoPanel from "./GroupInfoPanel";

function formatTimestamp(ts: number) {
    if (isToday(ts)) return format(ts, "h:mm a");
    if (isYesterday(ts)) return `Yesterday ${format(ts, "h:mm a")}`;
    return format(ts, "MMM d, h:mm a");
}

const SENDER_COLORS = [
    "text-violet-400", "text-emerald-400", "text-amber-400", "text-rose-400",
    "text-cyan-400", "text-pink-400", "text-orange-400", "text-teal-400",
    "text-sky-400", "text-lime-400",
];

function getSenderColor(senderId: string): string {
    let hash = 0;
    for (let i = 0; i < senderId.length; i++) hash = ((hash << 5) - hash + senderId.charCodeAt(i)) | 0;
    return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
}

export default function GroupChatWindow({ groupConv, onBack }: { groupConv: any; onBack: () => void }) {
    const [text, setText] = useState("");
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
    const [reactionMenuMessageId, setReactionMenuMessageId] = useState<string | null>(null);
    const [replyingToMessage, setReplyingToMessage] = useState<{ id: string; text: string; senderName: string } | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentUser = useQuery(api.users.getCurrentUser);
    const conversationId = groupConv._id;
    const groupData = useQuery(api.conversations.getGroupConversation, { conversationId });

    const messages = useQuery(api.messages.getMessages, { conversationId });
    const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });
    const sendMessage = useMutation(api.messages.sendMessage);
    const editMessage = useMutation(api.messages.editMessage);
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const toggleReaction = useMutation(api.messages.toggleReaction);
    const markAsRead = useMutation(api.messages.markAsRead);
    const setTyping = useMutation(api.typing.setTyping);

    const isTyping = typingUsers && typingUsers.length > 0;
    const memberCount = groupData?.membersData?.length || groupConv.memberCount || 0;

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
    useEffect(() => { if (conversationId) markAsRead({ conversationId }); }, [conversationId, messages, markAsRead]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if ((e.target as HTMLElement).closest("[data-action-menu]")) return;
            setActiveMenuMessageId(null);
            setReactionMenuMessageId(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("touchstart", handleClickOutside); };
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
        setTyping({ conversationId, isTyping: false });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        const payload: any = { conversationId, text: messageText };
        if (replyingToMessage) { payload.replyTo = replyingToMessage.id as any; setReplyingToMessage(null); }
        await sendMessage(payload);
    };

    const handleEditInitiate = (id: string, currentText: string) => { setEditingMessageId(id); setReplyingToMessage(null); setText(currentText); setActiveMenuMessageId(null); };
    const handleReplyInitiate = (id: string, text: string, senderName: string) => { setReplyingToMessage({ id, text, senderName }); setEditingMessageId(null); setActiveMenuMessageId(null); };
    const handleDelete = async (id: string) => { if (confirm("Delete this message?")) await deleteMessage({ messageId: id as any }); setActiveMenuMessageId(null); };
    const REACT_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];
    const handleReaction = async (id: string, emoji: string) => { await toggleReaction({ messageId: id as any, emoji }); setActiveMenuMessageId(null); setReactionMenuMessageId(null); };

    return (
        <div className="flex flex-col h-full relative z-10 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl shrink-0">
                <button onClick={onBack} className="md:hidden w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5">
                    <ArrowLeft size={18} />
                </button>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20 border border-violet-400/20 text-white font-bold text-lg">
                    {groupConv.groupName?.charAt(0)?.toUpperCase() || "G"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">{groupConv.groupName}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{memberCount} members</p>
                </div>
                <button onClick={() => setShowInfo(true)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
                    <Info size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 py-6 scroll-smooth">
                {messages === undefined ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm font-mono animate-pulse">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mb-4 border border-violet-500/20">
                            <Users size={28} className="text-violet-400" />
                        </div>
                        <p className="font-bold text-white/80">Group Created</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">Start the conversation with {memberCount} members</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 w-full max-w-4xl mx-auto">
                        {messages.map((m: any, i: number) => {
                            const showTime = i === 0 || m._creationTime - messages[i - 1]._creationTime > 300000;
                            const nextIsMe = messages[i + 1]?.isMe === m.isMe;
                            const prevIsSameSender = i > 0 && messages[i - 1]?.senderId === m.senderId && !messages[i - 1]?.isSystem;
                            const showSenderInfo = !m.isMe && !prevIsSameSender && !m.isSystem;
                            const senderColor = getSenderColor(m.senderId);

                            // System message
                            if (m.isSystem) {
                                return (
                                    <div key={m._id} className="w-full flex justify-center my-3">
                                        <span className="text-[11px] text-gray-500 bg-white/[0.03] border border-white/5 px-4 py-1.5 rounded-full font-medium italic">
                                            {m.text}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={m._id} className="w-full">
                                    {showTime && (
                                        <div className="flex justify-center my-6">
                                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md">
                                                {formatTimestamp(m._creationTime)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${m.isMe ? "justify-end" : "justify-start"} ${nextIsMe ? "mb-1" : "mb-4"}`}>
                                        <div className={`relative group flex ${m.isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[85%] sm:max-w-[70%]`}>

                                            {/* Avatar */}
                                            {!m.isMe && (
                                                <div className="shrink-0 mb-1">
                                                    {!prevIsSameSender ? (
                                                        <Image src={m.senderImage || "/placeholder.png"} width={28} height={28} className="w-7 h-7 rounded-full object-cover border border-white/10" alt="" />
                                                    ) : (
                                                        <div className="w-7" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Bubble */}
                                            <div
                                                onContextMenu={(e) => { e.preventDefault(); setActiveMenuMessageId(m._id); }}
                                                onClick={(e) => { if ((e.target as HTMLElement).closest("[data-action-menu]")) return; setActiveMenuMessageId(activeMenuMessageId === m._id ? null : m._id); }}
                                                className={`relative px-4 py-2.5 text-sm break-words font-medium leading-relaxed shadow-lg transition-transform ${m.isMe
                                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-500/50 " + (nextIsMe ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-br-sm")
                                                    : "bg-[#1A1A1A] text-white/90 border border-white/10 " + (nextIsMe ? "rounded-2xl rounded-tl-sm" : "rounded-2xl rounded-bl-sm")
                                                    }`}>
                                                {m.isDeleted ? (
                                                    <span className="italic text-white/60">This message was deleted</span>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        {showSenderInfo && (
                                                            <span className={`text-[11px] font-bold mb-1 ${senderColor}`}>{m.senderName}</span>
                                                        )}
                                                        {m.replyToMessage && (
                                                            <div className={`mb-2.5 rounded-xl overflow-hidden cursor-pointer transition-all hover:brightness-110 ${m.isMe ? "bg-white/10 backdrop-blur-sm" : "bg-white/[0.06] backdrop-blur-sm"}`}>
                                                                <div className="flex">
                                                                    <div className={`w-1 shrink-0 rounded-l-xl ${m.isMe ? "bg-gradient-to-b from-white/60 to-white/20" : "bg-gradient-to-b from-blue-400 to-blue-600"}`} />
                                                                    <div className="flex flex-col gap-0.5 px-3 py-2 min-w-0">
                                                                        <span className={`text-[11px] font-bold tracking-wide ${m.isMe ? "text-white/80" : "text-blue-400"}`}>{m.replyToMessage.senderName}</span>
                                                                        <span className="text-[12px] text-white/60 truncate leading-snug">{m.replyToMessage.text}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex items-end gap-2">
                                                            <span>{m.text}</span>
                                                            {m.isEdited && <span className="text-[10px] text-white/50 italic shrink-0">(edited)</span>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Reactions */}
                                                {m.reactions && m.reactions.length > 0 && (
                                                    <div className={`absolute -bottom-3 ${m.isMe ? "right-2" : "left-2"} flex gap-1 z-10`}>
                                                        {Array.from(new Set(m.reactions.map((r: any) => r.emoji))).map((emoji: unknown) => {
                                                            const count = m.reactions.filter((r: any) => r.emoji === emoji).length;
                                                            const hasReacted = m.reactions.some((r: any) => r.emoji === emoji && r.userId === currentUser?._id);
                                                            return (
                                                                <button key={emoji as string} onClick={(e) => { e.stopPropagation(); handleReaction(m._id, emoji as string); }}
                                                                    className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border shadow-sm transition-transform hover:scale-110 ${hasReacted ? "bg-blue-600/20 border-blue-500/30 text-blue-400" : "bg-[#1A1A1A] border-white/10 text-white/80"}`}>
                                                                    <span>{emoji as string}</span>{count > 1 && <span className="font-semibold">{count}</span>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Menu */}
                                            {!m.isDeleted && (
                                                <div data-action-menu className={`relative flex items-center ${activeMenuMessageId === m._id ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"} transition-opacity`}>
                                                    <button data-action-menu onClick={(e) => { e.stopPropagation(); setActiveMenuMessageId(activeMenuMessageId === m._id ? null : m._id); }}
                                                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                    {activeMenuMessageId === m._id && (
                                                        <div data-action-menu className={`absolute top-full mt-1 ${m.isMe ? "right-0" : "left-0"} bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden flex flex-col p-1`}>
                                                            {reactionMenuMessageId === m._id ? (
                                                                <div className="flex items-center justify-between p-2 gap-2 bg-white/5 rounded-lg mb-1" onMouseDown={e => e.stopPropagation()}>
                                                                    {REACT_EMOJIS.map(emoji => (
                                                                        <button key={emoji} onClick={e => { e.stopPropagation(); handleReaction(m._id, emoji); }} className="hover:scale-125 transition-transform text-lg">{emoji}</button>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setReactionMenuMessageId(m._id); }}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded-lg text-white/80 transition-colors">
                                                                    <Smile size={14} /> Add Reaction
                                                                </button>
                                                            )}
                                                            <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); handleReplyInitiate(m._id, m.text, m.senderName); }}
                                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded-lg text-white/80 transition-colors">
                                                                <Reply size={14} /> Reply
                                                            </button>
                                                            {m.isMe && (
                                                                <>
                                                                    <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); handleEditInitiate(m._id, m.text); }}
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-white/5 rounded-lg text-white/80 transition-colors">
                                                                        <Edit2 size={14} /> Edit
                                                                    </button>
                                                                    <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); handleDelete(m._id); }}
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 text-red-400 rounded-lg transition-colors">
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

                        {isTyping && typingUsers && (
                            <div className="flex justify-start mb-4 items-end gap-2">
                                {/* Stacked avatars of typing users */}
                                <div className="flex -space-x-1.5 shrink-0 mb-1">
                                    {typingUsers.slice(0, 3).map((t: any) => (
                                        <Image key={t.userId} src={t.userImage || "/placeholder.png"} width={24} height={24}
                                            className="w-6 h-6 rounded-full object-cover border-2 border-[#050505]" alt="" />
                                    ))}
                                </div>
                                <div className="bg-[#1A1A1A] rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2 shadow-lg border border-white/10">
                                    <span className="text-[11px] text-gray-400 font-medium">
                                        {typingUsers.length === 1
                                            ? `${(typingUsers[0] as any).userName} is typing`
                                            : typingUsers.length === 2
                                                ? `${(typingUsers[0] as any).userName} and ${(typingUsers[1] as any).userName} are typing`
                                                : `${(typingUsers[0] as any).userName} and ${typingUsers.length - 1} others are typing`
                                        }
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
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
                    <div className="w-full max-w-4xl flex items-center mb-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-md">
                        <div className="w-1 self-stretch bg-gradient-to-b from-amber-400 to-orange-500 shrink-0" />
                        <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><Edit2 size={14} className="text-amber-400" /></div>
                            <span className="text-[12px] font-bold text-amber-400 tracking-wide">Editing Message</span>
                        </div>
                        <button onClick={() => { setEditingMessageId(null); setText(""); }} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all mr-2 shrink-0"><X size={14} /></button>
                    </div>
                )}
                {replyingToMessage && (
                    <div className="w-full max-w-4xl flex items-center mb-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-md">
                        <div className="w-1 self-stretch bg-gradient-to-b from-blue-400 to-indigo-500 shrink-0" />
                        <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"><Reply size={14} className="text-blue-400" /></div>
                            <div className="flex flex-col min-w-0 gap-0.5">
                                <span className="text-[11px] font-bold text-blue-400 tracking-wide leading-tight">Replying to {replyingToMessage.senderName}</span>
                                <span className="text-[12px] truncate text-white/50 leading-tight max-w-[220px] sm:max-w-md">{replyingToMessage.text}</span>
                            </div>
                        </div>
                        <button onClick={() => setReplyingToMessage(null)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all mr-2 shrink-0"><X size={14} /></button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-2 focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:bg-white/10 focus-within:border-blue-500/30 transition-all w-full max-w-4xl shadow-lg">
                    <input type="text" value={text} onChange={handleInputChange}
                        placeholder={editingMessageId ? "Edit your message..." : "Message group..."}
                        className="flex-1 bg-transparent text-sm text-white px-4 outline-none placeholder-gray-500 font-medium" />
                    <button type="submit" disabled={!text.trim()}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:border-white/5 border border-blue-500/50 disabled:text-gray-500 text-white rounded-full flex items-center justify-center transition-all shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none">
                        <Send size={16} className={text.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                    </button>
                </form>
            </div>

            {/* Group Info Panel — fixed overlay */}
            {showInfo && (
                <GroupInfoPanel conversationId={groupConv._id} onClose={() => setShowInfo(false)} />
            )}
        </div>
    );
}
