import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { sendToGroq, type GroqMessage } from '../services/groqAI';
import { VoiceAssistant } from '../services/voiceAssistant';

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
}

interface AgricultureReasoningProps {
  onBack: () => void;
}

export default function AgricultureReasoning({ onBack }: AgricultureReasoningProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<ReasoningResponse | null>(null);
  const [stepGraphs, setStepGraphs] = useState<ReasoningResponse[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphVersion, setGraphVersion] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fullAnswer, setFullAnswer] = useState('');
  
  const svgRef = useRef<SVGSVGElement>(null);
  const inputControls = useAnimation();
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant();
    return () => {
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.stopSpeaking();
      }
    };
  }, []);

  // Real AI reasoning with Groq
  const fetchReasoning = async (query: string): Promise<{ graphData: ReasoningResponse, stepGraphs: ReasoningResponse[] }> => {
    // Step 1: Get reasoning steps first
    const stepsPrompt: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are an agricultural AI expert. Break down the answer into 4-6 clear reasoning steps. Return ONLY valid JSON: {"reasoning": ["step 1 text", "step 2 text", ...]}'
      },
      {
        role: 'user',
        content: `Question: ${query}\n\nGenerate reasoning steps JSON:`
      }
    ];

    const stepsResponse = await sendToGroq(stepsPrompt);
    
    // Parse reasoning steps
    let reasoningSteps: string[] = [];
    try {
      const jsonMatch = stepsResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        reasoningSteps = parsed.reasoning || [];
      }
    } catch (error) {
      console.error('Failed to parse steps, using fallback:', error);
      reasoningSteps = [
        'Analyzing your agriculture question...',
        'Processing relevant data...',
        'Evaluating best practices...',
        'Formulating recommendation...'
      ];
    }

    // Generate unique graph structure for each step with distinct patterns
    const stepGraphsData: ReasoningResponse[] = [];
    
    // Diverse graph patterns that explain agricultural reasoning
    const graphPatterns = [
      { // Pattern 1: Initial Analysis - Linear Flow
        nodes: [
          { id: '1', label: 'Question' },
          { id: '2', label: 'Context' },
          { id: '3', label: 'Analysis' },
          { id: '4', label: 'Direction' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '2', target: '3' },
          { source: '3', target: '4' }
        ]
      },
      { // Pattern 2: Multi-Factor Analysis - Branching
        nodes: [
          { id: '1', label: 'Problem' },
          { id: '2', label: 'Soil' },
          { id: '3', label: 'Climate' },
          { id: '4', label: 'Water' },
          { id: '5', label: 'Impact' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '1', target: '3' },
          { source: '1', target: '4' },
          { source: '2', target: '5' },
          { source: '3', target: '5' },
          { source: '4', target: '5' }
        ]
      },
      { // Pattern 3: Data Integration - Convergent
        nodes: [
          { id: '1', label: 'Research' },
          { id: '2', label: 'Experience' },
          { id: '3', label: 'Synthesis' },
          { id: '4', label: 'Strategy' }
        ],
        edges: [
          { source: '1', target: '3' },
          { source: '2', target: '3' },
          { source: '3', target: '4' }
        ]
      },
      { // Pattern 4: Feedback Loop - Open Chain
        nodes: [
          { id: '1', label: 'Apply' },
          { id: '2', label: 'Monitor' },
          { id: '3', label: 'Evaluate' },
          { id: '4', label: 'Adjust' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '2', target: '3' },
          { source: '3', target: '4' }
        ]
      },
      { // Pattern 5: Central Concept - Hub
        nodes: [
          { id: '1', label: 'Core Solution' },
          { id: '2', label: 'Timing' },
          { id: '3', label: 'Method' },
          { id: '4', label: 'Resources' },
          { id: '5', label: 'Benefits' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '1', target: '3' },
          { source: '1', target: '4' },
          { source: '1', target: '5' }
        ]
      },
      { // Pattern 6: Parallel Approaches - Diamond
        nodes: [
          { id: '1', label: 'Goal' },
          { id: '2', label: 'Option A' },
          { id: '3', label: 'Option B' },
          { id: '4', label: 'Compare' },
          { id: '5', label: 'Decide' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '1', target: '3' },
          { source: '2', target: '4' },
          { source: '3', target: '4' },
          { source: '4', target: '5' }
        ]
      },
      { // Pattern 7: Implementation Steps - Sequential
        nodes: [
          { id: '1', label: 'Prepare' },
          { id: '2', label: 'Execute' },
          { id: '3', label: 'Verify' },
          { id: '4', label: 'Optimize' },
          { id: '5', label: 'Complete' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '2', target: '3' },
          { source: '3', target: '4' },
          { source: '4', target: '5' }
        ]
      },
      { // Pattern 8: Hierarchical Breakdown - Tree
        nodes: [
          { id: '1', label: 'Main Goal' },
          { id: '2', label: 'Short-Term' },
          { id: '3', label: 'Long-Term' },
          { id: '4', label: 'Task 1' },
          { id: '5', label: 'Task 2' },
          { id: '6', label: 'Task 3' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '1', target: '3' },
          { source: '2', target: '4' },
          { source: '2', target: '5' },
          { source: '3', target: '6' }
        ]
      }
    ];
    
    // Assign different pattern to each step with unique node IDs
    for (let i = 0; i < reasoningSteps.length; i++) {
      const pattern = graphPatterns[i % graphPatterns.length];
      
      // Deep copy nodes and edges with unique IDs for this step
      const stepNodes = pattern.nodes.map(node => ({
        id: `step${i}-${node.id}`,
        label: node.label,
        x: undefined,
        y: undefined
      }));
      
      const stepEdges = pattern.edges.map(edge => ({
        source: `step${i}-${edge.source}`,
        target: `step${i}-${edge.target}`
      }));
      
      stepGraphsData.push({
        nodes: stepNodes,
        edges: stepEdges,
        reasoning: reasoningSteps
      });
    }
    
    console.log('Generated step graphs:', stepGraphsData.map((g, i) => ({ 
      step: i, 
      nodeCount: g.nodes.length, 
      edgeCount: g.edges.length,
      firstNodeId: g.nodes[0]?.id 
    })));
    
    setStepGraphs(stepGraphsData);
    
    // Set initial graph data from first step
    const graphData: ReasoningResponse = {
      nodes: stepGraphsData[0]?.nodes || [],
      edges: stepGraphsData[0]?.edges || [],
      reasoning: reasoningSteps
    };

    // Step 2: Get detailed answer
    const answerPrompt: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are Krushimitra, an expert agricultural AI assistant. Provide detailed, practical advice for farmers. Be concise but thorough.'
      },
      {
        role: 'user',
        content: query
      }
    ];

    const detailedAnswer = await sendToGroq(answerPrompt);
    setFullAnswer(detailedAnswer);

    return { graphData, stepGraphs: stepGraphsData };
  };

  // Text-to-Speech with step highlighting using VoiceAssistant
  const speakReasoning = (steps: string[], graphs: ReasoningResponse[]) => {
    if (!steps.length || !voiceAssistantRef.current) return;
    
    setIsSpeaking(true);
    setCurrentStep(0);
    
    const speak = (index: number) => {
      if (index >= steps.length) {
        // After reasoning steps, speak the full answer
        if (fullAnswer && voiceAssistantRef.current) {
          voiceAssistantRef.current.speak(
            fullAnswer,
            () => {}, // onStart
            () => {
              setIsSpeaking(false);
              // After everything is done, reset to show input again immediately
              setShowGraph(false);
              setGraphData(null);
              setStepGraphs([]);
              setFullAnswer('');
              setCurrentStep(0);
              setGraphVersion(0);
              setInputText('');
            } // onEnd
          );
        } else {
          setIsSpeaking(false);
        }
        return;
      }
      
      setCurrentStep(index);
      
      // Update graph to show structure for current step
      if (graphs[index]) {
        console.log(`Switching to graph for step ${index}:`, graphs[index]);
        setGraphData(graphs[index]);
        setGraphVersion(prev => prev + 1); // Force graph re-render
      } else {
        console.warn(`No graph data for step ${index}`);
      }
      
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
    if (!graphData.nodes || graphData.nodes.length === 0) return;

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
  }, [graphData, showGraph, graphVersion]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setShowGraph(true);

    // Fetch reasoning data
    const { graphData, stepGraphs: fetchedGraphs } = await fetchReasoning(inputText);
    setGraphData(graphData);
    setStepGraphs(fetchedGraphs);
    setIsProcessing(false);

    // Start speaking after graph appears (use fresh stepGraphs from fetch)
    setTimeout(() => {
      speakReasoning(graphData.reasoning, fetchedGraphs);
    }, 1000);
  };

  const handleReset = () => {
    voiceAssistantRef.current?.stopSpeaking();
    setShowGraph(false);
    setGraphData(null);
    setCurrentStep(0);
    setIsSpeaking(false);
    setFullAnswer('');
    setInputText('');
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
                  {graphData?.reasoning.map((step, index) => (
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
                <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-emerald-500/20">
                  <svg
                    key={`graph-${graphVersion}`}
                    ref={svgRef}
                    width="600"
                    height="500"
                    className="w-full h-auto"
                  />
                </div>
                <div className="mt-2 text-xs text-emerald-400/60 text-center">
                  Step {currentStep + 1} / {graphData?.reasoning.length || 0}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
