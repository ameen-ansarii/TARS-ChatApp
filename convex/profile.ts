import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        username: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Check if username is taken by another user
        if (args.username) {
            const existingUsername = await ctx.db
                .query("users")
                .withIndex("by_username", (q) => q.eq("username", args.username))
                .unique();

            if (existingUsername && existingUsername._id !== user._id) {
                throw new Error("Username already taken");
            }
        }

        await ctx.db.patch(user._id, {
            name: args.name,
            username: args.username,
        });

        return { success: true };
    },
});
