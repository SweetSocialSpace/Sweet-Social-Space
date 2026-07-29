"use client";
import { useState, useRef, useEffect } from "react";

type Props = { userId?: string; zipCode?: string; };

export default function GoLive({ userId, zipCode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const openLive = () => {
    setErrorMsg(null);
    setHasStream(false);
    setIsOpen(true);
  };

  const enableCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setHasStream(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (err: any) {
      const n = err?.name || "";
      if (n === "NotAllowedError") {
        setErrorMsg("Permission blocked. Tap the lock icon in address bar > Allow camera + mic > Reload page > Tap Enable Camera again.");
      } else if (n === "NotFoundError") {
        setErrorMsg("No camera found. Use a device with camera.");
      } else if (n === "NotReadableError") {
        setErrorMsg("Camera in use by another app. Close other tabs/apps and try again.");
      } else {
        setErrorMsg("Camera error. Allow permission and try again.");
      }
    }
  };

  const closeLive = () => {
    try { mediaRecorderRef.current?.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsOpen(false);
    setHasStream(false);
    setIsRecording(false);
    setIsUploading(false);
    setErrorMsg(null);
  };

  const startRec = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = rec;
    rec.ondataavailable = e => { if (e.data.size>0) chunksRef.current.push(e.data); };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
      setIsUploading(true);
      const fd = new FormData();
      fd.append("file", blob, `live-${Date.now()}.webm`);
      fd.append("zip", zipCode || "GLOBAL");
      fd.append("type", "golive");
      if (userId) fd.append("userId", userId);
      try {
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        if (!r.ok) throw new Error(await r.text());
        closeLive();
        location.reload();
      } catch (e:any) { setErrorMsg(e.message); setIsUploading(false); }
    };
    rec.start();
    setIsRecording(true);
  };

  const stopRec = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  useEffect(() => { return () => streamRef.current?.getTracks().forEach(t=>t.stop()); }, []);

  return (
    <>
      <button onClick={openLive} className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Go Live
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
          <div className="flex justify-between items-center p-3 bg-zinc-900 text-white">
            <span className="text-sm">{isRecording? "● REC" : "Live Preview"}</span>
            <button onClick={closeLive} className="bg-white/10 px-3 py-1 rounded-full text-sm">Close</button>
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover max-w- mx-auto" />
            {!hasStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-6">
                <button onClick={enableCamera} className="bg-white text-black px-6 py-3 rounded-full font-bold">Enable Camera</button>
                <span className="text-white/60 text-xs">Tap to allow camera + mic</span>
              </div>
            )}
            {errorMsg && <div className="absolute bottom-24 left-4 right-4 bg-white text-black p-3 rounded-xl text-xs text-center">{errorMsg}</div>}
            {isUploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">Uploading...</div>}
          </div>
          <div className="p-6 bg-zinc-900 flex justify-center">
            {!isRecording? (
              <button onClick={startRec} disabled={!hasStream} className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${hasStream? "bg-red-600 border-white/20" : "bg-zinc-700 border-white/10"}`}>
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </button>
            ) : (
              <button onClick={stopRec} className="w-20 h-20 rounded-full bg-white border-4 border-red-600 flex items-center justify-center">
                <div className="w-6 h-6 bg-red-600 rounded-sm"></div>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
