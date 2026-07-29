"use client";
import { useState, useRef, useEffect } from "react";

type Props = { userId?: string; zipCode?: string; };

export default function GoLive({ userId, zipCode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("Tap Enable Camera");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const openLive = () => {
    setStatus("Modal opened");
    setHasStream(false);
    setIsOpen(true);
  };

  const enableCamera = async () => {
    setStatus("Requesting camera...");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("getUserMedia not supported");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setHasStream(true);
      setStatus("Camera granted - preview live");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); setStatus("Preview live - tap REC"); } catch {}
      }
    } catch (err: any) {
      setStatus(`Failed: ${err.name} - ${err.message}`);
    }
  };

  const closeLive = () => {
    try { mediaRecorderRef.current?.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t=>t.stop());
    streamRef.current = null;
    setIsOpen(false);
    setHasStream(false);
    setIsRecording(false);
    setIsUploading(false);
    setStatus("Tap Enable Camera");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setStatus("Uploading file...");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("zip", zipCode || "GLOBAL");
    fd.append("type", "golive");
    if (userId) fd.append("userId", userId);
    try {
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (!r.ok) throw new Error(await r.text());
      setStatus("Uploaded!");
      closeLive();
      location.reload();
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  const startRec = () => {
    if (!streamRef.current) { setStatus("Enable camera first"); return; }
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = rec;
    rec.ondataavailable = ev => { if (ev.data.size>0) chunksRef.current.push(ev.data); };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
      setIsUploading(true);
      setStatus("Uploading...");
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
      } catch (e: any) { setStatus(`Upload failed: ${e.message}`); setIsUploading(false); }
    };
    rec.start();
    setIsRecording(true);
    setStatus("Recording...");
  };

  const stopRec = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  useEffect(()=>{ return ()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); }; },[]);

  return (
    <>
      <button onClick={openLive} className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Go Live
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
          <div className="flex justify-between items-center p-3 bg-zinc-900 text-white">
            <span className="text-xs">{status}</span>
            <button onClick={closeLive} className="bg-white/10 px-3 py-1 rounded-full text-xs">Close</button>
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover max-w- mx-auto bg-zinc-900" />
            {!hasStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6">
                <button onClick={enableCamera} className="bg-white text-black px-8 py-3 rounded-full font-bold text-base">Enable Camera</button>
                <span className="text-white/50 text-xs text-center">{status}</span>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span className="text-white/30 text-">or if camera blocked</span>
                  <label className="bg-white/10 text-white px-4 py-2 rounded-full text-xs cursor-pointer">
                    Upload Video Instead
                    <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}
            {isUploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-sm">Uploading...</div>}
          </div>
          <div className="p-5 bg-zinc-900 flex flex-col items-center gap-2">
            <div className="flex justify-center">
              {!isRecording? (
                <button onClick={startRec} disabled={!hasStream} className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${hasStream? "bg-red-600 border-white/20" : "bg-zinc-700 border-white/10 opacity-50"}`}>
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </button>
              ) : (
                <button onClick={stopRec} className="w-20 h-20 rounded-full bg-white border-4 border-red-600 flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-600 rounded-sm"></div>
                </button>
              )}
            </div>
            <span className="text- text-white/30">{zipCode || "GLOBAL"} • {hasStream? "camera ready" : "no stream"}</span>
          </div>
        </div>
      )}
    </>
  );
}
