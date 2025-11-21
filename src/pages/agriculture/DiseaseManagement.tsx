import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Bug, Microscope, AlertTriangle, Target, Activity } from 'lucide-react';
import InputPanel from '../../components/InputPanel';
import GraphView from '../../components/GraphView';

interface DiseaseManagementProps {
  onBack: () => void;
}

export default function DiseaseManagement({ onBack }: DiseaseManagementProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  const [analysisSteps] = useState([
    "Scanning crop images for disease symptoms...",
    "Analyzing environmental conditions...",
    "Identifying potential disease pathogens...",
    "Assessing infection risk factors...",
    "Evaluating treatment effectiveness...",
    "Modeling disease spread patterns...",
    "Generating prevention strategies...",
    "Creating integrated management plan..."
  ]);

  const healthMetrics = [
    {
      icon: Shield,
      title: "Disease Risk",
      value: "Low",
      level: 25,
      status: "Safe",
      description: "Current environmental conditions favor low disease pressure",
      color: "from-green-400 to-emerald-500",
      details: "Weather patterns reducing pathogen activity"
    },
    {
      icon: Bug,
      title: "Pest Activity",
      value: "Medium",
      level: 65,
      status: "Monitor",
      description: "Some pest activity detected, monitoring required",
      color: "from-yellow-400 to-orange-500",
      details: "Aphid populations increasing with temperature"
    },
    {
      icon: Microscope,
      title: "Pathogen Load",
      value: "15 CFU/g",
      level: 30,
      status: "Normal",
      description: "Soil pathogen levels within acceptable range",
      color: "from-blue-400 to-cyan-500",
      details: "Beneficial microorganisms active"
    },
    {
      icon: Activity,
      title: "Plant Vigor",
      value: "82%",
      level: 82,
      status: "Strong",
      description: "Plants showing good resistance to stress",
      color: "from-purple-400 to-pink-500",
      details: "Healthy root development and nutrient uptake"
    }
  ];

  const diseases = [
    {
      name: "Powdery Mildew",
      risk: "Low",
      severity: 15,
      affected: "0.5%",
      treatment: "Preventive fungicide",
      color: "green",
      symptoms: ["White powdery spots", "Leaf yellowing"],
      stage: "Early detection"
    },
    {
      name: "Leaf Spot",
      risk: "Medium",
      severity: 35,
      affected: "2.1%",
      treatment: "Copper-based spray",
      color: "yellow",
      symptoms: ["Brown spots on leaves", "Premature defoliation"],
      stage: "Active monitoring"
    },
    {
      name: "Root Rot",
      risk: "Low",
      severity: 20,
      affected: "0.8%",
      treatment: "Drainage improvement",
      color: "blue",
      symptoms: ["Wilting", "Root discoloration"],
      stage: "Preventive care"
    },
    {
      name: "Aphid Infestation",
      risk: "Medium",
      severity: 45,
      affected: "3.2%",
      treatment: "Beneficial insects",
      color: "orange",
      symptoms: ["Honeydew secretion", "Curled leaves"],
      stage: "Active treatment"
    }
  ];

  const treatmentHistory = [
    { date: "2024-01-15", treatment: "Fungicide Application", target: "Powdery Mildew", effectiveness: 95 },
    { date: "2024-01-10", treatment: "Beneficial Release", target: "Aphids", effectiveness: 88 },
    { date: "2024-01-05", treatment: "Copper Spray", target: "Leaf Spot", effectiveness: 92 },
    { date: "2023-12-28", treatment: "Soil Treatment", target: "Root Rot", effectiveness: 87 }
  ];

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(true);
    setCurrentStep(0);

    const allNodes = [
      { id: 'environment', label: 'Environment', group: 0 },
      { id: 'pathogens', label: 'Pathogens', group: 1 },
      { id: 'pests', label: 'Pests', group: 2 },
      { id: 'planthealth', label: 'Plant Health', group: 3 },
      { id: 'treatment', label: 'Treatment', group: 4 },
      { id: 'resistance', label: 'Resistance', group: 5 },
      { id: 'yield', label: 'Crop Yield', group: 6 },
    ];

    const allLinks = [
      { source: 'environment', target: 'pathogens', value: 3 },
      { source: 'environment', target: 'pests', value: 4 },
      { source: 'pathogens', target: 'planthealth', value: -4 },
      { source: 'pests', target: 'planthealth', value: -3 },
      { source: 'treatment', target: 'pathogens', value: -5 },
      { source: 'treatment', target: 'pests', value: -4 },
      { source: 'planthealth', target: 'resistance', value: 4 },
      { source: 'resistance', target: 'yield', value: 4 },
      { source: 'planthealth', target: 'yield', value: 5 },
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
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
              className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-rose-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Disease Management
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Advanced crop protection and integrated pest management</p>
        </motion.div>

        {/* Health Metrics Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {healthMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 hover:border-red-400/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{metric.title}</h3>
                  <span className="text-2xl font-bold text-red-400">{metric.value}</span>
                </div>
              </div>
              <div className="mb-3">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  metric.status === 'Safe' || metric.status === 'Strong' || metric.status === 'Normal' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'Monitor' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {metric.status}
                </span>
              </div>
              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.level}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  />
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">{metric.description}</p>
              <p className="text-gray-400 text-xs italic">{metric.details}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Disease Monitor */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-red-400" />
            Disease & Pest Monitor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diseases.map((disease, index) => (
              <motion.div
                key={disease.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white text-lg">{disease.name}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    disease.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                    disease.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {disease.risk} Risk
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-400 text-sm">Severity</span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-${disease.color}-400`}
                          initial={{ width: 0 }}
                          animate={{ width: `${disease.severity}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                        />
                      </div>
                      <span className="text-white text-sm font-semibold">{disease.severity}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Affected Area</span>
                    <p className="text-white font-semibold">{disease.affected}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-400 text-sm">Symptoms:</span>
                  <ul className="mt-1">
                    {disease.symptoms.map((symptom, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-sm">Treatment:</span>
                    <p className="text-blue-400 text-sm font-semibold">{disease.treatment}</p>
                  </div>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {disease.stage}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Treatment History */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-400" />
            Recent Treatments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {treatmentHistory.map((treatment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-4"
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-white text-sm mb-1">{treatment.treatment}</h3>
                  <p className="text-gray-400 text-xs">{treatment.date}</p>
                </div>
                <div className="mb-3">
                  <span className="text-gray-400 text-xs">Target: </span>
                  <span className="text-red-400 text-sm font-semibold">{treatment.target}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Effectiveness</span>
                    <span>{treatment.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${treatment.effectiveness}%` }}
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
              <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Protection Status
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Overall disease pressure remains low due to favorable conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Aphid populations increasing - monitor closely for threshold levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Beneficial microorganisms active in soil ecosystem</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Action Plan
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Release beneficial insects to control aphid populations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Continue preventive fungicide applications as scheduled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Maintain field sanitation and crop rotation practices</span>
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