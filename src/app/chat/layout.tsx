"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { MessageSquareText, Users, LogOut, Loader2, Sparkles, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

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
            <div className="flex h-screen items-center justify-center bg-neutral-950">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
        const isActive = pathname === href;
        return (
            <button
                onClick={() => router.push(href)}
                className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 lg:px-6 transition-all border-l-2 ${isActive ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
            >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`font-medium hidden lg:block ${isActive ? 'text-white' : ''}`}>
                    {label}
                </span>
            </button>
        );
    };

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
            {/* Dynamic Nav-sidebar */}
            <div className="w-[72px] lg:w-64 flex-shrink-0 flex flex-col items-center lg:items-stretch bg-[#0d0d0d] border-r border-neutral-800 z-50">

                {/* App Branding */}
                <div className="h-[72px] flex items-center justify-center lg:justify-start lg:px-6 border-b border-neutral-800 w-full mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-lg tracking-wide text-white">Tars Chat</span>
                </div>

                {/* Main Nav Items */}
                <div className="flex-1 w-full space-y-1 py-2">
                    <NavItem href="/chat" icon={MessageSquareText} label="Conversations" />
                    <NavItem href="/chat/contacts" icon={Users} label="All Contacts" />
                </div>

                {/* User Mini-Profile & Actions */}
                <div className="mt-auto w-full border-t border-neutral-800 p-3 lg:p-4">
                    <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-2 lg:p-3 flex flex-col items-center lg:items-start gap-4">
                        <div className="flex items-center gap-3 w-full justify-center lg:justify-start">
                            <img src={user.imageUrl} className="w-10 h-10 rounded-full border border-neutral-700 shrink-0 shadow-md" alt="profile" />
                            <div className="hidden lg:flex flex-col min-w-0 flex-1">
                                <span className="font-semibold text-white truncate text-sm leading-tight">{user.firstName} {user.lastName}</span>
                                <span className="text-[11px] text-blue-400 truncate opacity-90">@{user.username}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 w-full justify-center lg:justify-between px-1">
                            <button className="p-2 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-colors hidden lg:flex">
                                <Settings size={18} />
                            </button>
                            <SignOutButton>
                                <button className="p-2 flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full lg:w-auto justify-center">
                                    <LogOut size={18} />
                                    <span className="hidden lg:block text-xs font-semibold uppercase tracking-wider">Log out</span>
                                </button>
                            </SignOutButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a] min-w-0">
                {children}
            </div>
        </div>
    );
}
