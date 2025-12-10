import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, AlertTriangle } from 'lucide-react';
import '../types/speech.d.ts';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export default function VoiceInput({ onTranscript, isListening, onToggleListening }: VoiceInputProps) {
  const [transcript, setTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const animationRef = useRef<number>();
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const blockRestartRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      setSupportMessage('Voice not supported on this device.');
      return undefined;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setSupportMessage('Voice input not supported in this browser. Try Chrome, Edge, or Safari.');
      return undefined;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setSupportMessage('Microphone permission denied. Please allow access in your browser settings.');
        blockRestartRef.current = true; // avoid rapid restart loops on permission errors
      } else if (event.error === 'audio-capture') {
        setSupportMessage('No microphone detected. Please plug in or enable a mic.');
      } else if (event.error === 'network') {
        setSupportMessage('Network error. Check your connection and try again.');
      } else {
        setSupportMessage('Voice input error. Please try again.');
      }
    };

    return () => {
      recognition.stop();
    };

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, [onTranscript]);

  useEffect(() => {
    if (!isSupported || !recognitionRef.current || blockRestartRef.current) {
      setVolumeLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const recognition = recognitionRef.current;

    if (isListening) {
      if (cooldownRef.current) {
        // simple VAD-like guard: short cooldown after speech to reduce self-capture
        return;
      }
      try {
        recognition.start();
      } catch (err: any) {
        if (err?.name === 'InvalidStateError') {
          console.warn('Recognition already running, ignoring start');
        } else {
          console.error('Failed to start recognition:', err);
          setSupportMessage('Unable to start voice recognition. Please try again.');
        }
      }

      const animate = () => {
        setVolumeLevel(Math.random() * 100);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      recognition.stop();
      setVolumeLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // start a short cooldown to avoid capturing our own TTS
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        cooldownRef.current = null;
      }, 800);
    }
  }, [isListening, isSupported]);

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleListening}
        className={`p-3 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </motion.button>

      {!isSupported && (
        <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/40 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{supportMessage || 'Voice not supported on this device.'}</span>
        </div>
      )}

      {isListening && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Volume2 className="w-4 h-4 text-blue-400" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-blue-400 rounded-full"
                animate={{
                  height: volumeLevel > (i * 20) ? [4, 16, 4] : 4
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {transcript && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-400 max-w-xs truncate"
        >
          "{transcript}"
        </motion.div>
      )}
      {supportMessage && isSupported && (
        <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/40 rounded-lg px-3 py-2">
          {supportMessage}
        </div>
      )}
    </div>
  );
}
