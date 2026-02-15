export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  chat(messages: ChatMessage[], userId?: string): Promise<string>;
  summarize(text: string, maxWords?: number): Promise<string>;
  recommend(
    userProfile: { objectives: string[]; interests: string[]; level: string },
    context?: string,
  ): Promise<string[]>;
}

export const LLM_PROVIDER = 'LLM_PROVIDER';
