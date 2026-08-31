import { prisma } from "../../infrastructure/database/prisma/prisma.client";

export interface CreateNotificationInput {
  recipientType: "BUYER" | "VENDOR";
  userId?: string;
  vendorId?: string;
  organizationId?: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}

export class NotificationRepository {
  async create(data: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        recipientType: data.recipientType,
        userId: data.userId || null,
        vendorId: data.vendorId || null,
        organizationId: data.organizationId || null,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
      },
    });
  }

  async createMany(dataList: CreateNotificationInput[]) {
    if (dataList.length === 0) return;
    return prisma.notification.createMany({
      data: dataList.map((data) => ({
        recipientType: data.recipientType,
        userId: data.userId || null,
        vendorId: data.vendorId || null,
        organizationId: data.organizationId || null,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
      })),
    });
  }

  async findForBuyerUser(userId: string, organizationId?: string) {
    return prisma.notification.findMany({
      where: {
        recipientType: "BUYER",
        OR: [
          { userId },
          { organizationId, userId: null },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  async countUnreadForBuyerUser(userId: string, organizationId?: string) {
    return prisma.notification.count({
      where: {
        recipientType: "BUYER",
        read: false,
        OR: [
          { userId },
          { organizationId, userId: null },
        ],
      },
    });
  }

  async findForVendor(vendorId: string, userId?: string) {
    return prisma.notification.findMany({
      where: {
        recipientType: "VENDOR",
        OR: [
          { vendorId },
          { userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  async countUnreadForVendor(vendorId: string, userId?: string) {
    return prisma.notification.count({
      where: {
        recipientType: "VENDOR",
        read: false,
        OR: [
          { vendorId },
          { userId },
        ],
      },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsReadForBuyer(userId: string, organizationId?: string) {
    return prisma.notification.updateMany({
      where: {
        recipientType: "BUYER",
        read: false,
        OR: [
          { userId },
          { organizationId, userId: null },
        ],
      },
      data: { read: true },
    });
  }

  async markAllAsReadForVendor(vendorId: string, userId?: string) {
    return prisma.notification.updateMany({
      where: {
        recipientType: "VENDOR",
        read: false,
        OR: [
          { vendorId },
          { userId },
        ],
      },
      data: { read: true },
    });
  }
}
