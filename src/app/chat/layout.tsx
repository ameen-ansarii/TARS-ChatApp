"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { MessageSquareText, Users, LogOut, Loader2, Settings, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Logo } from "../../components/Logo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${isActive
            ? 'bg-white/[0.06] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.02]'
            }`}
    >
        {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 bg-[var(--accent)] rounded-r-full" />
        )}
        <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-[var(--accent)]' : ''} />
        <span className={`text-[14px] hidden lg:block ${isActive ? 'font-semibold' : 'font-normal'}`}>{label}</span>
    </button>
);

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const currentUser = useQuery(api.users.getCurrentUser);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoaded && !user) router.push("/");
    }, [user, isLoaded, router]);

    if (!isLoaded || !user) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-root)]">
                <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] bg-[var(--bg-root)] text-[var(--text-primary)] overflow-hidden">
            {/* ── Sidebar Nav ── */}
            <div className="hidden md:flex w-[64px] lg:w-[220px] shrink-0 flex-col items-center lg:items-stretch bg-[var(--bg-surface)]/60 backdrop-blur-xl border-r border-[var(--border)] z-50 relative">
                {/* Logo */}
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-5 border-b border-[var(--border)] w-full cursor-pointer group" onClick={() => router.push("/")}>
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[#38bdf8] rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Logo className="text-white" size={16} />
                    </div>
                    <span className="hidden lg:block ml-2.5 text-[15px] font-semibold tracking-tight">tars</span>
                </div>

                {/* Nav Items */}
                <div className="flex-1 w-full px-2.5 py-3 space-y-1">
                    <NavItem icon={MessageSquareText} label="Messages" isActive={pathname === "/chat"} onClick={() => router.push("/chat")} />
                    <NavItem icon={Users} label="Contacts" isActive={pathname === "/chat/contacts"} onClick={() => router.push("/chat/contacts")} />
                    <NavItem icon={User} label="Profile" isActive={pathname === "/profile"} onClick={() => router.push("/profile")} />
                </div>

                {/* User Card */}
                <div className="mt-auto w-full border-t border-[var(--border)] p-2.5">
                    <div className="glass rounded-xl p-2 lg:p-2.5 flex flex-col items-center lg:items-start gap-2.5">
                        <div className="flex items-center gap-2.5 w-full justify-center lg:justify-start cursor-pointer group" onClick={() => router.push("/profile")}>
                            <div className="relative shrink-0">
                                {user.imageUrl ? (
                                    <Image src={user.imageUrl} width={34} height={34} className="w-[34px] h-[34px] rounded-full border border-[var(--border)] object-cover" alt="profile" />
                                ) : (
                                    <div className="w-[34px] h-[34px] rounded-full bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)] font-medium text-sm">
                                        {user.firstName?.[0] || 'U'}
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 online-dot-sm" />
                            </div>
                            <div className="hidden lg:flex flex-col min-w-0 flex-1">
                                <span className="text-sm text-[var(--text-primary)] truncate font-medium leading-tight">{currentUser?.name || user.fullName}</span>
                                <span className="text-[11px] text-[var(--text-muted)] truncate">@{currentUser?.username || user.username}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 w-full justify-center lg:justify-start">
                            <button onClick={() => router.push("/profile")} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded-lg hover:bg-white/[0.04] transition-all hidden lg:flex">
                                <Settings size={14} />
                            </button>
                            <SignOutButton>
                                <button className="p-1.5 flex items-center gap-1.5 text-[var(--danger)]/50 hover:text-[var(--danger)] hover:bg-[var(--danger)]/5 rounded-lg transition-all w-full lg:w-auto justify-center">
                                    <LogOut size={14} />
                                    <span className="hidden lg:block text-[11px] font-medium">Sign out</span>
                                </button>
                            </SignOutButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 flex flex-col bg-[var(--bg-root)] min-w-0 relative">
                {children}
            </div>
        </div>
    );
}
