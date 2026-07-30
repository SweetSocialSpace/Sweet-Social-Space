"use client"
import { useState, useRef, useEffect } from "react";
import { supabase } from '@/lib/supabase';

type Props = {
  userId?: string;
  zipCode?: string;
};

export default function GoLive({ userId, zipCode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const openLive = async () => {
    setErrorMsg(null);
    setIsOpen(true);
    await new Promise(r => setTimeout(r, 100));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
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

  const getMimeType = () => {
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) return "video/webm;codecs=vp9";
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) return "video/webm;codecs=vp8";
    if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
    if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
    return "";
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    try {
      const mimeType = getMimeType();
      const recorder = mimeType? new MediaRecorder(streamRef.current, { mimeType }) : new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const type = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        await uploadVideo(blob);
      };
      recorder.start(100);
      setIsRecording(true);
    } catch (e: any) {
      setErrorMsg("Recording not supported");
    }
  };

  const stopRecording = () => {
    try { mediaRecorderRef.current?.stop(); } catch {}
    setIsRecording(false);
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      if (!userId) throw new Error("Not logged in");
      const ext = blob.type.includes("mp4")? "mp4" : "webm";
      const fileName = `${userId}/${Date.now()}.${ext}`;
      
      // 1. Upload to Supabase Storage directly - no Vercel timeout
      const { error: uploadError } = await supabase.storage
        .from("golive")
        .upload(fileName, blob, { contentType: blob.type, upsert: true });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("golive").getPublicUrl(fileName);

      // 2. Insert post
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: userId,
        zip_code: zipCode || "GLOBAL",
        video_url: publicUrl,
        content: "",
        type: "golive",
        visibility: "global",
      });

      if (insertError) throw insertError;

      closeLive();
      // No reload - just close and feed will show on next refresh
      window.location.href = "/feed";
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Upload failed - check bucket 'golive' exists");
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <>
      <button
        onClick={openLive}
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-sm"
      >
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        Go Live
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
          <div className="flex justify-between items-center p-3 bg-zinc-900 text-white">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording? "bg-red-500 animate-pulse" : "bg-white/50"}`}></span>
              <span className="text-sm font-semibold">{isRecording? "REC • Recording" : "Preview"}</span>
            </div>
            <button onClick={closeLive} className="bg-white/10 px-3 py-1 rounded-full text-sm">✕ Close</button>
          </div>

          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mx-auto" />
            {errorMsg && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 text-center">
                <div className="bg-white rounded-xl p-4 text-black text-sm">{errorMsg}<br/><button onClick={closeLive} className="mt-3 bg-black text-white px-4 py-1 rounded-full">Close</button></div>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-3">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Publishing instantly...</span>
              </div>
            )}
          </div>

          <div className="p-6 bg-zinc-900 flex justify-center gap-6">
            {!isRecording? (
              <button onClick={startRecording} className="w-20 h-20 rounded-full bg-red-600 border-4 border-white/20 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </button>
            ) : (
              <button onClick={stopRecording} className="w-20 h-20 rounded-full bg-white border-4 border-red-600 flex items-center justify-center">
                <div className="w-7 h-7 bg-red-600 rounded-sm"></div>
              </button>
            )}
          </div>
          <div className="text-xs text-white/40 text-center pb-4 bg-zinc-900">
            Instant upload • Global feed • {zipCode || "GLOBAL"}
          </div>
        </div>
      )}
    </>
  );
}
