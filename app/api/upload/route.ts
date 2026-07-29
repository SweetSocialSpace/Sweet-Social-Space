import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const zip = (form.get("zip") as string) || "GLOBAL";
    const type = (form.get("type") as string) || "post";
    const visibility = (form.get("visibility") as string) || "global";
    const userIdForm = form.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "no file" }, { status: 400 });
    }

    // get profile for variables - not hardcode
    const { data: profile } = await supabase
     .from("profiles")
     .select("id, zip_code, username, city")
     .or(`user_id.eq.${user.id},id.eq.${user.id}`)
     .single();

    const finalZip = profile?.zip_code || zip || "GLOBAL";
    const bucket = "posts-media";

    // ensure bucket exists - skip if fails
    const fileExt = file.name.split(".").pop() || "webm";
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
     .from(bucket)
     .upload(fileName, buffer, {
        contentType: file.type || "video/webm",
        upsert: false,
      });

    if (uploadError) {
      console.error("upload error", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
     .from(bucket)
     .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // create post entry - instant feed
    const { data: post, error: postError } = await supabase
     .from("posts")
     .insert({
        user_id: user.id,
        body: type === "golive"? `🔴 LIVE • ${profile?.username || "Live"}` : "",
        media_url: publicUrl,
        media_type: file.type.startsWith("video")? "video" : "image",
        zip_code: finalZip,
        category: type === "golive"? "live" : "general",
        type: type,
        visibility: visibility,
      })
     .select()
     .single();

    if (postError) {
      console.error("post insert error", postError);
      // still return url even if post fails
    }

    // pulse refresh - optional
    try {
      await supabase.from("feed_cache").upsert({
        zip_code: finalZip,
        last_golive: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      zip: finalZip,
      post: post || null,
    });
  } catch (err: any) {
    console.error("upload route error", err);
    return NextResponse.json({ error: err.message || "server error" }, { status: 500 });
  }
}
