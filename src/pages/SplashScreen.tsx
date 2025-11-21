import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-black to-purple-950 z-50 overflow-hidden"
    >
      {/* Ultra Futuristic Background */}
      <div className="absolute inset-0">
        {/* Animated aurora background */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse 120% 80% at 30% 40%, rgba(99, 102, 241, 0.25) 0%, transparent 70%), radial-gradient(ellipse 80% 120% at 70% 60%, rgba(168, 85, 247, 0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 50% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
              "radial-gradient(ellipse 80% 120% at 50% 30%, rgba(168, 85, 247, 0.25) 0%, transparent 70%), radial-gradient(ellipse 120% 80% at 80% 70%, rgba(99, 102, 241, 0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
              "radial-gradient(ellipse 120% 80% at 70% 80%, rgba(99, 102, 241, 0.25) 0%, transparent 70%), radial-gradient(ellipse 80% 120% at 40% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
        />

        {/* Hexagonal grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, rgba(99, 102, 241, 0.6) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.6) 87.5%, rgba(99, 102, 241, 0.6)),
              linear-gradient(150deg, rgba(99, 102, 241, 0.6) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.6) 87.5%, rgba(99, 102, 241, 0.6)),
              linear-gradient(30deg, rgba(99, 102, 241, 0.6) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.6) 87.5%, rgba(99, 102, 241, 0.6)),
              linear-gradient(150deg, rgba(99, 102, 241, 0.6) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.6) 87.5%, rgba(99, 102, 241, 0.6))
            `,
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
          }}
        />
        
        {/* Floating 3D geometric shapes */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${5 + i * 6.5}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -80, 30, 0],
              x: [0, 40, -20, 0],
              rotateX: [0, 360],
              rotateY: [0, 360],
              rotateZ: [0, 180],
              opacity: [0.05, 0.25, 0.1, 0.05],
              scale: [0.8, 1.6, 1, 0.8],
            }}
            transition={{
              duration: 15 + i * 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            <motion.div
              animate={{
                borderColor: [
                  "rgba(99, 102, 241, 0.3)",
                  "rgba(168, 85, 247, 0.3)",
                  "rgba(59, 130, 246, 0.3)",
                  "rgba(99, 102, 241, 0.3)",
                ],
                boxShadow: [
                  "0 0 0px rgba(99, 102, 241, 0)",
                  "0 0 30px rgba(168, 85, 247, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 0px rgba(99, 102, 241, 0)",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
              className="w-20 h-20 border-2 bg-gradient-to-br from-indigo-500/10 via-purple-500/15 to-blue-500/10 backdrop-blur-sm"
              style={{
                clipPath: i % 5 === 0 
                  ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' 
                  : i % 5 === 1 
                  ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                  : i % 5 === 2
                  ? 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)'
                  : i % 5 === 3
                  ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                  : 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                transform: 'perspective(1000px) rotateY(45deg)',
              }}
            />
          </motion.div>
        ))}

        {/* Digital rain effect */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute"
            style={{
              left: `${15 + i * 12}%`,
              top: '-10%',
            }}
            animate={{
              y: ['0vh', '110vh'],
              opacity: [0, 0.8, 0.9, 0.5, 0],
            }}
            transition={{
              duration: 10 + i * 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.2,
            }}
          >
            <div className="flex flex-col space-y-3">
              {[...Array(8)].map((_, j) => (
                <motion.div
                  key={j}
                  animate={{
                    width: [3, 10, 5, 3],
                    opacity: [0.4, 1, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: j * 0.15,
                    ease: "easeInOut",
                  }}
                  className="h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-400 rounded-full shadow-lg shadow-indigo-500/50"
                />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Glowing particles with trails */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: i % 3 === 0 
                ? 'radial-gradient(circle, rgba(99, 102, 241, 1), transparent)' 
                : i % 3 === 1
                ? 'radial-gradient(circle, rgba(168, 85, 247, 1), transparent)'
                : 'radial-gradient(circle, rgba(59, 130, 246, 1), transparent)',
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 2, 0],
              y: [0, -150],
              x: [(Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Spotlight effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle 800px at 30% 40%, rgba(99, 102, 241, 0.08), transparent)',
              'radial-gradient(circle 800px at 70% 60%, rgba(168, 85, 247, 0.08), transparent)',
              'radial-gradient(circle 800px at 50% 50%, rgba(59, 130, 246, 0.08), transparent)',
              'radial-gradient(circle 800px at 30% 40%, rgba(99, 102, 241, 0.08), transparent)',
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Premium 3D Logo Orb */}
      <motion.div
        initial={{ scale: 0, y: 150, rotateX: 90, opacity: 0 }}
        animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
        transition={{
          duration: 1.8,
          type: "spring",
          stiffness: 60,
          damping: 15,
        }}
        className="relative mb-12 z-10"
      >
        {/* Outermost energy field with neon glow */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1.2, 1],
            opacity: [0.15, 0.7, 0.4, 0.15],
            rotate: [0, 180, 360],
            filter: [
              "blur(30px) hue-rotate(0deg) brightness(1)",
              "blur(40px) hue-rotate(120deg) brightness(1.3)",
              "blur(35px) hue-rotate(240deg) brightness(1.1)",
              "blur(30px) hue-rotate(360deg) brightness(1)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-28 rounded-full bg-gradient-to-r from-indigo-500/30 via-purple-500/40 via-blue-500/30 to-indigo-500/30"
        />

        {/* Pulsing secondary ring */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1.1, 1],
            opacity: [0.4, 0.9, 0.6, 0.4],
            rotate: [0, -240, -360],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-16 rounded-full bg-gradient-conic from-indigo-400/40 via-purple-400/50 via-blue-400/40 to-indigo-400/40 blur-2xl"
        />

        {/* Tertiary energy layer */}
        <motion.div
          animate={{
            scale: [0.9, 1.25, 1, 0.9],
            opacity: [0.3, 0.8, 0.5, 0.3],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-12 rounded-full bg-gradient-to-br from-blue-400/30 via-indigo-400/40 to-purple-400/30 blur-xl"
        />

        {/* Main premium holographic container */}
        <motion.div
          animate={{
            rotate: 360,
            boxShadow: [
              "0 0 60px rgba(99, 102, 241, 0.4), inset 0 0 60px rgba(168, 85, 247, 0.2), 0 0 100px rgba(99, 102, 241, 0.1)",
              "0 0 80px rgba(168, 85, 247, 0.5), inset 0 0 80px rgba(99, 102, 241, 0.3), 0 0 120px rgba(168, 85, 247, 0.2)",
              "0 0 60px rgba(99, 102, 241, 0.4), inset 0 0 60px rgba(168, 85, 247, 0.2), 0 0 100px rgba(99, 102, 241, 0.1)",
            ],
          }}
          transition={{
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative w-72 h-72 rounded-full border-2 border-indigo-400/50 bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-blue-900/30 backdrop-blur-2xl flex items-center justify-center shadow-2xl"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.25))',
          }}
        >
          {/* Multiple rotating rings */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8 rounded-full border-2 border-dashed border-purple-400/60 shadow-inner shadow-purple-500/50"
          />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-12 rounded-full border border-dotted border-indigo-400/50"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-16 rounded-full border border-blue-400/40"
          />

          {/* Premium Logo with 3D effects */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{
              delay: 0.5,
              duration: 1.2,
              type: "spring",
              stiffness: 120,
            }}
            className="relative z-10"
          >
            <motion.img
              src="/logo1.png"
              alt="Graphify Logo"
              animate={{
                filter: [
                  "drop-shadow(0 0 30px rgba(99, 102, 241, 0.6)) brightness(1)",
                  "drop-shadow(0 0 50px rgba(168, 85, 247, 0.8)) brightness(1.2)",
                  "drop-shadow(0 0 30px rgba(99, 102, 241, 0.6)) brightness(1)",
                ],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-36 h-36 object-contain"
            />
            
            {/* Logo inner glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 40px rgba(99, 102, 241, 0.5)',
                  '0 0 60px rgba(168, 85, 247, 0.7)',
                  '0 0 40px rgba(99, 102, 241, 0.5)',
                ],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Enhanced orbiting energy nodes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              animate={{ rotate: 360 }}
              transition={{
                duration: 12 - i * 0.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.4,
              }}
              className="absolute inset-0"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                  boxShadow: [
                    '0 0 10px rgba(99, 102, 241, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.8)',
                    '0 0 10px rgba(99, 102, 241, 0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.25,
                }}
                className="absolute w-5 h-5 rounded-full"
                style={{
                  top: `${20 + i * 6}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: i % 3 === 0
                    ? 'radial-gradient(circle, rgba(99, 102, 241, 1), rgba(99, 102, 241, 0.3))'
                    : i % 3 === 1
                    ? 'radial-gradient(circle, rgba(168, 85, 247, 1), rgba(168, 85, 247, 0.3))'
                    : 'radial-gradient(circle, rgba(59, 130, 246, 1), rgba(59, 130, 246, 0.3))',
                }}
              />
            </motion.div>
          ))}

          {/* Advanced 3D scanning effect */}
          <motion.div
            animate={{
              rotate: [0, 360],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(99, 102, 241, 0.5) 30deg, rgba(168, 85, 247, 0.6) 60deg, transparent 90deg)',
            }}
          />

          {/* Holographic refraction effect */}
          <motion.div
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-white/5"
          />
        </motion.div>
      </motion.div>

      {/* Premium App Title */}
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.7 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1.5, type: "spring", stiffness: 80 }}
        className="text-center mb-10 relative z-10"
      >
        {/* Title neon glow background */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/40 to-blue-500/30 blur-3xl rounded-2xl"
        />

        <motion.h1
          className="relative text-8xl font-black mb-5 tracking-wide"
          style={{ 
            fontFamily: 'Orbitron, system-ui, sans-serif',
            WebkitTextStroke: '2px rgba(99, 102, 241, 0.3)',
          }}
        >
          <motion.span
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              textShadow: [
                "0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3)",
                "0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(168, 85, 247, 0.4)",
                "0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3)",
              ],
            }}
            transition={{
              backgroundPosition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="bg-gradient-to-r from-indigo-300 via-purple-400 to-blue-300 bg-clip-text text-transparent bg-[length:200%_100%]"
          >
            Graphify
          </motion.span>
          
          {/* Enhanced scanning lines */}
          <motion.div
            animate={{
              x: ["-150%", "250%"],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-20 blur-md overflow-hidden"
          />

          {/* Secondary highlight sweep */}
          <motion.div
            animate={{
              x: ["150%", "-250%"],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent w-32 blur-sm overflow-hidden"
          />
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="relative"
        >
          <motion.p
            className="text-indigo-300 text-2xl tracking-[0.3em] font-light mb-2"
            style={{ fontFamily: 'Orbitron, system-ui, sans-serif' }}
            animate={{
              opacity: [0.8, 1, 0.8],
              letterSpacing: ['0.3em', '0.35em', '0.3em'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            MULTIMODAL AI INTELLIGENCE
          </motion.p>
          
          {/* Subtitle accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2, duration: 1.5, ease: "easeOut" }}
            className="h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent w-96 mx-auto"
          />
        </motion.div>
      </motion.div>

      {/* Premium Quantum Loading System */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2.2, duration: 1.2, type: "spring", stiffness: 90 }}
        className="relative z-10"
      >
        {/* Enhanced loading orbs with 3D effect */}
        <div className="flex space-x-5 mb-10 relative justify-center items-center">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0.7, 2, 1.2, 0.7],
                opacity: [0.4, 1, 0.8, 0.4],
                rotateY: [0, 180, 360],
                boxShadow: [
                  '0 0 15px rgba(99, 102, 241, 0.3)',
                  '0 0 50px rgba(168, 85, 247, 1), 0 0 80px rgba(168, 85, 247, 0.5)',
                  '0 0 30px rgba(59, 130, 246, 0.7)',
                  '0 0 15px rgba(99, 102, 241, 0.3)',
                ],
                background: [
                  "radial-gradient(circle, rgba(99, 102, 241, 1) 0%, rgba(99, 102, 241, 0.6) 100%)",
                  "radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(168, 85, 247, 0.6) 100%)",
                  "radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(59, 130, 246, 0.6) 100%)",
                  "radial-gradient(circle, rgba(99, 102, 241, 1) 0%, rgba(99, 102, 241, 0.6) 100%)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              className="w-6 h-6 rounded-full relative"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Inner core pulse */}
              <motion.div
                animate={{
                  scale: [0.5, 0.9, 0.5],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
                className="absolute inset-2 bg-white rounded-full"
              />

              {/* Outer glow ring */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
                className="absolute -inset-2 border-2 border-indigo-400/50 rounded-full"
              />
            </motion.div>
          ))}
          
          {/* Enhanced connecting energy bridges */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`bridge-${i}`}
              className="absolute top-1/2 h-1 rounded-full"
              style={{
                left: `${(i + 1) * 11.11}%`,
                width: '11.11%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0) 0%, rgba(168, 85, 247, 0.8) 50%, rgba(99, 102, 241, 0) 100%)',
              }}
              animate={{
                opacity: [0, 1, 0.5, 0],
                scaleX: [0, 1.2, 0.8, 0],
                filter: [
                  'blur(1px) brightness(1)',
                  'blur(2px) brightness(1.5)',
                  'blur(1px) brightness(1)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Premium system status */}
        <motion.div
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-center"
        >
          <motion.p
            animate={{
              color: [
                "rgb(165 180 252)",
                "rgb(216 180 254)", 
                "rgb(147 197 253)",
                "rgb(165 180 252)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-sm tracking-[0.5em] font-light mb-6 uppercase"
            style={{ fontFamily: 'Orbitron, system-ui, sans-serif' }}
          >
            Initializing Neural Network
          </motion.p>
          
          {/* Premium waveform visualization */}
          <div className="flex justify-center space-x-1 mb-6">
            {[...Array(32)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [4, 20, 10, 4],
                  opacity: [0.5, 1, 0.8, 0.5],
                  backgroundColor: [
                    "rgb(99 102 241)",
                    "rgb(168 85 247)",
                    "rgb(59 130 246)",
                    "rgb(99 102 241)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.025,
                  ease: "easeInOut",
                }}
                className="w-1 rounded-full shadow-lg"
                style={{
                  boxShadow: '0 0 8px currentColor',
                }}
              />
            ))}
          </div>

          {/* Advanced progress bar */}
          <div className="w-64 mx-auto space-y-3">
            <motion.div
              className="w-full h-2 bg-gradient-to-r from-indigo-950 via-purple-950 to-blue-950 rounded-full overflow-hidden border border-indigo-500/30 shadow-inner"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 2.8, duration: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full relative"
                style={{ width: `${progress}%` }}
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(99, 102, 241, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.8)',
                    '0 0 10px rgba(99, 102, 241, 0.5)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {/* Progress shimmer */}
                <motion.div
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2"
                />
              </motion.div>
            </motion.div>
            
            {/* Progress percentage */}
            <motion.p
              className="text-indigo-300 text-sm font-mono tracking-wider"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {progress}% Complete
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Premium bottom accent with pulse */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 3, duration: 2.5, ease: "easeOut" }}
      >
        <motion.div
          animate={{
            background: [
              "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.8), rgba(59, 130, 246, 0.6), transparent)",
              "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.6), transparent)",
              "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.8), rgba(59, 130, 246, 0.6), transparent)",
            ],
            boxShadow: [
              '0 -2px 20px rgba(99, 102, 241, 0.3)',
              '0 -2px 30px rgba(168, 85, 247, 0.5)',
              '0 -2px 20px rgba(99, 102, 241, 0.3)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full"
        />
      </motion.div>
    </motion.div>
  );
}
