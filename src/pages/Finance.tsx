import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import { sendToGroqJSON } from '../services/groqAI';
import { generateReasoningPrompt, parseReasoningResponse } from '../utils/graphGenerator';
import { useReasoningPlayer } from '../hooks/useReasoningPlayer';
import GraphRenderer from '../components/GraphRenderer';

export default function Finance({ onBack }) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState('');

  const {
    currentStepIndex,
    isPlaying,
    graphData,
    graphVersion,
    showSummary,
    startReasoning,
    reset: resetPlayer,
    jumpToStep,
    showSummaryGraph,
    cleanup
  } = useReasoningPlayer();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const fetchReasoning = async (question) => {
    try {
      const prompt = generateReasoningPrompt(question, 'finance');
      const response = await sendToGroqJSON(prompt);
      const data = parseReasoningResponse(response);
      
      return data;
    } catch (error) {
      console.error('Error fetching reasoning:', error);
      throw error;
    }
  };

  const [isEntering, setIsEntering] = useState(false);

  const handleSubmit = async () => {
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    setIsEntering(true);

    setTimeout(() => {
      setShowReasoning(true);
      setIsEntering(false);
    }, 600);

    try {
      const data = await fetchReasoning(inputText);
      
      setSteps(data.steps || []);
      setFinalAnswer(data.final_answer || '');
      setIsProcessing(false);

      setTimeout(() => {
        startReasoning(data.steps || [], data.summaryKeywords || []);
      }, 800);

    } catch (error) {
      console.error('Failed to process request:', error);
      setIsProcessing(false);
      setShowReasoning(false);
      setIsEntering(false);
    }
  };

  const [isExiting, setIsExiting] = useState(false);

  const handleReset = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowReasoning(false);
      setIsExiting(false);
    }, 1200);
    
    setTimeout(() => {
      resetPlayer();
      setInputText('');
      setSteps([]);
      setFinalAnswer('');
    }, 1300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-slate-800 px-4 sm:px-6 py-5 sm:py-6 relative overflow-hidden">
      {/* Ambient gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8"
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (showReasoning || isExiting) {
                handleReset();
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 text-slate-800 rounded-xl transition-colors shadow-md backdrop-blur-sm border border-amber-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            </motion.div>
            Finance AI
          </h1>
          
          <div className="hidden sm:block w-24" />
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Input View */}
            {!showReasoning && !isExiting && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 100 }}
                animate={isEntering ? { opacity: 0, y: -800 } : { opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh]"
              >
                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-20 left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{ y: [0, -15, 0], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                    className="absolute top-40 right-1/4 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={isEntering ? { opacity: 0, y: -800 } : { opacity: 1, y: 0 }}
                  transition={{ delay: isEntering ? 0 : 0.2, duration: 0.6, ease: "easeOut" }}
                  className="w-full max-w-3xl relative z-10"
                >
                  {/* Decorative header */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center mb-8"
                  >
                    <motion.div className="inline-block mb-4 relative">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.15, 1],
                          boxShadow: [
                            '0 0 30px rgba(245, 158, 11, 0.5)',
                            '0 0 60px rgba(245, 158, 11, 0.8)',
                            '0 0 30px rgba(245, 158, 11, 0.5)'
                          ]
                        }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl"
                      >
                        <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 w-20 h-20 rounded-full border-2 border-amber-400"
                      />
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-3 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                      Finance Intelligence
                    </h2>
                    <p className="text-slate-700 text-base sm:text-lg font-medium">
                      Get expert financial insights powered by AI reasoning
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs text-amber-600/90 font-semibold uppercase tracking-wider">AI-Powered Financial Analysis</span>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-3xl blur-xl opacity-30 animate-pulse" />
                    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-amber-300/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-300/30">
                      <div className="mb-6">
                        <label className="block text-amber-600 font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Your Finance Question
                        </label>
                        <div className="relative">
                          <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="E.g., How to create a diversified investment portfolio? What are the best strategies for retirement planning?"
                            className="w-full h-36 sm:h-40 px-6 py-4 bg-amber-50/50 border-2 border-amber-300/40 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 resize-none text-base sm:text-lg transition-all"
                            disabled={isProcessing}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey && inputText.trim() && !isProcessing) {
                                handleSubmit();
                              }
                            }}
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-slate-500/80">
                            Press Ctrl+Enter to submit
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={handleSubmit}
                        disabled={!inputText.trim() || isProcessing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600 disabled:from-slate-300 disabled:to-slate-400 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/60 disabled:cursor-not-allowed disabled:shadow-none group relative overflow-hidden border border-amber-400/30 text-white"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing Your Question...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            <span>Get AI Answer</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Reasoning View */}
            {(showReasoning || isExiting) && (
              <motion.div
                key="reasoning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col xl:grid xl:grid-cols-3 gap-6"
              >
                {/* Graph Visualization */}
                <motion.div
                  initial={{ opacity: 0, y: 800 }}
                  animate={isExiting ? { opacity: 0, y: 800 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="bg-white/60 backdrop-blur-xl border-2 border-amber-300/50 rounded-3xl p-4 md:p-6 shadow-2xl shadow-amber-300/20 xl:col-span-2 order-1"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-amber-700 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                      {showSummary ? 'Summary Graph' : 'Causal Graph'}
                    </h3>
                    {showSummary && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl transition-all font-semibold text-xs md:text-sm shadow-lg hover:shadow-amber-400/50 w-full sm:w-auto justify-center"
                      >
                        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                        Back to Input
                      </button>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 rounded-2xl overflow-hidden border border-amber-300/40 w-full shadow-inner shadow-amber-200/20">
                    {graphData ? (
                      <div className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden">
                        <GraphRenderer
                          graphData={graphData}
                          graphVersion={graphVersion}
                          width="100%"
                          height="100%"
                          enableAnimation={true}
                          backgroundColor="#FFFEF7"
                          borderColor="rgba(245, 158, 11, 0.25)"
                          nodeColor="#F59E0B"
                          edgeColor="#F59E0B"
                          textColor="#78350F"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] text-amber-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                  </div>

                  {!showSummary && steps.length > 0 && (
                    <div className="mt-4 text-center text-xs md:text-sm text-amber-600/80 font-semibold">
                      Step {currentStepIndex + 1} of {steps.length}
                    </div>
                  )}
                </motion.div>

                {/* Progress & Current Step Info */}
                <motion.div
                  initial={{ opacity: 0, x: 800 }}
                  animate={isExiting ? { opacity: 0, x: -800 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: isExiting ? 0.4 : 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-4 order-3 xl:order-2"
                >
                  {/* Step Progress */}
                  <div className="bg-white/60 backdrop-blur-xl border-2 border-amber-300/50 rounded-3xl p-4 md:p-6 shadow-2xl shadow-amber-300/20">
                    <h3 className="text-base md:text-lg font-bold text-amber-700 mb-3 md:mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                      Progress
                    </h3>
                    <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-100/50">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          onClick={() => jumpToStep(index)}
                          className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-all cursor-pointer hover:bg-amber-200/40 ${
                            index === currentStepIndex && !showSummary
                              ? 'bg-amber-200/60 border border-amber-400/70'
                              : index < currentStepIndex || (index === currentStepIndex && showSummary)
                              ? 'bg-amber-100/60 border border-amber-300/50'
                              : 'bg-slate-100/50 border border-slate-300/40'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0 ${
                              index === currentStepIndex && isPlaying && !showSummary
                                ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white animate-pulse'
                                : index < currentStepIndex || (index === currentStepIndex && showSummary)
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-400 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span
                            className={`text-xs md:text-sm font-medium ${
                              index <= currentStepIndex || showSummary
                                ? 'text-amber-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {step.title || `Step ${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* View Summary Button */}
                    {!isPlaying && steps.length > 0 && (
                      <button
                        onClick={showSummaryGraph}
                        className="w-full mt-3 md:mt-4 px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl transition-all font-semibold text-xs md:text-sm shadow-lg hover:shadow-amber-400/50 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                        {showSummary ? 'Viewing Summary' : 'View Summary'}
                      </button>
                    )}
                  </div>

                  {/* Current Step Details */}
                  {!showSummary && steps[currentStepIndex] && (
                    <div className="hidden xl:block bg-white/60 backdrop-blur-xl border-2 border-amber-300/50 rounded-3xl p-6 shadow-2xl shadow-amber-300/20">
                      <h3 className="text-lg font-bold text-amber-700 mb-3">
                        Current Step
                      </h3>
                      <h4 className="font-bold text-amber-600 text-sm mb-2">
                        {steps[currentStepIndex].title}
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {steps[currentStepIndex].text}
                      </p>
                      {steps[currentStepIndex].keywords && (
                        <div className="mt-4">
                          <p className="text-xs text-slate-600 mb-2">Key Concepts:</p>
                          <div className="flex flex-wrap gap-2">
                            {steps[currentStepIndex].keywords.map((keyword, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-amber-200/70 text-amber-700 text-xs rounded-lg border border-amber-300/40"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Reasoning Process */}
                <motion.div
                  initial={{ opacity: 0, y: 800 }}
                  animate={isExiting ? { opacity: 0, y: 800 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="bg-white/60 backdrop-blur-xl border-2 border-amber-300/50 rounded-3xl p-4 md:p-6 shadow-2xl shadow-amber-300/20 w-full xl:col-span-3 order-2 xl:order-3"
                >
                  <h3 className="text-lg md:text-xl font-bold text-amber-700 mb-4 md:mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                    Reasoning Process
                  </h3>

                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: index <= currentStepIndex ? 1 : 0.3,
                          x: 0,
                          scale: index === currentStepIndex && isPlaying ? 1.02 : 1
                        }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 md:p-4 rounded-xl transition-all ${
                          index === currentStepIndex && isPlaying
                            ? 'bg-amber-200/60 border-2 border-amber-400/70 shadow-lg'
                            : 'bg-slate-50/60 border border-slate-300/50'
                        }`}
                      >
                        {step.title && (
                          <h4 className="font-bold text-amber-600 text-xs md:text-sm mb-1">
                            {step.title}
                          </h4>
                        )}
                        <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                          {step.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Final Answer */}
                  {showSummary && finalAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-amber-100/80 to-yellow-100/80 border-2 border-amber-300/60 rounded-xl p-4 md:p-5 shadow-inner"
                    >
                      <h4 className="text-sm md:text-base font-bold text-amber-700 mb-2 md:mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                        Final Answer
                      </h4>
                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                        {finalAnswer}
                      </p>
                    </motion.div>
                  )}

                  {/* Reset Button */}
                  {showSummary && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={handleReset}
                      className="w-full mt-4 md:mt-6 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-800 rounded-xl font-semibold transition-colors text-sm md:text-base border border-slate-300 shadow-md"
                    >
                      Ask Another Question
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Animated Bottom Lines */}
      <div className="fixed bottom-0 left-0 right-0 h-1 z-50 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: '50%',
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(245, 158, 11, 0.6)'
          }}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-1 z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5
          }}
          style={{
            width: '100%',
          }}
        />
      </div>
    </div>
  );
}
