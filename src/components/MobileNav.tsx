"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, User, Search } from "lucide-react";

const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/chat/contacts", icon: Search, label: "Search" },
    { href: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
    const pathname = usePathname();
    return (
        <div className="border-t border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around md:hidden relative z-50 shrink-0">
            {items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-all duration-200 relative ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] active:scale-95'
                            }`}
                    >
                        <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                        <span className="text-[9px] font-medium tracking-wide">{label}</span>
                        {active && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[var(--accent)] rounded-full" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
