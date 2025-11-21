import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

interface EnhancedUniversalAIOrbProps {
  isActive?: boolean;
  image?: string;
}

export default function EnhancedUniversalAIOrb({ isActive = false, image }: EnhancedUniversalAIOrbProps) {
  return (
    <div className="relative flex items-center justify-center w-72 h-72 mx-auto">
      {/* Futuristic Background Glow with AI Gradient Ring */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute inset-0 rounded-full opacity-50"
        style={{
          background: 'conic-gradient(from 0deg, #8b5cf6, #a855f7, #ec4899, #f59e0b, #8b5cf6)',
          filter: 'blur(4px)',
        }}
      />

      {/* AI Neural Network Glow */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400/40 via-pink-500/30 to-amber-400/40 blur-xl"
      />

      {/* AI Data Particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translateY(-110px) translateX(-50%)`,
              transformOrigin: '50% 110px',
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.3, 1.2, 0.3],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 },
              opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }
            }}
          />
        ))}
      </div>

      {/* Main AI Orb with Futuristic Gradient */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isActive ? [1, 1.08, 1] : [1, 1.03, 1],
          opacity: 1,
        }}
        transition={{
          scale: {
            duration: isActive ? 1.8 : 4.5,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { duration: 1.5, ease: "easeOut" }
        }}
        className="relative z-10 w-52 h-52 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 shadow-2xl overflow-hidden border-2 border-white/25"
        style={{
          boxShadow: '0 0 80px rgba(139, 92, 246, 0.7), inset 0 0 60px rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* AI Circuit Pattern Overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-transparent to-purple-600/20" />
        
        {/* Neural Network Light Pattern */}
        <motion.div
          animate={{
            rotate: [0, 360],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-3 w-20 h-20 rounded-full bg-gradient-to-br from-white/50 to-transparent blur-sm"
        />

        {/* Central AI Core with Glass Effect */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="absolute inset-12 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-inner"
          style={{
            boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.25), 0 0 25px rgba(139, 92, 246, 0.4)',
          }}
        >
          {image ? (
            <motion.img
              src={image}
              alt="Universal AI Intelligence"
              initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
              }}
              transition={{ 
                duration: 1.5, 
                delay: 0.8,
                ease: "easeOut" 
              }}
              className="w-full h-full object-cover rounded-full shadow-lg"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
              }}
              transition={{ 
                duration: 1.5, 
                delay: 0.8,
                ease: "easeOut" 
              }}
            >
              <Cpu className="w-20 h-20 text-white drop-shadow-lg" />
            </motion.div>
          )}
        </motion.div>

        {/* Advanced AI Pulse Effects */}
        {isActive && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{
                scale: [1, 1.4, 1.7],
                opacity: [0.9, 0.5, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border-2 border-purple-300/90"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{
                scale: [1, 1.6, 2.2],
                opacity: [0.7, 0.3, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: 0.4,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border border-pink-300/70"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{
                scale: [1, 1.8, 2.5],
                opacity: [0.5, 0.2, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.8,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border border-amber-300/50"
            />
          </>
        )}
      </motion.div>
    </div>
  );
}