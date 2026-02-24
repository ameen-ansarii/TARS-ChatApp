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

        const messagesWithReplies = await Promise.all(
            messages.map(async (m) => {
                let replyToMessage = undefined;
                if (m.replyTo) {
                    const repliedMsg = await ctx.db.get(m.replyTo);
                    if (repliedMsg) {
                        const sender = await ctx.db.get(repliedMsg.senderId);
                        replyToMessage = {
                            _id: repliedMsg._id,
                            text: repliedMsg.isDeleted ? "This message was deleted" : repliedMsg.text,
                            senderName: sender?.name || "User",
                        };
                    }
                }

                // Get sender info for group chats
                const sender = await ctx.db.get(m.senderId);

                return {
                    ...m,
                    isMe: m.senderId === currentUser?._id,
                    senderName: sender?.name || "User",
                    senderImage: sender?.imageUrl || "",
                    replyToMessage,
                };
            })
        );

        return messagesWithReplies;
    },
});

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        text: v.string(),
        replyTo: v.optional(v.id("messages")),
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
            replyTo: args.replyTo,
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

export const editMessage = mutation({
    args: {
        messageId: v.id("messages"),
        newText: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const msg = await ctx.db.get(args.messageId);
        if (!msg) throw new Error("Message not found");
        if (msg.senderId !== currentUser._id) {
            throw new Error("Unauthorized");
        }
        if (msg.isDeleted) {
            throw new Error("Cannot edit deleted message");
        }

        await ctx.db.patch(args.messageId, {
            text: args.newText,
            isEdited: true,
        });
    },
});

export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const msg = await ctx.db.get(args.messageId);
        if (!msg) throw new Error("Message not found");
        if (msg.senderId !== currentUser._id) {
            throw new Error("Unauthorized");
        }

        // Soft delete
        await ctx.db.patch(args.messageId, {
            isDeleted: true,
            text: "This message was deleted",
            reactions: [], // remove reactions on delete
        });
    },
});

export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const msg = await ctx.db.get(args.messageId);
        if (!msg) throw new Error("Message not found");

        const currentReactions = msg.reactions || [];
        const existingReactionIndex = currentReactions.findIndex(
            (r) => r.userId === currentUser._id && r.emoji === args.emoji
        );

        let newReactions = [...currentReactions];

        if (existingReactionIndex !== -1) {
            newReactions.splice(existingReactionIndex, 1);
        } else {
            newReactions.push({
                emoji: args.emoji,
                userId: currentUser._id,
            });
        }

        await ctx.db.patch(args.messageId, {
            reactions: newReactions,
        });
    },
});
