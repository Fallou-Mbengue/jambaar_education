'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronRight,
  BookOpen,
  PlayCircle,
  PanelRightClose,
} from 'lucide-react';
import { useRightPanelStore } from '@/store/rightPanel.store';
import clsx from 'clsx';

export function RightPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const { content, isPanelOpen, togglePanel } = useRightPanelStore();

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
  const isProgramPage = pathname.startsWith('/parcours/') && pathname !== '/parcours';

  return (
    <aside
      className="right-panel flex flex-col animate-slide-in-right"
      aria-label="Panneau contextuel"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-dark-border flex-shrink-0">
        <span className="text-xs font-semibold text-dark-text uppercase tracking-wider">
          Contexte
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
        {!content.contentId && (
          <div className="card p-3">
            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-3">
              Accès Rapide
            </p>
            <div className="space-y-1.5">
              {[
                { href: '/parcours', icon: BookOpen, label: 'Mes Programmes', color: 'text-brand-orange' },
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
