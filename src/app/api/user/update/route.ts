import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth/getUserFromReq";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName } = await req.json();
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    // Combine first and last name
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Update user name
    await db
      .update(users)
      .set({ name: fullName })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true, name: fullName });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

