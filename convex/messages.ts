import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
    args: {
        conversationId: v.optional(v.id("conversations")),
    },
    handler: async (ctx, args) => {
        if (!args.conversationId) return [];
        const conversationId = args.conversationId;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
            .collect();

        return messages.map((m) => ({
            ...m,
            isMe: m.senderId === currentUser?._id,
        }));
    },
});

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            text: args.text,
            isRead: false,
        });

        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
            updatedAt: Date.now(),
        });

        return messageId;
    },
});

export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.neq(q.field("senderId"), currentUser._id))
            .filter((q) => q.eq(q.field("isRead"), false))
            .collect();

        for (const message of messages) {
            await ctx.db.patch(message._id, { isRead: true });
        }
    },
});
