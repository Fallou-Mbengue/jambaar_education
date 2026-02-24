'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewParcoursPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/parcours"
          className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Créer un nouveau parcours</h1>
          <p className="text-sm text-gray-400 mt-1">
            Wizard de création en 4 étapes (à implémenter)
          </p>
        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-[#1A1A1A] rounded-xl p-12 border border-white/[0.06] text-center">
        <p className="text-gray-400 mb-4">
          Le wizard de création complet (4 étapes) sera implémenté prochainement :
        </p>
        <ul className="text-sm text-gray-500 space-y-2 max-w-md mx-auto text-left">
          <li>• Étape 1 : Informations générales (titre, description, catégorie, image)</li>
          <li>• Étape 2 : Contenu du cours (modules, leçons, types de contenu)</li>
          <li>• Étape 3 : Prix & Accès (tarification, durée, certification)</li>
          <li>• Étape 4 : Paramètres avancés</li>
        </ul>
      </div>
    </div>
  );
}
