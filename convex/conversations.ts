import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getConversation = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Order matters since indexing doesn't know combinations
        const p1 = currentUser._id;
        const p2 = args.userId;

        const conversations1 = await ctx.db
            .query("conversations")
            .withIndex("by_participant1", (q) => q.eq("participant1", p1))
            .filter((q) => q.eq(q.field("participant2"), p2))
            .first();

        if (conversations1) return conversations1;

        const conversations2 = await ctx.db
            .query("conversations")
            .withIndex("by_participant1", (q) => q.eq("participant1", p2))
            .filter((q) => q.eq(q.field("participant2"), p1))
            .first();

        return conversations2 || null;
    },
});

export const getOrCreateConversation = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const p1 = currentUser._id;
        const p2 = args.userId;

        const conversations1 = await ctx.db
            .query("conversations")
            .withIndex("by_participant1", (q) => q.eq("participant1", p1))
            .filter((q) => q.eq(q.field("participant2"), p2))
            .first();

        if (conversations1) return conversations1._id;

        const conversations2 = await ctx.db
            .query("conversations")
            .withIndex("by_participant1", (q) => q.eq("participant1", p2))
            .filter((q) => q.eq(q.field("participant2"), p1))
            .first();

        if (conversations2) return conversations2._id;

        // Create new
        return await ctx.db.insert("conversations", {
            participant1: p1,
            participant2: p2,
            updatedAt: Date.now(),
        });
    },
});

export const listConversations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        const conv1 = await ctx.db
            .query("conversations")
            .withIndex("by_participant1", (q) => q.eq("participant1", currentUser._id))
            .collect();

        const conv2 = await ctx.db
            .query("conversations")
            .withIndex("by_participant2", (q) => q.eq("participant2", currentUser._id))
            .collect();

        const allConvs = [...conv1, ...conv2].sort((a, b) => b.updatedAt - a.updatedAt);

        // Hydrate the partner user object and last message
        return await Promise.all(
            allConvs.map(async (conv) => {
                const partnerId = conv.participant1 === currentUser._id ? conv.participant2 : conv.participant1;
                const partner = await ctx.db.get(partnerId);
                const lastMessage = conv.lastMessageId ? await ctx.db.get(conv.lastMessageId) : null;

                const unreadMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
                    .filter(q => q.eq(q.field("isRead"), false))
                    .filter(q => q.neq(q.field("senderId"), currentUser._id))
                    .collect();

                return {
                    ...conv,
                    partner,
                    lastMessage,
                    unreadCount: unreadMessages.length,
                };
            })
        );
    },
});
