import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return;

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .filter(q => q.eq(q.field("userId"), currentUser._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isTyping: args.isTyping,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("typingIndicators", {
                conversationId: args.conversationId,
                userId: currentUser._id,
                isTyping: args.isTyping,
                updatedAt: Date.now(),
            });
        }
    },
});

export const getTypingUsers = query({
    args: {
        conversationId: v.optional(v.id("conversations")),
    },
    handler: async (ctx, args) => {
        if (!args.conversationId) return [];
        const conversationId = args.conversationId;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        const activeTyping = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
            .filter(q => q.eq(q.field("isTyping"), true))
            .filter(q => q.neq(q.field("userId"), currentUser._id))
            .collect();

        // Only return if they updated within the last 5 seconds to prevent stuck indicators
        return activeTyping.filter(t => Date.now() - t.updatedAt < 5000);
    },
});
