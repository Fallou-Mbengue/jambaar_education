import { ChatMessage, LLMProvider } from './llm-provider.interface';

const MOCK_RESPONSES = [
  'Pour améliorer ta communication, commence par écouter activement ton interlocuteur. 🎯',
  'Le leadership, c\'est d\'abord avoir une vision claire et la partager avec enthousiasme.',
  'La gestion du stress passe par la respiration : inspire 4 secondes, retiens 4, expire 4.',
  'Pour un pitch efficace : problème → solution → impact → appel à l\'action.',
  'La productivité commence par éliminer les distractions : mets ton téléphone en mode silencieux.',
  'En situation de conflit, reformule ce que l\'autre a dit avant de répondre.',
];

export class MockLLMProvider implements LLMProvider {
  async chat(messages: ChatMessage[]): Promise<string> {
    const lastUser = messages.filter((m) => m.role === 'user').pop();
    const query = lastUser?.content?.toLowerCase() ?? '';

    if (query.includes('stress') || query.includes('pression')) {
      return 'La gestion du stress commence par identifier ses déclencheurs. Je te recommande notre module "Gérer le stress au travail". Tu peux le trouver dans la section Programmes. 🧘';
    }
    if (query.includes('leadership') || query.includes('manager')) {
      return 'Le leadership s\'apprend ! Commence par notre challenge 7 jours "Développer son leadership". L\'objectif est de pratiquer une compétence de leader chaque jour. 🦁';
    }
    if (query.includes('entretien') || query.includes('emploi') || query.includes('job')) {
      return 'Pour réussir un entretien d\'embauche : prépare ta présentation en 2 min (parcours + valeur ajoutée), anticipe les questions difficiles, et pose des questions pertinentes. Je te recommande notre programme "Décrocher ton premier emploi". 💼';
    }
    if (query.includes('communication') || query.includes('parler')) {
      return 'La communication efficace repose sur 3 piliers : clarté du message, écoute active, et adaptation au contexte. Notre module "Maîtriser la communication" peut t\'aider ! 🎙️';
    }

    const idx = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[idx];
  }

  async summarize(text: string, maxWords = 50): Promise<string> {
    // Simple mock: take first sentences up to maxWords
    const words = text.split(' ').slice(0, maxWords);
    return words.join(' ') + (words.length < text.split(' ').length ? '...' : '');
  }

  async recommend(
    userProfile: { objectives: string[]; interests: string[]; level: string },
    _context?: string,
  ): Promise<string[]> {
    // Return interest-based recommendations
    const tags = [...userProfile.interests, ...userProfile.objectives];
    return tags.slice(0, 3);
  }
}
