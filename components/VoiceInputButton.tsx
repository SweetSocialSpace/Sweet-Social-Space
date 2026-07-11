'use client'

import { useCallback, useEffect, useRef, useState } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";

// TODO: Replace this with Next.js server action later
// For now we stub it - we'll wire ElevenLabs token after feed works
async function getScribeToken() {
  // We'll create app/api/scribe/route.ts later
  // For now return empty so browser fallback kicks in
  return { token: null, error: "ElevenLabs not wired yet" };
}

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: { transcript: string } | boolean;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult;
  };
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getBrowserSpeechRecognition(): BrowserSpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition?? speechWindow.webkitSpeechRecognition?? null;
}

type Props = {
  onTranscript: (text: string) => void;
  onPartialTranscript?: (text: string) => void;
  size?: "sm" | "md";
  className?: string;
};

export function VoiceInputButton({
  onTranscript,
  onPartialTranscript,
  size = "md",
  className = "",
}: Props) {
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onPartialTranscriptRef = useRef(onPartialTranscript);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [browserListening, setBrowserListening] = useState(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  useEffect(() => {
    onPartialTranscriptRef.current = onPartialTranscript;
  }, [onPartialTranscript]);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    vadSilenceThresholdSecs: 0.6,
    minSpeechDurationMs: 100,
    minSilenceDurationMs: 300,
    onPartialTranscript: (data: { text: string }) => {
      const text = data.text?.trim();
      if (text) onPartialTranscriptRef.current?.(text);
    },
    onCommittedTranscript: (data: { text: string }) => {
      const text = data.text?.trim();
      if (text) onTranscriptRef.current(text);
    },
    onError: (e: unknown) => {
      console.error("Scribe error", e);
      setErr("Voice input error");
    },
  });

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const isOn = browserListening || scribe.isConnected || scribe.status === "connecting";

  const toggle = useCallback(async () => {
    setErr(null);
    if (isOn) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setBrowserListening(false);
      }
      try {
        if (scribe.isConnected) scribe.commit();
      } catch (e) {
        console.error(e);
      }
      try {
        scribe.disconnect();
      } catch (e) {
        console.error(e);
      }
      return;
    }

    const startBrowserFallback = () => {
      const Recognition = getBrowserSpeechRecognition();
      if (!Recognition) return false;
      try {
        const recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || "en-US";
        recognition.onresult = (event) => {
          let interimText = "";
          let finalText = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            const firstMatch = result[0];
            const transcript =
              typeof firstMatch === "object" && firstMatch!== null? firstMatch.transcript : "";
            if (typeof transcript!== "string") continue;
            if (result.isFinal) finalText += transcript;
            else interimText += transcript;
          }
          if (interimText.trim()) onPartialTranscriptRef.current?.(interimText.trim());
          if (finalText.trim()) onTranscriptRef.current(finalText.trim());
        };
        recognition.onerror = (event) => {
          if (event.error && event.error!== "no-speech") setErr("Microphone permission needed");
          setBrowserListening(false);
        };
        recognition.onend = () => {
          recognitionRef.current = null;
          setBrowserListening(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
        setBrowserListening(true);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    };

    setStarting(true);
    let permissionStream: MediaStream | null = null;
    try {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (!navigator.mediaDevices?.getUserMedia) {
        if (startBrowserFallback()) return;
        setErr("Microphone not supported");
        return;
      }
      permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());
      permissionStream = null;

      // Try ElevenLabs first, fall back to browser if no token
      const res = await getScribeToken();
      if (!res?.token) {
        if (startBrowserFallback()) return;
        setErr(res?.error || "Using browser speech recognition");
        return;
      }
      await scribe.connect({
        token: res.token,
        microphone: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      console.error(e);
      if (!startBrowserFallback()) setErr("Microphone permission needed");
    } finally {
      permissionStream?.getTracks().forEach((track) => track.stop());
      setStarting(false);
    }
  }, [isOn, scribe]);

  const dim = size === "sm"? "h-8 w-8 text-sm" : "h-9 w-9 text-base";
  const base = `inline-flex shrink-0 items-center justify-center rounded-full border transition ${dim}`;
  const cls = isOn
   ? `${base} border-red-500 bg-red-500 text-white animate-pulse`
    : `${base} border-border bg-background text-foreground hover:bg-muted`;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={starting}
      className={`${cls} ${className}`}
      aria-pressed={isOn}
      aria-label={isOn? "Stop voice input" : "Start voice input"}
      title={err || (isOn? "Stop voice input" : "Speak to type (auto language)")}
    >
      {starting? "…" : isOn? "■" : "🎙"}
    </button>
  );
}
