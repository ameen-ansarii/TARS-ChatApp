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

    if (!isLoaded) return null;

    const updateProfileMutation = useMutation(api.users.updateProfile);

    // If user somehow tries to access this without being logged in
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
            // Update Clerk Name
            await user.update({
                firstName: name.split(" ")[0],
                lastName: name.split(" ").slice(1).join(" ") || undefined,
            });

            // Updating username through Next.js client SDK is generally restricted if it's already generated or if missing the specific identifier.
            const safeUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");

            try {
                // Try to update through Clerk
                if (user.update !== undefined) {
                    await user.update({ username: safeUsername } as any);
                }
            } catch (err) {
                console.warn("Could not set Clerk username client-side due to config restrictions, bypassing directly to datastore");
            }

            // Bypass to Convex Database directly
            try {
                await updateProfileMutation({
                    name: name,
                    username: safeUsername
                });
            } catch (convexErr) {
                console.warn("Convex patch failed");
            }

            // Immediately redirect
            setTimeout(() => {
                router.push("/chat");
            }, 300);

        } catch (err: any) {
            console.error(err);
            setError(err.errors?.[0]?.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center">
                        <UserCircle size={32} />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-2">Complete your profile</h1>
                <p className="text-neutral-400 text-center text-sm mb-8">
                    Welcome to Tars Live Chat! Let's set up your identity so others can find you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full bg-[#1a1a1a] border border-neutral-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-neutral-500">@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="johndoe"
                                className="w-full bg-[#1a1a1a] border border-neutral-800 focus:border-blue-500 text-white rounded-xl pl-8 pr-4 py-3 outline-none transition-colors"
                                required
                            />
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Only letters, numbers, and underscores.</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !name.trim() || !username.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors mt-8"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Let's Chat <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
