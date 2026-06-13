/**
 * Wishlist AI — Notifications API
 *
 * GET  /api/notifications  → Fetch all notifications for authenticated user
 * PATCH /api/notifications → Mark specific notification(s) as read
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function isDbConfigured(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("user:password")
  );
}

// Mock notifications fallback
const mockNotifications = [
  {
    id: "mock-1",
    title: "Welcome to Wishlist AI!",
    message: "Create your first financial goal to kickstart your dynamic investment roadmap.",
    type: "SUCCESS",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    title: "Market Advisory Alert",
    message: "Nifty 50 has shown strong support. It is a good time to review your SIP allocations.",
    type: "INFO",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, data: mockNotifications });
    }

    // Retrieve notifications from database
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // If database is empty, seed a welcome notification
    if (notifications.length === 0) {
      const welcome = await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: "Welcome to Wishlist AI!",
          message: "Set up your financial profile to receive custom dynamic advisory insights.",
          type: "SUCCESS",
        },
      });
      return NextResponse.json({ success: true, data: [welcome] });
    }

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

const PatchSchema = z.object({
  id: z.string().optional(),
  readAll: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const { id, readAll } = parsed.data;

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, message: "Mock notification updated" });
    }

    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      const updated = await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { read: true },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: "Missing notification id or readAll flag" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
