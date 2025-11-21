import { motion } from 'framer-motion';

interface OrbProps {
  isActive?: boolean;
  color?: string;
  image?: string;
}

export default function Orb({ isActive = false, color = 'blue', image }: OrbProps) {
  const colorMap = {
    blue: {
      gradient: 'from-blue-400 via-cyan-500 to-blue-600',
      shadow: 'rgba(59, 130, 246, 0.8)',
    },
    purple: {
      gradient: 'from-purple-400 via-pink-500 to-purple-600',
      shadow: 'rgba(147, 51, 234, 0.8)',
    },
    green: {
      gradient: 'from-green-400 via-emerald-500 to-green-600',
      shadow: 'rgba(34, 197, 94, 0.8)',
    },
  };

  const currentColor = colorMap[color as keyof typeof colorMap] || colorMap.blue;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
      <motion.div
        animate={isActive ? {
          scale: [1, 1.05, 1],
          rotate: [0, 180, 360],
        } : {
          scale: [1, 1.02, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: isActive ? 3 : 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0"
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${currentColor.gradient} blur-2xl opacity-60`} />
      </motion.div>

      <motion.div
        animate={{
          boxShadow: [
            `0 0 60px ${currentColor.shadow}`,
            `0 0 100px ${currentColor.shadow}`,
            `0 0 60px ${currentColor.shadow}`,
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <motion.div
          animate={{
            scale: isActive ? [1, 1.1, 1] : [1, 1.05, 1],
          }}
          transition={{
            duration: isActive ? 1 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${currentColor.gradient} relative overflow-hidden`}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-1 bg-white/30"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateX(-50%)`,
                  transformOrigin: 'left center',
                }}
              />
            ))}
          </motion.div>

          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden"
          >
            {image && (
              <motion.img
                src={image}
                alt="Orb content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover rounded-full"
              />
            )}
          </motion.div>

          {isActive && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [0.8, 1.5, 2],
                    opacity: [0.8, 0.4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full border-2 border-white/50"
                />
              ))}
            </>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentColor.gradient} blur-3xl opacity-30`}
      />
    </div>
  );
}
