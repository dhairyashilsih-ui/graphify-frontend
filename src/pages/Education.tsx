import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, BookOpen, Users, GraduationCap, Target, TrendingUp, Award } from 'lucide-react';
import EnhancedEducationOrb from '../components/EnhancedEducationOrb';
import InputPanel from '../components/InputPanel';
import GraphView from '../components/GraphView';

interface EducationProps {
  onBack: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: any;
  content: string;
  expanded: boolean;
}

export default function Education({ onBack }: EducationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'learning',
      title: 'Learning Paths & Curriculum',
      icon: BookOpen,
      content: 'Personalized learning paths adapted to individual pace. Mathematics proficiency shows 23% improvement. Recommend advanced problem-solving modules.',
      expanded: false,
    },
    {
      id: 'engagement',
      title: 'Student Engagement',
      icon: Users,
      content: 'Participation levels excellent in interactive sessions. Group collaboration skills developing well. Consider peer-to-peer learning opportunities.',
      expanded: false,
    },
    {
      id: 'performance',
      title: 'Academic Performance',
      icon: GraduationCap,
      content: 'Overall GPA trending upward at 3.7. Strongest performance in STEM subjects. Language arts show steady improvement with targeted support.',
      expanded: false,
    },
    {
      id: 'goals',
      title: 'Learning Objectives',
      icon: Target,
      content: 'Short-term goals 85% achieved. Long-term career pathway alignment strong. Recommend exploring advanced placement courses in areas of interest.',
      expanded: false,
    },
    {
      id: 'progress',
      title: 'Progress Analytics',
      icon: TrendingUp,
      content: 'Learning velocity increased by 18% this semester. Knowledge retention rates above average. Time-on-task optimization showing positive results.',
      expanded: false,
    },
    {
      id: 'achievements',
      title: 'Skills & Achievements',
      icon: Award,
      content: 'Critical thinking skills advanced level. Digital literacy competencies exceeded expectations. Leadership potential identified through project work.',
      expanded: false,
    },
  ]);

  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisSteps] = useState([
    "Initializing educational data analysis...",
    "Analyzing learning patterns and preferences...",
    "Evaluating curriculum effectiveness...",
    "Assessing student engagement metrics...",
    "Examining knowledge retention factors...",
    "Correlating teaching methodologies...",
    "Building personalized learning pathways...",
    "Optimizing educational outcomes...",
    "Finalizing adaptive learning model..."
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
      { id: 'curriculum', label: 'Curriculum', group: 0 },
      { id: 'engagement', label: 'Engagement', group: 1 },
      { id: 'performance', label: 'Performance', group: 2 },
      { id: 'skills', label: 'Skills', group: 3 },
      { id: 'goals', label: 'Learning Goals', group: 4 },
      { id: 'outcomes', label: 'Outcomes', group: 5 },
      { id: 'methods', label: 'Teaching Methods', group: 6 },
      { id: 'retention', label: 'Knowledge Retention', group: 7 },
      { id: 'assessment', label: 'Assessment', group: 8 },
    ];

    const allLinks = [
      { source: 'curriculum', target: 'engagement', value: 4 },
      { source: 'engagement', target: 'performance', value: 5 },
      { source: 'curriculum', target: 'skills', value: 3 },
      { source: 'performance', target: 'outcomes', value: 4 },
      { source: 'goals', target: 'performance', value: 3 },
      { source: 'skills', target: 'outcomes', value: 4 },
      { source: 'methods', target: 'engagement', value: 4 },
      { source: 'methods', target: 'retention', value: 3 },
      { source: 'retention', target: 'performance', value: 4 },
      { source: 'assessment', target: 'performance', value: 5 },
      { source: 'assessment', target: 'outcomes', value: 3 },
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
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/edu.png" 
              alt="Education" 
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Education Intelligence
            </h1>
          </div>
          <p className="text-gray-400 text-lg">AI-powered personalized learning analytics</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <EnhancedEducationOrb isActive={isAnalyzing} image="/education-orb.png" />
        </motion.div>

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-blue-500/20 border border-blue-500/50 rounded-full px-6 py-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
              />
              <span className="text-blue-400 font-semibold">Analyzing with GraphoraX Intelligence...</span>
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
                  className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
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