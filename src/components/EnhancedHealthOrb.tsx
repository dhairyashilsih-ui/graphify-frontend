import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface EnhancedHealthOrbProps {
  isActive?: boolean;
  image?: string;
}

export default function EnhancedHealthOrb({ isActive = false, image }: EnhancedHealthOrbProps) {
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
          background: 'conic-gradient(from 0deg, #ef4444, #ec4899, #f97316, #ef4444)',
          filter: 'blur(3px)',
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
        className="absolute inset-4 rounded-full bg-gradient-to-br from-red-300/40 via-pink-400/30 to-rose-400/40 blur-xl"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-300/60 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 45}deg) translateY(-100px) translateX(-50%)`,
              transformOrigin: '50% 100px',
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
        className="relative z-10 w-52 h-52 rounded-full bg-gradient-to-br from-red-400 via-pink-500 to-rose-500 shadow-2xl overflow-hidden border-2 border-white/20"
        style={{
          boxShadow: '0 0 60px rgba(239, 68, 68, 0.6), inset 0 0 60px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Premium Inner Gradient Layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-pink-600/20" />
        
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
            boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.2), 0 0 20px rgba(239, 68, 68, 0.3)',
          }}
        >
          {image ? (
            <motion.img
              src={image}
              alt="Health Intelligence"
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
              <Heart className="w-20 h-20 text-white drop-shadow-lg" />
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
              className="absolute inset-0 rounded-full border-2 border-pink-300/80"
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
              className="absolute inset-0 rounded-full border border-red-300/60"
            />
          </>
        )}
      </motion.div>
    </div>
  );
}