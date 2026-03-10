/**
 * src/lib/notifications.ts
 * Helper for creating notifications in the database.
 *
 * Call this inside any API route whenever an event occurs
 * (e.g., ticket created, status changed, request approved).
 */

import { prisma } from "./prisma";

interface CreateNotificationOptions {
    // userId may be passed as string (from front-end) or number
    userId: string | number;
    message: string;
    // ticketId/assetRequestId can be number or string; we'll normalize below
    ticketId?: string | number;
    assetRequestId?: string | number;
}

/**
 * Insert a notification row for a user.
 *
 * Usage example:
 *   await createNotification({
 *     userId:   agent.id,
 *     message:  `Ticket #${ticket.id} was assigned to you.`,
 *     ticketId: ticket.id,
 *   });
 */
export async function createNotification({
    userId,
    message,
    ticketId,
    assetRequestId,
}: CreateNotificationOptions): Promise<void> {
    // Normalize numeric fields to numbers when possible
    const userIdNum = typeof userId === "number" ? userId : parseInt(userId, 10);

    // We do not store ticketId/assetRequestId on Notification in the schema.
    // If callers pass them, include them in the message text for traceability.
    const augmentedMessage = ticketId || assetRequestId
        ? `${message}${ticketId ? ` (ticket: ${ticketId})` : ""}${assetRequestId ? ` (request: ${assetRequestId})` : ""}`
        : message;

    await prisma.notification.create({
        data: {
            userId: userIdNum,

            message: augmentedMessage,
        },
    });
}

/**
 * Create notifications for multiple users at once.
 * Useful when a ticket update should notify both creator and assignee.
 */
export async function createNotifications(
    userIds: string[],
    options: Omit<CreateNotificationOptions, "userId">
): Promise<void> {
    await Promise.all(
        userIds.map((userId) => createNotification({ userId, ...options }))
    );
}
