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
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, #312e81, #1e1b4b, #4c1d95)',
      }}
    >
      {/* Simplified animated background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
              "radial-gradient(ellipse 60% 80% at 70% 60%, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
              "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ willChange: 'background' }}
        />

        {/* Minimal grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Reduced floating particles - only 12 instead of 50+ */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 8) + 10}%`,
              top: `${(i % 3) * 30 + 10}%`,
              width: 2,
              height: 2,
              background: i % 2 === 0 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(168, 85, 247, 0.8)',
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Simplified Title */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.h1
          className="text-7xl font-black mb-3 tracking-wide"
          style={{ fontFamily: 'Orbitron, system-ui, sans-serif' }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
            }}
          >
            Graphify
          </span>
        </motion.h1>
        
        <motion.p
          className="text-purple-300 text-lg tracking-widest font-light"
          style={{ fontFamily: 'Orbitron, system-ui, sans-serif' }}
        >
          MULTIMODAL AI INTELLIGENCE
        </motion.p>
      </motion.div>

      {/* Simplified Logo Orb */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-12 z-10"
      >
        {/* Single outer glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-12 rounded-full bg-purple-500/30 blur-2xl"
          style={{ willChange: 'transform, opacity' }}
        />

        {/* Main orb container - no rotation */}
        <motion.div
          className="relative w-56 h-56 rounded-full border-2 border-purple-400/40 bg-gradient-to-br from-purple-900/30 via-violet-900/30 to-fuchsia-900/30 backdrop-blur-xl flex items-center justify-center"
          style={{
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.5)',
          }}
        >
          {/* Single rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8 rounded-full border-2 border-dashed border-purple-400/60"
            style={{ willChange: 'transform' }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.img
              src="/logo1.png"
              alt="Graphify Logo"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 object-contain"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.7))',
                willChange: 'transform',
              }}
            />
          </motion.div>

          {/* Minimal orbiting nodes - only 4 instead of 8 */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
              className="absolute inset-0"
              style={{ willChange: 'transform' }}
            >
              <div
                className="absolute w-3 h-3 rounded-full"
                style={{
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 1), rgba(168, 85, 247, 0.4))',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.8)',
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Simplified Loading System */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 w-80"
      >
        {/* Simplified loading dots - only 5 instead of 9 */}
        <div className="flex space-x-4 mb-6 justify-center">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0.8, 1.5, 0.8],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              className="w-4 h-4 rounded-full bg-purple-500"
              style={{
                boxShadow: '0 0 25px rgba(139, 92, 246, 0.8)',
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        <motion.p
          className="text-purple-300 text-xs tracking-widest font-light mb-4 text-center uppercase"
          style={{ fontFamily: 'Orbitron, system-ui, sans-serif' }}
        >
          Initializing Neural Network
        </motion.p>

        {/* Simple progress bar */}
        <div className="w-full h-1.5 bg-purple-950/50 rounded-full overflow-hidden border border-purple-500/30">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 rounded-full"
            style={{ width: `${progress}%`, boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)' }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <motion.p
          className="text-purple-300/90 text-sm font-mono tracking-wider text-center mt-3"
        >
          {progress}%
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
