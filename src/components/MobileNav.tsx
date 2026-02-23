"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, User, Search } from "lucide-react";

export default function MobileNav() {
    const pathname = usePathname();
    return (
        <div className="border-t border-white/5 bg-[#050505] px-4 py-3 flex items-center justify-around md:hidden relative z-50 shrink-0">
            <Link href="/" className={`flex flex-col items-center gap-1.5 ${pathname === '/' ? 'text-blue-400' : 'text-gray-500 hover:text-white'} transition-colors`}>
                <Home size={20} />
                <span className="text-[10px] font-medium tracking-wide">Home</span>
            </Link>
            <Link href="/chat" className={`flex flex-col items-center gap-1.5 ${pathname === '/chat' ? 'text-blue-400' : 'text-gray-500 hover:text-white'} transition-colors`}>
                <MessageCircle size={20} />
                <span className="text-[10px] font-medium tracking-wide">Chat</span>
            </Link>
            <Link href="/chat/contacts" className={`flex flex-col items-center gap-1.5 ${pathname === '/chat/contacts' ? 'text-blue-400' : 'text-gray-500 hover:text-white'} transition-colors`}>
                <Search size={20} />
                <span className="text-[10px] font-medium tracking-wide">Search</span>
            </Link>
            <Link href="/profile" className={`flex flex-col items-center gap-1.5 ${pathname === '/profile' ? 'text-blue-400' : 'text-gray-500 hover:text-white'} transition-colors`}>
                <User size={20} />
                <span className="text-[10px] font-medium tracking-wide">Profile</span>
            </Link>
        </div>
    );
}
