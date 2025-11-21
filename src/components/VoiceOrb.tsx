import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { localAI } from '../services/localAI';

interface VoiceOrbProps {
  domain: string;
  isActive: boolean;
  audioData?: string;
  audioContentType?: string;
  voiceResponse?: string;
  onSpeakingStateChange?: (isSpeaking: boolean) => void;
  className?: string;
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({
  domain,
  isActive,
  audioData,
  audioContentType,
  voiceResponse,
  onSpeakingStateChange,
  className = ''
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Domain-specific colors
  const domainColors = {
    agriculture: { 
      primary: '#22c55e', 
      secondary: '#16a34a',
      accent: '#dcfce7'
    },
    health: { 
      primary: '#ef4444', 
      secondary: '#dc2626',
      accent: '#fee2e2'
    },
    education: { 
      primary: '#3b82f6', 
      secondary: '#2563eb',
      accent: '#dbeafe'
    },
    finance: { 
      primary: '#f59e0b', 
      secondary: '#d97706',
      accent: '#fef3c7'
    },
    transport: { 
      primary: '#8b5cf6', 
      secondary: '#7c3aed',
      accent: '#ede9fe'
    },
    universal: { 
      primary: '#06b6d4', 
      secondary: '#0891b2',
      accent: '#cffafe'
    }
  };

  const colors = domainColors[domain as keyof typeof domainColors] || domainColors.universal;

  // Play audio when audioData is provided
  useEffect(() => {
    if (audioData && isActive && !isSpeaking) {
      playAudio();
    }
  }, [audioData, isActive]);

  const playAudio = async () => {
    if (!audioData) return;

    try {
      setIsSpeaking(true);
      setAudioError(null);
      onSpeakingStateChange?.(true);

      await localAI.playAudio(audioData, audioContentType);
      
      setIsSpeaking(false);
      onSpeakingStateChange?.(false);
    } catch (error) {
      console.error('Audio playback failed:', error);
      setAudioError('Audio playback failed');
      setIsSpeaking(false);
      onSpeakingStateChange?.(false);
      
      // Fallback to text display
      if (voiceResponse) {
        speakWithWebAPI(voiceResponse);
      }
    }
  };

  // Fallback to Web Speech API
  const speakWithWebAPI = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      setIsSpeaking(true);
      onSpeakingStateChange?.(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        onSpeakingStateChange?.(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        onSpeakingStateChange?.(false);
        setAudioError('Speech synthesis failed');
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Web Speech API failed:', error);
      setIsSpeaking(false);
      onSpeakingStateChange?.(false);
      setAudioError('Speech not available');
    }
  };

  // Manual trigger for speaking
  const handleSpeak = () => {
    if (isSpeaking) {
      // Stop current speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingStateChange?.(false);
      return;
    }

    if (audioData) {
      playAudio();
    } else if (voiceResponse) {
      speakWithWebAPI(voiceResponse);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Orb */}
      <motion.div
        className="relative w-32 h-32 cursor-pointer"
        onClick={handleSpeak}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer Ring - Pulsing when speaking */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 opacity-60"
          style={{ borderColor: colors.primary }}
          animate={isSpeaking ? {
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.3, 0.6]
          } : {}}
          transition={{ duration: 1.5, repeat: isSpeaking ? Infinity : 0 }}
        />

        {/* Middle Ring - Sound waves when speaking */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              className="absolute inset-2 rounded-full border opacity-40"
              style={{ borderColor: colors.secondary }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.1, 0.8],
                opacity: [0, 0.4, 0]
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Core Orb */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br shadow-lg"
          style={{
            backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
          }}
          animate={isSpeaking ? {
            boxShadow: [
              `0 0 20px ${colors.primary}40`,
              `0 0 40px ${colors.primary}60`,
              `0 0 20px ${colors.primary}40`
            ]
          } : {}}
          transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
        >
          {/* Inner Glow */}
          <div 
            className="absolute inset-1 rounded-full opacity-30"
            style={{ backgroundColor: colors.accent }}
          />
        </motion.div>

        {/* Center Icon/Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-6 h-6 text-white"
            animate={isSpeaking ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
          >
            {isSpeaking ? (
              // Sound waves icon
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              // Microphone icon
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            )}
          </motion.div>
        </div>

        {/* Audio Element for playback */}
        <audio
          ref={audioRef}
          preload="none"
          style={{ display: 'none' }}
        />
      </motion.div>

      {/* Status Text */}
      <div className="text-center mt-2">
        <motion.p 
          className="text-sm font-medium"
          style={{ color: colors.primary }}
          animate={isSpeaking ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
        >
          {isSpeaking ? 'Speaking...' : 'Click to hear response'}
        </motion.p>
        
        {audioError && (
          <p className="text-xs text-red-500 mt-1">{audioError}</p>
        )}
      </div>
    </div>
  );
};

export default VoiceOrb;