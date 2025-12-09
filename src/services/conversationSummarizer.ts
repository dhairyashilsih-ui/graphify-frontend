import { sendToGroq, type GroqMessage } from './groqAI';

/**
 * Extracts key facts from a single message (max 5 words)
 * Returns empty string if no important info to save
 */
export async function extractKeyFacts(userMessage: string, aiResponse: string): Promise<string[]> {
  const extractPrompt: GroqMessage[] = [
    {
      role: 'system',
      content: 'You are a strict key-fact extractor. ONLY extract facts that are EXPLICITLY stated by the user and are PERSONAL (name, age, city, job, company, phone, goal, etc.). Output ONLY in "key: value" format, one fact per line, max 5 words per value, max 5 lines, NO assumptions, NO intent, NO behavior, NO tone, NO emotion, NO conversation state, NO filler facts. If NO personal data exists → output NOTHING (empty response). NEVER generate inferred data.'
    },
    {
      role: 'user',
      content: `User: ${userMessage}\n\nExtract facts (one per line):`
    }
  ];

  try {
    const response = await sendToGroq(extractPrompt);
    const trimmed = response.trim().toLowerCase();
    
    // Don't save if no important info
    if (trimmed === 'none' || trimmed === 'nothing' || trimmed.length === 0) {
      return [];
    }
    
    // Split by newlines and filter valid facts
    const facts = response
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0 && f.includes(':') && !f.toLowerCase().startsWith('none'));
    
    return facts;
  } catch (error) {
    console.error('Error extracting facts:', error);
    return [];
  }
}

/**
 * Builds compact context from saved facts
 */
export function buildContextString(facts: string[]): string {
  if (facts.length === 0) return '';
  return 'Known: ' + facts.join(', ');
}

/**
 * Simple token estimator (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(messages: GroqMessage[]): number {
  const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  return Math.ceil(totalChars / 4);
}
