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
            // Redirect to the main chat page, since we don't handle routing per-chat ID yet
            router.push("/chat");
        } catch (e) {
            console.error(e);
            setIsStartingChat(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="h-20 flex items-center px-6 lg:px-8 border-b border-white/5 bg-[#050505]/50 backdrop-blur-2xl shrink-0 z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                        <Users className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white mb-0.5 mt-2">Network Directory</h1>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2">Explore & Connect</p>
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-8 pb-4 relative z-10">
                {/* Search */}
                <div className="relative max-w-xl group">
                    <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Search className="absolute left-4 top-3.5 text-gray-500 z-10" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or @username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 text-base text-white rounded-2xl pl-12 pr-4 py-3.5 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-500 shadow-sm relative z-10"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8 relative z-10 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl">
                    {filteredUsers === undefined ? (
                        <div className="col-span-full flex justify-center p-12">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="col-span-full text-center p-16 border border-dashed border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 border border-white/10">
                                <Search size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">No contacts found</h3>
                            <p className="text-gray-400 max-w-sm mx-auto text-sm">
                                {searchQuery ? `No matching query for "${searchQuery}"` : "The network is quiet. No users discovered yet."}
                            </p>
                        </div>
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        filteredUsers.map((u: any) => (
                            <div key={u._id} className="glass-panel border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 hover:bg-white-[0.04] hover:shadow-lg transition-all group cursor-pointer">
                                <div className="relative shrink-0">
                                    {u.imageUrl ? (
                                        <Image src={u.imageUrl} width={56} height={56} className="w-14 h-14 rounded-full border border-white/10 shadow-sm group-hover:border-blue-500/30 transition-colors object-cover" alt="avatar" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold border border-white/10 group-hover:border-blue-500/30 transition-colors">
                                            {u.name?.[0] || "?"}
                                        </div>
                                    )}
                                    {u.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2px] border-[#0A0A0A] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold truncate text-[15px] group-hover:text-blue-400 transition-colors">{u.name}</h3>
                                    {u.username && <p className="text-blue-400/80 font-mono text-xs truncate mb-1">@{u.username}</p>}
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mt-1">
                                        {u.isOnline ? <span className="text-emerald-500 tracking-wide">Secure Comm Link Active</span> : "Offline"}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStartChat(u._id); }}
                                    disabled={isStartingChat === u._id}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-600 text-blue-400 hover:text-white border border-white/10 hover:border-blue-500 flex items-center justify-center transition-all shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                >
                                    {isStartingChat === u._id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <MessageCirclePlus size={18} />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile Nav */}
            <MobileNav />
        </div>
    );
}
