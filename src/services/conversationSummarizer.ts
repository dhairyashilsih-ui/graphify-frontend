import { sendToGroq, type GroqMessage } from './groqAI';

/**
 * Extracts key facts from a single message (max 5 words)
 * Returns empty string if no important info to save
 */
export async function extractKeyFacts(userMessage: string, aiResponse: string): Promise<string[]> {
  const extractPrompt: GroqMessage[] = [
    {
      role: 'system',
      content: 'Extract key facts as "key: value" format (max 5 words). If the data is personal to user or related to user ex- name:om , village:pune like this save each key fact on new line and save max 5 key facts minimum 0 is ok '
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
