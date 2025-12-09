import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { sendToGroqJSON } from '../services/groqAI';
import { generateReasoningPrompt, parseReasoningResponse } from '../utils/graphGenerator';
import { useReasoningPlayer } from '../hooks/useReasoningPlayer';
import GraphRenderer from '../components/GraphRenderer';

export default function AgricultureSection({ onBack }) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [expandedSteps, setExpandedSteps] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Track viewport for mobile-specific sizing
  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // Auto-expand current step on mobile
  useEffect(() => {
    if (currentStepIndex >= 0 && !expandedSteps.includes(currentStepIndex)) {
      setExpandedSteps([currentStepIndex]);
    }
  }, [currentStepIndex]);

  /**
   * Toggle step expansion (accordion)
   */
  const toggleStep = (index) => {
    setExpandedSteps(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  /**
   * Fetch reasoning structure from AI (SINGLE API CALL)
   */
  const fetchReasoning = async (question) => {
    try {
      const prompt = generateReasoningPrompt(question);
      const response = await sendToGroqJSON(prompt);
      const data = parseReasoningResponse(response);
      
      return data;
    } catch (error) {
      console.error('Error fetching reasoning:', error);
      throw error;
    }
  };

  /**
   * Handle form submission with animation
   */
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

  /**
   * Reset to initial state with animation
   */
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
      setExpandedSteps([]);
    }, 1300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-x-hidden">
      {/* Responsive padding */}
      <div style={{ padding: 'clamp(12px, 4vw, 24px)' }}>
        
        {/* Header - Fully Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors touch-manipulation min-h-[40px]"
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 
            className="font-bold text-emerald-300 flex items-center gap-2 md:gap-3"
            style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}
          >
            <Sparkles className="w-5 h-5 md:w-8 md:h-8 animate-pulse" />
            <span className="hidden xs:inline">Agriculture AI</span>
            <span className="xs:hidden">AI</span>
          </h1>
          
          <div className="w-12 md:w-24" />
        </motion.div>

        {/* Main Content Container */}
        <div className="w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* ========== INPUT VIEW (MOBILE-FIRST) ========== */}
            {!showReasoning && !isExiting && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 100 }}
                animate={isEntering ? { opacity: 0, y: -800 } : { opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center"
                style={{ minHeight: isMobile ? 'clamp(380px, 65vh, 760px)' : 'clamp(400px, 70vh, 800px)' }}
              >
                {/* Floating particles - reduced on mobile */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
                  <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={isEntering ? { opacity: 0, y: -800 } : { opacity: 1, y: 0 }}
                  transition={{ delay: isEntering ? 0 : 0.2, duration: 0.6, ease: "easeOut" }}
                  className="w-full relative z-10"
                  style={{ maxWidth: 'min(900px, 96vw)' }}
                >
                  {/* Decorative header - Responsive Orb */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center"
                    style={{ marginBottom: 'clamp(16px, 4vw, 32px)' }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                      style={{ marginBottom: 'clamp(8px, 2vw, 16px)' }}
                    >
                      <div 
                        className="rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                        style={{ 
                          width: 'clamp(60px, 15vw, 80px)',
                          height: 'clamp(60px, 15vw, 80px)'
                        }}
                      >
                        <Sparkles 
                          style={{ 
                            width: 'clamp(30px, 7vw, 40px)',
                            height: 'clamp(30px, 7vw, 40px)'
                          }}
                          className="text-white" 
                        />
                      </div>
                    </motion.div>
                    
                    <h2 
                      className="font-extrabold bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent"
                      style={{ 
                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                        marginBottom: 'clamp(8px, 1.5vw, 12px)'
                      }}
                    >
                      Agriculture Intelligence
                    </h2>
                    
                    <p 
                      className="text-slate-400"
                      style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}
                    >
                      Get expert insights powered by AI reasoning
                    </p>
                  </motion.div>

                  {/* Input Card - Fully Responsive */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-3xl blur opacity-30 animate-pulse hidden md:block" />
                    
                    <div 
                      className="relative bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl md:rounded-3xl shadow-2xl"
                      style={{ padding: 'clamp(16px, 4vw, 28px)' }}
                    >
                      <div style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>
                        <label 
                          className="block text-emerald-300 font-semibold uppercase tracking-wide"
                          style={{ 
                            fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                            marginBottom: 'clamp(8px, 2vw, 12px)'
                          }}
                        >
                          Your Question
                        </label>
                        
                        <div className="relative">
                          <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="E.g., How to optimize tomato yield in summer?"
                            className="w-full bg-slate-800/70 border border-emerald-500/20 rounded-xl md:rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
                            style={{
                              height: 'clamp(120px, 20vh, 160px)',
                              padding: 'clamp(12px, 2.5vw, 24px)',
                              fontSize: 'clamp(0.875rem, 2.2vw, 1.125rem)'
                            }}
                            disabled={isProcessing}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey && inputText.trim() && !isProcessing) {
                                handleSubmit();
                              }
                            }}
                          />
                          <div 
                            className="absolute bottom-2 right-2 md:bottom-3 md:right-3 text-slate-500 hidden sm:block"
                            style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}
                          >
                            Ctrl+Enter to submit
                          </div>
                        </div>
                      </div>
                      
                      {/* Submit Button - Touch Friendly */}
                      <motion.button
                        onClick={handleSubmit}
                        disabled={!inputText.trim() || isProcessing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-600 rounded-xl md:rounded-2xl font-bold flex items-center justify-center transition-all shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:shadow-none group relative overflow-hidden touch-manipulation"
                        style={{
                          padding: 'clamp(14px, 3vw, 20px)',
                          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                          gap: 'clamp(8px, 2vw, 12px)',
                          minHeight: '48px'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                            <span className="hidden xs:inline">Analyzing...</span>
                            <span className="xs:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                            <span>Get AI Answer</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ========== REASONING VIEW (MOBILE-FIRST STACK) ========== */}
            {(showReasoning || isExiting) && (
              <motion.div
                key="reasoning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 md:gap-6"
                style={{ gap: 'clamp(12px, 2vw, 24px)' }}
              >
                
                {/* Graph Container - ASPECT RATIO + AUTO-RESIZE */}
                <motion.div
                  initial={{ opacity: 0, y: 800 }}
                  animate={isExiting ? { opacity: 0, y: 800 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl md:rounded-3xl shadow-2xl w-full"
                  style={{ padding: 'clamp(12px, 2.5vw, 24px)' }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h3 
                      className="font-bold text-emerald-300 flex items-center gap-2"
                      style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
                    >
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                      {showSummary ? 'Summary Graph' : 'Causal Graph'}
                    </h3>
                    {showSummary && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-emerald-500/50 touch-manipulation min-h-[40px]"
                        style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)' }}
                      >
                        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                        Back to Input
                      </button>
                    )}
                  </div>

                  {/* Graph with Aspect Ratio Container */}
                  <div 
                    className="bg-slate-800/30 rounded-xl md:rounded-2xl overflow-hidden border border-emerald-500/20 w-full"
                    style={{ aspectRatio: isMobile ? '1 / 1' : '16 / 10' }}
                  >
                    {graphData ? (
                      <GraphRenderer
                        graphData={graphData}
                        graphVersion={graphVersion}
                        width="100%"
                        height="100%"
                        enableAnimation={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                  </div>

                  {!showSummary && steps.length > 0 && (
                    <div 
                      className="mt-4 text-center text-emerald-400/60 font-semibold"
                      style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)' }}
                    >
                      Step {currentStepIndex + 1} of {steps.length}
                    </div>
                  )}
                </motion.div>

                {/* Progress Panel - ACCORDION ON MOBILE */}
                <motion.div
                  initial={{ opacity: 0, x: 800 }}
                  animate={isExiting ? { opacity: 0, x: -800 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: isExiting ? 0.4 : 0.3, ease: "easeOut" }}
                  className="bg-slate-900/60 backdrop-blur-xl border-2 border-emerald-500/30 rounded-2xl md:rounded-3xl shadow-2xl"
                  style={{ padding: 'clamp(12px, 2.5vw, 24px)' }}
                >
                  <h3 
                    className="font-bold text-emerald-300 flex items-center gap-2"
                    style={{ 
                      fontSize: 'clamp(1rem, 2.2vw, 1.125rem)',
                      marginBottom: 'clamp(12px, 2vw, 16px)'
                    }}
                  >
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    Progress
                  </h3>
                  
                  {/* Steps - Accordion Style on Mobile */}
                  <div 
                    className="space-y-2 overflow-y-auto"
                    style={{ maxHeight: 'clamp(300px, 40vh, 500px)' }}
                  >
                    {steps.map((step, index) => (
                      <div key={index}>
                        <div
                          onClick={() => {
                            jumpToStep(index);
                            toggleStep(index);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-emerald-500/10 touch-manipulation min-h-[48px] ${
                            index === currentStepIndex && !showSummary
                              ? 'bg-emerald-500/20 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                              : index < currentStepIndex || (index === currentStepIndex && showSummary)
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-slate-800/30 border border-slate-700/30'
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold ${
                              index === currentStepIndex && isPlaying && !showSummary
                                ? 'bg-emerald-500 text-slate-900 animate-pulse'
                                : index < currentStepIndex || (index === currentStepIndex && showSummary)
                                ? 'bg-emerald-500/50 text-slate-900'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                            style={{
                              width: 'clamp(32px, 7vw, 40px)',
                              height: 'clamp(32px, 7vw, 40px)',
                              fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)'
                            }}
                          >
                            {index + 1}
                          </div>
                          <span
                            className={`flex-1 font-medium ${
                              index <= currentStepIndex || showSummary
                                ? 'text-emerald-300'
                                : 'text-slate-500'
                            }`}
                            style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}
                          >
                            {step.title || `Step ${index + 1}`}
                          </span>
                          {/* Expand icon on mobile */}
                          <span className="md:hidden">
                            {expandedSteps.includes(index) ? (
                              <ChevronUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </span>
                        </div>

                        {/* Expanded Content - Mobile Only */}
                        <AnimatePresence>
                          {expandedSteps.includes(index) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="md:hidden overflow-hidden"
                            >
                              <div 
                                className="p-3 mt-2 bg-slate-800/50 rounded-lg border border-emerald-500/20"
                                style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)' }}
                              >
                                <p className="text-slate-200 leading-relaxed mb-2">
                                  {step.text}
                                </p>
                                {step.keywords && step.keywords.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-slate-400 mb-2">Key Concepts:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {step.keywords.map((keyword, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg"
                                        >
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                  
                  {/* View Summary Button */}
                  {!isPlaying && steps.length > 0 && (
                    <button
                      onClick={showSummaryGraph}
                      className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600/80 to-emerald-500/80 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
                      style={{ 
                        marginTop: 'clamp(12px, 2vw, 16px)',
                        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      {showSummary ? 'Viewing Summary' : 'View Summary'}
                    </button>
                  )}
                </motion.div>

                {/* Current Step Details - DESKTOP ONLY */}
                {!showSummary && steps[currentStepIndex] && (
                  <div className="hidden md:block bg-slate-900/60 backdrop-blur-xl border-2 border-emerald-500/30 rounded-3xl shadow-2xl" style={{ padding: 'clamp(16px, 2.5vw, 24px)' }}>
                    <h3 className="text-lg font-bold text-emerald-300 mb-3">
                      Current Step
                    </h3>
                    <h4 className="font-bold text-emerald-400 text-sm mb-2">
                      {steps[currentStepIndex].title}
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {steps[currentStepIndex].text}
                    </p>
                    {steps[currentStepIndex].keywords && (
                      <div className="mt-4">
                        <p className="text-xs text-slate-400 mb-2">Key Concepts:</p>
                        <div className="flex flex-wrap gap-2">
                          {steps[currentStepIndex].keywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reasoning Process - Collapsible on Mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 800 }}
                  animate={isExiting ? { opacity: 0, y: 800 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="bg-slate-900/60 backdrop-blur-xl border-2 border-emerald-500/30 rounded-2xl md:rounded-3xl shadow-2xl w-full"
                  style={{ padding: 'clamp(12px, 2.5vw, 24px)' }}
                >
                  <h3 
                    className="font-bold text-emerald-300 flex items-center gap-2"
                    style={{ 
                      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                      marginBottom: 'clamp(16px, 3vw, 24px)'
                    }}
                  >
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                    Reasoning Process
                  </h3>

                  <div 
                    className="space-y-3 md:space-y-4"
                    style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}
                  >
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
                        className={`rounded-xl transition-all ${
                          index === currentStepIndex && isPlaying
                            ? 'bg-emerald-500/20 border-2 border-emerald-500/50 shadow-lg'
                            : 'bg-slate-800/40 border border-slate-700/50'
                        }`}
                        style={{ padding: 'clamp(12px, 2vw, 16px)' }}
                      >
                        {step.title && (
                          <h4 
                            className="font-bold text-emerald-400 mb-1"
                            style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.875rem)' }}
                          >
                            {step.title}
                          </h4>
                        )}
                        <p 
                          className="text-slate-200 leading-relaxed"
                          style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)' }}
                        >
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
                      className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl"
                      style={{ padding: 'clamp(12px, 2.5vw, 20px)' }}
                    >
                      <h4 
                        className="font-bold text-emerald-300 flex items-center gap-2"
                        style={{ 
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          marginBottom: 'clamp(8px, 1.5vw, 12px)'
                        }}
                      >
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                        Final Answer
                      </h4>
                      <p 
                        className="text-slate-200 leading-relaxed"
                        style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}
                      >
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
                      className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors touch-manipulation min-h-[44px]"
                      style={{ 
                        marginTop: 'clamp(16px, 3vw, 24px)',
                        fontSize: 'clamp(0.85rem, 2vw, 1rem)'
                      }}
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
    </div>
  );
}
