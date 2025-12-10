import { useState, useRef, useCallback } from 'react';
import { VoiceAssistant } from '../services/voiceAssistant';
import { buildGraphFromKeywords } from '../utils/graphGenerator';

/**
 * NEW Reasoning Player Hook
 * Plays reasoning steps with dynamic graph generation from keywords
 */
export const useReasoningPlayer = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [graphVersion, setGraphVersion] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  const voiceAssistantRef = useRef(null);
  const stepsRef = useRef([]);
  const summaryGraphRef = useRef(null);
  const timeoutsRef = useRef([]);
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);

  const safeSetState = (setter) => {
    if (mountedRef.current) setter();
  };

  /**
   * Initialize voice assistant
   */
  const initializeVoice = useCallback(() => {
    if (!voiceAssistantRef.current) {
      voiceAssistantRef.current = new VoiceAssistant();
    }
  }, []);

  /**
   * Play a single step: speak + generate and show graph
   */
  const playStep = useCallback((stepIndex, steps, summaryGraph, runId) => {
    if (stepIndex >= steps.length) {
      // All steps complete - show summary graph
      safeSetState(() => setGraphData({ ...summaryGraph, autoZoom: true }));
      safeSetState(() => setGraphVersion(prev => prev + 1));
      safeSetState(() => setShowSummary(true));
      safeSetState(() => setIsPlaying(false));
      return;
    }

    const step = steps[stepIndex];
    safeSetState(() => setCurrentStepIndex(stepIndex));

    // Build graph from keywords using specified shape
    const stepGraph = buildGraphFromKeywords(
      step.keywords, 
      step.graphShape,
      700,
      550
    );
    
    // Add layout type to graph data for renderer
    stepGraph.layout = step.graphShape;
    
    safeSetState(() => setGraphData(stepGraph));
    safeSetState(() => setGraphVersion(prev => prev + 1));
    safeSetState(() => setShowSummary(false));

    // Speak the step text
    initializeVoice();
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.speak(step.text || step.title || '', {
        onEnd: () => {
          // Wait 800ms then play next step
          const t = setTimeout(() => {
            playStep(stepIndex + 1, steps, summaryGraph, runId);
          }, 800);
          timeoutsRef.current.push(t);
        },
        onError: (error) => {
          console.error('Voice error:', error);
          // Continue to next step even if voice fails
          const t = setTimeout(() => {
            playStep(stepIndex + 1, steps, summaryGraph, runId);
          }, 2000);
          timeoutsRef.current.push(t);
        }
      });
    } else {
      // No voice - just delay and continue
      const t = setTimeout(() => {
        playStep(stepIndex + 1, steps, summaryGraph, runId);
      }, 2000);
      timeoutsRef.current.push(t);
    }
  }, [initializeVoice]);

  /**
   * Start reasoning playback
   */
  const startReasoning = useCallback((steps, summaryKeywords) => {
    // Cancel previous run timers and voice
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    voiceAssistantRef.current?.cancel?.();

    if (!steps || steps.length === 0) {
      console.error('No steps provided for reasoning');
      safeSetState(() => {
        setGraphData(null);
        setIsPlaying(false);
        setShowSummary(false);
      });
      return;
    }

    // Store refs with defensive defaults
    stepsRef.current = steps.filter(Boolean);
    const safeKeywords = Array.isArray(summaryKeywords) ? summaryKeywords.filter(Boolean) : [];
    const summaryGraph = buildGraphFromKeywords(
      safeKeywords.length ? safeKeywords : ['Context', 'Reasoning'],
      'cluster',
      700,
      550
    );
    summaryGraph.layout = 'cluster';
    summaryGraphRef.current = summaryGraph;

    // Start playback
    safeSetState(() => setIsPlaying(true));
    safeSetState(() => setCurrentStepIndex(0));
    safeSetState(() => setShowSummary(false));
    const runId = ++runIdRef.current;
    playStep(0, stepsRef.current, summaryGraph, runId);
  }, [playStep]);

  /**
   * Reset player state
   */
  const resetPlayer = useCallback(() => {
    voiceAssistantRef.current?.cancel?.();
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setGraphData(null);
    setShowSummary(false);
    stepsRef.current = [];
    summaryGraphRef.current = null;
  }, []);

  /**
   * Jump to a specific step (for clicking on progress steps)
   */
  const jumpToStep = useCallback((stepIndex) => {
    if (!stepsRef.current || stepIndex < 0 || stepIndex >= stepsRef.current.length) {
      return;
    }

    const step = stepsRef.current[stepIndex];
    setCurrentStepIndex(stepIndex);
    setIsPlaying(false);
    setShowSummary(false);

    // Cancel any ongoing speech
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.cancel();
    }

    // Build and display the step's graph
    const stepGraph = buildGraphFromKeywords(
      step.keywords,
      step.graphShape,
      700,
      550
    );
    stepGraph.layout = step.graphShape;
    
    setGraphData(stepGraph);
    setGraphVersion(prev => prev + 1);
  }, []);

  /**
   * Show summary graph manually
   */
  const showSummaryGraph = useCallback(() => {
    if (summaryGraphRef.current) {
      safeSetState(() => setGraphData({ ...summaryGraphRef.current, autoZoom: true }));
      safeSetState(() => setGraphVersion(prev => prev + 1));
      safeSetState(() => setShowSummary(true));
      safeSetState(() => setIsPlaying(false));
      
      // Cancel any ongoing speech
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.cancel();
      }
    }
  }, []);

  /**
   * Cleanup voice on unmount
   */
  const cleanup = useCallback(() => {
    mountedRef.current = false;
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.cancel?.();
      voiceAssistantRef.current = null;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  return {
    currentStepIndex,
    isPlaying,
    graphData,
    graphVersion,
    showSummary,
    startReasoning,
    resetPlayer,
    jumpToStep,
    showSummaryGraph,
    cleanup
  };
};
