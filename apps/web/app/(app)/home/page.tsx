'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '@/lib/api/feed.api';
import { FeedItem } from '@/components/feed/FeedItem';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotificationsStore } from '@/store/notifications.store';
import apiClient from '@/lib/api/client';

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

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const res = await feedApi.getFeed(pageParam, 10);
      return res.data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      (lastPage as { nextCursor?: string }).nextCursor,
  });

  useEffect(() => {
    apiClient
      .get('/billing/status')
      .then((res) => setHasSubscription(res.data.data?.isActive ?? false))
      .catch(() => setHasSubscription(false));

    apiClient
      .get('/notifications/unread-count')
      .then((res) => useNotificationsStore.getState().setUnreadCount(res.data.data))
      .catch(() => {});
  }, []);

  const allItems = data?.pages.flatMap((p) => (p as { items: FeedItemData[] }).items) ?? [];

  // IntersectionObserver for infinite scroll
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

  // Track active item on scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = window.innerHeight;
    const index = Math.round(scrollTop / itemHeight);
    setActiveIndex(index);
  }, []);

  if (allItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-dark-text">
        <div className="text-center">
          <div className="text-4xl mb-4">📱</div>
          <p>Chargement du feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-4 pb-2 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-brand-orange font-bold text-xl">JAMBAAR</div>
        <Link href="/profile" className="relative p-2">
          <Bell size={22} className="text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Feed container */}
      <div
        ref={containerRef}
        className="feed-container"
        onScroll={handleScroll}
      >
        {allItems.map((item, idx) => (
          <div
            key={item.id}
            ref={idx === allItems.length - 1 ? lastItemRef : undefined}
          >
            <FeedItem
              item={item as FeedItemData}
              isActive={idx === activeIndex}
              hasSubscription={hasSubscription}
            />
          </div>
        ))}

        {isFetchingNextPage && (
          <div className="feed-item flex items-center justify-center">
            <div className="text-brand-orange">Chargement...</div>
          </div>
        )}
      </div>
    </div>
  );
}
