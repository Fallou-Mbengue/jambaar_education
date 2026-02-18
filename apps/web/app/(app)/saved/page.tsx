'use client';

import { useQuery } from '@tanstack/react-query';
import { feedApi } from '@/lib/api/feed.api';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['saved'],
    queryFn: async () => {
      const res = await feedApi.getSaved();
      return res.data.data;
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-brand-orange">Chargement...</div>
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Contenus sauvegardés</h1>

      {(!data || data.length === 0) ? (
        <div className="text-center py-16">
          <Bookmark size={48} className="text-dark-text mx-auto mb-4" />
          <p className="text-dark-text">Aucun contenu sauvegardé pour l&apos;instant.</p>
          <Link href="/home" className="text-brand-orange text-sm mt-2 block">
            Découvrir le feed →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((content: { id: string; title: string; type: string; durationSeconds?: number; thumbnailUrl?: string; tags: string[] }) => (
            <Link key={content.id} href={`/content/${content.id}`}>
              <div className="glass rounded-xl p-4 flex items-center gap-4 hover:border-brand-orange/30 transition-all">
                <div className="w-14 h-14 bg-brand-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📹</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-dark-text line-clamp-1">{content.title}</h3>
                  <p className="text-xs text-dark-text mt-0.5">
                    {content.type} {content.durationSeconds && `• ${Math.ceil(content.durationSeconds / 60)} min`}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {content.tags.slice(0, 2).map((t: string) => (
                      <span key={t} className="text-xs text-brand-orange">#{t}</span>
                    ))}
                  </div>
                </div>
                <Bookmark size={18} className="text-brand-orange flex-shrink-0" fill="currentColor" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
