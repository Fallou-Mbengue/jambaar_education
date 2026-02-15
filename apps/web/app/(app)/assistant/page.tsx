'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RecommendedContent {
  id: string;
  title: string;
  type: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  tags: string[];
}

interface QuickPrompt {
  id: string;
  label: string;
  message: string;
}

export default function AssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis Jam, ton assistant IA. Comment puis-je t\'aider aujourd\'hui ? 🦁',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedContents, setRecommendedContents] = useState<RecommendedContent[]>([]);
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient
      .get('/ai/quick-prompts')
      .then((res) => setQuickPrompts(res.data.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        messages: newMessages.filter((m) => m.role !== 'assistant' || newMessages.indexOf(m) > 0),
      });
      const { reply, recommendedContents: recs } = res.data.data;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      if (recs?.length > 0) setRecommendedContents(recs);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Désolé, je ne peux pas répondre pour l\'instant. Réessaie dans un moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-dark-bg">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-orange/20 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-brand-orange" />
          </div>
          <div>
            <h1 className="font-bold text-white">Assistant IA</h1>
            <p className="text-xs text-brand-green">● En ligne</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-orange text-white rounded-br-sm'
                  : 'glass text-white rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-brand-orange rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommended content cards */}
        {recommendedContents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-dark-text">Contenus recommandés pour toi :</p>
            {recommendedContents.map((content) => (
              <button
                key={content.id}
                onClick={() => router.push(`/content/${content.id}`)}
                className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:border-brand-orange/30 transition-all text-left"
              >
                <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📹</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white line-clamp-1">{content.title}</p>
                  <p className="text-xs text-dark-text mt-0.5">
                    {content.durationSeconds
                      ? `${Math.ceil(content.durationSeconds / 60)} min`
                      : content.type}
                  </p>
                </div>
                <span className="text-brand-orange text-xs flex-shrink-0">Voir →</span>
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && quickPrompts.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickPrompts.map((p) => (
              <button
                key={p.id}
                onClick={() => sendMessage(p.message)}
                className="glass text-white text-xs px-3 py-2 rounded-full whitespace-nowrap hover:border-brand-orange/50 transition-all flex-shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Pose ta question..."
            className="flex-1 bg-transparent text-white placeholder-dark-text text-sm focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="text-brand-orange disabled:opacity-40 transition-opacity"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
