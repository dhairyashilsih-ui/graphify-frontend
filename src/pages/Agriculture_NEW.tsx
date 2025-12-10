import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, CloudRain, Sprout, Droplets, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import EnhancedAgriOrb from '../components/EnhancedAgriOrb';
import InputPanel from '../components/InputPanel';
import RealTimeGraphView from '../components/RealTimeGraphView';
import { useRealTimeGraph } from '../hooks/useRealTimeGraph';
import WeatherClimate from './agriculture/WeatherClimate';
import CropGrowthYield from './agriculture/CropGrowthYield';
import WaterIrrigation from './agriculture/WaterIrrigation';
import SoilHealth from './agriculture/SoilHealth';
import DiseaseManagement from './agriculture/DiseaseManagement';
import MarketEconomics from './agriculture/MarketEconomics';
import { localAI } from '../services/localAI';

interface AgricultureProps {
  onBack: () => void;
}

type CurrentView = 'main' | 'weather' | 'crop' | 'water' | 'soil' | 'disease' | 'market';

export default function Agriculture({ onBack }: AgricultureProps) {
  const [currentView, setCurrentView] = useState<CurrentView>('main');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Real-time graph management
  const {
    graphState,
    startRealtimeBuilding,
    clearGraph,
    simulateStreamingUpdates
  } = useRealTimeGraph();

  const sections = [
    {
      id: 'weather',
      title: 'Weather & Climate',
      icon: CloudRain,
      content: 'Real-time weather analysis and climate impact assessment.',
    },
    {
      id: 'crop',
      title: 'Crop Growth & Yield',
      icon: Sprout,
      content: 'AI-powered crop monitoring and yield optimization strategies.',
    },
    {
      id: 'water',
      title: 'Water & Irrigation',
      icon: Droplets,
      content: 'Smart irrigation management and water conservation techniques.',
    },
    {
      id: 'soil',
      title: 'Soil Health',
      icon: TrendingUp,
      content: 'Comprehensive soil analysis and fertility management solutions.',
    },
    {
      id: 'disease',
      title: 'Disease Management',
      icon: AlertTriangle,
      content: 'Advanced crop protection and integrated pest management strategies.',
    },
    {
      id: 'market',
      title: 'Market & Economics',
      icon: DollarSign,
      content: 'Financial analysis and market intelligence for agricultural operations.',
    },
  ];

  const toggleSection = (id: string) => {
    setCurrentView(id as CurrentView);
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleSubmit = async (data: any) => {
    setIsAnalyzing(true);
    setShowResults(true); // Show graph container immediately

    console.log('🌾 Agriculture analysis started:', data);

    // Clear existing graph
    clearGraph();

    try {
      // Check if we have AI response from InputPanel
      if (data.aiResponse && data.aiResponse.success) {
        console.log('✅ Using AI-generated analysis, building real-time graph...');
        
        // Start real-time graph building from API response
        await startRealtimeBuilding(
          data.aiResponse,
          'agriculture',
          (step: number, total: number, message: string) => {
            console.log(`Graph building: Step ${step}/${total} - ${message}`);
          }
        );

        // Play TTS audio if available
        if (data.aiResponse.analysis.audio) {
          console.log('🔊 Playing TTS audio for agriculture analysis...');
          try {
            await localAI.playResponseAudio(
              data.aiResponse,
              () => {
                console.log('🎙️ Agriculture orb started speaking');
                setIsSpeaking(true);
              },
              () => {
                console.log('🤐 Agriculture orb finished speaking');
                setIsSpeaking(false);
                setAudioLevel(0);
              },
              (level: number) => {
                setAudioLevel(level);
              }
            );
          } catch (error) {
            console.warn('Failed to play TTS audio:', error);
            setIsSpeaking(false);
            setAudioLevel(0);
          }
        }
      } else {
        console.log('🔄 No AI response, using demo real-time simulation');
        
        // Use simulation for demo purposes
        await simulateStreamingUpdates((step: number, total: number, message: string) => {
          console.log(`Demo graph building: Step ${step}/${total} - ${message}`);
        });
      }
    } catch (error) {
      console.error('Error during graph building:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render dedicated pages based on current view
  if (currentView === 'weather') {
    return <WeatherClimate onBack={handleBackToMain} />;
  }
  if (currentView === 'crop') {
    return <CropGrowthYield onBack={handleBackToMain} />;
  }
  if (currentView === 'water') {
    return <WaterIrrigation onBack={handleBackToMain} />;
  }
  if (currentView === 'soil') {
    return <SoilHealth onBack={handleBackToMain} />;
  }
  if (currentView === 'disease') {
    return <DiseaseManagement onBack={handleBackToMain} />;
  }
  if (currentView === 'market') {
    return <MarketEconomics onBack={handleBackToMain} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Agriculture Intelligence
            </h1>
            <p className="text-green-200/80">Smart farming solutions powered by AI</p>
          </div>
        </div>
        
        {/* Real-time Graph Status */}
        {graphState.isBuilding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg px-4 py-2"
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-200 font-medium">Building Real-Time Graph</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel - AI Input & Controls */}
        <div className="lg:w-1/2 space-y-6">
          {/* Enhanced Agriculture Orb */}
          <div className="flex justify-center mb-8">
            <EnhancedAgriOrb 
              isActive={isAnalyzing || isSpeaking}
              audioLevel={audioLevel}
            />
          </div>

          {/* Input Panel */}
          <InputPanel
            domain="agriculture"
            onSubmit={handleSubmit}
          />

          {/* Agriculture Sections */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-300 mb-4">Agricultural Domains</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-green-800/30 backdrop-blur-sm border border-green-700/50 rounded-xl p-4 cursor-pointer hover:bg-green-700/40 transition-all duration-300"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-600/30 rounded-lg">
                        <IconComponent className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-200 mb-1">{section.title}</h3>
                        <p className="text-xs text-green-300/70 leading-relaxed">{section.content}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-green-400/60" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Real-Time Graph */}
        <div className="lg:w-1/2">
          {showResults && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <RealTimeGraphView
                nodes={graphState.nodes}
                links={graphState.links}
                isBuilding={graphState.isBuilding}
                buildingMessage={graphState.buildingMessage}
                currentStep={graphState.currentStep}
                totalSteps={graphState.totalSteps}
                onNodeClick={(node) => {
                  console.log('Node clicked:', node);
                  // You can add node interaction logic here
                }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}