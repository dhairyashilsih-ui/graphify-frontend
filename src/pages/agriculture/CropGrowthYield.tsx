import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sprout, TrendingUp, BarChart3, Leaf, Target, Calendar } from 'lucide-react';
import InputPanel from '../../components/InputPanel';
import GraphView from '../../components/GraphView';

interface CropGrowthYieldProps {
  onBack: () => void;
}

export default function CropGrowthYield({ onBack }: CropGrowthYieldProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  const [analysisSteps] = useState([
    "Analyzing crop growth stages and development...",
    "Evaluating plant health indicators...",
    "Calculating biomass accumulation rates...",
    "Assessing leaf area index and canopy coverage...",
    "Predicting yield potential based on current growth...",
    "Identifying growth optimization opportunities...",
    "Modeling harvest timing scenarios...",
    "Finalizing crop growth intelligence..."
  ]);

  const growthMetrics = [
    {
      icon: Sprout,
      title: "Growth Stage",
      value: "V6",
      status: "On Track",
      description: "Six-leaf vegetative stage. Development progressing normally",
      color: "from-green-400 to-emerald-500",
      progress: 45
    },
    {
      icon: TrendingUp,
      title: "Yield Prediction",
      value: "8.5 t/ha",
      status: "+15% Above Average",
      description: "Projected yield based on current growth conditions",
      color: "from-blue-400 to-cyan-500",
      progress: 85
    },
    {
      icon: Leaf,
      title: "Plant Health",
      value: "92%",
      status: "Excellent",
      description: "Overall plant vigor and health assessment",
      color: "from-emerald-400 to-green-500",
      progress: 92
    },
    {
      icon: Calendar,
      title: "Days to Harvest",
      value: "68 days",
      status: "Optimal Window",
      description: "Estimated harvest date: November 15, 2025",
      color: "from-orange-400 to-yellow-500",
      progress: 65
    }
  ];

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(true);
    setCurrentStep(0);

    const allNodes = [
      { id: 'seed', label: 'Seed Quality', group: 0 },
      { id: 'germination', label: 'Germination', group: 1 },
      { id: 'vegetative', label: 'Vegetative Growth', group: 2 },
      { id: 'flowering', label: 'Flowering', group: 3 },
      { id: 'filling', label: 'Grain Filling', group: 4 },
      { id: 'maturity', label: 'Maturity', group: 5 },
      { id: 'yield', label: 'Final Yield', group: 6 },
      { id: 'nutrients', label: 'Nutrient Uptake', group: 7 },
    ];

    const allLinks = [
      { source: 'seed', target: 'germination', value: 5 },
      { source: 'germination', target: 'vegetative', value: 4 },
      { source: 'vegetative', target: 'flowering', value: 4 },
      { source: 'flowering', target: 'filling', value: 5 },
      { source: 'filling', target: 'maturity', value: 4 },
      { source: 'maturity', target: 'yield', value: 5 },
      { source: 'nutrients', target: 'vegetative', value: 3 },
      { source: 'nutrients', target: 'filling', value: 4 },
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
        <span className="font-semibold">Back to Agriculture</span>
      </motion.button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center"
            >
              <Sprout className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Crop Growth & Yield
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Advanced crop development monitoring and yield prediction</p>
        </motion.div>

        {/* Growth Metrics Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {growthMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{metric.title}</h3>
                  <span className="text-2xl font-bold text-green-400">{metric.value}</span>
                </div>
              </div>
              <div className="mb-3">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  metric.status.includes('Above') || metric.status === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'On Track' || metric.status === 'Optimal Window' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {metric.status}
                </span>
              </div>
              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.progress}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-1">{metric.progress}%</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Analysis Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <InputPanel onSubmit={handleSubmit} isLoading={isAnalyzing} />
        </motion.div>

        {/* Results Section */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Graph View */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GraphView 
                nodes={graphData.nodes} 
                links={graphData.links} 
                isProgressive={isAnalyzing}
                currentStep={currentStep}
                analysisSteps={analysisSteps}
              />
            </motion.div>

            {/* Insights Panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Growth Analysis
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Crop is in optimal V6 vegetative stage with healthy leaf development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Biomass accumulation rate is 15% above regional average</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plant height and leaf area index within expected parameters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Root development strong, supporting excellent nutrient uptake</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Yield Optimization
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Continue current fertilization program for optimal growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor for early signs of flowering in 2-3 weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Prepare for potential side-dressing nitrogen application</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}