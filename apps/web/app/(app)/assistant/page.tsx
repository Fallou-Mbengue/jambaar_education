'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, ChevronRight, Clock } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

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
      content: "Bonjour ! Je suis Jam, ton assistant IA. Comment puis-je t'aider aujourd'hui ? 🦁\n\nJe peux t'aider à :\n• Trouver du contenu adapté à tes objectifs\n• Résumer des vidéos ou articles\n• Répondre à tes questions sur les soft skills",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedContents, setRecommendedContents] = useState<RecommendedContent[]>([]);
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
        messages: newMessages.filter((m, i) => m.role !== 'assistant' || i > 0),
      });
      const { reply, recommendedContents: recs } = res.data.data;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      if (recs?.length > 0) setRecommendedContents(recs);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "Désolé, je ne peux pas répondre pour l'instant. Réessaie dans un moment.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Chat area ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-dark-border flex-shrink-0 bg-dark-bg/80 backdrop-blur">
          <div className="w-9 h-9 bg-brand-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-brand-orange" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">Jam — Assistant IA</h1>
            <p className="text-[11px] text-brand-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full inline-block" aria-hidden="true" />
              En ligne
            </p>
          </div>
          <div className="ml-auto text-xs text-dark-text hidden md:block">
            <span className="kbd">↵</span> Envoyer &nbsp; <span className="kbd">⇧↵</span> Nouvelle ligne
          </div>
        </div>

        {/* Quick prompts (desktop chips above messages) */}
        {quickPrompts.length > 0 && messages.length <= 1 && (
          <div className="hidden md:flex gap-2 px-6 py-3 border-b border-dark-border overflow-x-auto flex-shrink-0">
            {quickPrompts.map((p) => (
              <button
                key={p.id}
                onClick={() => sendMessage(p.message)}
                className="flex items-center gap-1.5 bg-surface-2 hover:bg-surface-3 border border-dark-border text-white text-xs px-3 py-2 rounded-full whitespace-nowrap transition-all hover:border-brand-orange/30 flex-shrink-0"
              >
                <Sparkles size={10} className="text-brand-orange" aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4" aria-live="polite" aria-label="Conversation">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={13} className="text-brand-orange" aria-hidden="true" />
                </div>
              )}
              <div
                className={clsx(
                  'max-w-[80%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-brand-orange text-white rounded-br-sm'
                    : 'bg-surface-2 border border-dark-border text-white rounded-bl-sm',
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 bg-surface-3 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={13} className="text-dark-text" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} className="text-brand-orange" />
              </div>
              <div className="bg-surface-2 border border-dark-border px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5 items-center">
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

          <div ref={bottomRef} />
        </div>

        {/* Mobile quick prompts */}
        {quickPrompts.length > 0 && messages.length <= 1 && (
          <div className="md:hidden flex gap-2 px-4 pb-2 overflow-x-auto flex-shrink-0">
            {quickPrompts.map((p) => (
              <button
                key={p.id}
                onClick={() => sendMessage(p.message)}
                className="bg-surface-2 border border-dark-border text-white text-xs px-3 py-2 rounded-full whitespace-nowrap flex-shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 md:px-6 pb-4 md:pb-5 flex-shrink-0">
          <div className="flex items-end gap-3 bg-surface-2 border border-dark-border rounded-2xl px-4 py-3 focus-within:border-brand-orange/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question à Jam..."
              className="flex-1 bg-transparent text-white placeholder-dark-text text-sm focus:outline-none resize-none max-h-32 min-h-[24px]"
              disabled={loading}
              rows={1}
              aria-label="Message à envoyer"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="text-brand-orange disabled:opacity-40 transition-opacity p-0.5 flex-shrink-0"
              aria-label="Envoyer le message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right panel: recommended contents ── */}
      {recommendedContents.length > 0 && (
        <aside
          className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-dark-border animate-slide-in-right overflow-hidden"
          aria-label="Contenus recommandés"
        >
          <div className="px-4 py-3 border-b border-dark-border flex-shrink-0">
            <p className="text-xs font-semibold text-white uppercase tracking-wide">
              Contenus recommandés
            </p>
            <p className="text-[10px] text-dark-text mt-0.5">
              Basé sur ta conversation
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {recommendedContents.map((content) => (
              <button
                key={content.id}
                onClick={() => router.push(`/content/${content.id}`)}
                className="w-full flex items-center gap-3 card card-interactive p-3 text-left group"
              >
                <div className="w-10 h-10 bg-brand-orange/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  {content.thumbnailUrl ? (
                    <img
                      src={content.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <Sparkles size={16} className="text-brand-orange" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white line-clamp-2 group-hover:text-brand-orange transition-colors">
                    {content.title}
                  </p>
                  <p className="text-[10px] text-dark-text mt-0.5 flex items-center gap-1">
                    {content.durationSeconds ? (
                      <>
                        <Clock size={9} /> {Math.ceil(content.durationSeconds / 60)} min
                      </>
                    ) : (
                      content.type
                    )}
                  </p>
                </div>
                <ChevronRight size={12} className="text-dark-text flex-shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
