import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { sendToGroqJSON, type GroqMessage } from '../services/groqAI';
import { VoiceAssistant } from '../services/voiceAssistant';
import { generateSessionId, getStoredSessionId, setStoredSessionId } from '../services/mongodb';
import { validateReasoningResponse } from '../utils/reasoningValidator';

interface ReasoningNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

interface ReasoningEdge {
  source: string;
  target: string;
}

interface ReasoningResponse {
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
  reasoning: string[];
  unavailable?: boolean;
}

interface AgricultureReasoningProps {
  onBack: () => void;
}

export default function AgricultureReasoning({ onBack }: AgricultureReasoningProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<ReasoningResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphVersion, setGraphVersion] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fullAnswer, setFullAnswer] = useState('');
  const [graphUnavailable, setGraphUnavailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionIdRef = useRef<string>('');
  const historyRef = useRef<Array<{ q: string; a: string }>>([]);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const inputControls = useAnimation();
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant();
    sessionIdRef.current = getStoredSessionId() || generateSessionId();
    setStoredSessionId(sessionIdRef.current);
    return () => {
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.stopSpeaking();
      }
    };
  }, []);

  // Real AI reasoning with Groq
  const fetchReasoning = async (query: string): Promise<ReasoningResponse & { finalAnswer: string }> => {
    const contextLines = historyRef.current.slice(-5).map((t, idx) => `${idx + 1}. Q: ${t.q}\nA: ${t.a}`).join('\n');

    const prompt: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are Krushimitra, an expert agricultural AI assistant. Return ONLY valid JSON with fields: reasoning (array of 4-6 concise steps), causal_graph { nodes: [{id,label,type}], links: [{source,target,relation,strength}] }, and final_answer (concise but practical). Do not include prose outside JSON.'
      },
      {
        role: 'user',
        content: `${contextLines ? `Recent context (session ${sessionIdRef.current}):\n${contextLines}\n\n` : ''}Question: ${query}\nProvide the JSON object now.`
      }
    ];

    const jsonResponse = await sendToGroqJSON(prompt, { sessionId: sessionIdRef.current });
    const validation = validateReasoningResponse(jsonResponse);

    if (!validation.ok || !validation.data) {
      console.warn('Reasoning validation failed:', validation);
      throw new Error(validation.error || 'Reasoning format error, please try again.');
    }

    const { steps, causal_graph, final_answer } = validation.data;
    const reasoning: string[] = steps.map((step) => {
      if (step.text) return `${step.title}: ${step.text}`.trim();
      return step.title;
    });

    const graphUnavailable = !causal_graph || !causal_graph.nodes?.length || !causal_graph.links?.length;

    const nodes: ReasoningNode[] = graphUnavailable
      ? []
      : causal_graph.nodes.map((n: any) => ({ id: n.id, label: n.label, x: undefined, y: undefined }));

    const edges: ReasoningEdge[] = graphUnavailable
      ? []
      : causal_graph.links.map((l: any, idx: number) => ({
          source: typeof l.source === 'string' ? l.source : l.source.id || `s-${idx}`,
          target: typeof l.target === 'string' ? l.target : l.target.id || `t-${idx}`
        }));

    const finalAnswer = final_answer || '';

    historyRef.current = [
      ...historyRef.current,
      { q: query, a: finalAnswer || reasoning.join(' ') || 'Answer recorded' }
    ].slice(-6);

    return {
      nodes,
      edges,
      reasoning,
      unavailable: graphUnavailable,
      finalAnswer
    };
  };

  // Text-to-Speech with step highlighting using VoiceAssistant
  const speakReasoning = (steps: string[]) => {
    if (!steps.length || !voiceAssistantRef.current) return;
    
    setIsSpeaking(true);
    setCurrentStep(0);
    
    const speak = (index: number) => {
      if (index >= steps.length) {
        if (fullAnswer && voiceAssistantRef.current) {
          voiceAssistantRef.current.speak(
            fullAnswer,
            () => {},
            () => {
              setIsSpeaking(false);
            }
          );
        } else {
          setIsSpeaking(false);
        }
        return;
      }
      
      setCurrentStep(index);
      
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.speak(
          steps[index],
          () => {}, // onStart
          () => setTimeout(() => speak(index + 1), 500) // onEnd - move to next step
        );
      }
    };
    
    speak(0);
  };

  // D3 Graph Rendering - Updates when graphData changes (each step)
  useEffect(() => {
    if (!graphData || !svgRef.current || !showGraph) return;
    if (graphUnavailable || !graphData.nodes || graphData.nodes.length === 0) return;

    console.log('Rendering graph with nodes:', graphData.nodes.map(n => n.id));

    const svg = select(svgRef.current);
    
    // Clear and re-render immediately
    svg.selectAll('*').remove();
    svg.style('opacity', 0);
    
    const width = 600;
    const height = 500;
    const nodeRadius = 40;

    // Deep copy nodes and edges for force simulation
    const nodes = graphData.nodes.map(n => ({ ...n }));
    const edges = graphData.edges.map(e => ({ ...e }));

    // Create force simulation
    const simulation = forceSimulation(nodes)
      .force('link', forceLink(edges)
        .id((d: any) => d.id)
        .distance(120))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(nodeRadius + 10));

    // Create container group
    const g = svg.append('g');

    // Add zoom behavior
    const zoomBehavior = zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior as any);

    // Add gradient and filters FIRST
    const defs = svg.append('defs');
    
    // Gradient for nodes
    const gradient = defs.append('radialGradient')
      .attr('id', 'nodeGradient');
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#34d399');
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#059669');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', nodeRadius + 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#4ade80');

    // Draw edges
    const links = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const nodeGroups = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer');

    // Node circles with glow effect
    nodeGroups.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', 'url(#nodeGradient)')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => i * 200)
      .duration(800)
      .style('opacity', 1);

    // Node labels
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .text(d => {
        const maxLen = 15;
        return d.label.length > maxLen ? d.label.substring(0, maxLen) + '...' : d.label;
      })
      .transition()
      .delay((d, i) => i * 200 + 400)
      .duration(600)
      .style('opacity', 1);

    // Add title for full text on hover
    nodeGroups.append('title').text(d => d.label);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Fade in new graph
    svg.transition()
      .duration(500)
      .style('opacity', 1);

    return () => {
      simulation.stop();
    };
  }, [graphData, showGraph, graphVersion, graphUnavailable]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setShowGraph(true);
    setGraphUnavailable(false);
    setErrorMessage(null);

    try {
      const result = await fetchReasoning(inputText);
      setGraphData({ nodes: result.nodes, edges: result.edges, reasoning: result.reasoning, unavailable: result.unavailable });
      setFullAnswer(result.finalAnswer);
      setGraphUnavailable(!!result.unavailable);
      setIsProcessing(false);
      setGraphVersion(prev => prev + 1);

      setTimeout(() => {
        speakReasoning(result.reasoning || []);
      }, 600);
    } catch (error) {
      console.error('Failed to fetch reasoning:', error);
      const message = error instanceof Error ? error.message : 'Reasoning format error, please try again.';
      setErrorMessage(message);
      setGraphData(null);
      setGraphUnavailable(true);
      setShowGraph(false);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    voiceAssistantRef.current?.stopSpeaking();
    setShowGraph(false);
    setGraphData(null);
    setCurrentStep(0);
    setIsSpeaking(false);
    setFullAnswer('');
    setGraphUnavailable(false);
    setErrorMessage(null);
    setInputText('');
    historyRef.current = [];
    sessionIdRef.current = generateSessionId();
    setStoredSessionId(sessionIdRef.current);
    inputControls.start({
      width: '100%',
      x: 0,
      transition: { type: 'spring', damping: 20, stiffness: 100 }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(52, 211, 153, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full transition-all backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          Agriculture Reasoning AI
        </h1>
        <div className="w-24" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] p-8">
        <AnimatePresence mode="wait">
          {!showGraph ? (
            /* Input Section - Full Screen */
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-slate-900/40 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-emerald-300 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Ask Your Agriculture Question
                </h2>
                
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="E.g., What fertilizer should I use for wheat in alkaline soil?"
                  className="w-full h-32 bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  disabled={isProcessing}
                />

                {errorMessage && (
                  <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {errorMessage}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Reasoning View - Split Screen */
            <motion.div
              key="reasoning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex gap-6"
            >
              {/* Left: Reasoning Steps */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 shadow-2xl"
              >
                <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Reasoning Process
                </h3>

                {/* Reasoning Steps */}
                <div className="space-y-3">
                  {graphData?.reasoning?.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: index <= currentStep ? 1 : 0.3,
                        x: 0,
                        scale: index === currentStep && isSpeaking ? 1.05 : 1
                      }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl ${
                        index === currentStep && isSpeaking
                          ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                          : 'bg-slate-800/30 border border-slate-700/50'
                      }`}
                    >
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <span className="font-bold text-emerald-400 text-base">Step {index + 1}:</span> {step}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Full Answer */}
                {fullAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl p-5"
                  >
                    <h4 className="text-base font-bold text-emerald-300 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Detailed Recommendation
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed">{fullAnswer}</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Right: Graph Visualization */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 shadow-2xl"
              >
                <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Causal Graph
                </h3>

                {/* SVG Graph */}
                <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-emerald-500/20 min-h-[240px] flex items-center justify-center">
                  {graphUnavailable || !graphData?.nodes?.length ? (
                    <div className="text-center text-emerald-300/70 py-10 px-6">
                      <p className="font-semibold">Graph unavailable / reasoning not visualized.</p>
                      <p className="text-sm text-emerald-200/70 mt-2">The model did not return a structured causal graph.</p>
                    </div>
                  ) : (
                    <svg
                      key={`graph-${graphVersion}`}
                      ref={svgRef}
                      width="600"
                      height="500"
                      className="w-full h-auto"
                    />
                  )}
                </div>
                <div className="mt-2 text-xs text-emerald-400/60 text-center">
                  {graphUnavailable ? 'Graph not available for this answer' : `Step ${currentStep + 1} / ${graphData?.reasoning.length || 0}`}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
