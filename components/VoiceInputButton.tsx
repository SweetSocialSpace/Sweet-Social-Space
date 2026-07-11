'use client'

import { useCallback, useEffect, useRef, useState } from "react";

// ElevenLabs removed for Phase 1 build - will re-add in Phase 2 with correct API
// For now: Browser SpeechRecognition only. Works in Chrome/Android/Samsung.

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
  const [listening, setListening] = useState(false);
  const onTranscriptRef = useRef(onTranscript);
  const onPartialTranscriptRef = useRef(onPartialTranscript);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  useEffect(() => {
    onPartialTranscriptRef.current = onPartialTranscript;
  }, [onPartialTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggle = useCallback(async () => {
    setErr(null);

    if (listening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    const Recognition = getBrowserSpeechRecognition();
    if (!Recognition) {
      setErr("Speech recognition not supported in this browser");
      return;
    }

    setStarting(true);

    try {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

      if (!navigator.mediaDevices?.getUserMedia) {
        setErr("Microphone not supported");
        setStarting(false);
        return;
      }

      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());

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
        setListening(false);
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (e) {
      console.error(e);
      setErr("Microphone permission needed");
    } finally {
      setStarting(false);
    }
  }, [listening]);

  const dim = size === "sm"? "h-8 w-8 text-sm" : "h-9 w-9 text-base";
  const base = `inline-flex shrink-0 items-center justify-center rounded-full border transition ${dim}`;
  const cls = listening
   ? `${base} border-red-500 bg-red-500 text-white animate-pulse`
    : `${base} border-border bg-background text-foreground hover:bg-muted`;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={starting}
      className={`${cls} ${className}`}
      aria-pressed={listening}
      aria-label={listening? "Stop voice input" : "Start voice input"}
      title={err || (listening? "Stop voice input" : "Speak to type")}
    >
      {starting? "…" : listening? "■" : "🎙"}
    </button>
  );
}
