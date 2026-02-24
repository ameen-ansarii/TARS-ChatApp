"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, UserMinus, UserPlus, Search, Crown, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function GroupInfoPanel({ conversationId, onClose }: { conversationId: string; onClose: () => void }) {
    const [showAddMember, setShowAddMember] = useState(false);
    const [addSearch, setAddSearch] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const currentUser = useQuery(api.users.getCurrentUser);
    const groupData = useQuery(api.conversations.getGroupConversation, { conversationId: conversationId as any });
    const allUsers = useQuery(api.users.listUsers);
    const removeMember = useMutation(api.conversations.removeMember);
    const addMember = useMutation(api.conversations.addMember);

    // Animate in on mount
    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!groupData) return null;

    const isAdmin = currentUser?._id === groupData.groupAdmin;
    const memberIds = groupData.members || [];
    const nonMembers = allUsers?.filter(u => !memberIds.includes(u._id) && u.name?.toLowerCase().includes(addSearch.toLowerCase()));

    const handleKick = async (userId: string, name: string) => {
        if (!confirm(`Remove ${name} from the group?`)) return;
        await removeMember({ conversationId: conversationId as any, userId: userId as any });
    };

    const handleAdd = async (userId: string) => {
        await addMember({ conversationId: conversationId as any, userId: userId as any });
        setAddSearch("");
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
                onClick={handleClose}
            />

            {/* Panel — slides in from right */}
            <div
                className={`absolute top-0 right-0 h-full w-full sm:w-[380px] bg-[#0A0A0A] border-l border-white/5 flex flex-col shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 shrink-0">
                    <button onClick={handleClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                        <ArrowLeft size={16} />
                    </button>
                    <h3 className="text-sm font-bold text-white flex-1">Group Info</h3>
                    <button onClick={handleClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hidden sm:flex">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {/* Group Identity */}
                    <div className="flex flex-col items-center pt-10 pb-8 px-6">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-5 shadow-2xl shadow-violet-600/30 border border-violet-400/20 text-4xl font-bold text-white">
                            {groupData.groupName?.charAt(0)?.toUpperCase() || "G"}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{groupData.groupName}</h2>
                        {groupData.groupDescription && (
                            <p className="text-xs text-gray-500 text-center max-w-[260px] leading-relaxed mt-1">{groupData.groupDescription}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-[11px] text-gray-500 bg-white/5 border border-white/5 px-3 py-1 rounded-full font-medium">
                                {groupData.membersData?.length || 0} members
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-5 border-t border-white/5" />

                    {/* Members Section */}
                    <div className="px-5 py-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold">Members</p>
                            {isAdmin && (
                                <button onClick={() => setShowAddMember(!showAddMember)}
                                    className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors px-2.5 py-1 rounded-lg ${showAddMember ? "bg-violet-500/15 text-violet-400" : "text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"}`}>
                                    <UserPlus size={12} /> {showAddMember ? "Done" : "Add"}
                                </button>
                            )}
                        </div>

                        {/* Add Member Search */}
                        {showAddMember && isAdmin && (
                            <div className="mb-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="relative mb-2.5">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="text" placeholder="Search people to add..."
                                        value={addSearch} onChange={e => setAddSearch(e.target.value)} autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                                </div>
                                {nonMembers && nonMembers.length > 0 && (
                                    <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto scrollbar-hide bg-white/[0.02] rounded-xl border border-white/5 p-1">
                                        {nonMembers.slice(0, 6).map(u => (
                                            <button key={u._id} onClick={() => handleAdd(u._id)}
                                                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-violet-500/10 transition-all group">
                                                <Image src={u.imageUrl || ""} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-[12px] font-semibold text-white truncate">{u.name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">@{u.username}</p>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <UserPlus size={11} className="text-violet-400" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {nonMembers && nonMembers.length === 0 && addSearch && (
                                    <p className="text-[11px] text-gray-500 text-center py-3">No users found</p>
                                )}
                            </div>
                        )}

                        {/* Member List */}
                        <div className="flex flex-col gap-0.5">
                            {groupData.membersData?.map((member: any) => {
                                const isMemberAdmin = member._id === groupData.groupAdmin;
                                return (
                                    <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all group">
                                        <Link href={`/profile/${member._id}`} className="relative shrink-0">
                                            <Image src={member.imageUrl || ""} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                                            {member.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0A]" />}
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <Link href={`/profile/${member._id}`} className="text-[13px] font-semibold text-white truncate hover:text-violet-300 transition-colors">
                                                    {member.name}
                                                    {member._id === currentUser?._id && <span className="text-gray-500 font-normal"> (You)</span>}
                                                </Link>
                                                {isMemberAdmin && (
                                                    <span className="flex items-center gap-0.5 text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full font-bold border border-amber-500/20 shrink-0">
                                                        <Crown size={8} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate">@{member.username}</p>
                                        </div>
                                        {isAdmin && !isMemberAdmin && (
                                            <button onClick={() => handleKick(member._id, member.name)}
                                                className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-gray-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                title={`Remove ${member.name}`}>
                                                <UserMinus size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
