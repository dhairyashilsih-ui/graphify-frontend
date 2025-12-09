import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Wheat, Heart, GraduationCap, DollarSign, Car, Globe, Cpu, Shield, MessageCircle, Lightbulb, Sparkles, Brain, Mic, ArrowRight } from 'lucide-react';
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
    color: 'from-emerald-400 via-green-500 to-teal-600',
    description: 'Precision farming, crop intelligence & sustainable agriculture',
    gradient: 'from-emerald-500/30 via-green-500/20 to-teal-400/10',
    accentColor: 'emerald',
    highlight: true
  },
  { 
    id: 'health', 
    name: 'Health', 
    icon: Heart, 
    color: 'from-rose-400 to-pink-600',
    description: 'Medical insights & wellness',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    accentColor: 'rose'
  },
  { 
    id: 'education', 
    name: 'Education', 
    icon: GraduationCap, 
    color: 'from-amber-400 to-orange-600',
    description: 'Learning & knowledge enhancement',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    accentColor: 'amber'
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    icon: DollarSign, 
    color: 'from-cyan-400 to-blue-600',
    description: 'Financial analysis & insights',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    accentColor: 'cyan'
  },
  { 
    id: 'transport', 
    name: 'Transport', 
    icon: Car, 
    color: 'from-violet-400 to-purple-600',
    description: 'Smart mobility solutions',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    accentColor: 'violet'
  },
  { 
    id: 'universal-ai', 
    name: 'Universal AI', 
    icon: Globe, 
    color: 'from-indigo-400 to-blue-600',
    description: 'All-encompassing intelligence',
    gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    accentColor: 'indigo'
  },
];

const techRealms = [
  { id: 'robotics', name: 'Robotics', icon: Cpu, color: 'from-blue-400 to-cyan-500' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield, color: 'from-red-400 to-orange-500' },
  { id: 'social', name: 'Social Media', icon: MessageCircle, color: 'from-purple-400 to-pink-500' },
  { id: 'lab', name: 'Tech Lab', icon: Lightbulb, color: 'from-yellow-400 to-amber-500' },
];

const heroParticles = [
  { top: '22%', left: '18%', size: 7, duration: 20 },
  { top: '64%', left: '72%', size: 9, duration: 24 }
];

const premiumEase = [0.22, 1, 0.36, 1] as const;

export default function DomainSelection({ onSelectDomain }: DomainSelectionProps) {
  const orbControls = useAnimation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [ringBurst, setRingBurst] = useState(0);
  const [liftActive, setLiftActive] = useState(false);
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);
  const sessionIdRef = useRef<string>('');
  const keyFactsRef = useRef<string[]>([]); // Stores compressed facts only
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseFrameRef = useRef<number | null>(null);
  const latestMouseRef = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Detect scrolling to pause heavy animations
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  // Mouse position tracking for parallax
  const conversationHistory = useRef<GroqMessage[]>([
    {
      role: 'system',
      content: 'You are Graphify — a friendly, smart AI that remembers context and thinks in connections.You keep data of user which is below given read that and always use user deails in answers if have. You speak like a helpful human, keep answers simple, and always respond with clarity and warmth. You help users choose the right domain for their needs. Available domains: Agriculture, Health, Education, Finance, Transport, and Universal AI.'
    }
  ]);

  const revealDistance = isMobile ? 30 : 60;
  const revealDuration = isMobile ? 0.6 : 1.05;
  const revealParent = {
    hidden: { opacity: 0, y: revealDistance, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: revealDuration,
        ease: premiumEase,
        staggerChildren: isMobile ? 0.08 : 0.12
      }
    }
  };
  const revealChild = {
    hidden: { opacity: 0, y: revealDistance * 0.7, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: revealDuration,
        ease: premiumEase
      }
    }
  };

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      orbControls.start({
        scale: [1, 1.02, 1],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      });
      return () => orbControls.stop();
    }

    if (isListening) {
      orbControls.start({
        scale: [1, 1.012, 1],
        opacity: [1, 0.96, 1],
        transition: {
          duration: 2.6,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      });
      return () => orbControls.stop();
    }

    orbControls.start({
      scale: [1, 1.005, 1],
      opacity: [1, 0.97, 1],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    });

    return () => orbControls.stop();
  }, [isSpeaking, isListening, orbControls]);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant();

    // Initialize or load session
    const initSession = async () => {
      let sessionId = getStoredSessionId();
      
      if (!sessionId) {
        sessionId = generateSessionId();
        setStoredSessionId(sessionId);
      }
      
      sessionIdRef.current = sessionId;
      
      // Load saved facts from MongoDB
      const savedMessages = await loadConversation(sessionId);
      if (savedMessages && savedMessages.length > 1) {
        // Extract facts from loaded context
        const contextMsg = savedMessages.find(m => m.role === 'system' && m.content.includes('Known:'));
        if (contextMsg) {
          const factsStr = contextMsg.content.replace('Known: ', '');
          keyFactsRef.current = factsStr.split(', ').filter(f => f.length > 0);
          console.log('Loaded facts from MongoDB:', keyFactsRef.current);
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

  // Auto-rotate featured domain every 3s; pauses while hovered
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mainDomains.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isPaused]);

  // Mouse move handler for parallax (disabled on mobile for performance)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return; // Disable on mobile
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    latestMouseRef.current = { x, y };
    if (mouseFrameRef.current === null) {
      mouseFrameRef.current = requestAnimationFrame(() => {
        setMousePosition(latestMouseRef.current);
        mouseFrameRef.current = null;
      });
    }
  };

  const handleMouseLeave = () => {
    if (mouseFrameRef.current !== null) {
      cancelAnimationFrame(mouseFrameRef.current);
      mouseFrameRef.current = null;
    }
    latestMouseRef.current = { x: 0, y: 0 };
    setMousePosition({ x: 0, y: 0 });
  };

  const activeDomain = mainDomains[activeIndex];
  const ActiveIcon = activeDomain.icon;

  const startListening = () => {
    if (!voiceAssistantRef.current || isListening) return;

    voiceAssistantRef.current.startListening(
      async (text) => {
        setIsListening(false);
        await processUserInput(text);
      },
      (error) => {
        console.error('Listening error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(true);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    voiceAssistantRef.current?.stopListening();
    setIsListening(false);
  };

  const processUserInput = async (userText: string) => {
    try {
      // Build context from saved facts
      const context = buildContextString(keyFactsRef.current);
      
      // Create request with system prompt + context + current question only
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

      // Get response from Groq
      const aiResponse = await sendToGroq(requestMessages);

      // Speak immediately (don't wait for fact extraction/save)
      voiceAssistantRef.current?.speak(aiResponse, {
        onStart: () => {
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setTimeout(() => startListening(), 500);
        }
      });

      // Extract facts and save in background so speech is not delayed
      (async () => {
        try {
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
        } catch (err) {
          console.error('Background fact extraction/save failed:', err);
        }
      })();
    } catch (error) {
      console.error('Error processing input:', error);
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      voiceAssistantRef.current?.speak(errorMsg, {
        onEnd: () => {
          setIsSpeaking(false);
          setTimeout(() => startListening(), 500);
        }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-x-hidden text-slate-900"
      style={{ background: '#F6F8FB' }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(900px at 18% 24%, rgba(191,219,254,0.14), transparent 55%), radial-gradient(1100px at 82% 36%, rgba(148,163,184,0.12), transparent 60%)',
            opacity: 0.7,
            willChange: 'auto'
          }}
        />
        {heroParticles.map((particle, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-slate-400"
            style={{
              width: particle.size,
              height: particle.size,
              top: particle.top,
              left: particle.left,
              opacity: 0.03
            }}
          />
        ))}
        <div className="absolute inset-x-[-18%] bottom-[-26%] h-[1200px] bg-[radial-gradient(880px_at_48%_12%,rgba(191,219,254,0.1),transparent_55%)]" />
      </div>

      {/* Full-bleed Graphify intro - Premium White Enterprise Design */}
      <section className="relative w-full flex flex-col overflow-hidden px-6 md:px-10 lg:px-16 pb-6 pt-12">
        {/* Premium white gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white" />
        
        {/* Subtle ambient glow */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{ 
            background: 'radial-gradient(1400px at 50% 35%, rgba(56,189,248,0.09), transparent 60%)',
          }}
        />
        
        {/* Top edge light */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
        
        {/* Header that moves to top */}
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [0, 0, 0, 0, 0, -290] }}
          transition={{ 
            duration: 6,
            times: [0, 0.7, 0.8, 0.85, 0.9, 1],
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative max-w-4xl w-full mx-auto text-center flex items-center justify-center"
          style={{ minHeight: '80vh' }}
        >
          {/* Premium heading with cinematic letter reveal */}
          <motion.h1
            initial="hidden"
            animate="visible"
            className="text-[clamp(2.4rem,4vw,3.2rem)] leading-[1.08] font-bold text-[#0B1F3A]"
          >
            {"Welcome to ".split("").map((char, index) => (
              <motion.span
                key={`welcome-${index}`}
                className="inline-block"
                variants={{
                  hidden: { 
                    opacity: index === 0 ? 0 : 0, 
                    y: index === 0 ? -150 : 0,
                    x: index === 0 ? 0 : -8, 
                    scale: index === 0 ? 1.4 : 0.92,
                    rotateX: index === 0 ? -15 : 0,
                    filter: 'blur(6px)' 
                  },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    x: 0, 
                    scale: 1,
                    rotateX: 0,
                    filter: 'blur(0px)',
                    transition: {
                      duration: index === 0 ? 1.4 : 0.5,
                      delay: index === 0 ? 3 : (4.4 + (index - 1) * 0.035),
                      ease: index === 0 ? [0.16, 1, 0.3, 1] : [0.16, 1, 0.3, 1]
                    }
                  }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
            <span className="inline-block">
              {"Graphify".split("").map((char, index) => (
                <motion.span
                  key={`graphify-${index}`}
                  className="inline-block bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent"
                  variants={{
                    hidden: { opacity: 0, x: -8, scale: 0.92, filter: 'blur(4px)' },
                    visible: { 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      filter: 'blur(0px)',
                      transition: {
                        duration: 0.5,
                        delay: 4.4 + (10 + index) * 0.035,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </motion.h1>
        </motion.div>

        {/* Choose Your Domain box - slides in from below */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 5.5,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative max-w-7xl w-full mx-auto"
          style={{ marginTop: 'clamp(-34rem, calc(-34rem + max(0px, 840px - 100vh) * 0.3), -18rem)' }}
        >
          <div
            className="relative bg-white backdrop-blur-md border rounded-[2rem] px-6 md:px-10 lg:px-12 py-12 lg:py-16 overflow-hidden"
            style={{
              borderColor: 'rgba(0, 90, 160, 0.12)',
              boxShadow: '0 18px 50px -26px rgba(15,23,42,0.18), 0 10px 30px -18px rgba(15,23,42,0.14)'
            }}
          >
            {/* Crisp edge lights */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-slate-200/50 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-200/50 to-transparent pointer-events-none" />

            {/* Subtle inner sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/30 to-transparent pointer-events-none" />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
        <div className="flex-1 max-w-2xl space-y-7 text-center lg:text-left">
          <div className="relative inline-flex">
            <motion.div
              className="absolute inset-0 rounded-full bg-sky-200/40 blur-lg"
              animate={{ opacity: [0.2, 0.35, 0.2], scale: [0.99, 1.03, 0.99] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-200/80 bg-white shadow-[0_1px_0_rgba(255,255,255,0.8),0_12px_32px_-22px_rgba(15,23,42,0.6)]"
            >
              <Sparkles className="w-4 h-4 text-sky-700" />
              <span className="text-[13px] font-semibold tracking-wide text-sky-800">Powered by Advanced AI</span>
              <motion.span
                className="absolute inset-0 rounded-full border border-transparent"
                animate={{ background: ['linear-gradient(120deg, rgba(14,165,233,0) 0%, rgba(14,165,233,0.35) 50%, rgba(14,165,233,0) 100%)', 'linear-gradient(120deg, rgba(14,165,233,0) 0%, rgba(14,165,233,0.35) 50%, rgba(14,165,233,0) 100%)'] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
                style={{ WebkitMask: 'linear-gradient(120deg, transparent 0%, white 50%, transparent 100%)', mask: 'linear-gradient(120deg, transparent 0%, white 50%, transparent 100%)' }}
              />
              <div className="absolute inset-0 rounded-full shadow-inner" style={{ boxShadow: 'inset 0 1px 2px rgba(15,23,42,0.08)' }} />
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: 'easeOut' }}
            className="text-[clamp(2.1rem,6vw,2.6rem)] md:text-[clamp(2.6rem,4vw,3.6rem)] leading-[1.08] font-bold text-[#0B1F3A]"
          >
            Choose Your Domain
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.8, ease: 'easeOut' }}
            className="hidden md:block text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-[#445266] max-w-3xl mx-auto lg:mx-0"
          >
            A live speech-to-speech AI assistant that listens, responds, and routes you to the right domain instantly. Built for enterprise reliability, low latency, and human-level clarity.
          </motion.p>

          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[{
              label: 'Real-time voice orchestration',
              icon: Mic
            }, {
              label: 'Secure domain handoff',
              icon: Shield
            }, {
              label: 'Adaptive listening & speaking',
              icon: Brain
            }, {
              label: 'Enterprise-grade uptime',
              icon: Cpu
            }].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="group flex items-center gap-3 rounded-2xl border bg-white/90 backdrop-blur-sm px-4 py-3 shadow-[0_12px_34px_-22px_rgba(15,23,42,0.14),0_1px_0_rgba(255,255,255,0.8)_inset] relative overflow-hidden transition-all duration-300"
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -3, boxShadow: '0 14px 32px -18px rgba(15,23,42,0.22), 0 1px 0 rgba(255,255,255,0.85) inset' }}
                >
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/50 to-transparent opacity-70" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/80 via-white to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                    <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" strokeWidth={2.2} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 transition-transform duration-200 will-change-transform group-hover:-translate-y-0.5">{item.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="relative"
          >
            {/* Premium depth container */}
            <div className="absolute inset-[-6%] rounded-full bg-gradient-to-b from-slate-100/45 to-transparent blur-xl" />
            <motion.div
              className="relative cursor-pointer select-none rounded-full overflow-hidden -mt-6 sm:-mt-4 md:mt-0"
              onClick={() => {
                if (!isInitialized) {
                  setIsInitialized(true);
                  startListening();
                } else if (isListening) {
                  stopListening();
                } else if (!isSpeaking) {
                  startListening();
                }
                setRingBurst((prev) => prev + 1);
              }}
              style={{ width: 'min(68vw, 380px)', height: 'min(68vw, 380px)', transformStyle: 'preserve-3d', perspective: 1400 }}
              whileHover={{ rotateX: 1.2, rotateY: -1.2, scale: 1.01, boxShadow: '0 28px 52px -32px rgba(15,23,42,0.32), 0 14px 24px -16px rgba(15,23,42,0.22)' }}
              whileTap={{ scale: 0.96 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div
                className="hidden sm:block absolute inset-[-8%] rounded-full bg-sky-200/40 blur-xl"
                style={{ opacity: 0.16 }}
              />
              {/* Double halo */}
              <div
                className="hidden sm:block absolute inset-[-6%] md:inset-[-5%] rounded-full border border-sky-100/70 bg-white/25 md:bg-white/30"
                style={{ opacity: 0.35 }}
              />
              <div
                className="hidden sm:block absolute inset-[-2%] rounded-full border border-sky-200/70"
                style={{ boxShadow: '0 18px 42px -32px rgba(15,23,42,0.26)', opacity: 0.44 }}
              />

              {/* Listening ripple */}
              <AnimatePresence>
                {isListening && (
                  <motion.span
                    className="hidden sm:block absolute inset-[-6%] rounded-full border border-sky-200/70"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: [0.25, 0], scale: [0.97, 1.08] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>

              {/* Orb core */}
              <motion.div
                animate={orbControls}
                className="relative mx-auto flex items-center justify-center rounded-full bg-white border"
                style={{
                  width: '100%',
                  height: '100%',
                  borderColor: 'rgba(80,160,220,0.18)',
                  boxShadow: liftActive
                    ? '0 26px 52px -30px rgba(15,23,42,0.32), 0 16px 32px -18px rgba(15,23,42,0.26)'
                    : '0 16px 42px -26px rgba(15,23,42,0.25), 0 10px 28px -20px rgba(15,23,42,0.2)'
                }}
              >
                <AnimatePresence>
                  {ringBurst > 0 && (
                    <motion.span
                      key={ringBurst}
                      className="absolute inset-[-10%] rounded-full border border-sky-200/60 pointer-events-none"
                      initial={{ opacity: 0.25, scale: 0.95 }}
                      animate={{ opacity: [0.3, 0], scale: [0.95, 1.2] }}
                      exit={{ opacity: 0, scale: 1.25 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ boxShadow: '0 0 48px rgba(56,189,248,0.25), 0 0 0 12px rgba(125,176,222,0.12)' }}
                    />
                  )}
                </AnimatePresence>
                <div className="absolute inset-[9%] rounded-full bg-white/90 border-2 border-white/80 backdrop-blur-md shadow-[0_12px_30px_-26px_rgba(15,23,42,0.24)] md:opacity-100 opacity-85" style={{ boxShadow: '0 12px 30px -26px rgba(15,23,42,0.24), inset 8px 0 28px rgba(148,163,184,0.16), inset -8px 0 28px rgba(148,163,184,0.16), inset 0 -10px 32px rgba(148,163,184,0.2), inset 0 10px 32px rgba(148,163,184,0.2)' }} />
                <div className="absolute inset-[16%] rounded-full border border-slate-200/70 shadow-inner" style={{ boxShadow: 'inset 0 1px 8px rgba(148,163,184,0.18)' }} />

                {/* Ground shadow for physical presence */}
                <div className="absolute -bottom-[6%] left-1/2 h-10 w-[55%] -translate-x-1/2 rounded-full blur-md" style={{ background: 'radial-gradient(circle, rgba(15,23,42,0.16) 0%, rgba(15,23,42,0) 65%)' }} />

                {/* Inner core */}
                <motion.div
                  className="relative z-10 flex h-full w-full items-center justify-center rounded-full overflow-hidden"
                  style={{ background: 'radial-gradient(circle at 42% 32%, rgba(255,255,255,0.95), #f5f7fb 55%, #e9eef7 100%)' }}
                  animate={{ scale: isSpeaking ? [1, 1.014, 1] : isListening ? [1, 1.01, 1] : [1, 1.003, 1] }}
                  transition={{ duration: isSpeaking ? 0.6 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Reflection sweep - static for performance */}
                  <div
                    className="absolute inset-[-10%] bg-gradient-to-br from-transparent via-white/35 to-transparent"
                    style={{ mixBlendMode: 'screen' }}
                  />

                  {/* Falcon icon in center */}
                  <img
                    src="/homeora.svg"
                    alt="Graphify Falcon Icon"
                    className="absolute w-[34%] max-w-[140px] opacity-90 drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 8px 14px rgba(15,23,42,0.18))' }}
                    loading="lazy"
                  />

                  {/* Inner bevel - enhanced with sharper edges all around */}
                  <div
                    className="absolute inset-[18%] rounded-full border border-white/80"
                    style={{
                      transform: liftActive ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
                      transition: 'transform 0.28s ease-out, box-shadow 0.28s ease-out',
                      boxShadow: liftActive
                        ? 'inset 0 12px 30px rgba(255,255,255,0.45), inset 0 -14px 34px rgba(148,163,184,0.28), inset 10px 0 28px rgba(148,163,184,0.18), inset -10px 0 28px rgba(148,163,184,0.18)'
                        : 'inset 0 10px 28px rgba(255,255,255,0.4), inset 0 -12px 30px rgba(148,163,184,0.22), inset 8px 0 24px rgba(148,163,184,0.15), inset -8px 0 24px rgba(148,163,184,0.15)'
                    }}
                  />

                  {/* Inner 3D ring for depth - enhanced with sharper edges */}
                  <div
                    className="absolute inset-[28%] rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(99, 179, 237, 0.08), rgba(148, 163, 184, 0.12) 60%, rgba(255, 255, 255, 0.02) 100%)',
                      boxShadow: liftActive
                        ? 'inset 0 10px 20px rgba(255,255,255,0.4), inset 0 -12px 20px rgba(148,163,184,0.32), inset 8px 0 18px rgba(148,163,184,0.22), inset -8px 0 18px rgba(148,163,184,0.22), 0 14px 28px -18px rgba(15,23,42,0.3)'
                        : 'inset 0 8px 18px rgba(255,255,255,0.35), inset 0 -10px 18px rgba(148,163,184,0.26), inset 6px 0 16px rgba(148,163,184,0.18), inset -6px 0 16px rgba(148,163,184,0.18), 0 10px 24px -18px rgba(15,23,42,0.25)',
                      transform: liftActive ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
                      transition: 'transform 0.28s ease-out, box-shadow 0.28s ease-out'
                    }}
                  />

                  {/* Voice bars */}
                  <div className="relative z-20 flex items-end gap-1">
                    {[1.15, 1.5, 1.2, 1.6, 1.25].map((scale, index) => (
                      <motion.span
                        key={index}
                        className="w-1.5 rounded-full bg-sky-500/80"
                        style={{ height: 26 }}
                        animate={isListening ? { scaleY: [1, scale, 1] } : isSpeaking ? { scaleY: [1, scale + 0.2, 1] } : { scaleY: 1 }}
                        transition={{ duration: isSpeaking ? 1.2 : 2.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.08 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <div className="mt-6 flex flex-col items-center gap-3 text-center w-full max-w-sm">
              <motion.button
                type="button"
                aria-pressed={isListening}
                disabled={isSpeaking}
                animate={isListening ? { scale: [1, 1.01, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: isListening ? Infinity : 0, ease: 'easeInOut' }}
                whileTap={{ scale: 0.96 }}
                className={`inline-flex w-full justify-center items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all backdrop-blur-md ${
                  isListening
                    ? 'border-sky-300/80 bg-white text-sky-800 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.3),0_8px_18px_-12px_rgba(15,23,42,0.22),0_2px_0_rgba(255,255,255,0.95)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset]'
                    : 'border-slate-200/80 bg-white text-slate-800 shadow-[0_12px_26px_-18px_rgba(15,23,42,0.26),0_7px_16px_-12px_rgba(15,23,42,0.2),0_2px_0_rgba(255,255,255,0.95)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset]'
                } ${isSpeaking ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-18px_rgba(15,23,42,0.32),0_8px_18px_-12px_rgba(15,23,42,0.24),0_2px_0_rgba(255,255,255,0.98)_inset,0_-1px_0_rgba(0,0,0,0.06)_inset]'}`}
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else if (!isSpeaking) {
                    setIsInitialized(true);
                    startListening();
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <motion.span
                    className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white text-sky-700 border border-sky-100 shadow-[0_6px_18px_-12px_rgba(15,23,42,0.25)]"
                    animate={isListening ? { scale: [1, 1.07, 1], opacity: [0.9, 1, 0.9] } : { opacity: 0.92 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      animate={isListening ? { scale: [1, 1.15, 1], opacity: [0.2, 0.04, 0.2] } : { opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      style={{ background: 'radial-gradient(circle, rgba(125, 176, 222, 0.35), transparent 70%)' }}
                    />
                  </motion.span>
                </div>
                <span>{isListening ? 'Listening…' : isSpeaking ? 'Responding…' : 'Start Listening'}</span>
              </motion.button>
              <p className="text-xs text-[#445266]">{isListening ? 'Voice channel is live. Speak naturally.' : 'Tap the orb or button to begin secure voice.'}</p>
            </div>
          </motion.div>
        </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Cinematic Luxury Domain Selection */}
      <div 
        className="max-w-7xl w-full mx-auto px-8 md:px-12 lg:px-16 pb-16 relative z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative rounded-[2.5rem] overflow-visible"
          style={{
            perspective: '2000px',
          }}
        >
          {/* Animated radial glow behind card */}
          <motion.div
            className="absolute inset-0 -z-10"
            animate={(prefersReducedMotion || isScrolling) ? { opacity: 0.26, scale: 1 } : {
              opacity: [0.18, 0.32, 0.18],
              scale: [0.97, 1.03, 0.97],
            }}
            transition={(prefersReducedMotion || isScrolling) ? { duration: 0 } : {
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className={`absolute inset-0 rounded-[2.5rem] blur-[80px] ${
              activeDomain.id === 'agriculture'
                ? 'bg-gradient-radial from-emerald-400/40 via-green-400/30 to-transparent'
                : 'bg-gradient-radial from-indigo-400/40 via-cyan-400/30 to-transparent'
            }`} />
          </motion.div>

          {/* Glassmorphism container with parallax */}
          <motion.div
            className="relative bg-white/45 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_6px_24px_rgba(0,0,0,0.08)] overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Noise texture overlay */}
            <div 
              className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              }}
            />

            {/* Parallax animated arcs */}
            <motion.div 
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                transform: `translateX(${mousePosition.x * 0.01}px) translateY(${mousePosition.y * 0.01}px)`,
              }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 20 }}
            >
              <div className="absolute left-1/2 -translate-x-1/2 -top-16 w-[92%] aspect-[2/1] rounded-t-full border border-white/40 border-b-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent shadow-inner" />
              <motion.div 
                className="absolute left-1/2 -translate-x-1/2 top-[42%] w-[88%] h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)',
                }}
                animate={prefersReducedMotion ? { opacity: 0.45 } : {
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 3, repeat: Infinity }}
              />
            </motion.div>

            {/* Ambient gradient overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={(prefersReducedMotion || isScrolling) ? { background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08), transparent 55%)' } : {
                background: [
                  'radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08), transparent 50%)',
                  'radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08), transparent 50%)',
                  'radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08), transparent 50%)',
                ],
              }}
              transition={(prefersReducedMotion || isScrolling) ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="px-4 pt-10 pb-6 md:px-6 md:pt-14 md:pb-8 flex flex-col items-center gap-8 md:gap-10 relative">
              {/* Cinematic header with letter animation */}
              <div className="text-center space-y-4">
                {/* Badge with slide-down animation */}
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full ${
                    activeDomain.id === 'agriculture'
                      ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-white/60 border border-indigo-200/60 shadow-[0_4px_20px_rgba(99,102,241,0.1)]'
                  } backdrop-blur-xl text-xs font-bold transition-all duration-500`}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className={`w-4 h-4 ${
                      activeDomain.id === 'agriculture' ? 'text-emerald-600' : 'text-indigo-600'
                    }`} />
                  </motion.div>
                  <span className={activeDomain.id === 'agriculture' ? 'text-emerald-700' : 'text-indigo-700'}>
                    {activeDomain.id === 'agriculture' ? 'Featured: Smart Agriculture AI' : 'Curated AI Domains'}
                  </span>
                  {activeDomain.id === 'agriculture' && <span></span>}
                </motion.div>
                
                {/* Letter-by-letter heading reveal */}
                <motion.h2 
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
                  initial="hidden"
                  animate="visible"
                >
                  {("Premium Domain Selection").split("").map((char, index) => (
                    <motion.span
                      key={index}
                      className={activeDomain.id === 'agriculture' 
                        ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent inline-block'
                        : 'text-slate-900 inline-block'
                      }
                      variants={{
                        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                        visible: { 
                          opacity: 1, 
                          y: 0, 
                          filter: 'blur(0px)',
                          transition: {
                            duration: 0.5,
                            delay: index * 0.03,
                            ease: [0.16, 1, 0.3, 1]
                          }
                        }
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium"
                  style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                >
                  {activeDomain.id === 'agriculture' 
                    ? 'Revolutionary AI for sustainable farming and crop intelligence • Auto-rotating showcase'
                    : 'Six signature domains rotate every 3 seconds—tap any to explore instantly.'
                  }
                </motion.p>
              </div>

            {/* Cinematic featured domain card */}
            <div className="relative w-full min-h-[240px] md:min-h-[280px] flex items-start justify-center" ref={cardRef}>
              <AnimatePresence mode="wait">
                <motion.button
                  key={activeDomain.id}
                  variants={revealChild}
                  initial={{ 
                    opacity: 0, 
                    x: -80, 
                    scale: 0.92,
                    filter: 'blur(10px)'
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: 1,
                    filter: 'blur(0px)'
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 80, 
                    scale: 0.92,
                    filter: 'blur(10px)'
                  }}
                  transition={{ 
                    duration: 0.7, 
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  onClick={() => onSelectDomain(activeDomain.id)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                  whileTap={{ scale: 0.96 }}
                  className="relative w-full max-w-full md:max-w-3xl group"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Multi-layer ambient glow */}
                  <motion.div
                    className="absolute -inset-4 rounded-[2.5rem] opacity-0 group-hover:opacity-75"
                    animate={{
                      background: activeDomain.id === 'agriculture'
                        ? [
                            'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%)',
                            'radial-gradient(circle, rgba(16, 185, 129, 0.25), transparent 70%)',
                            'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%)',
                          ]
                        : [
                            'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
                            'radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent 70%)',
                            'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
                          ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ filter: 'blur(28px)' }}
                  />
                  
                  {/* 3D tilt card with glassmorphism */}
                  <motion.div 
                    className={`relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] ${
                      activeDomain.id === 'agriculture' 
                        ? 'bg-gradient-to-br from-white/80 via-emerald-50/40 to-green-50/50' 
                        : 'bg-gradient-to-br from-white/70 via-white/60 to-slate-50/50'
                    } backdrop-blur-2xl border border-white/60 px-5 py-6 md:px-12 md:py-9 flex flex-col md:flex-row gap-5 md:gap-6 items-center transition-all duration-300`}
                    style={{
                      transformStyle: 'preserve-3d',
                      boxShadow: '0 16px 35px -14px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                    }}
                    whileHover={{
                      rotateX: mousePosition.y * 0.008,
                      rotateY: mousePosition.x * 0.008,
                      scale: 1.01,
                      y: -6,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    
                    {/* Morphing icon container */}
                    <motion.div 
                      className={`w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] bg-gradient-to-br ${activeDomain.color} p-5 flex items-center justify-center relative overflow-hidden`}
                      initial={{ scale: 0.85, rotate: -8 }}
                      animate={{ 
                        scale: 0.98, 
                        rotate: 0,
                        boxShadow: activeDomain.id === 'agriculture' 
                          ? [
                              '0 14px 30px rgba(16, 185, 129, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.18) inset',
                              '0 16px 34px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
                              '0 14px 30px rgba(16, 185, 129, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.18) inset',
                            ]
                          : [
                              '0 14px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.16) inset',
                              '0 16px 34px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
                              '0 14px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.16) inset',
                            ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      whileHover={{ scale: 1.04, rotate: 4 }}
                    >
                      {/* Shimmer sweep */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
                        initial={{ x: '-100%', skewX: -20 }}
                        animate={{
                          x: ['100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Icon with smooth morph transition */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeDomain.id}
                          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="relative z-10"
                        >
                          <ActiveIcon className="w-full h-full text-white drop-shadow-lg" strokeWidth={2} />
                        </motion.div>
                      </AnimatePresence>
                      
                      {/* Pulsing ring */}
                      <motion.div
                        className="absolute inset-0 rounded-[1.5rem] border-2 border-white/30"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    </motion.div>
                    
                    <div className="text-center md:text-left space-y-3 flex-1">
                      <motion.p 
                        className={`text-[10px] md:text-xs font-bold ${
                          activeDomain.id === 'agriculture' ? 'text-emerald-600' : 'text-indigo-600'
                        } tracking-[0.25em] uppercase flex items-center gap-2 justify-center md:justify-start`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {activeDomain.id === 'agriculture' && <Sparkles className="w-3 h-3" />}
                        Featured Domain
                        {activeDomain.id === 'agriculture' && <Sparkles className="w-3 h-3" />}
                      </motion.p>
                      
                      <AnimatePresence mode="wait">
                        <motion.h3 
                          key={activeDomain.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4 }}
                          className={`text-3xl md:text-4xl font-black tracking-tight ${
                            activeDomain.id === 'agriculture' 
                              ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent' 
                              : 'text-slate-900'
                          }`}
                        >
                          {activeDomain.name}
                        </motion.h3>
                      </AnimatePresence>
                      
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={activeDomain.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`text-sm md:text-base max-w-xl leading-relaxed ${
                            activeDomain.id === 'agriculture' ? 'text-slate-700 font-medium' : 'text-slate-600'
                          }`}
                        >
                          {activeDomain.description}
                        </motion.p>
                      </AnimatePresence>
                      
                      {/* Shimmering CTA button */}
                      <motion.div 
                        className="pt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <motion.div
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm ${
                            activeDomain.id === 'agriculture'
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                              : 'bg-gradient-to-r from-indigo-500 to-cyan-600 text-white'
                          } shadow-lg relative overflow-hidden group/btn`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ 
                            scale: 0.95,
                            transition: { duration: 0.1 }
                          }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                              ease: "easeInOut"
                            }}
                            style={{ skewX: -20 }}
                          />
                          
                          <span className="relative z-10">Explore {activeDomain.name}</span>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-4 h-4 relative z-10" />
                          </motion.div>
                          
                          {/* Bounce effect indicator */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-white/20"
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 0.5
                            }}
                          />
                        </motion.div>
                      </motion.div>
                    </div>
                    
                    {/* Dynamic gradient overlay */}
                    <motion.div 
                      className="absolute inset-0 pointer-events-none opacity-40"
                      animate={{
                        background: activeDomain.id === 'agriculture'
                          ? [
                              'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent 60%)',
                              'linear-gradient(135deg, rgba(20, 184, 166, 0.15), transparent 60%)',
                              'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent 60%)',
                            ]
                          : [
                              'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent 60%)',
                              'linear-gradient(135deg, rgba(139, 92, 246, 0.15), transparent 60%)',
                              'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent 60%)',
                            ]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-[-10%] bg-gradient-to-br from-transparent via-white/20 to-transparent pointer-events-none"
                      style={{ mixBlendMode: 'screen' }}
                      animate={{ x: ['-140%', '140%'], y: ['-40%', '40%'] }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    
                    {/* Floating particles for agriculture */}
                    {activeDomain.id === 'agriculture' && (
                      <>
                        <motion.div
                          className="absolute top-6 right-6 text-2xl"
                          animate={{
                            y: [0, -12, 0],
                            rotate: [0, 15, -15, 0],
                            opacity: [0.4, 0.7, 0.4]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          
                        </motion.div>
                        <motion.div
                          className="absolute bottom-6 right-10 text-xl"
                          animate={{
                            y: [0, -10, 0],
                            rotate: [0, -12, 12, 0],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                        >
                          
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </motion.button>
              </AnimatePresence>
            </div>

            {/* Magnetic hover domain pills with instant preview */}
            <div className="relative w-full flex flex-wrap justify-center gap-3 pb-2 overflow-x-auto md:overflow-visible scrollbar-hide">
              <div className="flex gap-3 px-4 md:px-0">
                {mainDomains.map((domain, idx) => {
                  // Skip the currently featured domain (it's shown above)
                  if (idx === activeIndex) return null;
                  
                  const Icon = domain.icon;
                  const isAgriculture = domain.id === 'agriculture';
                  const isHovered = hoveredDomain === domain.id;
                  
                  // Calculate position in carousel
                  let position;
                  if (idx > activeIndex) {
                    position = idx - activeIndex - 1;
                  } else {
                    position = mainDomains.length - activeIndex + idx - 1;
                  }
                  
                  return (
                    <motion.button
                      key={domain.id}
                      layout
                      onClick={() => {
                        setActiveIndex(idx);
                        setHoveredDomain(null);
                      }}
                      onMouseEnter={() => setHoveredDomain(domain.id)}
                      onMouseLeave={() => setHoveredDomain(null)}
                      className={`flex items-center gap-2.5 px-5 py-3.5 rounded-full ${
                        isAgriculture 
                          ? 'bg-gradient-to-r from-emerald-50/90 to-green-50/90 border border-emerald-300/60' 
                          : 'bg-white/70 border border-white/80'
                      } backdrop-blur-xl relative overflow-hidden group cursor-pointer flex-shrink-0`}
                      style={{
                        order: position,
                        boxShadow: isHovered 
                          ? '0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'
                          : '0 2px 10px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.3) inset'
                      }}
                      whileHover={{ 
                        y: -8, 
                        scale: 1.05,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Ripple glow on hover */}
                      {isHovered && (
                        <motion.div
                          className={`absolute inset-0 rounded-full ${
                            isAgriculture 
                              ? 'bg-gradient-to-r from-emerald-400/20 to-green-400/20'
                              : 'bg-gradient-to-r from-indigo-400/15 to-cyan-400/15'
                          }`}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1.12, opacity: [0, 0.85, 0] }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          style={{ filter: 'blur(12px)' }}
                        />
                      )}
                      
                      {/* Magnetic icon */}
                      <motion.div 
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${domain.color} flex items-center justify-center text-white shadow-lg relative overflow-hidden`}
                        animate={{
                          rotate: isHovered ? 360 : 0,
                          scale: isHovered ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        {/* Icon shine on hover */}
                        {isHovered && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent"
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: '100%', opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}
                        <Icon className="w-5 h-5 relative z-10" strokeWidth={2} />
                      </motion.div>
                      
                      <div className="text-left relative z-10">
                        <motion.p 
                          className={`text-sm font-bold ${
                            isAgriculture ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                          animate={{ 
                            scale: isHovered ? 1.05 : 1,
                          }}
                        >
                          {domain.name}
                          {isAgriculture && <span className="ml-1"></span>}
                        </motion.p>
                        <span className={`text-[10px] font-semibold ${
                          isAgriculture ? 'text-emerald-600' : 'text-slate-500'
                        }`}>
                          {isHovered ? 'Click to view' : 'Hover to preview'}
                        </span>
                      </div>
                      
                      {/* Hover indicator */}
                      <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ 
                          scaleX: isHovered ? 1 : 0,
                          opacity: isHovered ? 0.5 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

        {/* Premium Tech Realms section */}
        <motion.div
          className="mt-20 md:mt-24 relative"
          variants={revealParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Section header with glow */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/70 border-2 border-purple-200 backdrop-blur-xl shadow-lg mb-4"
            >
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 text-sm font-semibold">Advanced Domains</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              Explore Tech <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Realms</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm">
              Specialized technological domains powered by advanced AI • Coming Soon
            </p>
          </div>

          {/* Tech realms grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techRealms.map((realm, index) => (
              <motion.button
                key={realm.id}
                variants={revealChild}
                custom={index}
                whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                disabled
                className="relative group cursor-not-allowed"
              >
                {/* Subtle glow effect */}
                <motion.div
                  className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25))`,
                  }}
                />

                {/* Card */}
                <div className={`
                  relative p-6 rounded-xl
                  bg-white/70
                  border-2 border-slate-200 group-hover:border-purple-300
                  backdrop-blur-md
                  transition-all duration-300
                  overflow-hidden
                `}>
                  {/* Gradient overlay on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-2.5 shadow-md border border-slate-300">
                      <realm.icon className="w-full h-full text-slate-600 group-hover:text-indigo-600 transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                  </motion.div>

                  {/* Text */}
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 transition-colors duration-300 mb-1">
                    {realm.name}
                  </p>
                  <span className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300">Coming Soon</span>

                  {/* Lock icon overlay */}
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ opacity: 0.4 }}
                    whileHover={{ opacity: 0.7 }}
                  >
                    <div className="w-5 h-5 rounded bg-slate-200/70 flex items-center justify-center">
                      <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
