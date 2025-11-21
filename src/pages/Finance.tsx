import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, DollarSign, TrendingUp, PieChart, CreditCard, Building, BarChart3 } from 'lucide-react';
import EnhancedFinanceOrb from '../components/EnhancedFinanceOrb';
import InputPanel from '../components/InputPanel';
import GraphView from '../components/GraphView';

interface FinanceProps {
  onBack: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: any;
  content: string;
  expanded: boolean;
}

export default function Finance({ onBack }: FinanceProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'portfolio',
      title: 'Portfolio Analysis',
      icon: PieChart,
      content: 'Diversified portfolio showing 12.4% annual growth. Risk-adjusted returns above benchmark. Recommend rebalancing with 5% shift to emerging markets.',
      expanded: false,
    },
    {
      id: 'spending',
      title: 'Spending Patterns',
      icon: CreditCard,
      content: 'Monthly expenses within budget parameters. Discretionary spending increased 8% this quarter. Identify opportunities for optimization in subscription services.',
      expanded: false,
    },
    {
      id: 'investment',
      title: 'Investment Opportunities',
      icon: TrendingUp,
      content: 'Market conditions favorable for tech sector allocation. ESG investments showing strong performance. Consider dollar-cost averaging for volatile positions.',
      expanded: false,
    },
    {
      id: 'budgeting',
      title: 'Budget & Planning',
      icon: DollarSign,
      content: 'Emergency fund at optimal 6-month coverage. Retirement contributions on track for target date. Short-term savings goals 78% achieved.',
      expanded: false,
    },
    {
      id: 'assets',
      title: 'Asset Management',
      icon: Building,
      content: 'Real estate portfolio appreciating at 6% annually. Liquid assets properly allocated. Consider refinancing mortgage at current favorable rates.',
      expanded: false,
    },
    {
      id: 'analytics',
      title: 'Financial Analytics',
      icon: BarChart3,
      content: 'Cash flow positive with improving trajectory. Debt-to-income ratio optimal at 28%. Tax optimization strategies yielding 7% savings annually.',
      expanded: false,
    },
  ]);

  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisSteps] = useState([
    "Initializing financial data analysis...",
    "Analyzing market trends and volatility...",
    "Evaluating risk assessment factors...",
    "Examining portfolio diversification...",
    "Assessing liquidity and cash flow...",
    "Correlating economic indicators...",
    "Building investment strategy model...",
    "Optimizing risk-return ratios...",
    "Finalizing comprehensive financial plan..."
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
      { id: 'income', label: 'Income', group: 0 },
      { id: 'expenses', label: 'Expenses', group: 1 },
      { id: 'investments', label: 'Investments', group: 2 },
      { id: 'savings', label: 'Savings', group: 3 },
      { id: 'portfolio', label: 'Portfolio', group: 4 },
      { id: 'wealth', label: 'Net Worth', group: 5 },
      { id: 'risk', label: 'Risk Profile', group: 6 },
      { id: 'market', label: 'Market Trends', group: 7 },
      { id: 'goals', label: 'Financial Goals', group: 8 },
    ];

    const allLinks = [
      { source: 'income', target: 'expenses', value: 3 },
      { source: 'income', target: 'savings', value: 4 },
      { source: 'savings', target: 'investments', value: 5 },
      { source: 'investments', target: 'portfolio', value: 4 },
      { source: 'portfolio', target: 'wealth', value: 5 },
      { source: 'income', target: 'wealth', value: 3 },
      { source: 'risk', target: 'investments', value: 4 },
      { source: 'market', target: 'portfolio', value: 3 },
      { source: 'goals', target: 'savings', value: 4 },
      { source: 'goals', target: 'wealth', value: 5 },
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
              src="/finance.jpg" 
              alt="Finance" 
              className="w-16 h-16 object-cover rounded-full"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Finance Intelligence
            </h1>
          </div>
          <p className="text-gray-400 text-lg">AI-driven financial planning and analysis</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <EnhancedFinanceOrb isActive={isAnalyzing} image="/finance-orb.png" />
        </motion.div>

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-6 py-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full"
              />
              <span className="text-yellow-400 font-semibold">Analyzing with GraphoraX Intelligence...</span>
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
                  className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center">
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