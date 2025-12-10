// Local AI service for FUSION React app
import {
  getStoredSessionId,
  setStoredSessionId,
  clearStoredSessionId,
  generateSessionId as generateStoredSessionId
} from './mongodb';
export interface AIAnalysisRequest {
  domain: string;
  query: string;
  inputType?: 'text' | 'voice' | 'image' | 'video' | 'live';
  file?: File;
}

export interface AIAnalysisResponse {
  success: boolean;
  domain: string;
  analysis: {
    insights: string[];
    recommendations: string[];
    causal_relationships: Array<{
      source: string;
      target: string;
      strength: number;
      type: 'positive' | 'negative';
    }>;
    risk_factors?: Array<{
      factor: string;
      probability: number;
      impact: string;
    }>;
    confidence_score: number;
    data_quality: string;
    next_steps: string[];
    summary?: string;
    voice_response?: string;
    audio?: string;
    audioContentType?: string;
  };
  metadata: {
    source: string;
    timestamp: string;
    model_used: string;
    processing_time: string;
  };
  raw_data?: any;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  ollama: 'running' | 'not_running';
  models: string[];
  fallback?: string;
  timestamp: string;
}

class LocalAIService {
  private baseUrl: string;
  private isHealthy: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds
  private sessionId: string | null = null;
  private recentTurns: Array<{ query: string; summary: string }>; // lightweight context for continuity

  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
    this.recentTurns = [];
    this.checkHealth();
  }

  async checkHealth(): Promise<SystemHealth> {
    const now = Date.now();
    
    // Only check health every 30 seconds to avoid spam
    if (now - this.lastHealthCheck < this.healthCheckInterval && this.isHealthy) {
      return {
        status: 'healthy',
        ollama: 'running',
        models: [],
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const health: SystemHealth = await response.json();
        this.isHealthy = health.status === 'healthy';
        this.lastHealthCheck = now;
        return health;
      } else {
        this.isHealthy = false;
        return {
          status: 'degraded',
          ollama: 'not_running',
          models: [],
          fallback: 'demo_mode',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      this.isHealthy = false;
      console.warn('Local AI backend unavailable, using fallback mode:', error);
      return {
        status: 'unavailable',
        ollama: 'not_running',
        models: [],
        fallback: 'demo_mode',
        timestamp: new Date().toISOString()
      };
    }
  }

  async analyzeQuery(request: AIAnalysisRequest, generateTTS: boolean = true): Promise<AIAnalysisResponse> {
    console.log(`🔍 Analyzing ${request.domain} query:`, request.query.substring(0, 100));

    try {
      let response: Response;
      const sessionId = this.getOrCreateSessionId();
      const context = this.buildContextPayload();

      if (request.file) {
        // Multimodal analysis with file upload
        const formData = new FormData();
        formData.append('domain', request.domain);
        formData.append('query', request.query);
        formData.append('inputType', request.inputType || 'text');
        formData.append('generateTTS', generateTTS.toString());
        formData.append('file', request.file);
        formData.append('sessionId', sessionId);
        if (context.contextSummary) formData.append('contextSummary', context.contextSummary);
        formData.append('recentTurns', JSON.stringify(context.recentTurns));

        response = await fetch(`${this.baseUrl}/analyze/multimodal`, {
          method: 'POST',
          headers: {
            'x-session-id': sessionId
          },
          body: formData,
        });
      } else {
        // Text-based analysis with TTS option
        response = await fetch(`${this.baseUrl}/analyze`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-session-id': sessionId
          },
          body: JSON.stringify({
            domain: request.domain,
            query: request.query,
            inputType: request.inputType || 'text',
            generateTTS,
            sessionId,
            contextSummary: context.contextSummary,
            recentTurns: context.recentTurns
          }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Analysis completed via Gemini AI with TTS support');
        
        const formattedResponse = this.formatResponse(result, request);
        this.updateContext(request.query, formattedResponse);
        return formattedResponse;
      } else {
        console.warn('❌ Backend AI request failed, using fallback');
        const fallback = this.getFallbackResponse(request);
        this.updateContext(request.query, fallback);
        return fallback;
      }
    } catch (error) {
      console.warn('❌ Backend AI connection failed, using fallback:', error);
      const fallback = this.getFallbackResponse(request);
      this.updateContext(request.query, fallback);
      return fallback;
    }
  }

  private getOrCreateSessionId(): string {
    if (this.sessionId) return this.sessionId;
    const stored = getStoredSessionId();
    if (stored) {
      this.sessionId = stored;
      return stored;
    }
    const fresh = generateStoredSessionId();
    this.sessionId = fresh;
    setStoredSessionId(fresh);
    return fresh;
  }

  startNewSession(): string {
    clearStoredSessionId();
    this.recentTurns = [];
    this.sessionId = generateStoredSessionId();
    setStoredSessionId(this.sessionId);
    return this.sessionId;
  }

  private buildContextPayload() {
    const recentTurns = this.recentTurns.slice(-5).map((t) => ({
      query: t.query.slice(0, 200),
      summary: t.summary.slice(0, 200)
    }));

    const contextSummary = recentTurns
      .map((t, idx) => `${idx + 1}. Q: ${t.query} | A: ${t.summary}`)
      .join(' \n ');

    return { contextSummary, recentTurns };
  }

  // Method to handle TTS playback with orb speaking state
  async playResponseAudio(
    response: AIAnalysisResponse,
    onSpeakingStart?: () => void,
    onSpeakingEnd?: () => void,
    onAudioLevel?: (level: number) => void
  ): Promise<void> {
    if (response.analysis.audio) {
      console.log('🔊 Playing AI response audio...');
      return this.playAudio(
        response.analysis.audio,
        response.analysis.audioContentType || 'audio/mpeg',
        onSpeakingStart,
        onSpeakingEnd,
        onAudioLevel
      );
    } else {
      console.warn('No audio available in response');
      return Promise.resolve();
    }
  }

  // Format backend response to match our interface
  private formatResponse(backendResult: any, request: AIAnalysisRequest): AIAnalysisResponse {
    if (!backendResult.success || !backendResult.data) {
      return this.getFallbackResponse(request);
    }

    const data = backendResult.data;
    
    return {
      success: true,
      domain: request.domain,
      analysis: {
        insights: data.insights || [],
        recommendations: data.recommendations || [],
        causal_relationships: data.causal_relationships || [],
        risk_factors: data.risk_factors || [],
        confidence_score: data.confidence_score || 60,
        data_quality: data.data_quality || 'good',
        next_steps: data.next_steps || [],
        summary: data.summary,
        voice_response: data.voice_response,
        audio: data.audio,
        audioContentType: data.audioContentType
      },
      metadata: {
        source: data.source || 'backend',
        timestamp: new Date().toISOString(),
        model_used: data.source === 'gemini' ? 'Google Gemini' : (data.source === 'ollama' ? 'Local Ollama' : 'Fallback'),
        processing_time: '< 2s'
      },
      raw_data: data
    };
  }

  private updateContext(query: string, response: AIAnalysisResponse) {
    const summary = response.analysis.summary
      || response.analysis.insights?.slice(0, 2).join('; ')
      || response.analysis.recommendations?.slice(0, 1).join('; ')
      || 'Response recorded';

    this.recentTurns = [...this.recentTurns, { query, summary }].slice(-6);
  }

  // Generate TTS for any text
  async generateTTS(text: string, voiceId?: string): Promise<{ success: boolean; audio?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        return { success: false, error: 'TTS generation failed' };
      }
    } catch (error) {
      console.error('TTS request failed:', error);
      return { success: false, error: 'TTS service unavailable' };
    }
  }

  // Play audio from base64 data with speaking state callbacks
  async playAudio(
    audioBase64: string, 
    contentType: string = 'audio/mpeg',
    onSpeakingStart?: () => void,
    onSpeakingEnd?: () => void,
    onAudioLevel?: (level: number) => void
  ): Promise<void> {
    try {
      // Convert base64 to blob
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: contentType });
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      let audioContext: AudioContext | null = null;
      let analyser: AnalyserNode | null = null;
      let animationId: number | null = null;

      // Set up audio analysis for visual feedback
      if (onAudioLevel && typeof AudioContext !== 'undefined') {
        try {
          audioContext = new AudioContext();
          const source = audioContext.createMediaElementSource(audio);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          
          source.connect(analyser);
          analyser.connect(audioContext.destination);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const updateAudioLevel = () => {
            if (analyser) {
              analyser.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              const normalizedLevel = Math.min(average / 128, 1);
              onAudioLevel(normalizedLevel);
              
              animationId = requestAnimationFrame(updateAudioLevel);
            }
          };
          
          updateAudioLevel();
        } catch (audioContextError) {
          console.warn('Audio analysis not available:', audioContextError);
        }
      }
      
      return new Promise((resolve, reject) => {
        audio.onplay = () => {
          console.log('🔊 Audio started playing');
          onSpeakingStart?.();
        };
        
        audio.onended = () => {
          console.log('🔇 Audio finished playing');
          onSpeakingEnd?.();
          if (animationId) cancelAnimationFrame(animationId);
          if (audioContext) audioContext.close();
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          onSpeakingEnd?.();
          if (animationId) cancelAnimationFrame(animationId);
          if (audioContext) audioContext.close();
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Audio playback failed:', error);
      onSpeakingEnd?.();
      throw error;
    }
  }

  private getFallbackResponse(request: AIAnalysisRequest): AIAnalysisResponse {
    const fallbackData = this.getDomainFallback(request.domain);
    
    return {
      success: true,
      domain: request.domain,
      analysis: {
        insights: fallbackData.insights,
        recommendations: fallbackData.recommendations,
        causal_relationships: fallbackData.causal_relationships,
        confidence_score: fallbackData.confidence_score,
        data_quality: 'demo',
        next_steps: fallbackData.next_steps,
        voice_response: fallbackData.voice_response
      },
      metadata: {
        source: 'fallback_demo_data',
        timestamp: new Date().toISOString(),
        model_used: 'demo_model',
        processing_time: '< 0.1s'
      }
    };
  }

  private getDomainFallback(domain: string) {
    const fallbacks = {
      agriculture: {
        insights: [
          'Current soil conditions show optimal moisture levels for crop development',
          'Weather patterns indicate favorable growing conditions for the next 7-14 days',
          'Nutrient analysis reveals balanced NPK levels with slight phosphorus deficiency'
        ],
        recommendations: [
          'Apply phosphorus-rich fertilizer within next 5 days for optimal uptake',
          'Monitor irrigation schedule - reduce frequency by 20% due to expected rainfall',
          'Schedule pest monitoring as warmer temperatures may increase activity'
        ],
        causal_relationships: [
          { source: 'soil_moisture', target: 'crop_health', strength: 0.85, type: 'positive' as const },
          { source: 'rainfall', target: 'irrigation_needs', strength: 0.9, type: 'negative' as const },
          { source: 'temperature', target: 'pest_activity', strength: 0.7, type: 'positive' as const }
        ],
        confidence_score: 78,
        voice_response: 'Your agricultural analysis shows excellent progress! Soil conditions are optimal with good moisture levels, and weather patterns favor crop development. I recommend applying phosphorus-rich fertilizer within the next 5 days and monitoring for pest activity as temperatures rise.',
        next_steps: [
          'Continue monitoring soil moisture daily',
          'Implement integrated pest management protocol',
          'Plan harvest timing based on maturity indicators'
        ]
      },
      health: {
        insights: [
          'Vital signs indicate stable cardiovascular function with room for optimization',
          'Activity patterns suggest adequate physical engagement with sleep quality concerns',
          'Stress indicators are within manageable range but trending upward'
        ],
        recommendations: [
          'Implement consistent sleep hygiene routine targeting 7-8 hours nightly',
          'Consider stress reduction techniques such as mindfulness or yoga',
          'Monitor blood pressure weekly and maintain activity log'
        ],
        causal_relationships: [
          { source: 'sleep_quality', target: 'stress_levels', strength: 0.8, type: 'negative' as const },
          { source: 'physical_activity', target: 'cardiovascular_health', strength: 0.9, type: 'positive' as const },
          { source: 'stress', target: 'blood_pressure', strength: 0.75, type: 'positive' as const }
        ],
        confidence_score: 82,
        voice_response: 'Your health analysis shows stable vital signs and good cardiovascular function. I recommend focusing on sleep hygiene for better rest and incorporating stress reduction techniques like mindfulness to optimize your overall wellness.',
        next_steps: [
          'Schedule follow-up health assessment in 4 weeks',
          'Track daily wellness metrics using recommended apps',
          'Consult healthcare provider if symptoms persist'
        ]
      },
      finance: {
        insights: [
          'Portfolio allocation shows balanced risk distribution across asset classes',
          'Recent market volatility has minimal impact due to diversification strategy',
          'Cash flow analysis indicates healthy emergency fund coverage'
        ],
        recommendations: [
          'Consider rebalancing if equity allocation exceeds 70% due to market gains',
          'Explore tax-loss harvesting opportunities in non-retirement accounts',
          'Review and potentially increase retirement contributions by 2-3%'
        ],
        causal_relationships: [
          { source: 'diversification', target: 'portfolio_stability', strength: 0.85, type: 'positive' as const },
          { source: 'market_volatility', target: 'portfolio_risk', strength: 0.6, type: 'positive' as const },
          { source: 'emergency_fund', target: 'financial_security', strength: 0.9, type: 'positive' as const }
        ],
        confidence_score: 79,
        voice_response: 'Your financial portfolio demonstrates balanced risk distribution and healthy diversification. Consider rebalancing if equity allocation exceeds 70% and explore tax-loss harvesting opportunities to optimize your returns.',
        next_steps: [
          'Schedule quarterly portfolio review',
          'Research ESG investment options for values alignment',
          'Consider dollar-cost averaging for new contributions'
        ]
      },
      education: {
        insights: [
          'Learning progress shows strong conceptual understanding with application gaps',
          'Engagement metrics indicate high motivation but inconsistent study patterns',
          'Knowledge retention rates are above average for visual learning materials'
        ],
        recommendations: [
          'Implement spaced repetition system for better long-term retention',
          'Focus on practical applications and project-based learning',
          'Establish consistent daily study schedule with 25-minute focused sessions'
        ],
        causal_relationships: [
          { source: 'study_consistency', target: 'knowledge_retention', strength: 0.8, type: 'positive' as const },
          { source: 'practical_application', target: 'concept_mastery', strength: 0.85, type: 'positive' as const },
          { source: 'visual_materials', target: 'engagement', strength: 0.75, type: 'positive' as const }
        ],
        confidence_score: 77,
        voice_response: 'Your learning progress shows strong conceptual understanding with great potential. I recommend implementing spaced repetition for better retention and focusing on practical applications to strengthen your knowledge mastery.',
        next_steps: [
          'Create personalized study schedule with built-in breaks',
          'Seek peer study groups for collaborative learning',
          'Track progress with objective assessments monthly'
        ]
      },
      transport: {
        insights: [
          'Current route optimization shows potential 15-20% time savings during peak hours',
          'Traffic pattern analysis reveals consistent bottlenecks at 3 key intersections',
          'Fuel efficiency metrics indicate room for improvement through driving behavior changes'
        ],
        recommendations: [
          'Utilize alternative routes during 7-9 AM and 5-7 PM periods',
          'Implement eco-driving techniques to improve fuel efficiency by 10-15%',
          'Consider public transport integration for high-congestion corridors'
        ],
        causal_relationships: [
          { source: 'traffic_congestion', target: 'travel_time', strength: 0.9, type: 'positive' as const },
          { source: 'route_optimization', target: 'fuel_consumption', strength: 0.7, type: 'negative' as const },
          { source: 'driving_behavior', target: 'safety_score', strength: 0.8, type: 'positive' as const }
        ],
        confidence_score: 81,
        voice_response: 'Your transportation analysis reveals excellent optimization opportunities! Route efficiency can be improved by 15-20% during peak hours. I recommend using alternative routes and implementing eco-driving techniques for better fuel efficiency.',
        next_steps: [
          'Install navigation app with real-time traffic updates',
          'Monitor fuel consumption weekly for efficiency trends',
          'Evaluate public transport options for regular commutes'
        ]
      },
      universal: {
        insights: [
          'Cross-domain analysis reveals interconnected optimization opportunities',
          'Data correlation shows health metrics improve with better time management',
          'Financial and environmental goals align through sustainable choices'
        ],
        recommendations: [
          'Develop integrated dashboard for holistic life optimization',
          'Focus on keystone habits that positively impact multiple domains',
          'Implement decision framework considering multi-domain consequences'
        ],
        causal_relationships: [
          { source: 'time_management', target: 'health_metrics', strength: 0.7, type: 'positive' as const },
          { source: 'sustainable_choices', target: 'financial_savings', strength: 0.6, type: 'positive' as const },
          { source: 'holistic_planning', target: 'goal_achievement', strength: 0.85, type: 'positive' as const }
        ],
        confidence_score: 76,
        voice_response: 'Your universal analysis shows exciting cross-domain optimization opportunities! Health metrics improve with better time management, and your financial and environmental goals align perfectly through sustainable choices. Focus on keystone habits for maximum impact.',
        next_steps: [
          'Create unified tracking system across all life domains',
          'Identify and prioritize keystone habit implementations',
          'Schedule monthly cross-domain review sessions'
        ]
      }
    };

    return fallbacks[domain as keyof typeof fallbacks] || fallbacks.universal;
  }

  // Convert AI response to graph data for visualization
  generateGraphData(response: AIAnalysisResponse) {
    const nodes = new Set<string>();
    const links: Array<{ source: string; target: string; value: number }> = [];

    // Add nodes and links from causal relationships
    response.analysis.causal_relationships.forEach((rel) => {
      nodes.add(rel.source);
      nodes.add(rel.target);
      links.push({
        source: rel.source,
        target: rel.target,
        value: Math.round(rel.strength * 10) // Scale for visualization
      });
    });

    // Convert nodes to required format
    const nodeArray = Array.from(nodes).map((id, index) => ({
      id,
      label: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      group: index % 6 // Color groups
    }));

    return {
      nodes: nodeArray,
      links: links
    };
  }

  // Status check for UI
  async getSystemStatus() {
    const health = await this.checkHealth();
    return {
      ai_backend: health.status,
      local_models: health.models?.length || 0,
      fallback_active: health.status !== 'healthy'
    };
  }
}

// Export singleton instance
export const localAI = new LocalAIService();

// Export types and service
export default LocalAIService;