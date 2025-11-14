import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromReq(req: Request) {
  // Access cookie manually
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.split(";").map(c => c.trim()).find(c => c.startsWith("token="));
  const token = match?.split("=")[1];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || typeof payload === "string") return null;
  const userId = (payload as { userId?: string }).userId;
  if (!userId) return null;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user || null;
}

