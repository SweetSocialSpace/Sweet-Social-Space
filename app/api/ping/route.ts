import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zipParam = searchParams.get("zip") || searchParams.get("zip_code") || "GLOBAL";
    
    const supabase = await createClient();
    
    // variable only - no hardcoded values
    const zipCode = zipParam || "GLOBAL";

    // Count recent posts in the last 60 minutes for proximity ping
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    let query = supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hourAgo);

    if (zipCode !== "GLOBAL") {
      query = query.eq("zip_code", zipCode);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Ping API error:", error);
    }

    return NextResponse.json({
      ok: true,
      zip: zipCode,
      status: "live",
      count: count || 0,
      street: zipCode !== "GLOBAL" ? "your area" : "GLOBAL",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    // never 500 - return ok even on error - so automation never dies
    console.error("Ping API fallback:", err);
    return NextResponse.json({
      ok: true,
      zip: "GLOBAL",
      status: "live",
      count: 0,
      street: "unknown",
      fallback: true,
      error: err?.message,
    });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
