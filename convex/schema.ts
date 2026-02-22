import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  conversations: defineTable({
    participant1: v.id("users"),
    participant2: v.id("users"),
    lastMessageId: v.optional(v.id("messages")),
    updatedAt: v.number(),
  })
    .index("by_participant1", ["participant1"])
    .index("by_participant2", ["participant2"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    isRead: v.boolean(),
  })
    .index("by_conversationId", ["conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),
});
