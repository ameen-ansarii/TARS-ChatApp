"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Search, Loader2, MessageCirclePlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";
import MobileNav from "../../../components/MobileNav";

export default function ContactsPage() {
    const users = useQuery(api.users.listUsers);
    const ensureConversation = useMutation(api.conversations.getOrCreateConversation);
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [isStartingChat, setIsStartingChat] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredUsers = users?.filter((u: any) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartChat = async (userId: Id<"users">) => {
        setIsStartingChat(userId);
        try {
            await ensureConversation({ userId });
            router.push("/chat");
        } catch (e) {
            console.error(e);
            setIsStartingChat(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-root)] text-[var(--text-primary)] relative overflow-hidden">
            {/* Header */}
            <div className="h-16 flex items-center px-6 lg:px-8 border-b border-[var(--border)] shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <Users className="text-[var(--text-muted)]" size={18} />
                    <div>
                        <h1 className="text-base font-medium tracking-tight">Contacts</h1>
                        <p className="text-[10px] text-[var(--text-muted)] font-light">
                            {filteredUsers ? `${filteredUsers.length} people` : 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="px-5 lg:px-8 py-4 pb-2">
                <div className="relative max-w-lg group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={15} />
                    <input
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-clean !pl-10 !py-2.5 !text-[13px] !font-light"
                    />
                </div>
            </div>

            {/* Contact Grid */}
            <div className="flex-1 overflow-y-auto px-5 lg:px-8 pb-8 pt-2 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-5xl">
                    {filteredUsers === undefined ? (
                        <div className="col-span-full flex justify-center p-16">
                            <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="col-span-full text-center p-16 anim-fade-up">
                            <p className="text-sm font-medium mb-1">No contacts found</p>
                            <p className="text-[var(--text-muted)] text-xs font-light">
                                {searchQuery ? `No matches for "${searchQuery}"` : "No users discovered yet."}
                            </p>
                        </div>
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        filteredUsers.map((u: any, i: number) => (
                            <div
                                key={u._id}
                                className="glass rounded-xl p-3.5 flex items-center gap-3 card-hover group cursor-pointer relative overflow-hidden"
                                onClick={() => handleStartChat(u._id)}
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    {u.imageUrl ? (
                                        <Image src={u.imageUrl} width={44} height={44} className="w-11 h-11 rounded-full border border-[var(--border)] object-cover group-hover:border-[var(--border-hover)] transition-colors" alt="avatar" />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-lg font-medium">
                                            {u.name?.[0] || "?"}
                                        </div>
                                    )}
                                    {u.isOnline && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[14px] font-medium truncate group-hover:text-[var(--accent)] transition-colors">{u.name}</h3>
                                    {u.username && <p className="text-[11px] text-[var(--text-muted)] truncate font-light">@{u.username}</p>}
                                    <p className="text-[10px] mt-0.5 font-light">
                                        {u.isOnline ? (
                                            <span className="text-[var(--success)] flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-[var(--success)]" />
                                                Online
                                            </span>
                                        ) : (
                                            <span className="text-[var(--text-muted)]">Offline</span>
                                        )}
                                    </p>
                                </div>

                                {/* Chat Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStartChat(u._id); }}
                                    disabled={isStartingChat === u._id}
                                    className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-center transition-all duration-300 shrink-0 active:scale-90 disabled:opacity-50 z-10"
                                >
                                    {isStartingChat === u._id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <MessageCirclePlus size={14} />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <MobileNav />
        </div>
    );
}
