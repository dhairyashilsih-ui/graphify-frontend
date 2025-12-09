import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Wheat, Heart, GraduationCap, DollarSign, Car, Globe, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react';
import { VoiceAssistant } from '../services/voiceAssistant';
import { sendToGroq, type GroqMessage } from '../services/groqAI';
import { 
  saveConversation, 
  loadConversation, 
  generateSessionId, 
  getStoredSessionId, 
  setStoredSessionId 
} from '../services/mongodb';
import { extractKeyFacts, buildContextString } from '../services/conversationSummarizer';

interface DomainSelectionProps {
  onSelectDomain: (domain: string) => void;
}

const mainDomains = [
  { 
    id: 'agriculture', 
    name: 'Agriculture', 
    icon: Wheat, 
    color: 'from-emerald-500 to-green-600',
    lightColor: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    hoverBorder: 'hover:border-emerald-500',
    description: 'Smart farming & crop analysis',
    gradient: 'from-emerald-500/20 via-green-500/10 to-transparent'
  },
  { 
    id: 'health', 
    name: 'Health', 
    icon: Heart, 
    color: 'from-rose-500 to-pink-600',
    lightColor: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    hoverBorder: 'hover:border-rose-500',
    description: 'Medical insights & wellness',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent'
  },
  { 
    id: 'education', 
    name: 'Education', 
    icon: GraduationCap, 
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    hoverBorder: 'hover:border-blue-500',
    description: 'Learning & knowledge',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent'
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    icon: DollarSign, 
    color: 'from-amber-500 to-orange-600',
    lightColor: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    hoverBorder: 'hover:border-amber-500',
    description: 'Financial insights',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  { 
    id: 'transport', 
    name: 'Transport', 
    icon: Car, 
    color: 'from-cyan-500 to-teal-600',
    lightColor: 'from-cyan-400 to-teal-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    hoverBorder: 'hover:border-cyan-500',
    description: 'Smart mobility',
    gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent'
  },
  { 
    id: 'universal-ai', 
    name: 'Universal AI', 
    icon: Globe, 
    color: 'from-indigo-500 to-purple-600',
    lightColor: 'from-indigo-400 to-purple-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    hoverBorder: 'hover:border-indigo-500',
    description: 'All-domain intelligence',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent'
  },
];

export default function DomainSelection({ onSelectDomain }: DomainSelectionProps) {
  const controls = useAnimation();
  const orbControls = useAnimation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);
  const sessionIdRef = useRef<string>('');
  const keyFactsRef = useRef<string[]>([]);
  const conversationHistory = useRef<GroqMessage[]>([
    {
      role: 'system',
      content: 'You are Krushimitra, a friendly AI assistant. You help users choose the right domain for their needs. Keep responses concise and friendly. Available domains: Agriculture, Health, Education, Finance, Transport, and Universal AI.'
    }
  ]);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant();

    const initSession = async () => {
      let sessionId = getStoredSessionId();
      
      if (!sessionId) {
        sessionId = generateSessionId();
        setStoredSessionId(sessionId);
      }
      
      sessionIdRef.current = sessionId;
      
      const savedMessages = await loadConversation(sessionId);
      if (savedMessages && savedMessages.length > 1) {
        const contextMsg = savedMessages.find(m => m.role === 'system' && m.content.includes('Known:'));
        if (contextMsg) {
          const factsStr = contextMsg.content.replace('Known: ', '');
          keyFactsRef.current = factsStr.split(', ').filter(f => f.length > 0);
        }
      }
    };
    
    initSession();

    return () => {
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.stopListening();
        voiceAssistantRef.current.stopSpeaking();
      }
    };
  }, []);

  const startListening = () => {
    if (!voiceAssistantRef.current || isListening) return;

    voiceAssistantRef.current.startListening(
      async (text) => {
        setTranscript(text);
        setIsListening(false);
        orbControls.set({ scale: 1 });
        
        await processUserInput(text);
      },
      (error) => {
        console.error('Listening error:', error);
        setIsListening(false);
        orbControls.set({ scale: 1 });
      },
      () => {
        setIsListening(true);
        orbControls.start({
          scale: [1, 1.05, 1],
          transition: { 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop"
          }
        });
      },
      () => {
        setIsListening(false);
        orbControls.stop();
        orbControls.set({ scale: 1 });
      }
    );
  };

  const stopListening = () => {
    voiceAssistantRef.current?.stopListening();
    setIsListening(false);
    orbControls.stop();
    orbControls.set({ scale: 1 });
  };

  const processUserInput = async (userText: string) => {
    try {
      const context = buildContextString(keyFactsRef.current);
      
      const requestMessages: GroqMessage[] = [
        {
          role: 'system',
          content: conversationHistory.current[0].content + (context ? ` ${context}` : '')
        },
        {
          role: 'user',
          content: userText
        }
      ];

      const aiResponse = await sendToGroq(requestMessages);
      
      const newFacts = await extractKeyFacts(userText, aiResponse);
      
      if (newFacts.length > 0) {
        for (const newFact of newFacts) {
          const factKey = newFact.toLowerCase().split(':')[0].trim();
          
          const existingIndex = keyFactsRef.current.findIndex(existing => 
            existing.toLowerCase().split(':')[0].trim() === factKey
          );
          
          if (existingIndex >= 0) {
            keyFactsRef.current[existingIndex] = newFact;
          } else {
            keyFactsRef.current.push(newFact);
          }
        }
      }

      await saveConversation(sessionIdRef.current, [
        conversationHistory.current[0],
        {
          role: 'system',
          content: buildContextString(keyFactsRef.current)
        }
      ]);

      setResponse(aiResponse);

      voiceAssistantRef.current?.speak(
        aiResponse,
        {
          onStart: () => {
            setIsSpeaking(true);
            orbControls.start({
              scale: [1, 1.15, 1],
              transition: { 
                duration: 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop"
              }
            });
          },
          onEnd: () => {
            setIsSpeaking(false);
            orbControls.stop();
            orbControls.set({ scale: 1 });
            setTimeout(() => startListening(), 500);
          }
        }
      );
    } catch (error) {
      console.error('Error processing input:', error);
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      setResponse(errorMsg);
      voiceAssistantRef.current?.speak(errorMsg, {
        onStart: () => {
          setIsSpeaking(true);
          orbControls.start({
            scale: [1, 1.15, 1],
            transition: { 
              duration: 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop"
            }
          });
        },
        onEnd: () => {
          setIsSpeaking(false);
          orbControls.stop();
          orbControls.set({ scale: 1 });
          setTimeout(() => startListening(), 500);
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Ambient gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: 360,
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full blur-2xl opacity-30"
              />
              <Sparkles className="relative w-16 h-16 md:w-20 md:h-20 text-indigo-600 drop-shadow-2xl" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
          >
            FUSION AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-slate-600 text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto"
          >
            Your Intelligent Assistant Across All Domains
          </motion.p>
        </motion.div>

        {/* Voice Assistant Orb */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col items-center justify-center mb-12 md:mb-16"
        >
          <motion.div
            animate={orbControls}
            className="relative cursor-pointer group mb-6"
            onClick={() => {
              if (!isInitialized) {
                setIsInitialized(true);
                startListening();
              } else if (isListening) {
                stopListening();
              } else if (!isSpeaking) {
                startListening();
              }
            }}
            whileHover={!isListening && !isSpeaking ? { scale: 1.05 } : {}}
            whileTap={!isListening && !isSpeaking ? { scale: 0.95 } : {}}
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                boxShadow: isListening 
                  ? [
                      "0 0 60px rgba(99, 102, 241, 0.4)",
                      "0 0 100px rgba(99, 102, 241, 0.6)",
                      "0 0 60px rgba(99, 102, 241, 0.4)",
                    ]
                  : isSpeaking
                  ? [
                      "0 0 60px rgba(139, 92, 246, 0.4)",
                      "0 0 100px rgba(139, 92, 246, 0.6)",
                      "0 0 60px rgba(139, 92, 246, 0.4)",
                    ]
                  : [
                      "0 0 40px rgba(99, 102, 241, 0.3)",
                      "0 0 60px rgba(139, 92, 246, 0.4)",
                      "0 0 40px rgba(99, 102, 241, 0.3)",
                    ]
              }}
              transition={{
                duration: isSpeaking ? 0.6 : 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-full"
            >
              <div className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 relative">
                <img 
                  src="/homeora.svg" 
                  alt="FUSION AI Assistant" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
                
                {/* Voice indicator overlay */}
                {(isListening || isSpeaking) && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`absolute inset-0 rounded-full ${
                        isListening ? 'bg-indigo-400/30' : 'bg-purple-400/30'
                      }`}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Status indicators */}
          <AnimatePresence mode="wait">
            {isListening && (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-indigo-300/50"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Mic className="w-5 h-5 text-indigo-600" />
                </motion.div>
                <span className="text-indigo-700 font-semibold">Listening...</span>
              </motion.div>
            )}
            {isSpeaking && (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-purple-300/50"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Volume2 className="w-5 h-5 text-purple-600" />
                </motion.div>
                <span className="text-purple-700 font-semibold">Speaking...</span>
              </motion.div>
            )}
            {!isListening && !isSpeaking && !isInitialized && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-xl rounded-2xl shadow-md border border-slate-300/50"
              >
                <Mic className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700 font-medium text-sm">Click to start voice conversation</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript and Response */}
          {(transcript || response) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-2xl w-full space-y-3"
            >
              {transcript && (
                <div className="bg-white/70 backdrop-blur-xl border-2 border-blue-300/50 rounded-2xl p-4 shadow-lg">
                  <p className="text-xs font-semibold text-blue-600 mb-1">You said:</p>
                  <p className="text-sm text-slate-700">{transcript}</p>
                </div>
              )}
              {response && (
                <div className="bg-white/70 backdrop-blur-xl border-2 border-purple-300/50 rounded-2xl p-4 shadow-lg">
                  <p className="text-xs font-semibold text-purple-600 mb-1">AI Response:</p>
                  <p className="text-sm text-slate-700">{response}</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Domain Selection Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800">
            Choose Your Domain
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mainDomains.map((domain, index) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDomain(domain.id)}
                className={`group cursor-pointer bg-white/80 backdrop-blur-xl border-2 ${domain.borderColor} ${domain.hoverBorder} rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 md:w-20 md:h-20 mb-4 rounded-2xl bg-gradient-to-br ${domain.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <domain.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </motion.div>
                  
                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">
                    {domain.name}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 group-hover:text-slate-700">
                    {domain.description}
                  </p>
                  
                  {/* Arrow indicator */}
                  <motion.div
                    initial={{ x: 0, opacity: 0 }}
                    whileHover={{ x: 5, opacity: 1 }}
                    className="absolute bottom-6 right-6 text-slate-400 group-hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center mt-12 md:mt-16"
        >
          <p className="text-slate-500 text-sm md:text-base">
            Powered by Advanced AI Reasoning • Real-time Causal Analysis • Voice-Enabled
          </p>
        </motion.div>
      </div>

      {/* Animated Bottom Lines */}
      <div className="fixed bottom-0 left-0 right-0 h-1 z-50 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
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
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(139, 92, 246, 0.6)'
          }}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-1 z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
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
