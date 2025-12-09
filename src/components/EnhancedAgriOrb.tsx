import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

interface EnhancedAgriOrbProps {
  isActive?: boolean;
  image?: string;
  isSpeaking?: boolean;
  audioLevel?: number;
}

export default function EnhancedAgriOrb({ isActive = false, image, isSpeaking = false, audioLevel = 0 }: EnhancedAgriOrbProps) {

  return (
    <div className="relative flex items-center justify-center w-72 h-72 mx-auto">
      {/* Elegant Background Glow with Gradient Ring */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          background: 'conic-gradient(from 0deg, #22c55e, #10b981, #06d6a0, #22c55e)',
          filter: 'blur(3px)',
          willChange: 'transform',
        }}
      />

      {/* Soft Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-4 rounded-full bg-gradient-to-br from-green-300/40 via-emerald-400/30 to-teal-400/40 blur-xl"
      />

      {/* Floating Particles - Reduced from 8 to 4 */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-300/60 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 90}deg) translateY(-100px) translateX(-50%)`,
              transformOrigin: '50% 100px',
              willChange: 'transform, opacity',
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              rotate: { duration: 12, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }
            }}
          />
        ))}
      </div>

      {/* Main Orb with Enhanced Gradient */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isActive ? [1, 1.05, 1] : [1, 1.02, 1],
          opacity: 1,
        }}
        transition={{
          scale: {
            duration: isActive ? 2 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { duration: 1.5, ease: "easeOut" }
        }}
        className="relative z-10 w-52 h-52 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 shadow-2xl overflow-hidden border-2 border-white/20"
        style={{
          boxShadow: '0 0 60px rgba(34, 197, 94, 0.6), inset 0 0 60px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Premium Inner Gradient Layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-emerald-600/20" />
        
        {/* Subtle Light Reflection */}
        <motion.div
          animate={{
            rotate: [0, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-4 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-sm"
        />

        {/* Central Content Area with Glass Effect */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="absolute inset-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-inner"
          style={{
            boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.2), 0 0 20px rgba(34, 197, 94, 0.3)',
          }}
        >
          {image ? (
            <motion.img
              src={image}
              alt="Agricultural Intelligence"
              initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
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
              initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
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
              <Sprout className="w-20 h-20 text-white drop-shadow-lg" />
            </motion.div>
          )}
        </motion.div>

        {/* Elegant Active Pulse Effect */}
        {isActive && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.3, 1.6],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border-2 border-green-300/80"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.6, 0.2, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border border-emerald-300/60"
            />
          </>
        )}

        {/* Speaking Animation - Audio Waveform Effect */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {/* Animated audio waveform rings */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.2 + (audioLevel * 0.3), 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
                style={{
                  transform: `scale(${1 + i * 0.1})`,
                }}
              />
            ))}
            
            {/* Central pulsing effect for speech */}
            <motion.div
              animate={{
                scale: [1, 1.1 + (audioLevel * 0.2), 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-8 rounded-full bg-emerald-400/30 backdrop-blur-sm"
            />
          </div>
        )}
      </motion.div>

    </div>
  );
}