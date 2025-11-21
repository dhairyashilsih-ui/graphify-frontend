import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Brain, Zap, Network, Cpu, Sparkles, Layers } from 'lucide-react';
import EnhancedUniversalAIOrb from '../components/EnhancedUniversalAIOrb';
import InputPanel from '../components/InputPanel';
import GraphView from '../components/GraphView';

interface UniversalAIProps {
  onBack: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: any;
  content: string;
  expanded: boolean;
}

export default function UniversalAI({ onBack }: UniversalAIProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'reasoning',
      title: 'Advanced Reasoning',
      icon: Brain,
      content: 'Multi-step logical reasoning capabilities enhanced. Complex problem-solving accuracy improved by 34%. Causal inference models performing exceptionally.',
      expanded: false,
    },
    {
      id: 'multimodal',
      title: 'Multimodal Processing',
      icon: Layers,
      content: 'Text, image, audio, and video processing unified. Cross-modal understanding achieved 96% accuracy. Semantic alignment across modalities optimized.',
      expanded: false,
    },
    {
      id: 'learning',
      title: 'Adaptive Learning',
      icon: Zap,
      content: 'Continuous learning from user interactions. Knowledge base updated in real-time. Few-shot learning capabilities expanded to new domains.',
      expanded: false,
    },
    {
      id: 'networking',
      title: 'Neural Networks',
      icon: Network,
      content: 'Transformer architecture optimized for efficiency. Attention mechanisms refined for better context understanding. Model compression achieving 60% size reduction.',
      expanded: false,
    },
    {
      id: 'compute',
      title: 'Compute Optimization',
      icon: Cpu,
      content: 'Inference speed improved 45% through hardware acceleration. Memory usage optimized for edge deployment. Distributed computing scaling effectively.',
      expanded: false,
    },
    {
      id: 'creativity',
      title: 'Creative Intelligence',
      icon: Sparkles,
      content: 'Generative capabilities expanded across domains. Novel solution generation showing breakthrough results. Creative reasoning patterns emerging from training.',
      expanded: false,
    },
  ]);

  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisSteps] = useState([
    "Initializing universal AI analysis...",
    "Analyzing cross-domain patterns...",
    "Evaluating multi-modal data inputs...",
    "Processing neural network connections...",
    "Assessing knowledge graph correlations...",
    "Integrating machine learning models...",
    "Building comprehensive AI framework...",
    "Optimizing universal intelligence pathways...",
    "Finalizing omniscient reasoning system..."
  ]);

  const toggleSection = (id: string) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, expanded: !s.expanded } : s
    ));
  };

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(true);
    setCurrentStep(0);

    const allNodes = [
      { id: 'input', label: 'Input Data', group: 0 },
      { id: 'processing', label: 'AI Processing', group: 1 },
      { id: 'reasoning', label: 'Reasoning', group: 2 },
      { id: 'knowledge', label: 'Knowledge Base', group: 3 },
      { id: 'generation', label: 'Generation', group: 4 },
      { id: 'output', label: 'Intelligent Output', group: 5 },
      { id: 'learning', label: 'Machine Learning', group: 6 },
      { id: 'neural', label: 'Neural Networks', group: 7 },
      { id: 'optimization', label: 'AI Optimization', group: 8 },
    ];

    const allLinks = [
      { source: 'input', target: 'processing', value: 5 },
      { source: 'processing', target: 'reasoning', value: 4 },
      { source: 'knowledge', target: 'reasoning', value: 4 },
      { source: 'reasoning', target: 'generation', value: 5 },
      { source: 'generation', target: 'output', value: 5 },
      { source: 'processing', target: 'output', value: 3 },
      { source: 'learning', target: 'processing', value: 4 },
      { source: 'neural', target: 'learning', value: 5 },
      { source: 'neural', target: 'reasoning', value: 4 },
      { source: 'optimization', target: 'generation', value: 3 },
      { source: 'knowledge', target: 'learning', value: 3 },
    ];

    setGraphData({ nodes: allNodes, links: allLinks });

    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsAnalyzing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-8"
    >
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back to Domains</span>
      </motion.button>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Universal AI
          </h1>
          <p className="text-gray-400 text-lg">Next-generation artificial general intelligence</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <EnhancedUniversalAIOrb isActive={isAnalyzing} image="/universal-ai.png" />
        </motion.div>

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-purple-500/20 border border-purple-500/50 rounded-full px-6 py-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"
              />
              <span className="text-purple-400 font-semibold">Analyzing with GraphoraX Intelligence...</span>
            </div>
          </motion.div>
        )}

        {/* Responsive Layout Container */}
        <motion.div
          layout
          className={`transition-all duration-700 ease-in-out ${
            showResults 
              ? 'flex flex-col lg:flex-row gap-6 items-start' 
              : 'block'
          }`}
        >
          {/* Input Panel - Shrinks and moves left when results show */}
          <motion.div
            layout
            className={`transition-all duration-700 ease-in-out ${
              showResults 
                ? 'w-full lg:w-1/3 lg:sticky lg:top-8' 
                : 'w-full'
            }`}
          >
            <InputPanel onSubmit={handleSubmit} isLoading={isAnalyzing} />
          </motion.div>

          {/* Graph View - Appears on the right when results show */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
              className="w-full lg:w-2/3"
            >
              <GraphView 
                nodes={graphData.nodes} 
                links={graphData.links} 
                isProgressive={isAnalyzing}
                currentStep={currentStep}
                analysisSteps={analysisSteps}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Analysis Sections - Shows below the side-by-side layout */}
        {showResults && (

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-white">{section.title}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: section.expanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: section.expanded ? 'auto' : 0,
                      opacity: section.expanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-300 leading-relaxed">
                      {section.content}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
      </div>
    </motion.div>
  );
}