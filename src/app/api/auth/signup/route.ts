import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // check existing
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) {
      return NextResponse.json({ error: "User exists" }, { status: 400 });
    }

    const password_hash = await hashPassword(password);
    const [created] = await db.insert(users).values({ email, name, password_hash }).returning();

    const token = signToken({ userId: created.id });
    const res = NextResponse.json({ ok: true, user: { id: created.id, email, name } });
    res.cookies.set("token", token, { httpOnly: true, path: "/", sameSite: "lax" });
    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

