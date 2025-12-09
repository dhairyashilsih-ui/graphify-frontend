export class VoiceAssistant {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize speech recognition
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
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    this.recognition.start();
  }

  stopListening(): void {
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
    this.synthesis.cancel();
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}
