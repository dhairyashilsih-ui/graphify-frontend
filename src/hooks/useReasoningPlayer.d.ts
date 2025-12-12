export interface ReasoningStep {
  title: string;
  text: string;
  keywords?: string[];
}

export interface UseReasoningPlayerReturn {
  steps: ReasoningStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  graphData: any;
  graphVersion: number;
  summaryGraphData: any;
  isInSummary: boolean;
  showSummary: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
  jumpToStep: (index: number) => void;
  viewSummary: () => void;
  goBackToSteps: () => void;
  startReasoning: (steps: any[], keywords?: any[]) => void;
  showSummaryGraph: () => void;
  cleanup: () => void;
}

export function useReasoningPlayer(
  reasoningText?: string,
  graphDataInput?: any,
  autoPlay?: boolean
): UseReasoningPlayerReturn;
