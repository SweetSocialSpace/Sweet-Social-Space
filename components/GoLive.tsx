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
        video: { facingMode: "user", width: { ideal: 240 }, height: { ideal: 320 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (e: any) {
      setErrorMsg("Camera denied");
      setIsOpen(false);
    }
  };

  const closeLive = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsOpen(false);
    setIsRecording(false);
    setIsUploading(false);
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    const supabase = createClient();
    try {
      if (!userId) throw new Error("No user");
      const fileName = `${userId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("golive").upload(fileName, blob, { contentType: "video/webm", upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("golive").getPublicUrl(fileName);
      await supabase.from("posts").insert({ user_id: userId, zip_code: zipCode || "GLOBAL", video_url: data.publicUrl, body: "" });
      closeLive();
      window.location.href = "/feed";
    } catch (e: any) {
      setErrorMsg("Upload failed");
      setIsUploading(false);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm", videoBitsPerSecond: 300000 } as any);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      await uploadVideo(blob);
    };
    recorder.start(200);
    setIsRecording(true);
    timerRef.current = setTimeout(() => { try { recorder.stop(); } catch {} }, 30000);
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
      <button onClick={openLive} className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Go Live
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center">
          <div className="bg-zinc-900 rounded-xl overflow-hidden w- shadow-2xl">
            <div className="flex justify-between items-center px-2 py-1 bg-black text-white text-">
              <span>{isRecording? "REC" : "Preview"}</span>
              <button onClick={closeLive} className="bg-white/20 px-2 py-0.5 rounded-full">X</button>
            </div>
            <div className="relative w- h- bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {errorMsg && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white text- p-2 text-center">{errorMsg}</div>}
              {isUploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-">Publishing</div>}
            </div>
            <div className="p-2 flex flex-col items-center gap-1 bg-zinc-900">
              {!isRecording? (
                <button onClick={startRecording} className="w-10 h-10 rounded-full bg-red-600 border-2 border-white/20 flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full"></div></button>
              ) : (
                <button onClick={stopRecording} className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><div className="w-3 h-3 bg-red-600 rounded-sm"></div></button>
              )}
              <div className="text- text-white/30">{city || 'your area'}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
