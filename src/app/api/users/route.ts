import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { DEFAULT_USERS } from "@/lib/db/seed";

export async function GET() {
  try {
    const list = await db.select().from(users);
    if (list.length === 0) {
      return NextResponse.json({ users: DEFAULT_USERS });
    }
    return NextResponse.json({ users: list });
  } catch (e: any) {
    console.warn("Users fetch error:", e);
    return NextResponse.json({ users: DEFAULT_USERS });
  }
}
