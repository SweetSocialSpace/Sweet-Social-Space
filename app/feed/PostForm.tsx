'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getBrowserSpeechRecognition(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition?? w.webkitSpeechRecognition?? null;
}

export default function PostForm({ userId }: { userId: string }) {
  const [body, setBody] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking')
  const router = useRouter()
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Ask for mic permission on page load, like Facebook/Instagram do
  useEffect(() => {
    async function checkMicPermission() {
      try {
        // This line actually triggers Chrome's permission popup the first time
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop()); // We don't need it yet, just checking
        setMicPermission('granted');
      } catch (e) {
        console.error('Mic permission error:', e);
        setMicPermission('denied');
      }
    }
    
    // Only run in browser
    if (typeof window!== 'undefined' && navigator.mediaDevices) {
      checkMicPermission();
    } else {
      setMicPermission('denied');
    }
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  const stopMic = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsListening(false);
  }, []);

  const startMic = useCallback(async () => {
    setErr(null);
    
    if (micPermission!== 'granted') {
      setErr('Microphone access denied. Click "Enable Microphone" above.');
      return;
    }
    
    const Recognition = getBrowserSpeechRecognition();
    if (!Recognition) {
      setErr("Voice typing not supported. Use Chrome or Edge.");
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setErr("Microphone blocked. Click the lock icon and allow Microphone.");
      setMicPermission('denied');
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";

      recognition.onresult = (event) => {
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += transcript + " ";
        }
        if (finalText.trim()) {
          setBody(prev => {
            let newText = prev + finalText;
            newText = newText.replace(/\s+question\s*$/i, '? ');
            newText = newText.replace(/\s+exclamation\s*$/i, '! ');
            newText = newText.replace(/\s+comma\s*$/i, ', ');
            newText = newText.replace(/\s+period\s*$/i, '. ');
            newText = newText.replace(/([.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
            return newText.trimStart();
          });
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErr("Microphone blocked. Click the lock icon and allow Microphone.");
          setMicPermission('denied');
        } else if (event.error!== "no-speech") {
          setErr("Voice input error");
        }
        stopMic();
      };

      recognition.onend = () => {
        stopMic();
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (e) {
      console.error(e);
      setErr("Could not start microphone");
      stopMic();
    }
  }, [stopMic, micPermission]);

  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermission('granted');
      setErr(null);
    } catch (e) {
      setErr('Permission denied. Click the lock icon in your address bar and allow Microphone, then refresh.');
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopMic();
    } else {
      startMic();
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    
    stopMic(); // Kill mic BEFORE posting
    
    setIsPosting(true);
    const { error } = await supabase.from('posts').insert({
      body: body.trim(), user_id: userId, post_type: 'text',
      is_anonymous: false, city: 'San Jose', zip_code: '95122'
    });
    setIsPosting(false);
    if (error) { alert('Error: ' + error.message); return; }
    setBody(''); setErr(null); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="border rounded-lg p-4 bg-white shadow">
        
        {/* This banner shows up if mic is blocked, like Facebook does */}
        {micPermission === 'denied' && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
            <strong>Microphone access needed</strong>
            <p className="mt-1">To use voice typing, allow microphone access.</p>
            <button
              type="button"
              onClick={requestMicAccess}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Enable Microphone
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's happening in San Jose?"
            className="w-full p-2 pr-12 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isPosting}
          />
          <button
            type="button"
            onClick={toggleMic}
            disabled={isPosting || micPermission!== 'granted'}
            className={`absolute right-2 top-2 p-2 rounded-full ${
              isListening? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            title={err || (isListening? "Stop voice input" : "Start voice input")}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            {micPermission === 'checking' && 'Checking microphone...'}
            {micPermission === 'granted' && isListening &&!err && 'Listening... Say "period", "question", "comma"'}
            {micPermission === 'granted' &&!isListening &&!err && 'Click mic to start voice typing'}
            {err && <span className="text-red-500">{err}</span>}
          </div>
          <button
            type="submit"
            disabled={!body.trim() || isPosting}
            className="bg-blue-500 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPosting? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}
