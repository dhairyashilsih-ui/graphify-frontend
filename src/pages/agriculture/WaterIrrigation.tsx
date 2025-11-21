import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Droplets, Gauge, Timer, MapPin, Zap, Settings } from 'lucide-react';
import InputPanel from '../../components/InputPanel';
import GraphView from '../../components/GraphView';

interface WaterIrrigationProps {
  onBack: () => void;
}

export default function WaterIrrigation({ onBack }: WaterIrrigationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  const [analysisSteps] = useState([
    "Analyzing soil moisture levels across fields...",
    "Calculating evapotranspiration rates...",
    "Evaluating irrigation system efficiency...",
    "Assessing water availability and quality...",
    "Optimizing irrigation scheduling...",
    "Modeling water stress indicators...",
    "Generating water conservation strategies...",
    "Finalizing irrigation management plan..."
  ]);

  const waterMetrics = [
    {
      icon: Droplets,
      title: "Soil Moisture",
      value: "65%",
      status: "Optimal",
      description: "Current soil moisture at field capacity. No irrigation needed",
      color: "from-blue-400 to-cyan-500",
      progress: 65,
      target: "60-70%"
    },
    {
      icon: Gauge,
      title: "Water Usage",
      value: "2.5 ML",
      status: "Efficient",
      description: "Weekly water consumption within optimal range",
      color: "from-cyan-400 to-blue-500",
      progress: 75,
      target: "< 3.0 ML"
    },
    {
      icon: Timer,
      title: "Next Irrigation",
      value: "3 days",
      status: "Scheduled",
      description: "Based on weather forecast and soil moisture trends",
      color: "from-green-400 to-emerald-500",
      progress: 40,
      target: "As needed"
    },
    {
      icon: Zap,
      title: "System Efficiency",
      value: "92%",
      status: "Excellent",
      description: "Irrigation system operating at high efficiency",
      color: "from-yellow-400 to-orange-500",
      progress: 92,
      target: "> 85%"
    }
  ];

  const irrigationZones = [
    { id: 1, name: "North Field", moisture: 68, status: "Good", lastIrrigation: "2 days ago" },
    { id: 2, name: "South Field", moisture: 62, status: "Optimal", lastIrrigation: "3 days ago" },
    { id: 3, name: "East Field", moisture: 58, status: "Monitor", lastIrrigation: "4 days ago" },
    { id: 4, name: "West Field", moisture: 71, status: "Good", lastIrrigation: "1 day ago" },
  ];

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(true);
    setCurrentStep(0);

    const allNodes = [
      { id: 'rainfall', label: 'Rainfall', group: 0 },
      { id: 'soilmoisture', label: 'Soil Moisture', group: 1 },
      { id: 'evapotranspiration', label: 'Evapotranspiration', group: 2 },
      { id: 'irrigation', label: 'Irrigation', group: 3 },
      { id: 'efficiency', label: 'Water Efficiency', group: 4 },
      { id: 'stress', label: 'Water Stress', group: 5 },
      { id: 'yield', label: 'Crop Yield', group: 6 },
    ];

    const allLinks = [
      { source: 'rainfall', target: 'soilmoisture', value: 4 },
      { source: 'irrigation', target: 'soilmoisture', value: 5 },
      { source: 'soilmoisture', target: 'stress', value: -4 },
      { source: 'evapotranspiration', target: 'soilmoisture', value: -3 },
      { source: 'stress', target: 'yield', value: -3 },
      { source: 'efficiency', target: 'irrigation', value: 3 },
      { source: 'soilmoisture', target: 'yield', value: 4 },
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
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center"
            >
              <Droplets className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Water & Irrigation
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Smart water management and precision irrigation control</p>
        </motion.div>

        {/* Water Metrics Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {waterMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{metric.title}</h3>
                  <span className="text-2xl font-bold text-blue-400">{metric.value}</span>
                </div>
              </div>
              <div className="mb-3">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  metric.status === 'Optimal' || metric.status === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'Efficient' || metric.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' :
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
              <p className="text-gray-300 text-sm leading-relaxed">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Irrigation Zones */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Irrigation Zones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {irrigationZones.map((zone, index) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{zone.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    zone.status === 'Good' || zone.status === 'Optimal' ? 'bg-green-500/20 text-green-400' :
                    zone.status === 'Monitor' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {zone.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Moisture</span>
                    <span>{zone.moisture}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${zone.moisture}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Last: {zone.lastIrrigation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analysis Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <InputPanel onSubmit={handleSubmit} isLoading={isAnalyzing} />
        </motion.div>

        {/* Results Section */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Graph View */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
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
              transition={{ delay: 1.1 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Water Status
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Overall soil moisture levels are optimal across all zones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>East field requires monitoring - moisture approaching threshold</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Water usage efficiency at 92% - exceeding industry standards</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Recommendations
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Schedule irrigation for East field in next 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Maintain current irrigation schedule for other zones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Consider soil moisture sensors for real-time monitoring</span>
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