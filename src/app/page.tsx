"use client";

import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Loader2, MessageCircle, Zap, Shield, Users, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050505]">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
                    <Loader2 className="relative animate-spin text-blue-500" size={40} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative">
            {/* Animated Background blobs */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
            <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />

            {/* Nav */}
            <nav className="fixed w-full top-0 z-50 glass-panel border-b-0 border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:scale-105">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Tars Chat</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link href="/chat" className="hidden sm:flex px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all duration-300">
                                    Open App
                                </Link>
                                <Link href="/profile" className="flex items-center gap-3 px-2 py-2 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all duration-300 group">
                                    {user.imageUrl ? (
                                        <Image src={user.imageUrl} width={28} height={28} className="w-7 h-7 rounded-full ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all" alt="avatar" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                                            {user.firstName?.[0] || 'U'}
                                        </div>
                                    )}
                                    <span className="hidden sm:block text-white/80 group-hover:text-white">{user.firstName}</span>
                                </Link>
                            </>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-6 py-2.5 bg-white text-black hover:bg-gray-100 rounded-full text-sm font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transform hover:-translate-y-0.5">
                                    Sign In
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="max-w-5xl mx-auto text-center z-10 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/30 text-blue-400 text-sm font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Next Generation Communication
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.1] tracking-tighter">
                        Connect with <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                            absolute clarity.
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                        Experience real-time messaging reimagined. Built for speed, designed for beauty, and engineered for the modern web.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {user ? (
                            <Link href="/chat" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                                Launch Application
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                                    Start Chatting Now
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignInButton>
                        )}
                        <a href="#features" className="px-8 py-4 text-gray-400 hover:text-white font-medium transition-colors duration-300">
                            Explore Features
                        </a>
                    </div>
                </div>

                {/* Dashboard Mockup Abstract */}
                <div className="mt-20 max-w-6xl mx-auto relative group perspective">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 h-full" />
                    <div className="glass-panel rounded-t-3xl border-b-0 p-2 sm:p-4 transform transition-transform duration-700 hover:scale-[1.02] hover:-translate-y-2 border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="bg-[#0A0A0A] rounded-2xl md:rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden flex h-[400px] sm:h-[600px]">
                            {/* Mockup Sidebar */}
                            <div className="w-16 sm:w-64 border-r border-white/5 bg-[#0a0a0a]/50 p-4 hidden md:flex flex-col gap-4">
                                <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                                <div className="space-y-4 mt-8">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded-full bg-white/5" />
                                            <div className="flex-1 space-y-2 hidden sm:block">
                                                <div className="h-3 w-24 bg-white/5 rounded" />
                                                <div className="h-2 w-32 bg-white/5 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Mockup Chat Area */}
                            <div className="flex-1 flex flex-col p-4 sm:p-8 relative">
                                <div className="absolute inset-0 bg-zinc-900/10" />
                                <div className="flex justify-end mb-8 relative">
                                    <div className="glass-panel px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%]">
                                        <div className="h-4 w-48 sm:w-64 bg-white/20 rounded mb-2" />
                                        <div className="h-4 w-32 bg-white/10 rounded" />
                                    </div>
                                </div>
                                <div className="flex justify-start mb-8 relative">
                                    <div className="glass-panel !bg-white/5 !border-white/5 px-6 py-4 rounded-2xl rounded-tl-sm max-w-[80%]">
                                        <div className="h-4 w-56 sm:w-72 bg-blue-500/20 rounded mb-2" />
                                        <div className="h-4 w-40 bg-blue-500/10 rounded" />
                                    </div>
                                </div>
                                <div className="mt-auto glass-panel !bg-[#050505]/50 p-4 rounded-2xl flex gap-4 items-center relative z-10">
                                    <div className="flex-1 h-10 bg-white/5 rounded-xl block" />
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl block" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32 px-6 relative z-10 border-t border-white/5 bg-black/40">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">Everything you need. <br /><span className="text-gray-500">Nothing you don&apos;t.</span></h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: <Zap size={24} className="text-amber-400" />,
                                title: "Zero Latency",
                                desc: "Powered by Convex, messages synchronize instantly across all devices. Real-time actually means real-time.",
                                bg: "from-amber-500/10 to-transparent",
                                border: "group-hover:border-amber-500/50"
                            },
                            {
                                icon: <Users size={24} className="text-blue-400" />,
                                title: "Live Presence",
                                desc: "See exactly who is online and when they engage. Fluid typing indicators make it feel alive.",
                                bg: "from-blue-500/10 to-transparent",
                                border: "group-hover:border-blue-500/50"
                            },
                            {
                                icon: <Shield size={24} className="text-emerald-400" />,
                                title: "Enterprise Grade",
                                desc: "Military-grade authentication backed by Clerk. Your conversations and identity are protected always.",
                                bg: "from-emerald-500/10 to-transparent",
                                border: "group-hover:border-emerald-500/50"
                            }
                        ].map((feature, i) => (
                            <div key={i} className={`group glass-panel rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 border border-white/5 ${feature.border} overflow-hidden relative`}>
                                <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                    <p className="text-gray-400 font-light leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            {!user && (
                <section className="py-32 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10" />
                    <div className="max-w-4xl mx-auto text-center relative z-10 glass-panel p-12 sm:p-20 rounded-[3rem] border-white/10">
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500 blur-[100px] opacity-30" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500 blur-[100px] opacity-30" />

                        <h2 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tighter">Ready to evolve?</h2>
                        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto font-light">Join the future of communication. Free forever for developers.</p>

                        <SignInButton mode="modal">
                            <button className="px-10 py-5 bg-white text-black hover:bg-gray-100 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transform hover:-translate-y-1">
                                Create Account
                            </button>
                        </SignInButton>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-black/50 relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles size={12} className="text-white" />
                    </div>
                    <span className="font-bold text-white/90">Tars.</span>
                </div>
                <p className="text-gray-500 text-sm">
                    © 2026 Tars Inc. Designed with precision. Built with Next.js & Convex.
                </p>
            </footer>
        </div>
    );
}
