"use client"
import { useState, useRef, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';

type Props = { userId?: string; zipCode?: string; city?: string; };

export default function GoLive({ userId, zipCode, city }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  const openLive = async () => {
    setErrorMsg(null);
    setIsOpen(true);
    await new Promise(r => setTimeout(r, 100));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 400 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Camera denied");
      setIsOpen(false);
    }
  };

  const closeLive = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
    setIsRecording(false);
    setIsUploading(false);
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    const supabase = createClient();
    try {
      if (!userId) throw new Error("Not logged in");
      const fileName = `${userId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("golive").upload(fileName, blob, { contentType: "video/webm", upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("golive").getPublicUrl(fileName);
      const { error: insErr } = await supabase.from("posts").insert({
        user_id: userId,
        zip_code: zipCode || "GLOBAL",
        video_url: data.publicUrl,
        body: ""
      });
      if (insErr) throw insErr;
      closeLive();
      window.location.href = "/feed";
    } catch (e: any) {
      setErrorMsg(e.message || "Upload failed");
      setIsUploading(false);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm", videoBitsPerSecond: 350000 } as any);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        await uploadVideo(blob);
      };
      recorder.start(200);
      setIsRecording(true);
      timerRef.current = setTimeout(() => { try { recorder.stop(); } catch {} }, 30000);
    } catch {
      setErrorMsg("Recording not supported");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try { mediaRecorderRef.current?.stop(); } catch {}
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <>
      <button onClick={openLive} className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Go Live
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl overflow-hidden w-full max-w- shadow-2xl">
            <div className="flex justify-between items-center p-2 bg-black text-white text-xs">
              <span>{isRecording? "REC • 30s" : "Preview"}</span>
              <button onClick={closeLive} className="bg-white/20 px-2 py-0.5 rounded-full">X</button>
            </div>
            <div className="relative aspect-[9/16] bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {errorMsg && <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-2 text-white text-xs text-center">{errorMsg}</div>}
              {isUploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs">Publishing...</div>}
            </div>
            <div className="p-3 bg-zinc-900 flex flex-col items-center gap-2">
              {!isRecording? (
                <button onClick={startRecording} className="w-12 h-12 rounded-full bg-red-600 border-2 border-white/20 flex items-center justify-center"><div className="w-4 h-4 bg-white rounded-full"></div></button>
              ) : (
                <button onClick={stopRecording} className="w-12 h-12 rounded-full bg-white border-2 border-red-600 flex items-center justify-center"><div className="w-3 h-3 bg-red-600 rounded-sm"></div></button>
              )}
              <div className="text- text-white/30 text-center">
                Global • {city || 'your area'}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
