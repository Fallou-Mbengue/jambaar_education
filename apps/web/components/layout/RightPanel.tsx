'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  TrendingUp,
  Zap,
  ChevronRight,
  Flame,
  Star,
  BookOpen,
  PlayCircle,
  Loader2,
  PanelRightClose,
} from 'lucide-react';
import { useRightPanelStore } from '@/store/rightPanel.store';
import { useGamificationStore } from '@/store/gamification.store';
import apiClient from '@/lib/api/client';
import clsx from 'clsx';

export function RightPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const { content, isPanelOpen, togglePanel } = useRightPanelStore();
  const gamification = useGamificationStore((s) => s.profile);

  // Load gamification profile if not set
  useEffect(() => {
    if (!gamification) {
      apiClient.get('/gamification/profile').then((res) => {
        useGamificationStore.getState().setProfile(res.data.data);
      }).catch(() => {});
    }
  }, [gamification]);

  if (!isPanelOpen) {
    return (
      <div className="right-panel flex flex-col items-center pt-4 w-10 !border-l border-dark-border bg-surface-1">
        <button
          onClick={togglePanel}
          className="p-1.5 text-dark-text hover:text-gray-800 transition-colors rounded"
          aria-label="Ouvrir le panneau contextuel"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  const isHomePage = pathname === '/home';
  const isContentPage = pathname.startsWith('/content/');
  const isProgramPage = pathname.startsWith('/programs/') && pathname !== '/programs';
  const isChallengePage = pathname.startsWith('/challenges/') && pathname !== '/challenges';
  const isAssistantPage = pathname === '/assistant';

  return (
    <aside
      className="right-panel flex flex-col animate-slide-in-right"
      aria-label="Panneau contextuel"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-dark-border flex-shrink-0">
        <span className="text-xs font-semibold text-dark-text uppercase tracking-wider">
          {isAssistantPage ? 'Suggestions' : isChallengePage ? 'Challenge du Jour' : 'Contexte'}
        </span>
        <button
          onClick={togglePanel}
          className="p-1 text-dark-text hover:text-gray-800 transition-colors rounded"
          aria-label="Fermer le panneau"
        >
          <PanelRightClose size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Gamification streak/XP ── */}
        {gamification && (
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={13} className="text-brand-orange" />
              <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Ma Progression</span>
            </div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 bg-surface-2 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-brand-orange mb-1">
                  <Flame size={13} />
                  <span className="text-sm font-bold">{gamification.currentStreak}</span>
                </div>
                <p className="text-[10px] text-dark-text">Streak</p>
              </div>
              <div className="flex-1 bg-surface-2 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-brand-gold mb-1">
                  <Star size={13} />
                  <span className="text-sm font-bold">{gamification.totalXp}</span>
                </div>
                <p className="text-[10px] text-dark-text">XP Total</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-dark-text mb-1">
                <span>{gamification.currentLevel}</span>
                {gamification.xpToNextLevel > 0 && (
                  <span>+{gamification.xpToNextLevel} XP</span>
                )}
              </div>
              <div className="bg-surface-3 rounded-full h-1.5">
                <div
                  className="bg-brand-orange h-1.5 rounded-full xp-bar-fill"
                  style={{
                    width: gamification.xpToNextLevel > 0
                      ? `${Math.min((gamification.totalXp / (gamification.totalXp + gamification.xpToNextLevel)) * 100, 100)}%`
                      : '100%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── AI Summary (content / home with selected) ── */}
        {(isContentPage || isHomePage) && (
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-brand-orange" />
              <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Résumé IA</span>
            </div>
            {content.isLoadingSummary ? (
              <div className="flex items-center gap-2 text-dark-text text-xs py-2">
                <Loader2 size={13} className="animate-spin text-brand-orange" />
                <span>Génération en cours...</span>
              </div>
            ) : content.aiSummary ? (
              <p className="text-xs text-dark-text leading-relaxed whitespace-pre-wrap">
                {content.aiSummary}
              </p>
            ) : content.contentId ? (
              <p className="text-xs text-dark-text italic">
                Sélectionne un contenu pour voir le résumé IA.
              </p>
            ) : (
              <p className="text-xs text-dark-text italic">
                Clique sur un contenu pour voir le résumé IA.
              </p>
            )}
          </div>
        )}

        {/* ── Content progression (if in program/content) ── */}
        {(isProgramPage || isContentPage) && content.progression && (
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={13} className="text-brand-green" />
              <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Avancement</span>
            </div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-dark-text">{content.progression.label}</span>
              <span className="text-brand-green font-medium">{content.progression.percent}%</span>
            </div>
            <div className="bg-surface-3 rounded-full h-1.5">
              <div
                className="bg-brand-green h-1.5 rounded-full xp-bar-fill"
                style={{ width: `${content.progression.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Challenge du Jour ── */}
        {isChallengePage && content.challengeDay && (
          <div className="card p-3 border-brand-orange/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-brand-orange" />
              <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                Challenge du Jour
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-black text-brand-orange">
                {content.challengeDay.dayNumber}
              </span>
              <span className="text-dark-text text-xs">/ {content.challengeDay.total} jours</span>
            </div>
            <p className="text-sm text-gray-800 font-medium mb-1">
              {content.challengeDay.title}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Star size={11} className="text-brand-gold" />
              <span className="text-xs text-brand-gold font-medium">
                +{content.challengeDay.xpReward} XP
              </span>
            </div>
          </div>
        )}

        {/* ── Next content ── */}
        {content.nextContent && (isContentPage || isHomePage) && (
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle size={13} className="text-dark-text" />
              <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                Suivant
              </span>
            </div>
            <button
              onClick={() => router.push(`/content/${content.nextContent!.id}`)}
              className="w-full flex items-center gap-3 bg-surface-2 rounded-lg p-2.5 hover:bg-surface-3 transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-brand-orange/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <PlayCircle size={18} className="text-brand-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 font-medium line-clamp-2 group-hover:text-brand-orange transition-colors">
                  {content.nextContent.title}
                </p>
                {content.nextContent.durationSeconds && (
                  <p className="text-[10px] text-dark-text mt-0.5">
                    {Math.ceil(content.nextContent.durationSeconds / 60)} min
                  </p>
                )}
              </div>
              <ChevronRight size={13} className="text-dark-text group-hover:text-gray-800 flex-shrink-0" />
            </button>
          </div>
        )}

        {/* ── Quick actions ── */}
        {!content.contentId && !isChallengePage && !isAssistantPage && (
          <div className="card p-3">
            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-3">
              Accès Rapide
            </p>
            <div className="space-y-1.5">
              {[
                { href: '/programs', icon: BookOpen, label: 'Mes Programmes', color: 'text-brand-orange' },
                { href: '/challenges', icon: Zap, label: 'Challenges actifs', color: 'text-brand-gold' },
                { href: '/assistant', icon: Sparkles, label: 'Poser une question', color: 'text-brand-green' },
              ].map(({ href, icon: Icon, label, color }) => (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className={clsx(
                    'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs font-medium',
                    'bg-surface-2 hover:bg-surface-3 transition-colors text-left',
                    color,
                  )}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span className="text-gray-800">{label}</span>
                  <ChevronRight size={11} className="text-dark-text ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
