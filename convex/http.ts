import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

const http = httpRouter();

http.route({
    path: "/clerk",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const payloadString = await request.text();
        const headerPayload = request.headers;

        let evt: WebhookEvent;

        // In production, verify using Svix
        try {
            evt = JSON.parse(payloadString) as WebhookEvent;
        } catch (err) {
            console.error("Error parsing payload", err);
            return new Response("Error", { status: 400 });
        }

        const eventType = evt.type;

        if (eventType === "user.created" || eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;
            const email = email_addresses[0]?.email_address;
            const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

            await ctx.runMutation(internal.users.upsertUser, {
                clerkId: id,
                email,
                name,
                username: username || undefined,
                imageUrl: image_url,
            });
        }

        if (eventType === "user.deleted") {
            const { id } = evt.data;
            if (id) {
                await ctx.runMutation(internal.users.deleteUser, { clerkId: id });
            }
        }

        return new Response("Success", { status: 200 });
    }),
});

export default http;
