import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Activity, Heart, Pill, Brain, Trees, User } from 'lucide-react';
import EnhancedHealthOrb from '../components/EnhancedHealthOrb';
import InputPanel from '../components/InputPanel';
import GraphView from '../components/GraphView';

interface HealthProps {
  onBack: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: any;
  content: string;
  expanded: boolean;
}

export default function Health({ onBack }: HealthProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'lifestyle',
      title: 'Lifestyle & Behavior',
      icon: User,
      content: 'Sleep patterns indicate good rest quality. Recommend maintaining 7-8 hours nightly. Physical activity levels are adequate for maintaining cardiovascular health.',
      expanded: false,
    },
    {
      id: 'fitness',
      title: 'Fitness & Vitals',
      icon: Activity,
      content: 'Heart rate variability within optimal range. Blood pressure stable at 120/80. VO2 max shows improvement over last month, indicating enhanced aerobic capacity.',
      expanded: false,
    },
    {
      id: 'disease',
      title: 'Disease & Diagnosis',
      icon: Heart,
      content: 'No immediate concerns detected. Preventive screening recommended for age group. Monitor for seasonal allergies based on environmental factors.',
      expanded: false,
    },
    {
      id: 'medication',
      title: 'Medication & Treatment',
      icon: Pill,
      content: 'Current medication schedule optimal. No drug interactions detected. Consider vitamin D supplementation based on reduced sun exposure patterns.',
      expanded: false,
    },
    {
      id: 'mental',
      title: 'Mental Health',
      icon: Brain,
      content: 'Stress indicators within normal range. Recommend mindfulness practices for optimal cognitive function. Social engagement levels support positive mental wellbeing.',
      expanded: false,
    },
    {
      id: 'environment',
      title: 'Environment & Surroundings',
      icon: Trees,
      content: 'Air quality index favorable. Indoor environment humidity at optimal 45%. Reduce blue light exposure 2 hours before sleep for improved circadian rhythm.',
      expanded: false,
    },
  ]);

  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  const toggleSection = (id: string) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, expanded: !s.expanded } : s
    ));
  };

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(false);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const sampleNodes = [
      { id: 'lifestyle', label: 'Lifestyle', group: 0 },
      { id: 'sleep', label: 'Sleep', group: 1 },
      { id: 'exercise', label: 'Exercise', group: 2 },
      { id: 'vitals', label: 'Vital Signs', group: 3 },
      { id: 'mental', label: 'Mental State', group: 4 },
      { id: 'health', label: 'Overall Health', group: 5 },
    ];

    const sampleLinks = [
      { source: 'lifestyle', target: 'sleep', value: 3 },
      { source: 'lifestyle', target: 'exercise', value: 4 },
      { source: 'sleep', target: 'mental', value: 4 },
      { source: 'exercise', target: 'vitals', value: 5 },
      { source: 'mental', target: 'health', value: 4 },
      { source: 'vitals', target: 'health', value: 5 },
    ];

    setGraphData({ nodes: sampleNodes, links: sampleLinks });
    setIsAnalyzing(false);
    setShowResults(true);
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
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Health Intelligence
          </h1>
          <p className="text-gray-400 text-lg">Comprehensive AI-powered health insights</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <EnhancedHealthOrb isActive={isAnalyzing} image="/health-orb.png" />
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

        <InputPanel onSubmit={handleSubmit} isLoading={isAnalyzing} />

        {showResults && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 mb-8"
            >
              <GraphView nodes={graphData.nodes} links={graphData.links} />
            </motion.div>

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
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center">
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
          </>
        )}
      </div>
    </motion.div>
  );
}
