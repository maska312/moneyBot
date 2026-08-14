import { NextRequest, NextResponse } from "next/server";
import { db, categories } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/db/seed";

export async function GET() {
  try {
    const list = await db.select().from(categories);
    if (list.length === 0) {
      return NextResponse.json({ categories: DEFAULT_CATEGORIES });
    }
    return NextResponse.json({ categories: list });
  } catch (e: any) {
    console.warn("Categories fetch error:", e);
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, icon, color } = await req.json();
    if (!name || !icon || !color) {
      return NextResponse.json({ error: "name, icon, and color are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(categories)
      .values({
        name,
        icon,
        color,
        isSystem: false,
      })
      .returning();

    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
