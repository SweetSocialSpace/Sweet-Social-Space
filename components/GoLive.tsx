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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const openLive = async () => {
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("camera error", err);
      setIsOpen(false);
    }
  };

  const closeLive = () => {
    stopStream();
    setIsOpen(false);
    setIsRecording(false);
    setIsUploading(false);
    setPreviewUrl(null);
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9",
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      await uploadVideo(blob);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = `golive-${Date.now()}.webm`;
      formData.append("file", blob, filename);
      if (userId) formData.append("userId", userId);
      if (zipCode) formData.append("zip", zipCode);
      // global fallback - works for anybody
      formData.append("zip", zipCode || "GLOBAL");
      formData.append("type", "golive");
      formData.append("visibility", "global");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("upload failed");

      const data = await res.json();

      // instantly add to feed - trigger refresh
      await fetch("/api/feed/refresh", { method: "POST" }).catch(()=>{});
      await fetch("/api/pulse", {
        method: "POST",
        body: JSON.stringify({ event: "golive", zip: zipCode || "GLOBAL", video: data.url })
      }).catch(()=>{});

      console.log("live uploaded", data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  return (
    <>
      <button
        onClick={openLive}
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg transition"
      >
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        Go Live
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w- bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* header */}
            <div className="flex justify-between items-center p-3 bg-zinc-800 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold">
                  {isRecording? "Recording" : "Live Preview"}
                </span>
              </div>
              <button onClick={closeLive} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* video */}
            <div className="relative aspect-[9/16] bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {previewUrl &&!isRecording && (
                <video src={previewUrl} controls autoPlay className="absolute inset-0 w-full h-full object-cover" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  Uploading instantly...
                </div>
              )}
            </div>

            {/* controls */}
            <div className="p-4 flex justify-center gap-4 bg-zinc-900">
              {!isRecording? (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-red-600 border-4 border-white/20 flex items-center justify-center hover:scale-105 transition"
                >
                  <span className="w-6 h-6 bg-white rounded-full"></span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-white border-4 border-red-600 flex items-center justify-center"
                >
                  <span className="w-6 h-6 bg-red-600 rounded-sm"></span>
                </button>
              )}
            </div>

            <p className="text- text-zinc-400 text-center pb-3">
              Instant upload • Visible in global feed • zip: {zipCode || "GLOBAL"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
