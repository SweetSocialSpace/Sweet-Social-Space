"use client";
import { useState, useRef, useEffect } from "react";

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
  };

  const enableCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (err: any) {
      console.error("camera error", err);
      if (err?.name === "NotAllowedError") {
        setErrorMsg("Permission denied by system - Allow camera in browser + System Settings > Privacy > Camera");
      } else {
        setErrorMsg(err?.message || "Camera failed");
      }
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
    setErrorMsg(null);
  };

  const getMimeType = () => {
    if (typeof MediaRecorder === "undefined") return "";
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) return "video/webm;codecs=vp9";
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) return "video/webm;codecs=vp8";
    if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
    if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
    return "";
  };

  const startRecording = () => {
    if (!streamRef.current) {
      setErrorMsg("Tap Enable Camera first");
      return;
    }
    chunksRef.current = [];
    try {
      const mimeType = getMimeType();
      const recorder = mimeType? new MediaRecorder(streamRef.current, { mimeType }) : new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
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
    try {
      const formData = new FormData();
      const ext = blob.type.includes("mp4")? "mp4" : "webm";
      formData.append("file", blob, `golive-${Date.now()}.${ext}`);
      formData.append("zip", zipCode || "GLOBAL");
      formData.append("type", "golive");
      formData.append("visibility", "global");
      if (userId) formData.append("userId", userId);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());

      closeLive();
      window.location.reload();
    } catch (e: any) {
      setErrorMsg(e.message || "Upload failed");
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // auto try camera when modal opens
      const t = setTimeout(() => enableCamera(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
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
              <span className="text-sm font-semibold">{isRecording? "REC" : "Live Preview"}</span>
            </div>
            <button onClick={closeLive} className="bg-white/10 px-3 py-1 rounded-full text-sm">Close</button>
          </div>

          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover max-w- mx-auto"
            />
            {!streamRef.current && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                <button onClick={enableCamera} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm">
                  Enable Camera
                </button>
                <p className="text-white/50 text-xs text-center">Tap to allow camera + mic</p>
              </div>
            )}
            {errorMsg && (
              <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl p-3 text-black text-xs text-center">
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
