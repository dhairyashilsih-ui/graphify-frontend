import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Wheat, Heart, GraduationCap, DollarSign, Car, Globe, Cpu, Shield, MessageCircle, Lightbulb, Sparkles, Zap, Brain } from 'lucide-react';

interface DomainSelectionProps {
  onSelectDomain: (domain: string) => void;
}

const mainDomains = [
  { 
    id: 'agriculture', 
    name: 'Agriculture', 
    icon: Wheat, 
    color: 'from-emerald-400 to-green-600',
    description: 'Smart farming & crop analysis',
    gradient: 'from-emerald-500/20 via-green-500/10 to-transparent'
  },
  { 
    id: 'health', 
    name: 'Health', 
    icon: Heart, 
    color: 'from-rose-400 to-pink-600',
    description: 'Medical insights & wellness',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent'
  },
  { 
    id: 'education', 
    name: 'Education', 
    icon: GraduationCap, 
    color: 'from-amber-400 to-orange-600',
    description: 'Learning & knowledge enhancement',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    icon: DollarSign, 
    color: 'from-cyan-400 to-blue-600',
    description: 'Financial analysis & insights',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent'
  },
  { 
    id: 'transport', 
    name: 'Transport', 
    icon: Car, 
    color: 'from-violet-400 to-purple-600',
    description: 'Smart mobility solutions',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent'
  },
  { 
    id: 'universal-ai', 
    name: 'Universal AI', 
    icon: Globe, 
    color: 'from-indigo-400 to-blue-600',
    description: 'All-encompassing intelligence',
    gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent'
  },
];

const techRealms = [
  { id: 'robotics', name: 'Robotics', icon: Cpu, color: 'from-blue-400 to-cyan-500' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield, color: 'from-red-400 to-orange-500' },
  { id: 'social', name: 'Social Media', icon: MessageCircle, color: 'from-purple-400 to-pink-500' },
  { id: 'lab', name: 'Tech Lab', icon: Lightbulb, color: 'from-yellow-400 to-amber-500' },
];

export default function DomainSelection({ onSelectDomain }: DomainSelectionProps) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.02, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    });
  }, [controls]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950"
    >
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient mesh background */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse 100% 80% at 30% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 70%), radial-gradient(ellipse 80% 100% at 70% 60%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
              "radial-gradient(ellipse 80% 100% at 50% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 70%), radial-gradient(ellipse 100% 80% at 80% 70%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
              "radial-gradient(ellipse 100% 80% at 30% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 70%), radial-gradient(ellipse 80% 100% at 70% 60%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
        />

        {/* Floating particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              background: i % 3 === 0 
                ? 'rgba(99, 102, 241, 0.6)' 
                : i % 3 === 1
                ? 'rgba(168, 85, 247, 0.6)'
                : 'rgba(59, 130, 246, 0.6)',
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -100],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Top section with text on left and orb on right */}
      <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen p-8 md:p-12 lg:p-16 relative z-10">
        {/* Left side - Text content */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 max-w-3xl mb-12 lg:mb-0"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-full backdrop-blur-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </motion.div>
            <span className="text-indigo-300 text-sm font-medium tracking-wider">POWERED BY ADVANCED AI</span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 tracking-tight" 
            style={{ fontFamily: 'Orbitron, system-ui, sans-serif' }}
            animate={controls}
          >
            <motion.span
              className="bg-gradient-to-r from-indigo-300 via-purple-400 to-blue-300 bg-clip-text text-transparent bg-[length:200%_100%]"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Choose Your Domain
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-slate-400 text-lg md:text-2xl leading-relaxed"
          >
            Explore cutting-edge AI solutions tailored to your specific needs
          </motion.p>
        </motion.div>

        {/* Right side - Orb only (no status indicators, no background box) */}
        <motion.div
          initial={{ x: 100, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.2, type: "spring", stiffness: 80 }}
          className="flex-shrink-0"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 80px rgba(99, 102, 241, 0.4)",
                "0 0 120px rgba(168, 85, 247, 0.5)",
                "0 0 80px rgba(99, 102, 241, 0.4)",
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="rounded-full"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <img 
                src="/homeora.png" 
                alt="FUSION AI" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Premium domain cards section */}
      <div className="max-w-7xl w-full px-8 md:px-12 lg:px-16 pb-16 relative z-10">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {mainDomains.map((domain, index) => (
            <motion.button
              key={domain.id}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                delay: 0.1 * index, 
                duration: 0.7,
                type: "spring",
                stiffness: 100 
              }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                z: 50,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectDomain(domain.id)}
              className="relative group perspective-1000"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card glow effect */}
              <motion.div
                className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${domain.color.replace('from-', 'rgb(').replace(' to-', '), rgb(').replace(/\d+/g, m => String(parseInt(m) * 2.55))})`,
                }}
              />

              {/* Main card container */}
              <div className={`
                relative overflow-hidden rounded-2xl p-8
                bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90
                border border-slate-700/50 group-hover:border-slate-600
                backdrop-blur-xl shadow-2xl
                transition-all duration-500
              `}>
                {/* Gradient overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  animate={{
                    background: [
                      'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                      'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                    ],
                    backgroundPosition: ['-200% 0', '200% 0'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Icon with enhanced animation */}
                <motion.div
                  className="relative mb-6"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${domain.color} p-4 shadow-lg`}
                    whileHover={{
                      boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)",
                    }}
                  >
                    <domain.icon className="w-full h-full text-white" strokeWidth={1.5} />
                  </motion.div>
                  
                  {/* Icon glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl"
                    style={{
                      background: `linear-gradient(135deg, ${domain.color.replace('from-', 'rgba(').replace(' to-', ', 0.5), rgba(').replace(/\d+/g, m => String(parseInt(m) * 2.55) + ', 0.3')})`,
                    }}
                  />
                </motion.div>

                {/* Text content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors duration-300">
                    {domain.name}
                  </h3>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                    {domain.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap className="w-5 h-5 text-indigo-400" />
                </motion.div>

                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Premium Tech Realms section */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.9 }}
          className="mt-20 relative"
        >
          {/* Section header with glow */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-4"
            >
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Advanced Domains</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Explore Tech <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Realms</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Specialized technological domains powered by advanced AI • Coming Soon
            </p>
          </div>

          {/* Tech realms grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techRealms.map((realm, index) => (
              <motion.button
                key={realm.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.7 + (0.05 * index), 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                disabled
                className="relative group cursor-not-allowed"
              >
                {/* Subtle glow effect */}
                <motion.div
                  className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))`,
                  }}
                />

                {/* Card */}
                <div className={`
                  relative p-6 rounded-xl
                  bg-gradient-to-br from-slate-800/60 via-slate-700/60 to-slate-800/60
                  border border-slate-600/40 group-hover:border-slate-500/60
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
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 p-2.5 shadow-lg border border-slate-500/30">
                      <realm.icon className="w-full h-full text-slate-400 group-hover:text-indigo-400 transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                  </motion.div>

                  {/* Text */}
                  <p className="text-sm font-semibold text-slate-300 group-hover:text-slate-200 transition-colors duration-300 mb-1">
                    {realm.name}
                  </p>
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300">Coming Soon</span>

                  {/* Lock icon overlay */}
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ opacity: 0.4 }}
                    whileHover={{ opacity: 0.7 }}
                  >
                    <div className="w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center">
                      <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
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
