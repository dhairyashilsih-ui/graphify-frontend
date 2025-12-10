export class VoiceAssistant {
  private recognition: SpeechRecognition | null;
  private synthesis: SpeechSynthesis | null;
  private isListening: boolean = false;
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    this.recognition = null;
    this.synthesis = null;

    if (!this.isBrowser) {
      return;
    }

    this.synthesis = 'speechSynthesis' in window ? window.speechSynthesis : null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: any) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.isBrowser) {
      const errorMsg = 'Voice not supported in this environment (SSR or non-browser).';
      console.warn(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    if (!this.recognition) {
      const errorMsg = 'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
      console.error(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    if (this.isListening) {
      console.warn('Already listening, ignoring duplicate start');
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 Listening started');
      onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      try {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          console.log('📝 Transcript:', transcript);
          onResult(transcript);
        } else {
          console.warn('Empty transcript received');
        }
      } catch (error: any) {
        console.error('Error processing speech result:', error);
        onError?.(error);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      this.isListening = false;
      
      // Provide user-friendly error messages
      let userMessage = 'Voice recognition error';
      switch (event.error) {
        case 'no-speech':
          userMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          userMessage = 'Microphone not found. Please check your device.';
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          userMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          userMessage = 'Network error. Please check your connection.';
          break;
        default:
          userMessage = `Voice recognition error: ${event.error}`;
      }
      
      onError?.(new Error(userMessage));
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🎤 Listening ended');
      onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (error: any) {
      // InvalidStateError occurs if already started; surface readable message
      const message = error?.name === 'InvalidStateError'
        ? 'Voice recognition is already running.'
        : 'Failed to start voice recognition.';
      console.error(message, error);
      this.isListening = false;
      onError?.(new Error(message));
    }
  }

  stopListening(): void {
    if (!this.isBrowser) return;
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: any) => void;
      rate?: number;
      pitch?: number;
    }
  ): void {
    const { onStart, onEnd, onError, rate = 1.0, pitch = 1.0 } = options || {};
    if (!this.isBrowser || !this.synthesis) {
      const err = new Error('Speech synthesis not supported in this environment.');
      onError?.(err);
      return;
    }
    
    // Cancel any ongoing speech
    this.synthesis.cancel();

    // Small delay to ensure cancellation is complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Wait for voices to load
      const setVoiceAndSpeak = () => {
        const voices = this.synthesis.getVoices();
        
        // Priority list of high-quality voices by language
        const preferredVoices = [
          // English (en)
          'Microsoft Jenny',
          'Microsoft Aria',
          'Microsoft Guy',
          'Microsoft Sara',
          'Microsoft Mark',
          
          // Hindi (hi)
          'Microsoft Swara',
          'Microsoft Madhur',
          
          // Marathi (mr)
          'Microsoft Aarohi',
          
          // Tamil (ta)
          'Microsoft Pallavi',
          
          // Telugu (te)
          'Microsoft Shruti',
          
          // Bengali (bn)
          'Microsoft Bashkar',
          
          // Gujarati (gu)
          'Microsoft Dhwani',
          
          // Kannada (kn)
          'Microsoft Gagan',
          
          // Spanish (es)
          'Microsoft Elvira',
          'Microsoft Elena',
          
          // French (fr)
          'Microsoft Denise',
          'Microsoft Eloise',
          
          // German (de)
          'Microsoft Katja',
          'Microsoft Conrad',
          
          // Chinese (zh)
          'Microsoft Xiaoxiao',
          'Microsoft Yunxi'
        ];
        
        // Try to find the best voice from priority list
        let selectedVoice = null;
        
        for (const preferredName of preferredVoices) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(preferredName) &&
            (voice.name.toLowerCase().includes('online') || 
             voice.name.toLowerCase().includes('neural') ||
             voice.name.toLowerCase().includes('microsoft'))
          );
          if (selectedVoice) break;
        }
        
        // Fallback: any Microsoft voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('microsoft')
          );
        }
        
        // Final fallback: first English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🎤 Using voice:', selectedVoice.name, '|', selectedVoice.lang);
        } else {
          console.warn('⚠️ No suitable voice found, using default');
        }

        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0; // Maximum volume
        utterance.lang = 'en-US';

        utterance.onstart = () => {
          onStart?.();
        };

        utterance.onend = () => {
          onEnd?.();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          if (onError) {
            onError(event);
          }
          // Only call onEnd if it's not an interrupted error
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            onEnd?.();
          }
        };

        try {
          this.synthesis.speak(utterance);
        } catch (error) {
          console.error('Failed to speak:', error);
          onEnd?.();
        }
      };

      // Check if voices are already loaded
      if (this.synthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        // Wait for voices to load
        this.synthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
      }
    }, 100);
  }

  stopSpeaking(): void {
    if (!this.isBrowser) return;
    this.synthesis?.cancel();
  }

  cancel(): void {
    // Safely stop any ongoing speech synthesis
    try {
      this.synthesis?.cancel();
    } catch (err) {
      console.warn('Speech synthesis cancel failed:', err);
    }

    // Safely stop recognition if it was started
    try {
      if (this.recognition) {
        this.recognition.stop();
      }
    } catch (err) {
      console.warn('Speech recognition stop failed:', err);
    }

    this.isListening = false;
  }

  isSpeaking(): boolean {
    return !!this.synthesis?.speaking;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}
