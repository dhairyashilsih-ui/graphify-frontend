import { motion } from 'framer-motion';
import { Zap, Globe, Star, Sparkles, Brain, Database } from 'lucide-react';

interface EnhancedHomeOrbProps {
  isActive?: boolean;
  image?: string;
  title?: string;
  subtitle?: string;
}

export default function EnhancedHomeOrb({ 
  isActive = false, 
  image = "/homeora.png",
  title = "FUSION AI",
  subtitle = "Choose Your Domain"
}: EnhancedHomeOrbProps) {
  const techIcons = [Globe, Star, Sparkles, Brain, Database, Zap];

  const handleOrbClick = () => {
    // Add a subtle pulse effect on click
    const orb = document.querySelector('[data-orb="main"]');
    if (orb) {
      orb.classList.add('animate-pulse');
      setTimeout(() => orb.classList.remove('animate-pulse'), 600);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-96 h-96 mx-auto">
      {/* Quantum Field Effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360, 720],
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.3), rgba(6, 182, 212, 0.4), rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.4))',
          filter: 'blur(25px)',
        }}
      />

      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 via-purple-400 to-cyan-300 blur-3xl opacity-60"
      />

      {/* Rotating Particle Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-12"
      >
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              background: `linear-gradient(135deg, 
                ${i % 4 === 0 ? 'rgba(59, 130, 246, 0.8)' : 
                  i % 4 === 1 ? 'rgba(147, 51, 234, 0.8)' : 
                  i % 4 === 2 ? 'rgba(6, 182, 212, 0.8)' : 
                  'rgba(16, 185, 129, 0.8)'}, 
                transparent)`,
              transform: `rotate(${i * 22.5}deg) translateY(-140px) translateX(-50%)`,
              transformOrigin: '50% 140px',
            }}
            animate={{
              scale: [0.6, 1.4, 0.6],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Floating Tech Icons */}
      <motion.div className="absolute inset-20">
        {techIcons.map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 60}deg) translateY(-90px) translateX(-50%)`,
              transformOrigin: '50% 90px',
            }}
            animate={{
              rotate: [0, 360],
              y: [-8, 8, -8],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <motion.div
              animate={{
                scale: isActive ? [1, 1.4, 1] : [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 40px rgba(147, 51, 234, 0.8)',
                  '0 0 20px rgba(6, 182, 212, 0.5)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-br from-blue-500/80 to-purple-600/80 p-3 rounded-xl shadow-2xl backdrop-blur-sm border border-white/20"
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Central Orb Core */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 80px rgba(59, 130, 246, 0.8)`,
            `0 0 140px rgba(147, 51, 234, 1)`,
            `0 0 80px rgba(6, 182, 212, 0.8)`,
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-20 cursor-pointer"
        onClick={handleOrbClick}
        data-orb="main"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          animate={{
            scale: isActive ? [1, 1.06, 1] : [1, 1.03, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: {
              duration: isActive ? 2.5 : 5,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-500 relative overflow-hidden shadow-2xl border-4 border-white/20"
        >
          {/* Animated Grid Pattern */}
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-6"
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {[...Array(8)].map((_, i) => (
                <g key={i}>
                  <motion.circle
                    cx="100"
                    cy="100"
                    r={20 + i * 15}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    animate={{
                      strokeDashoffset: [0, -20],
                      opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                      strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 3, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }
                    }}
                  />
                </g>
              ))}
            </svg>
          </motion.div>

          {/* Central Image Container */}
          <motion.div
            animate={{
              scale: [0.85, 1.05, 0.85],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-16 rounded-full bg-gradient-to-br from-white/30 to-blue-100/40 backdrop-blur-md border-3 border-white/40 flex items-center justify-center overflow-hidden shadow-inner"
          >
            {image && (
              <motion.img
                src={image}
                alt="FUSION AI"
                initial={{ scale: 0.7, opacity: 0, rotate: -270 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  rotate: 0,
                  filter: [
                    'brightness(1) contrast(1.1) saturate(1.2)',
                    'brightness(1.3) contrast(1.2) saturate(1.4)',
                    'brightness(1) contrast(1.1) saturate(1.2)'
                  ]
                }}
                transition={{ 
                  scale: { duration: 1.2 },
                  opacity: { duration: 1.2 },
                  rotate: { duration: 2 },
                  filter: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-full h-full object-cover rounded-full"
              />
            )}
            
            {/* Holographic Scan Lines */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(0deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  'linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  'linear-gradient(270deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  'linear-gradient(0deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)'
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full"
            />
          </motion.div>

          {/* Pulsing Energy Waves when Active */}
          {isActive && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{
                    scale: [0.4, 3, 3.5],
                    opacity: [0.9, 0.4, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 1,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full border-3 border-blue-300/80"
                />
              ))}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Title and Subtitle */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <motion.h2
          animate={{
            opacity: [0.8, 1, 0.8],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {title}
        </motion.h2>
        <motion.p
          animate={{
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-gray-400 text-lg font-medium"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Data Stream Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-12 bg-gradient-to-b from-blue-400 via-purple-500 to-transparent"
            style={{
              top: '5%',
              left: `${15 + i * 10}%`,
            }}
            animate={{
              y: [0, 350],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* System Status Indicators */}
      <div className="absolute top-8 left-8">
        <motion.div
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-md border border-blue-400/50 rounded-2xl px-4 py-2 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-4 h-4 text-blue-400" />
            </motion.div>
            <span className="text-sm font-bold text-blue-400">System Online</span>
          </div>
        </motion.div>
      </div>

      {/* AI Status */}
      <div className="absolute top-8 right-8">
        <motion.div
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md border border-purple-400/50 rounded-2xl px-4 py-2 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Brain className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-sm font-bold text-purple-400">AI Ready</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}