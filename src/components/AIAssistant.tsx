import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, X, Send, Mic, Trash2, ArrowRight, Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/context/I18nContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  module?: string | null;
}

const QUICK_QUESTIONS = [
  'Village Status',
  'Water Status',
  'Agriculture Condition',
  "Today's Alerts",
  'Weather',
  'AI Predictions',
];

const QUICK_MAP: Record<string, string> = {
  'Village Status': 'What is the current village status?',
  'Water Status': 'What is the current water status?',
  'Agriculture Condition': 'What is the agriculture condition?',
  "Today's Alerts": 'Are there any emergency alerts today?',
  'Weather': 'What is the current weather?',
  'AI Predictions': 'What are the AI predictions?',
};

export function AIAssistant({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { t, village } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('ai.greeting'),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/village-assistant`;
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          village: village || undefined,
        }),
      });

      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply || t('ai.unavailable'),
        module: data.module || null,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: t('ai.unavailable'),
        module: null,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([{ role: 'assistant', content: t('ai.clearChat') }]);
  }

  function toggleVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Voice input is not supported in your browser. Please type your question instead.',
      }]);
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="flex h-[600px] max-h-[90vh] w-full max-w-md flex-col cmd-bg cmd-grid-pattern overflow-hidden rounded-2xl border border-white/[0.1] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white cmd-pulse-glow">
              <Bot size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{t('ai.title')}</p>
              <p className="text-[11px] text-green-400">{t('ai.online')} • EN / தமிழ் / Tanglish</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearChat} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" title="Clear chat">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="cmd-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                  <Bot size={14} />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'rounded-2xl rounded-br-md bg-blue-600 text-white' : 'rounded-2xl rounded-bl-md cmd-glass text-slate-200'} px-3.5 py-2.5 text-sm`}>
                <p className="leading-relaxed">{msg.content}</p>
                {msg.module && (
                  <button
                    onClick={() => { navigate(msg.module!); onClose(); }}
                    className="mt-2 flex items-center gap-1.5 rounded-lg bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/25 transition-colors"
                  >
                    {t('ai.openModule')} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                <Bot size={14} />
              </div>
              <div className="flex gap-1 rounded-2xl rounded-bl-md cmd-glass px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-green-400" style={{ animationDelay: '0s' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-green-400" style={{ animationDelay: '0.15s' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-green-400" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div className="border-t border-white/[0.06] px-4 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Sparkles size={12} className="text-green-400" /> Quick Questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(QUICK_MAP[q])}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-400"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <button
              onClick={toggleVoice}
              className={`flex-shrink-0 rounded-lg p-1.5 transition-colors ${listening ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-green-400'}`}
              title="Voice input"
            >
              <Mic size={18} className={listening ? 'animate-pulse' : ''} />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about water, crops, alerts..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 rounded-lg bg-green-500/20 p-1.5 text-green-400 transition-colors hover:bg-green-500/30 disabled:opacity-30"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
