// Local AI API integration for FUSION
export class LocalAI {
  constructor() {
    this.ollamaUrl = 'http://localhost:11434/api/generate';
    this.models = {
      agriculture: 'llama3.1:8b',
      health: 'mistral:7b',
      finance: 'llama3.1:8b',
      education: 'mistral:7b',
      transport: 'llama3.1:8b',
      universal: 'llama3.1:8b'
    };
  }

  async analyzeDomain(domain, query, inputType = 'text') {
    const model = this.models[domain] || 'llama3.1:8b';
    
    const prompt = this.buildPrompt(domain, query, inputType);
    
    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.parseResponse(data.response);
    } catch (error) {
      console.error('Local AI Error:', error);
      return {
        error: 'Local AI unavailable. Please start Ollama server.',
        fallback: 'Using cached responses for demo.'
      };
    }
  }

  buildPrompt(domain, query, inputType) {
    return `You are GraphoraX AI, specialized in ${domain} analysis.
    
Input Type: ${inputType}
Query: ${query}

Provide analysis in JSON format:
{
  "insights": ["key finding 1", "key finding 2"],
  "recommendations": ["action 1", "action 2"],
  "causal_links": [{"source": "factor1", "target": "factor2", "strength": 0.8}],
  "confidence": 85
}`;
  }

  parseResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to plain text processing
      return {
        insights: [response.substring(0, 200) + '...'],
        recommendations: ['Continue monitoring', 'Seek expert consultation'],
        confidence: 75
      };
    } catch (error) {
      return {
        insights: [response],
        recommendations: ['Review analysis manually'],
        confidence: 60
      };
    }
  }

  async checkHealth() {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const models = await response.json();
      return {
        status: 'healthy',
        available_models: models.models?.map(m => m.name) || []
      };
    } catch (error) {
      return {
        status: 'unavailable',
        message: 'Ollama server not running'
      };
    }
  }
}

// Usage in your React components
export const localAI = new LocalAI();