"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2, UserCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Onboarding() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const updateProfileMutation = useMutation(api.users.updateProfile);

    if (!isLoaded) return null;

    if (!user) {
        router.push("/");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !name.trim()) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await user.update({
                firstName: name.split(" ")[0],
                lastName: name.split(" ").slice(1).join(" ") || undefined,
            });

            const safeUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");

            try {
                if (user.update !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await user.update({ username: safeUsername } as any);
                }
            } catch (err) {
                console.warn("Could not set Clerk username client-side, bypassing to datastore", err);
            }

            try {
                await updateProfileMutation({ name: name, username: safeUsername });
            } catch (convexErr) {
                console.warn("Convex patch failed", convexErr);
            }

            setTimeout(() => { router.push("/chat"); }, 300);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError(err.errors?.[0]?.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <UserCircle size={28} className="text-white" />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Set up your profile</h1>
                    <p className="text-gray-500 text-center text-sm mb-8">
                        Choose how others will see you on Tars Chat
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 text-gray-900 rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-colors placeholder-gray-400"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Letters, numbers, and underscores only.</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !name.trim() || !username.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    Let&apos;s Chat <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
