"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { Loader2, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "../components/Logo";
import { useState, useEffect, useRef } from "react";

/* ── Intersection Observer hook for scroll animations ── */
function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

export default function Home() {
    const { user, isLoaded } = useUser();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const features = useReveal();
    const specs = useReveal();
    const faq = useReveal();
    const cta = useReveal();

    if (!isLoaded) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-root)]">
                <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[var(--bg-root)] text-[var(--text-primary)] overflow-hidden">

            {/* ─── Background ─── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent-dim)] rounded-full blur-[200px] opacity-[0.06] anim-blob" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#38bdf8] rounded-full blur-[200px] opacity-[0.04] anim-blob delay-2000" />
                <div className="absolute inset-0 bg-grid opacity-40" />
            </div>

            {/* ─── Nav ─── */}
            <nav className="fixed w-full top-0 z-50 backdrop-blur-2xl bg-[var(--bg-root)]/80 border-b border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[#38bdf8] rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <Logo size={16} className="text-white" />
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">tars</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <Link href="/chat" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium hidden sm:block">
                                    Open App
                                </Link>
                                <Link href="/profile" className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 group">
                                    {user.imageUrl ? (
                                        <Image src={user.imageUrl} width={26} height={26} className="w-[26px] h-[26px] rounded-full" alt="avatar" />
                                    ) : (
                                        <div className="w-[26px] h-[26px] rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-xs font-medium">
                                            {user.firstName?.[0] || 'U'}
                                        </div>
                                    )}
                                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors font-medium hidden sm:block">{user.firstName}</span>
                                </Link>
                            </>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="text-sm font-medium px-5 py-2 rounded-full border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-white/[0.04] transition-all duration-300">
                                    Sign in
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-36 px-6">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Pill */}
                    <div className="anim-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium mb-10 bg-white/[0.02] tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                        Now in public beta
                    </div>

                    {/* Headline — thin, large, elegant */}
                    <h1 className="anim-fade-up delay-100 text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.045em] mb-8">
                        Where conversations
                        <br />
                        <span className="text-gradient anim-gradient">come alive</span>
                        <span className="text-[var(--text-muted)]">.</span>
                    </h1>

                    {/* Subtitle — light weight */}
                    <p className="anim-fade-up delay-200 text-lg sm:text-xl text-[var(--text-secondary)] mb-14 max-w-xl mx-auto leading-relaxed font-light">
                        Real-time messaging built on modern infrastructure.
                        <br className="hidden sm:block" />
                        Instant, minimal, open.
                    </p>

                    {/* CTA */}
                    <div className="anim-fade-up delay-300 flex flex-col sm:flex-row gap-3 justify-center items-center">
                        {user ? (
                            <Link href="/chat" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--text-primary)] text-[var(--bg-root)] rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]">
                                Open App
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                        ) : (
                            <>
                                <SignInButton mode="modal">
                                    <button className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--text-primary)] text-[var(--bg-root)] rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]">
                                        Get started — free
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>
                                </SignInButton>
                                <a href="#features" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-all duration-300 hover:bg-white/[0.02]">
                                    Learn more
                                </a>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── App Preview ─── */}
                <div className="anim-fade-up delay-500 mt-24 max-w-4xl mx-auto relative">
                    <div className="absolute -inset-8 bg-gradient-to-t from-[var(--bg-root)] via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="absolute -inset-4 bg-[var(--accent)]/5 rounded-[2rem] blur-3xl opacity-60" />
                    <div className="relative glass rounded-2xl p-1.5 overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
                        <div className="bg-[var(--bg-surface)] rounded-[0.65rem] border border-[var(--border)] overflow-hidden flex h-[320px] sm:h-[440px]">
                            {/* Sidebar mock */}
                            <div className="w-14 sm:w-48 border-r border-[var(--border)] bg-[var(--bg-root)]/50 p-3 hidden md:flex flex-col gap-3">
                                <div className="h-5 w-16 bg-white/5 rounded-md" />
                                <div className="space-y-3 mt-5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`flex gap-2.5 items-center p-2 rounded-lg ${i === 1 ? 'bg-white/[0.04]' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-white/[0.06] shrink-0" />
                                            <div className="flex-1 space-y-1.5 hidden sm:block">
                                                <div className="h-2 w-16 bg-white/[0.06] rounded" />
                                                <div className="h-1.5 w-24 bg-white/[0.03] rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Chat mock */}
                            <div className="flex-1 flex flex-col p-4 sm:p-6">
                                <div className="flex justify-end mb-5">
                                    <div className="bg-[var(--accent-dim)] px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[70%]">
                                        <div className="h-2 w-40 sm:w-48 bg-white/25 rounded mb-1.5" />
                                        <div className="h-2 w-24 bg-white/12 rounded" />
                                    </div>
                                </div>
                                <div className="flex justify-start mb-5">
                                    <div className="bg-white/[0.04] border border-[var(--border)] px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[70%]">
                                        <div className="h-2 w-44 sm:w-56 bg-white/[0.06] rounded mb-1.5" />
                                        <div className="h-2 w-32 bg-white/[0.04] rounded" />
                                    </div>
                                </div>
                                <div className="mt-auto bg-[var(--bg-root)]/60 border border-[var(--border)] p-2.5 rounded-xl flex gap-2.5 items-center">
                                    <div className="flex-1 h-8 bg-white/[0.03] rounded-lg" />
                                    <div className="w-8 h-8 bg-[var(--accent-dim)] rounded-lg shrink-0" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Features — Bento Grid ─── */}
            <section id="features" className="py-28 sm:py-36 px-6 relative z-10 border-t border-[var(--border)]" ref={features.ref}>
                <div className={`max-w-5xl mx-auto transition-all duration-1000 ${features.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="text-center mb-20">
                        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.2em] mb-5">Features</p>
                        <h2 className="text-3xl sm:text-[2.75rem] font-medium tracking-[-0.035em] leading-tight">
                            Everything you need
                            <br />
                            <span className="text-[var(--text-secondary)]">for seamless communication.</span>
                        </h2>
                    </div>

                    {/* Bento Grid — text & number driven, no icons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Big stat card */}
                        <div className="glass rounded-2xl p-8 sm:col-span-2 lg:col-span-1 card-hover group relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <p className="text-5xl sm:text-6xl font-light tracking-tight text-[var(--text-primary)] mb-3">&lt;50<span className="text-[var(--accent)]">ms</span></p>
                            <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">Average message delivery. Powered by Convex real-time sync — your messages arrive before you blink.</p>
                        </div>
                        {/* Feature card */}
                        <div className="glass rounded-2xl p-8 card-hover group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--success)]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <p className="text-lg font-medium text-[var(--text-primary)] mb-2.5 tracking-tight">Live presence</p>
                            <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">See who&apos;s online in real-time. Typing indicators, read receipts, and live status — all instant.</p>
                        </div>
                        {/* Feature card */}
                        <div className="glass rounded-2xl p-8 card-hover group relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--warning)]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <p className="text-lg font-medium text-[var(--text-primary)] mb-2.5 tracking-tight">Secure by design</p>
                            <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">Enterprise-grade authentication via Clerk. Your identity and conversations are always protected.</p>
                        </div>
                        {/* Feature card */}
                        <div className="glass rounded-2xl p-8 card-hover group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-[#38bdf8]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <p className="text-lg font-medium text-[var(--text-primary)] mb-2.5 tracking-tight">Responsive everywhere</p>
                            <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">Designed mobile-first. Works flawlessly across phones, tablets, and desktops without compromise.</p>
                        </div>
                        {/* Big number card */}
                        <div className="glass rounded-2xl p-8 sm:col-span-2 card-hover group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent)]/4 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-lg font-medium text-[var(--text-primary)] mb-2.5 tracking-tight">Built on modern stack</p>
                                    <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed max-w-sm">Next.js, Convex, Clerk, and WebSockets working together — zero bloat, maximum performance.</p>
                                </div>
                                <p className="text-4xl font-light text-[var(--text-muted)] hidden sm:block tracking-tight">99.9<span className="text-[var(--accent)]">%</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Specs ─── */}
            <section className="py-28 sm:py-36 px-6 relative z-10 border-t border-[var(--border)] bg-[var(--bg-surface)]/30" ref={specs.ref}>
                <div className={`max-w-5xl mx-auto transition-all duration-1000 delay-100 ${specs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="text-center mb-20">
                        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.2em] mb-5">Architecture</p>
                        <h2 className="text-3xl sm:text-[2.75rem] font-medium tracking-[-0.035em] leading-tight">
                            Engineered for
                            <br />
                            <span className="text-gradient">performance.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
                        {[
                            { label: "Edge routing", text: "Messages take the shortest physical path to their destination." },
                            { label: "End-to-end security", text: "Your data stays yours. No compromises, ever." },
                            { label: "Micro payloads", text: "Binary framing keeps network overhead at virtually zero." },
                            { label: "Offline support", text: "Messages queue locally and sync the moment you reconnect." },
                            { label: "Sub-millisecond state", text: "Typing indicators and presence propagate instantly." },
                            { label: "Cross-platform", text: "Identical experience across mobile, tablet, and desktop." },
                            { label: "Self-healing", text: "Automatic reconnection and state recovery — no manual refresh." },
                            { label: "PWA ready", text: "Install as a native app on any device from the browser." },
                        ].map((item, i) => (
                            <div key={i} className="group">
                                <div className="w-6 h-px bg-[var(--accent)] rounded-full mb-4 group-hover:w-10 transition-all duration-500" />
                                <h4 className="text-[15px] font-medium text-[var(--text-primary)] mb-2 tracking-tight">{item.label}</h4>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="py-28 sm:py-36 px-6 relative z-10 border-t border-[var(--border)]" ref={faq.ref}>
                <div className={`max-w-2xl mx-auto transition-all duration-1000 ${faq.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-[2.75rem] font-medium tracking-[-0.035em]">
                            Questions<span className="text-[var(--text-muted)]">.</span>
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {[
                            { q: "Is it free?", a: "Yes. Core messaging is completely free for personal use. No hidden limits or paywalls." },
                            { q: "How is my data protected?", a: "We use Clerk for identity management and Convex as our database — both meet enterprise-grade security and compliance standards." },
                            { q: "Is there a mobile app?", a: "Tars is a Progressive Web App optimized to feel like a native app in your mobile browser. Install it directly — no app store needed." },
                            { q: "Can I self-host?", a: "Not yet. We're focused on the managed cloud experience for now. Open-source deployment is on our roadmap." }
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full text-left rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 overflow-hidden group"
                            >
                                <div className="flex items-center justify-between px-6 py-5">
                                    <span className="text-[15px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors pr-4">{item.q}</span>
                                    <ChevronDown size={16} className={`text-[var(--text-muted)] shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                                </div>
                                <div className={`transition-all duration-400 overflow-hidden ${openFaq === i ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`} style={{ transitionTimingFunction: 'var(--ease)' }}>
                                    <p className="px-6 pb-5 text-sm text-[var(--text-secondary)] leading-relaxed font-light -mt-1">{item.a}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            {!user && (
                <section className="py-28 sm:py-36 px-6 relative z-10 border-t border-[var(--border)]" ref={cta.ref}>
                    <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${cta.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-4xl sm:text-6xl font-medium tracking-[-0.04em] mb-6 leading-tight">
                            Start a conversation
                            <span className="text-[var(--text-muted)]">.</span>
                        </h2>
                        <p className="text-lg text-[var(--text-secondary)] mb-12 font-light max-w-md mx-auto">
                            Free, instant, and designed to stay out of your way.
                        </p>
                        <SignInButton mode="modal">
                            <button className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-root)] rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]">
                                Create free account
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                        </SignInButton>
                    </div>
                </section>
            )}

            {/* ─── Footer ─── */}
            <footer className="border-t border-[var(--border)] py-10 relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-[var(--accent)] to-[#38bdf8] rounded-lg flex items-center justify-center">
                        <Logo size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-secondary)]">tars</span>
                </div>
                <p className="text-[var(--text-muted)] text-xs font-light">
                    © 2026 Tars. Built with Next.js & Convex.
                </p>
            </footer>
        </div>
    );
}
