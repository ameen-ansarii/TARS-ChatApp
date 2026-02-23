"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { MessageSquareText, Users, LogOut, Loader2, Sparkles, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 lg:px-6 transition-all duration-300 border-l-2 ${isActive ? 'bg-white/10 border-blue-500 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-400' : ''} />
            <span className={`font-medium hidden lg:block ${isActive ? 'text-white' : ''}`}>
                {label}
            </span>
        </button>
    );
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoaded) {
            if (!user) {
                router.push("/");
            }
        }
    }, [user, isLoaded, router]);

    if (!isLoaded || !user) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-[#050505]">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
                    <Loader2 className="relative animate-spin text-blue-500" size={40} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] bg-[#050505] text-white font-sans overflow-hidden selection:bg-blue-500/30">
            {/* Dynamic Nav-sidebar */}
            <div className="hidden md:flex w-18 lg:w-64 shrink-0 flex-col items-center lg:items-stretch bg-[#0A0A0A]/80 backdrop-blur-3xl border-r border-white/5 z-50 relative">

                {/* Subtle Sidebar Highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

                {/* App Branding */}
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5 w-full mb-4 relative z-10 cursor-pointer" onClick={() => router.push("/")}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Tars Chat</span>
                </div>

                {/* Main Nav Items */}
                <div className="flex-1 w-full space-y-2 py-2 relative z-10">
                    <NavItem icon={MessageSquareText} label="Conversations" isActive={pathname === "/chat"} onClick={() => router.push("/chat")} />
                    <NavItem icon={Users} label="All Contacts" isActive={pathname === "/chat/contacts"} onClick={() => router.push("/chat/contacts")} />
                </div>

                {/* User Mini-Profile & Actions */}
                <div className="mt-auto w-full border-t border-white/5 p-3 lg:p-4 relative z-10">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2 lg:p-3 flex flex-col items-center lg:items-start gap-4 backdrop-blur-md hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 w-full justify-center lg:justify-start cursor-pointer group" onClick={() => router.push("/profile")}>
                            <div className="relative">
                                {user.imageUrl ? (
                                    <Image src={user.imageUrl} width={40} height={40} className="w-10 h-10 rounded-full border border-white/10 shrink-0 object-cover ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all" alt="profile" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-white/10">
                                        {user.firstName?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="hidden lg:flex flex-col min-w-0 flex-1">
                                <span className="font-semibold text-white/90 truncate text-sm leading-tight group-hover:text-white">{user.firstName} {user.lastName}</span>
                                <span className="text-[11px] text-blue-400 truncate opacity-80">@{user.username}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 w-full justify-center lg:justify-between px-1">
                            <button onClick={() => router.push("/profile")} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors hidden lg:flex">
                                <Settings size={18} />
                            </button>
                            <SignOutButton>
                                <button className="p-2 flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors w-full lg:w-auto justify-center border border-transparent hover:border-red-500/20">
                                    <LogOut size={18} />
                                    <span className="hidden lg:block text-xs font-semibold uppercase tracking-wider">Log out</span>
                                </button>
                            </SignOutButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#050505] min-w-0 relative">
                {children}
            </div>
        </div>
    );
}
