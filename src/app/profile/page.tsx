"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Loader2, Save, X, ArrowLeft, Mail, Calendar, Clock, CheckCircle, Sparkles, LogOut, Camera } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import MobileNav from "../../components/MobileNav";

export default function ProfilePage() {
    const { user: clerkUser, isLoaded } = useUser();
    const router = useRouter();
    const currentUser = useQuery(api.users.getCurrentUser);
    const syncUser = useMutation(api.users.syncUser);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateProfile = useMutation((api as any).profile?.updateProfile as any);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isLoaded) return;
        if (!clerkUser) { router.push("/"); }
    }, [clerkUser, isLoaded, router]);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || "");
            setUsername(currentUser.username || "");
        } else if (currentUser === null) {
            syncUser();
        }
    }, [currentUser, syncUser]);

    const handleSave = async () => {
        setIsSaving(true);
        setError("");
        setSuccess(false);
        try {
            await updateProfile({
                name: name.trim() || undefined,
                username: username.trim() || undefined,
            });
            setSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setName(currentUser?.name || "");
        setUsername(currentUser?.username || "");
        setError("");
    };

    if (!isLoaded || currentUser === undefined || !clerkUser) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050505]">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
                    <Loader2 className="relative animate-spin text-blue-500" size={40} />
                </div>
            </div>
        );
    }

    if (currentUser === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-gray-400 text-sm font-medium tracking-wide">Syncing your identity...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white selection:bg-blue-500/30 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Scrollable Main Area */}
            <div className="flex-1 overflow-y-auto w-full z-10 relative">
                {/* Header */}
                <div className="glass-panel border-b border-white/5 sticky top-0 z-50 bg-[#050505]/50 backdrop-blur-2xl">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push("/chat")}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 transform hover:-translate-x-1"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h1 className="font-bold text-xl tracking-tight hidden sm:block">Settings & Profile</h1>
                        </div>
                        <SignOutButton>
                            <button className="group flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-all px-4 py-2 rounded-full border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10">
                                <span>Sign Out</span>
                                <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-12 relative z-10 w-full space-y-6">

                    {/* Hero / Avatar Area */}
                    <div className="glass-panel rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative shrink-0 group/avatar cursor-pointer">
                            <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden ring-4 ring-white/5 group-hover/avatar:ring-white/20 transition-all duration-500">
                                {clerkUser.imageUrl ? (
                                    <Image src={clerkUser.imageUrl} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-5xl font-bold text-white">
                                        {currentUser.name?.[0] || "?"}
                                    </div>
                                )}
                                {/* Overlay for avatar edit hint */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                    <Camera className="text-white" size={28} />
                                </div>
                            </div>
                            <div className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 w-6 h-6 rounded-full border-4 border-[#0F1014] ${currentUser.isOnline ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-gray-500"}`} />
                        </div>

                        <div className="flex-1 text-center md:text-left mt-2 relative z-10">
                            <h2 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                {currentUser.name || "Anonymous"}
                            </h2>
                            <p className="text-blue-400 font-mono text-sm tracking-wide mb-4 opacity-80 backdrop-blur-sm">@{currentUser.username || "no-username"}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                                <div className="glass-panel px-4 py-2 rounded-xl border-white/5 flex items-center gap-2 text-sm text-gray-400">
                                    <Mail size={16} className="text-blue-400" />
                                    {currentUser.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {success && (
                        <div className="animate-fade-in-up flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-medium">
                            <CheckCircle size={18} className="shrink-0" />
                            Identity synchronized perfectly.
                        </div>
                    )}
                    {error && (
                        <div className="animate-fade-in-up flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                            <X size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-5 gap-6">
                        {/* Form Section */}
                        <div className="md:col-span-3">
                            <div className="glass-panel border-white/5 rounded-[2rem] p-8 space-y-8">
                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <div>
                                        <h3 className="font-bold text-xl text-white tracking-tight">Public Identity</h3>
                                        <p className="text-sm text-gray-500 mt-1">This is how others will see you on the network.</p>
                                    </div>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-full bg-white text-black hover:bg-gray-200 text-sm font-semibold transition-colors shadow-lg">
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Display Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 text-white rounded-2xl px-5 py-4 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10"
                                                placeholder="Your name"
                                            />
                                        ) : (
                                            <div className="px-5 py-4 bg-white/5 border border-transparent text-gray-300 rounded-2xl text-sm font-medium">
                                                {currentUser.name || "Not set"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Username Handle</label>
                                        {isEditing ? (
                                            <div className="relative group">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 font-mono font-bold">@</span>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 text-white rounded-2xl pl-10 pr-5 py-4 text-sm font-mono outline-none transition-all focus:ring-4 focus:ring-blue-500/10"
                                                    placeholder="username"
                                                />
                                            </div>
                                        ) : (
                                            <div className="px-5 py-4 bg-white/5 border border-transparent text-gray-300 rounded-2xl text-sm font-mono tracking-wide">
                                                @{currentUser.username || "not-set"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {isSaving ? "Synchronizing..." : "Save Origin"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="sm:w-32 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-colors"
                                        >
                                            <X size={18} /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Section */}
                        <div className="md:col-span-2">
                            <div className="glass-panel border-white/5 rounded-[2rem] p-8 space-y-6 h-full">
                                <h3 className="font-bold text-lg text-white tracking-tight border-b border-white/5 pb-4">Metadata</h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                                        <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                            <Calendar size={14} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Origin Date</p>
                                            <p className="text-gray-200 text-sm font-medium">{clerkUser.createdAt ? format(new Date(clerkUser.createdAt), "MMMM dd, yyyy") : "Unknown"}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                                        <div className="mt-1 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                                            <Clock size={14} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Network Activity</p>
                                            <p className="text-gray-200 text-sm font-medium">{currentUser.isOnline ? (
                                                <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active now</span>
                                            ) : (
                                                format(new Date(currentUser.lastSeen), "MMM dd, p")
                                            )}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile Nav */}
            <MobileNav />
        </div>
    );
}
