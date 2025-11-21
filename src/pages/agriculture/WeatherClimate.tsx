import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CloudRain, Thermometer, Wind, Droplets as RainIcon, Sun, AlertCircle } from 'lucide-react';
import InputPanel from '../../components/InputPanel';
import GraphView from '../../components/GraphView';

interface WeatherClimateProps {
  onBack: () => void;
}

export default function WeatherClimate({ onBack }: WeatherClimateProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  const [analysisSteps] = useState([
    "Collecting weather data from multiple sources...",
    "Analyzing temperature patterns and trends...",
    "Evaluating precipitation levels and forecasts...",
    "Assessing wind patterns and micro-climate factors...",
    "Calculating growing degree days...",
    "Identifying weather-related crop risks...",
    "Generating climate-based recommendations...",
    "Finalizing weather intelligence model..."
  ]);

  const weatherMetrics = [
    {
      icon: Thermometer,
      title: "Temperature",
      value: "24°C",
      status: "Optimal",
      description: "Current temperature is ideal for crop growth. Daily range: 18°C - 28°C",
      color: "from-orange-400 to-red-500"
    },
    {
      icon: RainIcon,
      title: "Precipitation",
      value: "45mm",
      status: "Adequate",
      description: "Recent rainfall sufficient. Next expected: 2 days",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Wind,
      title: "Wind Speed",
      value: "12 km/h",
      status: "Moderate",
      description: "Light to moderate winds. No storm warnings in effect",
      color: "from-gray-400 to-blue-400"
    },
    {
      icon: Sun,
      title: "Solar Radiation",
      value: "850 W/m²",
      status: "High",
      description: "Excellent sunlight conditions for photosynthesis",
      color: "from-yellow-400 to-orange-500"
    }
  ];

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(true);
    setCurrentStep(0);

    const allNodes = [
      { id: 'temperature', label: 'Temperature', group: 0 },
      { id: 'precipitation', label: 'Precipitation', group: 1 },
      { id: 'humidity', label: 'Humidity', group: 2 },
      { id: 'wind', label: 'Wind Patterns', group: 3 },
      { id: 'solar', label: 'Solar Radiation', group: 4 },
      { id: 'growth', label: 'Crop Growth', group: 5 },
      { id: 'stress', label: 'Plant Stress', group: 6 },
    ];

    const allLinks = [
      { source: 'temperature', target: 'growth', value: 5 },
      { source: 'precipitation', target: 'growth', value: 4 },
      { source: 'solar', target: 'growth', value: 4 },
      { source: 'temperature', target: 'stress', value: 3 },
      { source: 'humidity', target: 'stress', value: 2 },
      { source: 'wind', target: 'stress', value: 2 },
      { source: 'precipitation', target: 'humidity', value: 3 },
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
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center"
            >
              <CloudRain className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Weather & Climate
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Advanced meteorological analysis for precision agriculture</p>
        </motion.div>

        {/* Weather Metrics Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {weatherMetrics.map((metric, index) => (
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
              <div className="mb-2">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  metric.status === 'Optimal' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'Adequate' ? 'bg-blue-500/20 text-blue-400' :
                  metric.status === 'High' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {metric.status}
                </span>
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
                  <AlertCircle className="w-5 h-5" />
                  Key Insights
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Current weather conditions are optimal for crop growth with ideal temperature range</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Recent precipitation levels are adequate, reducing irrigation needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>High solar radiation levels promoting excellent photosynthesis rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Weather forecast shows stable conditions for the next 7 days</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Recommendations</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Continue current irrigation schedule - no adjustments needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor for potential heat stress during midday hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimal conditions for applying foliar fertilizers</span>
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