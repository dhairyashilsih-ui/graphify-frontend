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
  const playStep = useCallback((stepIndex, steps, summaryGraph) => {
    if (stepIndex >= steps.length) {
      // All steps complete - show summary graph
      setGraphData({ ...summaryGraph, autoZoom: true });
      setGraphVersion(prev => prev + 1);
      setShowSummary(true);
      setIsPlaying(false);
      return;
    }

    const step = steps[stepIndex];
    setCurrentStepIndex(stepIndex);

    // Build graph from keywords using specified shape
    const stepGraph = buildGraphFromKeywords(
      step.keywords, 
      step.graphShape,
      700,
      550
    );
    
    // Add layout type to graph data for renderer
    stepGraph.layout = step.graphShape;
    
    setGraphData(stepGraph);
    setGraphVersion(prev => prev + 1);
    setShowSummary(false);

    // Speak the step text
    initializeVoice();
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.speak(step.text, {
        onEnd: () => {
          // Wait 800ms then play next step
          setTimeout(() => {
            playStep(stepIndex + 1, steps, summaryGraph);
          }, 800);
        },
        onError: (error) => {
          console.error('Voice error:', error);
          // Continue to next step even if voice fails
          setTimeout(() => {
            playStep(stepIndex + 1, steps, summaryGraph);
          }, 2000);
        }
      });
    } else {
      // No voice - just delay and continue
      setTimeout(() => {
        playStep(stepIndex + 1, steps, summaryGraph);
      }, 2000);
    }
  }, [initializeVoice]);

  /**
   * Start reasoning playback
   */
  const startReasoning = useCallback((steps, summaryKeywords) => {
    if (!steps || steps.length === 0) {
      console.error('No steps provided for reasoning');
      return;
    }

    // Store refs
    stepsRef.current = steps;
    
    // Build summary graph from keywords using cluster layout
    const summaryGraph = buildGraphFromKeywords(
      summaryKeywords,
      'cluster',
      700,
      550
    );
    summaryGraph.layout = 'cluster';
    summaryGraphRef.current = summaryGraph;

    // Start playback
    setIsPlaying(true);
    setCurrentStepIndex(0);
    setShowSummary(false);
    
    playStep(0, steps, summaryGraph);
  }, [playStep]);

  /**
   * Reset player state
   */
  const resetPlayer = useCallback(() => {
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.cancel();
    }
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
      setGraphData({ ...summaryGraphRef.current, autoZoom: true });
      setGraphVersion(prev => prev + 1);
      setShowSummary(true);
      setIsPlaying(false);
      
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
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.cancel();
      voiceAssistantRef.current = null;
    }
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
