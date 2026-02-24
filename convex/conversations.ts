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

        return await ctx.db.insert("conversations", {
            participant1: p1,
            participant2: p2,
            updatedAt: Date.now(),
        });
    },
});

// ─── Group Conversations ───

export const createGroupConversation = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        memberIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");
        if (args.memberIds.length < 2) throw new Error("Group needs at least 2 other members");
        if (args.name.trim().length === 0) throw new Error("Group name is required");

        const allMembers = [currentUser._id, ...args.memberIds];

        const convId = await ctx.db.insert("conversations", {
            isGroup: true,
            groupName: args.name.trim(),
            groupDescription: args.description?.trim() || "",
            groupAdmin: currentUser._id,
            members: allMembers,
            updatedAt: Date.now(),
        });

        // System message
        await ctx.db.insert("messages", {
            conversationId: convId,
            senderId: currentUser._id,
            text: `${currentUser.name} created the group`,
            isRead: false,
            isSystem: true,
        });

        return convId;
    },
});

export const getGroupConversation = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const conv = await ctx.db.get(args.conversationId);
        if (!conv || !conv.isGroup) return null;

        const members = await Promise.all(
            (conv.members || []).map(async (memberId) => {
                const user = await ctx.db.get(memberId);
                return user;
            })
        );

        return {
            ...conv,
            membersData: members.filter(Boolean),
        };
    },
});

export const updateGroupInfo = mutation({
    args: {
        conversationId: v.id("conversations"),
        groupName: v.optional(v.string()),
        groupDescription: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!currentUser) throw new Error("User not found");

        const conv = await ctx.db.get(args.conversationId);
        if (!conv || !conv.isGroup) throw new Error("Not a group");
        if (conv.groupAdmin !== currentUser._id) throw new Error("Only admin can update group info");

        const updates: any = { updatedAt: Date.now() };
        if (args.groupName !== undefined) updates.groupName = args.groupName.trim();
        if (args.groupDescription !== undefined) updates.groupDescription = args.groupDescription.trim();

        await ctx.db.patch(args.conversationId, updates);
    },
});

export const addMember = mutation({
    args: {
        conversationId: v.id("conversations"),
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

        const conv = await ctx.db.get(args.conversationId);
        if (!conv || !conv.isGroup) throw new Error("Not a group");
        if (conv.groupAdmin !== currentUser._id) throw new Error("Only admin can add members");

        const members = conv.members || [];
        if (members.includes(args.userId)) throw new Error("Already a member");

        const newUser = await ctx.db.get(args.userId);
        await ctx.db.patch(args.conversationId, {
            members: [...members, args.userId],
            updatedAt: Date.now(),
        });

        // System message
        const msgId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            text: `${currentUser.name} added ${newUser?.name || "a user"} to the group`,
            isRead: false,
            isSystem: true,
        });
        await ctx.db.patch(args.conversationId, { lastMessageId: msgId });
    },
});

export const removeMember = mutation({
    args: {
        conversationId: v.id("conversations"),
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

        const conv = await ctx.db.get(args.conversationId);
        if (!conv || !conv.isGroup) throw new Error("Not a group");
        if (conv.groupAdmin !== currentUser._id) throw new Error("Only admin can remove members");
        if (args.userId === currentUser._id) throw new Error("Admin cannot remove themselves");

        const members = conv.members || [];
        const removedUser = await ctx.db.get(args.userId);

        await ctx.db.patch(args.conversationId, {
            members: members.filter(id => id !== args.userId),
            updatedAt: Date.now(),
        });

        // System message
        const msgId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            text: `${currentUser.name} removed ${removedUser?.name || "a user"} from the group`,
            isRead: false,
            isSystem: true,
        });
        await ctx.db.patch(args.conversationId, { lastMessageId: msgId });
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

        const dmConvs = [...conv1, ...conv2].filter(c => !c.isGroup);

        const allConversations = await ctx.db.query("conversations").collect();
        const groupConvs = allConversations.filter(
            (c) => c.isGroup && c.members && c.members.includes(currentUser._id)
        );

        const allConvs = [...dmConvs, ...groupConvs].sort((a, b) => b.updatedAt - a.updatedAt);

        return await Promise.all(
            allConvs.map(async (conv) => {
                const lastMessage = conv.lastMessageId ? await ctx.db.get(conv.lastMessageId) : null;

                if (conv.isGroup) {
                    const memberCount = conv.members?.length || 0;
                    let lastMessageSenderName = undefined;
                    if (lastMessage && !lastMessage.isDeleted && !lastMessage.isSystem) {
                        const sender = await ctx.db.get(lastMessage.senderId);
                        lastMessageSenderName = sender?.name?.split(" ")[0] || "User";
                    }

                    const unreadMessages = await ctx.db
                        .query("messages")
                        .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
                        .filter(q => q.eq(q.field("isRead"), false))
                        .filter(q => q.neq(q.field("senderId"), currentUser._id))
                        .collect();

                    return {
                        ...conv,
                        partner: null,
                        lastMessage,
                        lastMessageSenderName,
                        memberCount,
                        unreadCount: unreadMessages.length,
                    };
                }

                const partnerId = conv.participant1 === currentUser._id ? conv.participant2 : conv.participant1;
                const partner = partnerId ? await ctx.db.get(partnerId) : null;

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
