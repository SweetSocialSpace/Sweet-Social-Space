"use client";
import { useState, useRef, useEffect } from "react";

type Props = { userId?: string; zipCode?: string; };

export default function GoLive({ userId, zipCode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const openLive = () => {
    setErrorMsg(null);
    setIsOpen(true);
  };

  const enableCamera = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices ||!navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (err: any) {
      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorMsg("Camera blocked. Please allow camera + mic permission in your browser settings, then reload and tap Enable Camera again.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setErrorMsg("No camera found on this device. Try another device.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setErrorMsg("Camera is busy. Close other apps using camera and try again.");
      } else {
        setErrorMsg(err?.message || "Unable to access camera. Check permissions and try again.");
      }
    }
  };

  const closeLive = () => {
    if (mediaRecorderRef.current && isRecording) {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsOpen(false);
    setIsRecording(false);
    setIsUploading(false);
    setErrorMsg(null);
  };

  const startRecording = () => {
    if (!streamRef.current) {
      setErrorMsg("Enable camera first");
      return;
    }
    chunksRef.current = [];
    const mime = typeof MediaRecorder!== "undefined" && MediaRecorder.isTypeSupported("video/webm")? "video/webm" : "";
    const rec = mime? new MediaRecorder(streamRef.current, { mimeType: mime }) : new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = rec;
    rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
      await uploadVideo(blob);
    };
    rec.start(100);
    setIsRecording(true);
    setErrorMsg(null);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      const ext = blob.type.includes("mp4")? "mp4" : "webm";
      fd.append("file", blob, `golive-${Date.now()}.${ext}`);
      fd.append("zip", zipCode || "GLOBAL");
      fd.append("type", "golive");
      fd.append("visibility", "global");
      if (userId) fd.append("userId", userId);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      closeLive();
      window.location.reload();
    } catch (e: any) {
      setErrorMsg(e.message || "Upload failed. Try again.");
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => enableCamera(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <>
      <button onClick={openLive} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-sm">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Go Live
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
          <div className="flex justify-between items-center p-3 bg-zinc-900 text-white">
            <span className="text-sm font-semibold">{isRecording? "REC" : "Live"}</span>
            <button onClick={closeLive} className="bg-white/10 px-3 py-1 rounded-full text-sm">Close</button>
          </div>

          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover max-w- mx-auto bg-black" />

            {!streamRef.current &&!isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-black/60">
                <button onClick={enableCamera} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm">
                  Enable Camera
                </button>
                <p className="text-white/60 text-xs text-center">Allow camera + mic when prompted</p>
              </div>
            )}

            {errorMsg && (
              <div className="absolute bottom-24 left-4 right-4 bg-white rounded-xl p-3 text-black text-xs text-center">
                {errorMsg}
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Uploading...</span>
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
                <div className="w-6 h-6 bg-red-600 rounded-sm"></div>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
