'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { feedApi } from '@/lib/api/feed.api';
import { FeedItem } from '@/components/feed/FeedItem';
import {
  Heart,
  Bookmark,
  Share2,
  Play,
  Lock,
  Filter,
  Clock,
  Video,
  BookOpen,
  Zap,
  Users,
} from 'lucide-react';
import { useNotificationsStore } from '@/store/notifications.store';
import { useRightPanelStore } from '@/store/rightPanel.store';
import { ContentTypeBadge, PremiumBadge } from '@/components/ui/Badge';
import { FeedItemSkeleton, EmptyState } from '@/components/ui';
import apiClient from '@/lib/api/client';
import { aiApi } from '@/lib/api/content.api';
import clsx from 'clsx';

interface FeedItemData {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  durationSeconds?: number | null;
  tags: string[];
  isPremium: boolean;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  saveCount: number;
}

type FeedFilter = 'all' | 'programs' | 'challenges' | 'video' | 'article';

const FILTERS: { id: FeedFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Pour toi', icon: Users },
  { id: 'programs', label: 'Programmes', icon: BookOpen },
  { id: 'challenges', label: 'Challenges', icon: Zap },
  { id: 'video', label: 'Vidéos', icon: Video },
  { id: 'article', label: 'Articles', icon: BookOpen },
];

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)} min`;
}

// ── Web Feed Row Item ────────────────────────────────────
function FeedRowItem({
  item,
  isSelected,
  onSelect,
}: {
  item: FeedItemData;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [isSaved, setIsSaved] = useState(item.isSaved);
  const [likeCount, setLikeCount] = useState(item.likeCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((p) => !p);
    setLikeCount((p) => p + (isLiked ? -1 : 1));
    try {
      await feedApi.toggleLike(item.id);
    } catch {
      setIsLiked((p) => !p);
      setLikeCount((p) => p + (isLiked ? 1 : -1));
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved((p) => !p);
    try {
      await feedApi.toggleSave(item.id);
    } catch {
      setIsSaved((p) => !p);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.share({ title: item.title, url: `${window.location.origin}/content/${item.id}` });
      await feedApi.share(item.id, 'native');
    } catch {
      await navigator.clipboard.writeText(`${window.location.origin}/content/${item.id}`);
      await feedApi.share(item.id, 'copy');
    }
  };

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'w-full flex gap-3 p-3 rounded-xl text-left transition-all',
        isSelected
          ? 'bg-brand-orange/10 border border-brand-orange/30'
          : 'hover:bg-surface-2 border border-transparent',
      )}
      aria-pressed={isSelected}
    >
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-3">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-surface-3 flex items-center justify-center">
            {item.type === 'VIDEO' ? (
              <Play size={18} className="text-brand-orange/60" />
            ) : (
              <BookOpen size={18} className="text-brand-orange/60" />
            )}
          </div>
        )}
        {item.isPremium && (
          <div className="absolute top-1 left-1">
            <PremiumBadge />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <ContentTypeBadge type={item.type} />
          {item.durationSeconds && (
            <span className="text-[10px] text-dark-text flex items-center gap-0.5 flex-shrink-0">
              <Clock size={9} />
              {formatDuration(item.durationSeconds)}
            </span>
          )}
        </div>
        <p className="text-sm text-white font-medium line-clamp-2 leading-snug">
          {item.title}
        </p>
        {item.tags.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-brand-orange">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={handleLike}
          className="p-1 rounded transition-colors"
          aria-label={isLiked ? 'Ne plus aimer' : 'Aimer'}
        >
          <Heart
            size={14}
            className={isLiked ? 'text-red-500' : 'text-dark-text hover:text-white'}
            fill={isLiked ? 'currentColor' : 'none'}
          />
        </button>
        <button
          onClick={handleSave}
          className="p-1 rounded transition-colors"
          aria-label={isSaved ? 'Retirer des favoris' : 'Sauvegarder'}
        >
          <Bookmark
            size={14}
            className={isSaved ? 'text-brand-orange' : 'text-dark-text hover:text-white'}
            fill={isSaved ? 'currentColor' : 'none'}
          />
        </button>
        <button
          onClick={handleShare}
          className="p-1 rounded transition-colors"
          aria-label="Partager"
        >
          <Share2 size={14} className="text-dark-text hover:text-white" />
        </button>
      </div>
    </button>
  );
}

// ── Center content player/preview ───────────────────────
function ContentPreview({
  item,
  hasSubscription,
}: {
  item: FeedItemData;
  hasSubscription: boolean;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPremiumLocked = item.isPremium && !hasSubscription;

  return (
    <div className="flex flex-col h-full">
      {/* Video / thumbnail area */}
      <div className="relative bg-black aspect-video w-full flex-shrink-0">
        {item.videoUrl && !isPremiumLocked ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            className="w-full h-full object-contain"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-surface-3" />
        )}

        {/* Premium overlay */}
        {isPremiumLocked && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
            <div className="bg-surface-2 border border-brand-orange/30 rounded-2xl p-6 text-center max-w-xs">
              <Lock size={36} className="text-brand-orange mx-auto mb-3" />
              <p className="font-semibold text-white mb-1">Contenu Premium</p>
              <p className="text-sm text-dark-text mb-4">Abonne-toi pour accéder à tout le contenu</p>
              <button
                onClick={() => router.push('/billing')}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                Voir les offres
              </button>
            </div>
          </div>
        )}

        {/* Play button overlay */}
        {!isPremiumLocked && !isPlaying && (
          <button
            onClick={() => { videoRef.current?.play(); }}
            className="absolute inset-0 flex items-center justify-center group"
            aria-label="Lire la vidéo"
          >
            {item.videoUrl ? (
              <div className="w-14 h-14 bg-brand-orange/90 group-hover:bg-brand-orange rounded-full flex items-center justify-center transition-colors shadow-modal">
                <Play size={24} fill="white" className="text-white ml-0.5" />
              </div>
            ) : (
              <button
                onClick={() => router.push(`/content/${item.id}`)}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors backdrop-blur-sm"
              >
                Voir le contenu →
              </button>
            )}
          </button>
        )}

        {/* Pause button */}
        {isPlaying && (
          <button
            onClick={() => { videoRef.current?.pause(); }}
            className="absolute inset-0"
            aria-label="Mettre en pause"
          />
        )}
      </div>

      {/* Info section */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <ContentTypeBadge type={item.type} />
            {item.isPremium && <PremiumBadge />}
          </div>
          {item.durationSeconds && (
            <span className="text-xs text-dark-text flex items-center gap-1">
              <Clock size={11} /> {formatDuration(item.durationSeconds)}
            </span>
          )}
        </div>

        <h2 className="text-lg font-bold text-white mb-2">{item.title}</h2>
        {item.description && (
          <p className="text-dark-text text-sm leading-relaxed mb-4">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => router.push(`/content/${item.id}`)}
          className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Ouvrir le contenu complet →
        </button>
      </div>
    </div>
  );
}

// ── Main Home Page ───────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<FeedItemData | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const setPanel = useRightPanelStore((s) => s.setContent);
  const setAiSummary = useRightPanelStore((s) => s.setAiSummary);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed', filter],
    queryFn: async ({ pageParam }) => {
      const res = await feedApi.getFeed(pageParam as string | undefined, 10);
      return res.data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage as { nextCursor?: string }).nextCursor,
  });

  useEffect(() => {
    apiClient
      .get('/billing/status')
      .then((res) => setHasSubscription(res.data.data?.isActive ?? false))
      .catch(() => {});
    apiClient
      .get('/notifications/unread-count')
      .then((res) => useNotificationsStore.getState().setUnreadCount(res.data.data))
      .catch(() => {});
  }, []);

  const allItems = data?.pages.flatMap((p) => (p as { items: FeedItemData[] }).items) ?? [];

  // Auto-select first item
  useEffect(() => {
    if (allItems.length > 0 && !selectedItem) {
      setSelectedItem(allItems[0]);
    }
  }, [allItems.length]);

  // Load AI summary when item selected
  useEffect(() => {
    if (!selectedItem) return;
    setPanel({
      contentId: selectedItem.id,
      contentTitle: selectedItem.title,
      contentType: selectedItem.type,
      aiSummary: null,
      nextContent: allItems.find((i) => i.id !== selectedItem.id) ?? undefined,
    });
    setAiSummary(null, true);
    aiApi
      .summarize(selectedItem.id)
      .then((res) => setAiSummary(res.data.data.summary))
      .catch(() => setAiSummary('Résumé non disponible.', false));
  }, [selectedItem?.id]);

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage],
  );

  // Keyboard navigation (j/k)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        const idx = allItems.findIndex((i) => i.id === selectedItem?.id);
        const next = allItems[idx + 1];
        if (next) setSelectedItem(next);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        const idx = allItems.findIndex((i) => i.id === selectedItem?.id);
        const prev = allItems[idx - 1];
        if (prev) setSelectedItem(prev);
      } else if (e.key === 'Enter' && selectedItem) {
        router.push(`/content/${selectedItem.id}`);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [allItems, selectedItem, router]);

  // ── Mobile: keep original full-screen feed ──────────────
  const MobileFeed = (
    <div className="md:hidden relative">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-4 pb-2 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-brand-orange font-bold text-xl">JAMBAAR</div>
      </div>
      <div ref={containerRef} className="feed-container">
        {allItems.map((item, idx) => (
          <div key={item.id} ref={idx === allItems.length - 1 ? lastItemRef : undefined}>
            <FeedItem
              item={item}
              isActive={idx === activeIndex}
              hasSubscription={hasSubscription}
            />
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="feed-item flex items-center justify-center">
            <div className="text-brand-orange text-sm">Chargement...</div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Desktop: 2-column split ──────────────────────────────
  const DesktopFeed = (
    <div className="hidden md:flex h-full">
      {/* Left: feed list */}
      <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col border-r border-dark-border">
        {/* Filter chips */}
        <div className="flex gap-1.5 px-3 py-3 border-b border-dark-border overflow-x-auto flex-shrink-0">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                filter === id
                  ? 'bg-brand-orange text-white'
                  : 'bg-surface-2 text-dark-text hover:text-white hover:bg-surface-3 border border-dark-border',
              )}
            >
              <Icon size={11} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Keyboard hint */}
        <div className="px-3 py-1.5 border-b border-dark-border/50 flex items-center gap-1.5 flex-shrink-0">
          <span className="kbd">J</span><span className="kbd">K</span>
          <span className="text-[10px] text-dark-text ml-0.5">pour naviguer</span>
          <span className="kbd ml-2">↵</span>
          <span className="text-[10px] text-dark-text ml-0.5">pour ouvrir</span>
        </div>

        {/* Feed list */}
        <div className="flex-1 overflow-y-auto feed-list px-2 py-2 space-y-1">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <FeedItemSkeleton key={i} />)}

          {!isLoading && allItems.length === 0 && (
            <EmptyState
              emoji="📭"
              title="Aucun contenu"
              description="Ton feed est vide pour le moment. Reviens plus tard !"
            />
          )}

          {allItems.map((item, idx) => (
            <div
              key={item.id}
              ref={idx === allItems.length - 1 ? lastItemRef : undefined}
            >
              <FeedRowItem
                item={item}
                isSelected={selectedItem?.id === item.id}
                onSelect={() => setSelectedItem(item)}
              />
            </div>
          ))}

          {isFetchingNextPage && (
            <div className="py-4 text-center">
              <div className="text-xs text-dark-text">Chargement...</div>
            </div>
          )}
        </div>
      </div>

      {/* Center: selected content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedItem ? (
          <ContentPreview item={selectedItem} hasSubscription={hasSubscription} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              emoji="👈"
              title="Sélectionne un contenu"
              description="Clique sur un élément dans le feed pour le prévisualiser ici."
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {MobileFeed}
      {DesktopFeed}
    </>
  );
}
