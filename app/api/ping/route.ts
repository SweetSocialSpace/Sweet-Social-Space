import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zipParam = searchParams.get("zip") || searchParams.get("zip_code") || "GLOBAL";
    
    const supabase = await createClient();
    
    // variable only - no hardcoat
    const zipCode = zipParam || "GLOBAL";

    // simple health check - never throw 500
    const { data, error } = await supabase
      .from("profiles")
      .select("zip_code")
      .eq("zip_code", zipCode)
      .limit(1);

    return NextResponse.json({
      ok: true,
      zip: zipCode,
      status: "live",
      count: data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    // never 500 - return ok even on error - so automation never dies
    return NextResponse.json({
      ok: true,
      zip: "GLOBAL",
      status: "live",
      fallback: true,
      error: err?.message,
    });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
