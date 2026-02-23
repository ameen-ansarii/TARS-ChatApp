"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Loader2, Save, X, ArrowLeft, Mail, Calendar, Clock, CheckCircle, LogOut, Camera, Edit3, Shield } from "lucide-react";
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
            <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-root)]">
                <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
            </div>
        );
    }

    if (currentUser === null) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-root)]">
                <div className="flex flex-col items-center gap-3 text-center anim-fade-up">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                    <p className="text-[var(--text-secondary)] text-sm font-light">Syncing profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] bg-[var(--bg-root)] text-[var(--text-primary)] relative overflow-hidden">
            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto w-full z-10 relative scrollbar-hide">
                {/* Header */}
                <div className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--bg-root)]/80 backdrop-blur-2xl">
                    <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push("/chat")}
                                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all border border-[var(--border)] active:scale-95"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <h1 className="text-sm font-medium hidden sm:block">Profile</h1>
                        </div>
                        <SignOutButton>
                            <button className="flex items-center gap-1.5 text-[13px] text-[var(--danger)]/60 hover:text-[var(--danger)] transition-colors font-light">
                                <span>Sign out</span>
                                <LogOut size={13} />
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-10 w-full space-y-5">

                    {/* ── Avatar Card ── */}
                    <div className="glass rounded-2xl p-8 relative overflow-hidden group anim-fade-up">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-7">
                            {/* Avatar */}
                            <div className="relative shrink-0 group/avatar cursor-pointer">
                                <div className="w-28 h-28 md:w-32 md:h-32 relative rounded-full overflow-hidden ring-2 ring-[var(--border)] group-hover/avatar:ring-[var(--accent)]/30 transition-all duration-500">
                                    {clerkUser.imageUrl ? (
                                        <Image src={clerkUser.imageUrl} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-[#38bdf8] flex items-center justify-center text-4xl font-medium text-white">
                                            {currentUser.name?.[0] || "?"}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                        <Camera className="text-white" size={22} />
                                    </div>
                                </div>
                                <div className={`absolute bottom-1 right-1 ${currentUser.isOnline ? "online-dot" : "w-3 h-3 rounded-full bg-[var(--text-muted)] border-2 border-[var(--bg-root)]"}`} />
                            </div>

                            {/* Name */}
                            <div className="flex-1 text-center md:text-left mt-1">
                                <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.03em] mb-1">
                                    {currentUser.name || "Anonymous"}
                                </h2>
                                <p className="text-[var(--text-muted)] text-sm font-light mb-4">@{currentUser.username || "no-username"}</p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 text-[13px] text-[var(--text-secondary)] font-light">
                                        <Mail size={12} className="text-[var(--text-muted)]" />
                                        {currentUser.email}
                                    </div>
                                    {currentUser.isOnline && (
                                        <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[13px] text-[var(--success)] font-light">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                                            Online
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {success && (
                        <div className="anim-fade-up flex items-center gap-2.5 p-3.5 bg-[var(--success)]/8 border border-[var(--success)]/15 rounded-xl text-[var(--success)] text-sm font-light">
                            <CheckCircle size={16} className="shrink-0" />
                            Profile updated successfully.
                        </div>
                    )}
                    {error && (
                        <div className="anim-fade-up flex items-center gap-2.5 p-3.5 bg-[var(--danger)]/8 border border-[var(--danger)]/15 rounded-xl text-[var(--danger)] text-sm font-light">
                            <X size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-5 gap-4">
                        {/* ── Edit Form ── */}
                        <div className="md:col-span-3 anim-fade-up delay-100">
                            <div className="glass rounded-2xl p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
                                    <div>
                                        <h3 className="text-base font-medium tracking-tight">Details</h3>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5 font-light">How others see you.</p>
                                    </div>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-[var(--border)] hover:border-[var(--border-hover)] text-[13px] font-medium transition-all active:scale-[0.97]">
                                            <Edit3 size={13} />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.12em] pl-0.5 font-medium">Name</label>
                                        {isEditing ? (
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-clean" placeholder="Your name" />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/[0.02] border border-[var(--border)] rounded-xl text-sm font-light text-[var(--text-secondary)]">
                                                {currentUser.name || "Not set"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.12em] pl-0.5 font-medium">Username</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent)] text-sm font-medium">@</span>
                                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="input-clean !pl-8 font-mono" placeholder="username" />
                                            </div>
                                        ) : (
                                            <div className="px-4 py-3 bg-white/[0.02] border border-[var(--border)] rounded-xl text-sm font-mono font-light text-[var(--text-secondary)]">
                                                @{currentUser.username || "not-set"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-[var(--border)]">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[var(--text-primary)] text-[var(--bg-root)] rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="sm:w-28 flex items-center justify-center gap-1.5 px-5 py-3 bg-white/[0.03] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Metadata ── */}
                        <div className="md:col-span-2 anim-fade-up delay-300">
                            <div className="glass rounded-2xl p-6 space-y-4 h-full">
                                <h3 className="text-base font-medium tracking-tight border-b border-[var(--border)] pb-3.5">Info</h3>

                                <div className="space-y-3">
                                    <div className="group flex gap-3 p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] border border-[var(--border)] transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--success)]/8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Calendar size={14} className="text-[var(--success)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em] font-medium">Joined</p>
                                            <p className="text-sm font-light">{clerkUser.createdAt ? format(new Date(clerkUser.createdAt), "MMM dd, yyyy") : "Unknown"}</p>
                                        </div>
                                    </div>

                                    <div className="group flex gap-3 p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] border border-[var(--border)] transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--warning)]/8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Clock size={14} className="text-[var(--warning)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em] font-medium">Status</p>
                                            <p className="text-sm font-light">{currentUser.isOnline ? (
                                                <span className="text-[var(--success)] flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[var(--success)] animate-pulse"></span> Online</span>
                                            ) : (
                                                format(new Date(currentUser.lastSeen), "MMM dd, p")
                                            )}</p>
                                        </div>
                                    </div>

                                    <div className="group flex gap-3 p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] border border-[var(--border)] transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Shield size={14} className="text-[var(--accent)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em] font-medium">Auth</p>
                                            <p className="text-sm font-light">Clerk secured</p>
                                        </div>
                                    </div>
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
