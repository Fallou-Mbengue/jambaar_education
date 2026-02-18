'use client';

import { useRef, useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Play, Lock } from 'lucide-react';
import { feedApi } from '@/lib/api/feed.api';
import { useGamificationStore } from '@/store/gamification.store';
import { useRouter } from 'next/navigation';

interface FeedItemProps {
  item: {
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
  };
  isActive: boolean;
  hasSubscription: boolean;
}

export function FeedItem({ item, isActive, hasSubscription }: FeedItemProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [isSaved, setIsSaved] = useState(item.isSaved);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [isPlaying, setIsPlaying] = useState(false);
  const addPendingXp = useGamificationStore((s) => s.addPendingXp);

  const isPremiumLocked = item.isPremium && !hasSubscription;

  useEffect(() => {
    if (!videoRef.current || !item.videoUrl || isPremiumLocked) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, item.videoUrl, isPremiumLocked]);

  const handleLike = async () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    try {
      await feedApi.toggleLike(item.id);
      if (!isLiked) addPendingXp(10);
    } catch {
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => prev + (isLiked ? 1 : -1));
    }
  };

  const handleSave = async () => {
    setIsSaved((prev) => !prev);
    try {
      await feedApi.toggleSave(item.id);
    } catch {
      setIsSaved((prev) => !prev);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: item.title, url: `${window.location.origin}/content/${item.id}` });
      await feedApi.share(item.id, 'native');
    } catch {
      await navigator.clipboard.writeText(`${window.location.origin}/content/${item.id}`);
      await feedApi.share(item.id, 'copy');
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}min`;
  };

  return (
    <div className="feed-item relative bg-dark-bg flex items-center justify-center">
      {/* Background */}
      {item.videoUrl && !isPremiumLocked ? (
        <video
          ref={videoRef}
          src={item.videoUrl}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onClick={() => {
            if (videoRef.current) {
              if (isPlaying) {
                videoRef.current.pause();
              } else {
                videoRef.current.play();
              }
              setIsPlaying((p) => !p);
            }
          }}
        />
      ) : item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-dark-card" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Premium lock overlay */}
      {isPremiumLocked && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 z-20">
          <div className="bg-brand-orange/20 border border-brand-orange/50 rounded-2xl p-6 text-center">
            <Lock size={40} className="text-brand-orange mx-auto mb-3" />
            <p className="font-semibold text-dark-text">Contenu Premium</p>
            <p className="text-sm text-dark-text mt-1">Abonne-toi pour accéder</p>
            <button
              onClick={() => router.push('/billing')}
              className="mt-4 bg-brand-orange text-dark-text px-6 py-2 rounded-xl font-semibold text-sm"
            >
              S&apos;abonner
            </button>
          </div>
        </div>
      )}

      {/* Content info */}
      <div className="absolute bottom-24 left-4 right-16 z-10">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {item.isPremium && (
            <span className="bg-brand-gold text-black text-xs font-bold px-2 py-0.5 rounded">
              PREMIUM
            </span>
          )}
          <span className="bg-white/10 text-dark-text text-xs px-2 py-0.5 rounded">
            {item.type.replace('_', ' ')}
          </span>
          {item.durationSeconds && (
            <span className="text-dark-text text-xs">{formatDuration(item.durationSeconds)}</span>
          )}
        </div>

        <h2
          className="text-dark-text font-bold text-lg leading-tight cursor-pointer"
          onClick={() => router.push(`/content/${item.id}`)}
        >
          {item.title}
        </h2>
        {item.description && (
          <p className="text-dark-text text-sm mt-1 line-clamp-2">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-brand-orange text-xs">#{tag}</span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 bottom-28 z-10 flex flex-col items-center gap-6">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-dark-text'} transition-colors`}>
            <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-dark-text text-xs font-medium">{likeCount}</span>
        </button>

        <button onClick={handleSave} className="flex flex-col items-center gap-1">
          <div className={`p-2 rounded-full ${isSaved ? 'text-brand-orange' : 'text-dark-text'} transition-colors`}>
            <Bookmark size={28} fill={isSaved ? 'currentColor' : 'none'} />
          </div>
          <span className="text-dark-text text-xs font-medium">Sauv.</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="p-2 rounded-full text-dark-text">
            <Share2 size={28} />
          </div>
          <span className="text-dark-text text-xs font-medium">Part.</span>
        </button>

        {item.videoUrl && !isPlaying && !isPremiumLocked && (
          <button
            onClick={() => {
              videoRef.current?.play();
              setIsPlaying(true);
            }}
            className="p-3 bg-white/20 rounded-full"
          >
            <Play size={24} className="text-dark-text" fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
