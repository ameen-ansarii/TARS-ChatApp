import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!existing) {
            await ctx.db.insert("users", {
                clerkId: identity.subject,
                email: identity.email ?? "",
                name: identity.name ?? "Anonymous",
                username: identity.nickname ?? identity.subject.split("_")[1] ?? "user",
                imageUrl: identity.pictureUrl,
                isOnline: true,
                lastSeen: Date.now(),
            });
        }
        return true;
    },
});

export const upsertUser = internalMutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        username: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                username: args.username,
                imageUrl: args.imageUrl,
                email: args.email,
                isOnline: true,
                lastSeen: Date.now(),
            });
        } else {
            await ctx.db.insert("users", {
                clerkId: args.clerkId,
                email: args.email,
                username: args.username,
                name: args.name,
                imageUrl: args.imageUrl,
                isOnline: true,
                lastSeen: Date.now(),
            });
        }
    },
});

export const deleteUser = internalMutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();
        // Exclude the current user from the list
        return users.filter((u) => u.clerkId !== identity.subject);
    },
});

export const updatePresence = mutation({
    args: {
        isOnline: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: args.isOnline,
                lastSeen: Date.now(),
            });
        }
    },
});

export const updateProfile = mutation({
    args: {
        name: v.string(),
        username: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                name: args.name,
                username: args.username,
            });
        }
    },
});

export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
