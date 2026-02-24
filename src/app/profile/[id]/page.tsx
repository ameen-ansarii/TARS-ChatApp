"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Loader2, ArrowLeft, Mail, Clock, MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import MobileNav from "../../../components/MobileNav";

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const [isStartingChat, setIsStartingChat] = useState(false);

    const user = useQuery(api.users.getUserById, userId ? { userId: userId as any } : "skip");
    const currentUser = useQuery(api.users.getCurrentUser);
    const ensureConversation = useMutation(api.conversations.getOrCreateConversation);

    const isOwnProfile = currentUser?._id === userId;

    const handleMessage = async () => {
        if (!userId || isOwnProfile) return;
        setIsStartingChat(true);
        try {
            await ensureConversation({ userId: userId as any });
            // Save the user data to sessionStorage so chat page restores this conversation
            if (user) {
                sessionStorage.setItem("tars_active_chat", JSON.stringify({
                    type: "user",
                    data: {
                        _id: user._id,
                        name: user.name,
                        username: user.username,
                        imageUrl: user.imageUrl,
                        isOnline: user.isOnline,
                        lastSeen: user.lastSeen,
                        email: user.email,
                    }
                }));
            }
            router.push("/chat");
        } catch (e) {
            console.error(e);
            setIsStartingChat(false);
        }
    };

    if (user === undefined) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-root)]">
                <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
            </div>
        );
    }

    if (user === null) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-root)] text-[var(--text-primary)]">
                <div className="text-center anim-fade-up">
                    <p className="text-lg font-medium mb-2">User not found</p>
                    <button onClick={() => router.back()} className="text-sm text-[var(--accent)] hover:underline">Go back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] bg-[var(--bg-root)] text-[var(--text-primary)] relative overflow-hidden">
            <div className="flex-1 overflow-y-auto w-full z-10 relative scrollbar-hide">
                {/* Header */}
                <div className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--bg-root)]/80 backdrop-blur-2xl">
                    <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all border border-[var(--border)] active:scale-95"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className="text-sm font-medium flex-1">Profile</h1>
                        {!isOwnProfile && (
                            <button
                                onClick={handleMessage}
                                disabled={isStartingChat}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[12px] font-semibold hover:brightness-110 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 border border-blue-500/30"
                            >
                                {isStartingChat ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <Send size={13} />
                                )}
                                Message
                            </button>
                        )}
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-10 w-full space-y-5">
                    {/* Avatar Card */}
                    <div className="glass rounded-2xl p-8 relative overflow-hidden anim-fade-up">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-7">
                            <div className="relative shrink-0">
                                <div className="w-28 h-28 md:w-32 md:h-32 relative rounded-full overflow-hidden ring-2 ring-[var(--border)]">
                                    {user.imageUrl ? (
                                        <Image src={user.imageUrl} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-[#38bdf8] flex items-center justify-center text-4xl font-medium text-white">
                                            {user.name?.[0] || "?"}
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute bottom-1 right-1 ${user.isOnline ? "online-dot" : "w-3 h-3 rounded-full bg-[var(--text-muted)] border-2 border-[var(--bg-root)]"}`} />
                            </div>

                            <div className="flex-1 text-center md:text-left mt-1">
                                <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.03em] mb-1">
                                    {user.name || "Anonymous"}
                                </h2>
                                <p className="text-[var(--text-muted)] text-sm font-light mb-4">@{user.username || "no-username"}</p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 text-[13px] text-[var(--text-secondary)] font-light">
                                        <Mail size={12} className="text-[var(--text-muted)]" />
                                        {user.email}
                                    </div>
                                    {user.isOnline && (
                                        <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[13px] text-[var(--success)] font-light">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                                            Online
                                        </div>
                                    )}
                                </div>

                                {/* Message CTA Button */}
                                {!isOwnProfile && (
                                    <button
                                        onClick={handleMessage}
                                        disabled={isStartingChat}
                                        className="mt-5 flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50 border border-blue-500/30"
                                    >
                                        {isStartingChat ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <MessageCircle size={15} />
                                        )}
                                        {isStartingChat ? "Opening chat..." : "Send Message"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="glass rounded-2xl p-6 space-y-4 anim-fade-up delay-100">
                        <h3 className="text-base font-medium tracking-tight border-b border-[var(--border)] pb-3.5">Info</h3>
                        <div className="space-y-3">
                            <div className="group flex gap-3 p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] border border-[var(--border)] transition-all">
                                <div className="w-8 h-8 rounded-lg bg-[var(--warning)]/8 flex items-center justify-center shrink-0">
                                    <Clock size={14} className="text-[var(--warning)]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em] font-medium">Status</p>
                                    <p className="text-sm font-light">{user.isOnline ? (
                                        <span className="text-[var(--success)] flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[var(--success)] animate-pulse"></span> Online</span>
                                    ) : (
                                        `Last seen ${format(new Date(user.lastSeen), "MMM dd, p")}`
                                    )}</p>
                                </div>
                            </div>

                            <div className="group flex gap-3 p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] border border-[var(--border)] transition-all">
                                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/8 flex items-center justify-center shrink-0">
                                    <MessageCircle size={14} className="text-[var(--accent)]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em] font-medium">Chat</p>
                                    {isOwnProfile ? (
                                        <p className="text-sm font-light text-[var(--text-muted)]">This is your profile</p>
                                    ) : (
                                        <button onClick={handleMessage} disabled={isStartingChat} className="text-sm font-light text-[var(--accent)] hover:underline">
                                            {isStartingChat ? "Opening..." : "Start a conversation"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <MobileNav />
        </div>
    );
}
