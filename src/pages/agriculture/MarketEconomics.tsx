import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, BarChart3, Globe, PieChart, Calculator } from 'lucide-react';
import InputPanel from '../../components/InputPanel';
import GraphView from '../../components/GraphView';

interface MarketEconomicsProps {
  onBack: () => void;
}

export default function MarketEconomics({ onBack }: MarketEconomicsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  const [analysisSteps] = useState([
    "Analyzing current market prices and trends...",
    "Evaluating supply and demand dynamics...",
    "Calculating production costs and margins...",
    "Assessing seasonal price variations...",
    "Monitoring competitor activities...",
    "Forecasting market opportunities...",
    "Optimizing pricing strategies...",
    "Generating economic recommendations..."
  ]);

  const economicMetrics = [
    {
      icon: DollarSign,
      title: "Revenue",
      value: "$125,400",
      trend: "+12.5%",
      status: "Increasing",
      description: "Total revenue from current harvest season",
      color: "from-green-400 to-emerald-500",
      progress: 85,
      period: "This Season"
    },
    {
      icon: Calculator,
      title: "Production Cost",
      value: "$68,200",
      trend: "+3.2%",
      status: "Controlled",
      description: "Total cost including seeds, fertilizer, labor",
      color: "from-orange-400 to-red-500",
      progress: 62,
      period: "This Season"
    },
    {
      icon: TrendingUp,
      title: "Profit Margin",
      value: "45.6%",
      trend: "+8.3%",
      status: "Excellent",
      description: "Net profit margin after all expenses",
      color: "from-blue-400 to-cyan-500",
      progress: 78,
      period: "YTD"
    },
    {
      icon: BarChart3,
      title: "ROI",
      value: "22.8%",
      trend: "+5.1%",
      status: "Strong",
      description: "Return on investment for current operations",
      color: "from-purple-400 to-pink-500",
      progress: 88,
      period: "Annual"
    }
  ];

  const marketPrices = [
    { 
      crop: "Wheat", 
      current: "$285/ton", 
      change: "+$12", 
      trend: "up",
      volume: "1,200 tons",
      forecast: "Stable"
    },
    { 
      crop: "Corn", 
      current: "$195/ton", 
      change: "-$8", 
      trend: "down",
      volume: "2,800 tons",
      forecast: "Declining" 
    },
    { 
      crop: "Soybeans", 
      current: "$425/ton", 
      change: "+$25", 
      trend: "up",
      volume: "950 tons",
      forecast: "Rising"
    },
    { 
      crop: "Rice", 
      current: "$620/ton", 
      change: "+$15", 
      trend: "up",
      volume: "750 tons",
      forecast: "Stable"
    }
  ];

  const salesChannels = [
    { channel: "Direct Sales", revenue: 45000, percentage: 36, growth: "+15%" },
    { channel: "Cooperatives", revenue: 38500, percentage: 31, growth: "+8%" },
    { channel: "Wholesalers", revenue: 28200, percentage: 22, growth: "+5%" },
    { channel: "Export", revenue: 13700, percentage: 11, growth: "+22%" }
  ];

  const costBreakdown = [
    { category: "Seeds & Planting", amount: 15600, percentage: 23, color: "from-green-400 to-green-600" },
    { category: "Fertilizers", amount: 18200, percentage: 27, color: "from-yellow-400 to-yellow-600" },
    { category: "Labor", amount: 16800, percentage: 25, color: "from-blue-400 to-blue-600" },
    { category: "Equipment", amount: 10400, percentage: 15, color: "from-purple-400 to-purple-600" },
    { category: "Other", amount: 7200, percentage: 10, color: "from-gray-400 to-gray-600" }
  ];

  const handleSubmit = async (_data: any) => {
    setIsAnalyzing(true);
    setShowResults(true);
    setCurrentStep(0);

    const allNodes = [
      { id: 'production', label: 'Production', group: 0 },
      { id: 'costs', label: 'Costs', group: 1 },
      { id: 'market', label: 'Market Demand', group: 2 },
      { id: 'pricing', label: 'Pricing', group: 3 },
      { id: 'sales', label: 'Sales Channels', group: 4 },
      { id: 'revenue', label: 'Revenue', group: 5 },
      { id: 'profit', label: 'Profit', group: 6 },
    ];

    const allLinks = [
      { source: 'production', target: 'costs', value: 4 },
      { source: 'market', target: 'pricing', value: 5 },
      { source: 'pricing', target: 'sales', value: 4 },
      { source: 'sales', target: 'revenue', value: 5 },
      { source: 'revenue', target: 'profit', value: 3 },
      { source: 'costs', target: 'profit', value: -4 },
      { source: 'production', target: 'revenue', value: 4 },
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
                rotate: [0, 15, -15, 0]
              }}
              transition={{ 
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center"
            >
              <DollarSign className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Market & Economics
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Financial analysis and market intelligence for agricultural operations</p>
        </motion.div>

        {/* Economic Metrics Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {economicMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{metric.title}</h3>
                  <span className="text-2xl font-bold text-emerald-400">{metric.value}</span>
                </div>
              </div>
              <div className="mb-3">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  metric.status === 'Excellent' || metric.status === 'Strong' || metric.status === 'Increasing' ? 'bg-green-500/20 text-green-400' :
                  metric.status === 'Controlled' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {metric.status}
                </span>
                <span className={`text-sm ml-2 ${
                  metric.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend}
                </span>
                <span className="text-xs text-gray-400 ml-2">{metric.period}</span>
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

        {/* Market Prices */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            Current Market Prices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketPrices.map((price, index) => (
              <motion.div
                key={price.crop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{price.crop}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    price.forecast === 'Rising' || price.forecast === 'Stable' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {price.forecast}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-emerald-400">{price.current}</span>
                    <span className={`text-sm ${
                      price.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {price.change}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <p>Volume: {price.volume}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sales Channels & Cost Breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Sales Channels */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-emerald-400" />
              Sales Channels
            </h2>
            <div className="space-y-4">
              {salesChannels.map((channel, index) => (
                <motion.div
                  key={channel.channel}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{channel.channel}</h3>
                    <span className="text-green-400 text-sm font-semibold">{channel.growth}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-bold">${channel.revenue.toLocaleString()}</span>
                    <span className="text-gray-400 text-sm">{channel.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${channel.percentage}%` }}
                      transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              Cost Breakdown
            </h2>
            <div className="space-y-4">
              {costBreakdown.map((cost, index) => (
                <motion.div
                  key={cost.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{cost.category}</h3>
                    <span className="text-gray-400 text-sm">{cost.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-400 font-bold">${cost.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${cost.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${cost.percentage}%` }}
                      transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
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
              <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Insights
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Strong profit margins indicate efficient operations and good market positioning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Direct sales channel showing highest growth potential at 15%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Export opportunities expanding with 22% growth rate</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Financial Recommendations
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Increase investment in direct sales infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Explore export market opportunities for premium pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor fertilizer costs for potential savings opportunities</span>
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