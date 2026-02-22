"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

export default function Home() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            router.push("/chat");
        }
    }, [user, isLoaded, router]);

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-950">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white font-sans px-4">
                {/* Splash Design Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
                </div>

                <div className="z-10 bg-neutral-900/50 backdrop-blur-3xl border border-neutral-800/80 p-10 md:p-14 rounded-3xl shadow-2xl text-center max-w-lg w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500">
                        Tars Live Chat
                    </h1>
                    <p className="text-neutral-400 mb-10 text-lg leading-relaxed">
                        Real-time messaging engineered for speed. Connect instantly, anywhere.
                    </p>
                    <SignInButton mode="modal">
                        <button className="group relative w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] active:scale-[0.98]">
                            <span className="flex items-center justify-center gap-2">
                                Get Started
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </button>
                    </SignInButton>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-neutral-950">
            <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
    );
}
