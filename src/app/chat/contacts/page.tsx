"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Search, Loader2, MessageCirclePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ContactsPage() {
    const users = useQuery(api.users.listUsers);
    const ensureConversation = useMutation(api.conversations.getOrCreateConversation);
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [isStartingChat, setIsStartingChat] = useState<string | null>(null);

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
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Header */}
            <div className="h-[72px] flex items-center px-8 border-b border-neutral-800 bg-[#0d0d0d] shrink-0">
                <h1 className="text-xl font-bold tracking-wide text-white">All Contacts</h1>
            </div>

            <div className="p-8 pb-4">
                {/* Search */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-3.5 text-neutral-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or @username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] text-base text-white rounded-2xl pl-12 pr-4 py-3.5 outline-none border border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-neutral-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl">
                    {filteredUsers === undefined ? (
                        <div className="col-span-full flex justify-center p-12">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="col-span-full text-center p-16 border border-dashed border-neutral-800 rounded-3xl bg-[#0f0f0f]">
                            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-600">
                                <Search size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No contacts found</h3>
                            <p className="text-neutral-500 max-w-sm mx-auto">
                                {searchQuery ? `No one matches "${searchQuery}"` : "There are no other users registered on the platform yet."}
                            </p>
                        </div>
                    ) : (
                        filteredUsers.map((u: any) => (
                            <div key={u._id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex items-center gap-4 hover:border-neutral-700 transition-colors group">
                                <div className="relative shrink-0">
                                    <img src={u.imageUrl} className="w-14 h-14 rounded-full border border-neutral-700 shadow-md" alt="avatar" />
                                    {u.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-[#141414]" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold truncate text-[15px]">{u.name}</h3>
                                    {u.username && <p className="text-neutral-400 text-xs truncate mb-1">@{u.username}</p>}
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">
                                        {u.isOnline ? <span className="text-green-500">Online</span> : "Offline"}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleStartChat(u._id)}
                                    disabled={isStartingChat === u._id}
                                    className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]"
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
        </div>
    );
}
