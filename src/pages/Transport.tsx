import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Car, MapPin, Clock, Fuel, Route, Shield } from 'lucide-react';
import EnhancedTransportOrb from '../components/EnhancedTransportOrb';
import InputPanel from '../components/InputPanel';
import GraphView from '../components/GraphView';

interface TransportProps {
  onBack: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: any;
  content: string;
  expanded: boolean;
}

export default function Transport({ onBack }: TransportProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'routing',
      title: 'Route Optimization',
      icon: Route,
      content: 'Optimal route identified with 23% time savings. Traffic patterns analyzed for peak hour avoidance. Alternative routes available with real-time updates.',
      expanded: false,
    },
    {
      id: 'tracking',
      title: 'Location & Tracking',
      icon: MapPin,
      content: 'GPS accuracy at 98.5%. Real-time location sharing enabled. Geofencing alerts configured for designated zones and destinations.',
      expanded: false,
    },
    {
      id: 'timing',
      title: 'Schedule & Timing',
      icon: Clock,
      content: 'On-time performance at 94%. Predictive arrival times with 2-minute accuracy. Schedule optimization reducing wait times by 15%.',
      expanded: false,
    },
    {
      id: 'vehicle',
      title: 'Vehicle Performance',
      icon: Car,
      content: 'Fleet efficiency improved 18% through predictive maintenance. Vehicle utilization optimized. Battery health monitoring for electric vehicles.',
      expanded: false,
    },
    {
      id: 'fuel',
      title: 'Fuel & Efficiency',
      icon: Fuel,
      content: 'Fuel consumption down 12% with eco-routing. Carbon footprint reduced by optimizing transport modes. Energy recovery systems performing well.',
      expanded: false,
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      icon: Shield,
      content: 'Zero safety incidents this month. Driver behavior analysis showing improvement. Emergency response protocols tested and optimized.',
      expanded: false,
    },
  ]);

  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisSteps] = useState([
    "Initializing transportation analysis...",
    "Analyzing traffic patterns and congestion...",
    "Evaluating route optimization factors...",
    "Assessing fuel efficiency parameters...",
    "Examining safety and maintenance data...",
    "Correlating environmental impact metrics...",
    "Building smart transport network...",
    "Optimizing logistics and delivery...",
    "Finalizing intelligent transport system..."
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
      { id: 'origin', label: 'Origin', group: 0 },
      { id: 'route', label: 'Route', group: 1 },
      { id: 'traffic', label: 'Traffic', group: 2 },
      { id: 'vehicle', label: 'Vehicle', group: 3 },
      { id: 'efficiency', label: 'Efficiency', group: 4 },
      { id: 'destination', label: 'Destination', group: 5 },
      { id: 'fuel', label: 'Fuel Usage', group: 6 },
      { id: 'safety', label: 'Safety Score', group: 7 },
      { id: 'environment', label: 'CO2 Impact', group: 8 },
    ];

    const allLinks = [
      { source: 'origin', target: 'route', value: 4 },
      { source: 'traffic', target: 'route', value: 3 },
      { source: 'route', target: 'vehicle', value: 4 },
      { source: 'vehicle', target: 'efficiency', value: 5 },
      { source: 'route', target: 'destination', value: 5 },
      { source: 'efficiency', target: 'destination', value: 3 },
      { source: 'vehicle', target: 'fuel', value: 4 },
      { source: 'traffic', target: 'safety', value: 3 },
      { source: 'fuel', target: 'environment', value: 4 },
      { source: 'route', target: 'safety', value: 3 },
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
              src="/transport.png" 
              alt="Transport" 
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Transport Intelligence
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Smart mobility and logistics optimization</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <EnhancedTransportOrb isActive={isAnalyzing} image="/transport-orb.png" />
        </motion.div>

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-cyan-500/20 border border-cyan-500/50 rounded-full px-6 py-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full"
              />
              <span className="text-cyan-400 font-semibold">Analyzing with GraphoraX Intelligence...</span>
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
                  className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-lg flex items-center justify-center">
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