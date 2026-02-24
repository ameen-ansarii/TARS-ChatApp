"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Users, Search, Check, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (convId: string) => void }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [search, setSearch] = useState("");
    const [creating, setCreating] = useState(false);

    const users = useQuery(api.users.listUsers);
    const createGroup = useMutation(api.conversations.createGroupConversation);

    const filtered = users?.filter((u: any) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleUser = (u: any) => {
        setSelectedUsers(prev =>
            prev.find(s => s._id === u._id)
                ? prev.filter(s => s._id !== u._id)
                : [...prev, u]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) return;
        setCreating(true);
        try {
            const convId = await createGroup({
                name: groupName.trim(),
                description: groupDescription.trim() || undefined,
                memberIds: selectedUsers.map(u => u._id),
            });
            onCreated(convId);
        } catch (e) {
            console.error(e);
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Users size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">New Group</h2>
                            <p className="text-[11px] text-gray-500 font-medium">
                                {step === 1 ? `${selectedUsers.length} selected` : "Name your group"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                        <X size={14} />
                    </button>
                </div>

                {step === 1 ? (
                    <>
                        {/* Selected Users Pills */}
                        {selectedUsers.length > 0 && (
                            <div className="px-6 pb-3 flex gap-2 flex-wrap">
                                {selectedUsers.map(u => (
                                    <button key={u._id} onClick={() => toggleUser(u)}
                                        className="flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/30 text-violet-300 rounded-full pl-1 pr-2.5 py-1 text-[11px] font-semibold hover:bg-violet-500/25 transition-all group">
                                        <Image src={u.imageUrl} width={18} height={18} className="w-[18px] h-[18px] rounded-full object-cover" alt="" />
                                        {u.name?.split(" ")[0]}
                                        <X size={10} className="opacity-50 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div className="px-6 pb-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text" placeholder="Search people..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide">
                            {filtered?.map((u: any) => {
                                const isSelected = selectedUsers.find(s => s._id === u._id);
                                return (
                                    <button key={u._id} onClick={() => toggleUser(u)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected ? "bg-violet-500/10" : "hover:bg-white/[0.03]"}`}>
                                        <div className="relative shrink-0">
                                            <Image src={u.imageUrl} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                                            {u.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111]" />}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-[13px] font-semibold text-white truncate">{u.name}</p>
                                            <p className="text-[11px] text-gray-500 truncate">@{u.username}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-violet-500 border-violet-500" : "border-white/20"}`}>
                                            {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        <div className="p-4 border-t border-white/5">
                            <button onClick={() => setStep(2)} disabled={selectedUsers.length < 2}
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-lg shadow-violet-600/20 disabled:shadow-none">
                                Continue <ArrowRight size={16} />
                            </button>
                            {selectedUsers.length < 2 && (
                                <p className="text-center text-[11px] text-gray-500 mt-2">Select at least 2 people</p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Step 2: Name the group */}
                        <div className="flex-1 flex flex-col items-center px-6 py-6 gap-4">
                            <div className="text-center">
                                <p className="text-white font-bold text-base mb-0.5">Name your group</p>
                                <p className="text-gray-500 text-xs">
                                    {selectedUsers.length} members · You can change this later
                                </p>
                            </div>

                            <input
                                type="text"
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                placeholder="Group name..."
                                autoFocus
                                maxLength={50}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold placeholder-gray-500 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
                            />

                            <textarea
                                value={groupDescription}
                                onChange={e => setGroupDescription(e.target.value)}
                                placeholder="What's this group about? (optional)"
                                maxLength={200}
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
                            />

                            {/* Member avatars preview */}
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex -space-x-1.5">
                                    {selectedUsers.slice(0, 5).map(u => (
                                        <Image key={u._id} src={u.imageUrl} width={28} height={28}
                                            className="w-7 h-7 rounded-full object-cover border-2 border-[#111]" alt="" />
                                    ))}
                                    {selectedUsers.length > 5 && (
                                        <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-[#111] flex items-center justify-center text-[9px] text-white font-bold">
                                            +{selectedUsers.length - 5}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[11px] text-gray-500">{selectedUsers.map(u => u.name?.split(" ")[0]).join(", ")}</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="p-4 border-t border-white/5 flex gap-3">
                            <button onClick={() => setStep(1)}
                                className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all">
                                Back
                            </button>
                            <button onClick={handleCreate} disabled={!groupName.trim() || creating}
                                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-lg shadow-violet-600/20 disabled:shadow-none flex items-center justify-center gap-2">
                                {creating ? (
                                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span>
                                ) : (
                                    <><Users size={14} /> Create Group</>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
