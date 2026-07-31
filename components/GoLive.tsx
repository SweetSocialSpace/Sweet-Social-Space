"use client"
import { useState, useRef, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';

type Props = {
  userId?: string;
  zipCode?: string;
  city?: string;
};

export default function GoLive({ userId, zipCode, city }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const openLive = async () => {
    setErrorMsg(null);
    setIsOpen(true);
    await new Promise(r => setTimeout(r, 150));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 360 }, height: { ideal: 480 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Camera permission denied");
      setIsOpen(false);
    }
  };

  const closeLive = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && isRecording) {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
    setIsRecording(false);
    setIsUploading(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    try {
      const options: MediaRecorderOptions = {
        mimeType: "video/webm;codecs=vp8",
        videoBitsPerSecond: 400000,
        audioBitsPerSecond: 48000
      };
      // @ts-ignore
      if (!MediaRecorder.isTypeSupported(options.mimeType)) delete options.mimeType;
      const recorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        if (blob.size > 12 * 1024 * 1024) {
          setErrorMsg(`Too large ${(blob.size/1024/1024).toFixed(1)}MB. Keep under 30s.`);
          return;
        }
        await uploadVideo(blob);
      };
      recorder.start(200);
      setIsRecording(true);
      timerRef.current = setTimeout(() => { if (mediaRecorderRef.current?.state === "recording") stopRecording(); }, 30000);
    } catch { setErrorMsg("Recording not supported"); }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    try { mediaRecorderRef.current?.stop(); } catch {}
    setIsRecording(false);
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    setErrorMsg(null);
    const supabase = createClient();
    try {
      if (!userId) throw new Error("Not logged in");
      const fileName = `${userId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("golive").upload(fileName, blob, { contentType: "video/webm", upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("golive").getPublicUrl(fileName);
      const { error: insErr } = await supabase.from("posts").insert({
        user_id: userId,
        zip_code: zipCode || "GLOBAL",
        video_url: publicUrl,
        body: "",
      });
      if (insErr) throw insErr;
      closeLive();
      window.location.href = "/feed";
    } catch (e: any) {
      setErrorMsg(e.message || "Upload failed");
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <>
      <button onClick={openLive} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-sm">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Go Live
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
          <div className="flex justify-between items-center p-3 bg-zinc-900 text-white">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording? "bg-red-500 animate-pulse" : "bg-white/50"}`}></span>
              <span className="text-sm font-semibold">{isRecording? "REC • 30s max" : "Preview"}</span>
            </div>
            <button onClick={closeLive} className="bg-white/10 px-3 py-1 rounded-full text-sm">✕ Close</button>
          </div>
          <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-hidden">
            <div className="relative w-full max-w- aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {errorMsg && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-center">
                  <div className="bg-white rounded-xl p-4 text-black text-sm">{errorMsg}<br/><button onClick={closeLive} className="mt-3 bg-black text-white px-4 py-1 rounded-full">Close</button></div>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-3">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm">Publishing...</span>
                </div>
              )}
            </div>
          <div className="p-6 bg-zinc-900 flex justify-center gap-6">
            {!isRecording? (
              <button onClick={startRecording} className="w-16 h-16 rounded-full bg-red-600 border-4 border-white/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </button>
            ) : (
              <button onClick={stopRecording} className="w-16 h-16 rounded-full bg-white border-4 border-red-600 flex items-center justify-center">
                <div className="w-5 h-5 bg-red-600 rounded-sm"></div>
              </button>
            )}
          </div>
          <div className="text-xs text-white/40 text-center pb-4 bg-zinc-900">
            Instant upload • Global feed • {city || 'your area'}
          </div>
        </div>
      )}
    </>
  );
}
