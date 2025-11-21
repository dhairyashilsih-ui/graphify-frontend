import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mountain, BarChart3, TestTube, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import InputPanel from '../../components/InputPanel';
import GraphView from '../../components/GraphView';

interface SoilHealthProps {
  onBack: () => void;
}

export default function SoilHealth({ onBack }: SoilHealthProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  const [analysisSteps] = useState([
    "Analyzing soil pH and nutrient levels...",
    "Testing organic matter content...",
    "Evaluating soil structure and texture...",
    "Assessing microbial activity...",
    "Checking nutrient availability...",
    "Monitoring soil erosion indicators...",
    "Analyzing chemical composition...",
    "Generating soil health report..."
  ]);

  const soilMetrics = [
    {
      icon: TestTube,
      title: "pH Level",
      value: "6.8",
      status: "Optimal",
      description: "Soil pH within ideal range for most crops",
      color: "from-green-400 to-emerald-500",
      progress: 85,
      target: "6.0-7.0",
      details: "Slightly alkaline, suitable for nutrient uptake"
    },
    {
      icon: Layers,
      title: "Organic Matter",
      value: "3.8%",
      status: "Good",
      description: "Above average organic matter content",
      color: "from-amber-400 to-orange-500",
      progress: 76,
      target: "> 3.0%",
      details: "Rich in decomposed organic materials"
    },
    {
      icon: BarChart3,
      title: "NPK Balance",
      value: "15-8-12",
      status: "Balanced",
      description: "Nitrogen, Phosphorus, Potassium levels",
      color: "from-blue-400 to-cyan-500",
      progress: 82,
      target: "Balanced",
      details: "Good nutrient availability for crops"
    },
    {
      icon: Mountain,
      title: "Soil Density",
      value: "1.2 g/cm³",
      status: "Ideal",
      description: "Optimal bulk density for root penetration",
      color: "from-purple-400 to-pink-500",
      progress: 90,
      target: "< 1.3",
      details: "Well-structured soil with good porosity"
    }
  ];

  const soilLayers = [
    { 
      depth: "0-15cm", 
      name: "Topsoil", 
      fertility: 92, 
      ph: 6.8, 
      organic: 4.2,
      color: "from-amber-600 to-yellow-600"
    },
    { 
      depth: "15-30cm", 
      name: "Subsoil", 
      fertility: 76, 
      ph: 6.5, 
      organic: 2.8,
      color: "from-orange-600 to-red-600"
    },
    { 
      depth: "30-60cm", 
      name: "Substratum", 
      fertility: 58, 
      ph: 6.2, 
      organic: 1.5,
      color: "from-red-600 to-rose-600"
    },
    { 
      depth: "60cm+", 
      name: "Bedrock", 
      fertility: 25, 
      ph: 6.0, 
      organic: 0.8,
      color: "from-gray-600 to-slate-600"
    }
  ];

  const nutrients = [
    { name: "Nitrogen (N)", level: 85, status: "High", color: "green", ppm: "45 ppm" },
    { name: "Phosphorus (P)", level: 62, status: "Medium", color: "blue", ppm: "28 ppm" },
    { name: "Potassium (K)", level: 78, status: "High", color: "purple", ppm: "156 ppm" },
    { name: "Calcium (Ca)", level: 91, status: "Excellent", color: "cyan", ppm: "1200 ppm" },
    { name: "Magnesium (Mg)", level: 68, status: "Medium", color: "yellow", ppm: "180 ppm" },
    { name: "Sulfur (S)", level: 55, status: "Low", color: "orange", ppm: "12 ppm" }
  ];

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(true);
    setCurrentStep(0);

    const allNodes = [
      { id: 'ph', label: 'pH Level', group: 0 },
      { id: 'organic', label: 'Organic Matter', group: 1 },
      { id: 'nutrients', label: 'Nutrients', group: 2 },
      { id: 'structure', label: 'Soil Structure', group: 3 },
      { id: 'microbes', label: 'Microbial Activity', group: 4 },
      { id: 'fertility', label: 'Soil Fertility', group: 5 },
      { id: 'yield', label: 'Crop Yield', group: 6 },
    ];

    const allLinks = [
      { source: 'ph', target: 'nutrients', value: 4 },
      { source: 'organic', target: 'structure', value: 5 },
      { source: 'organic', target: 'microbes', value: 4 },
      { source: 'nutrients', target: 'fertility', value: 5 },
      { source: 'structure', target: 'fertility', value: 3 },
      { source: 'microbes', target: 'fertility', value: 4 },
      { source: 'fertility', target: 'yield', value: 5 },
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
                scale: [1, 1.1, 1],
                rotateY: [0, 180, 360]
              }}
              transition={{ 
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center"
            >
              <Mountain className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Soil Health
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Comprehensive soil analysis and fertility management</p>
        </motion.div>

        {/* Soil Metrics Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {soilMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6 hover:border-amber-400/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{metric.title}</h3>
                  <span className="text-2xl font-bold text-amber-400">{metric.value}</span>
                </div>
              </div>
              <div className="mb-3">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  metric.status === 'Optimal' || metric.status === 'Ideal' || metric.status === 'Balanced' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {metric.status}
                </span>
                <span className="text-xs text-gray-400 ml-2">Target: {metric.target}</span>
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
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">{metric.description}</p>
              <p className="text-gray-400 text-xs italic">{metric.details}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Soil Layers */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            Soil Profile Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {soilLayers.map((layer, index) => (
              <motion.div
                key={layer.depth}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${layer.color} opacity-10`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{layer.name}</h3>
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                      {layer.depth}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Fertility</span>
                      <span className="text-white font-semibold">{layer.fertility}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${layer.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${layer.fertility}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>pH: {layer.ph}</span>
                      <span>OM: {layer.organic}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Nutrient Analysis */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TestTube className="w-6 h-6 text-amber-400" />
            Nutrient Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nutrients.map((nutrient, index) => (
              <motion.div
                key={nutrient.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{nutrient.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    nutrient.status === 'Excellent' || nutrient.status === 'High' ? 'bg-green-500/20 text-green-400' :
                    nutrient.status === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {nutrient.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Level</span>
                    <span>{nutrient.ppm}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-${nutrient.color}-400`}
                      initial={{ width: 0 }}
                      animate={{ width: `${nutrient.level}%` }}
                      transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analysis Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mb-8"
        >
          <InputPanel onSubmit={handleSubmit} isLoading={isAnalyzing} />
        </motion.div>

        {/* Results Section */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Graph View */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 }}
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
              transition={{ delay: 1.7 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Soil Health Score
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Overall Health</span>
                    <span className="text-2xl font-bold text-green-400">83/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: "83%" }}
                      transition={{ delay: 1.8, duration: 1.5 }}
                    />
                  </div>
                </div>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Excellent pH balance and nutrient availability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Good organic matter content supports structure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Soil density optimal for root development</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recommendations
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Increase sulfur levels through gypsum application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor phosphorus levels in next growing season</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Maintain current organic matter through cover crops</span>
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