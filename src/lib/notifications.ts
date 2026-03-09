/**
 * Notification utilities for creating and managing notifications
 */

import { prisma } from "./prisma";

export interface CreateNotificationParams {
  userId: string;
  message: string;
  ticketId?: number;
}

/**
 * Create a single notification
 */
export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      message: params.message,
      userId: parseInt(params.userId),
      ticketId: params.ticketId,
    },
  });
}

/**
 * Create notifications for multiple users
 */
export async function createNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  if (userIds.length === 0) return [];

  const notifications = userIds.map((userId) =>
    prisma.notification.create({
      data: {
        message: params.message,
        userId: parseInt(userId),
        ticketId: params.ticketId,
      },
    })
  );

  return Promise.all(notifications);
}

/**
 * Get notifications for a user
 */
export async function getNotificationsForUser(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

