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
  const router = useRouter()
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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
    
    const Recognition = getBrowserSpeechRecognition();
    if (!Recognition) {
      setErr("Voice typing not supported. Use Chrome or Edge.");
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      console.error('getUserMedia error:', e);
      if (e.name === 'NotAllowedError') setErr("Mic permission denied. Click the lock icon and Allow.");
      else if (e.name === 'NotFoundError') setErr("No microphone found. Plug one in.");
      else if (e.name === 'NotReadableError') setErr("Mic is busy. Close Zoom/Teams and try again.");
      else setErr(`Mic error: ${e.name}`);
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
        console.error('SpeechRecognition error:', event.error);
        if (event.error === "not-allowed") setErr("Mic blocked by browser settings.");
        else if (event.error === "aborted") return; // Ignore when we stop it ourselves
        else if (event.error!== "no-speech") setErr(`Voice error: ${event.error}`);
        stopMic();
      };

      recognition.onend = () => stopMic();
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (e: any) {
      console.error(e);
      setErr(`Could not start mic: ${e.message}`);
      stopMic();
    }
  }, [stopMic]);

  const toggleMic = () => isListening? stopMic() : startMic();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    stopMic();
    setIsPosting(true);
    const { error } = await supabase.from('posts').insert({
      body: body.trim(), 
      user_id: userId, 
      post_type: 'post', // <-- THIS IS THE FIX
      is_anonymous: false, 
      city: 'San Jose', 
      zip_code: '95122'
    });
    setIsPosting(false);
    if (error) { alert('Error: ' + error.message); return; }
    setBody(''); setErr(null); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="border rounded-lg p-4 bg-white shadow">
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
            disabled={isPosting}
            className={`absolute right-2 top-2 p-2 rounded-full ${
              isListening? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            title={err || (isListening? "Stop voice input" : "Start voice input")}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            {isListening &&!err && 'Listening... Say "period", "question", "comma" for punctuation'}
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
