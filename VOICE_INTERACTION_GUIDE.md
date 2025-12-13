# 🎙️ Voice Interaction System

## Overview
The home page now features an **interactive AI voice assistant** powered by Groq API with real-time speech recognition and text-to-speech capabilities.

## Features Implemented

### 1. **Animated Orb Welcome** 🎉
- When users land on the home page, the orb automatically:
  - Zooms in/out with a welcoming animation
  - Speaks: "Hello! I'm Graphify, your AI assistant. How can I help you today?"
  - Automatically starts listening after the welcome

### 2. **Voice Recognition** 🎤
- **Speech-to-Text**: Users can speak naturally to the AI
- **Visual Feedback**: Purple glow indicates listening mode
- **Click to Start/Stop**: Click the orb or microphone button to control listening

### 3. **AI Processing with Groq** 🧠
- User speech is transcribed to text
- Text is sent to **Groq API** (llama-3.1-8b-instant model)
- AI generates contextual, helpful responses
- Maintains conversation history for context

### 4. **Text-to-Speech Response** 🔊
- AI response is spoken using **Microsoft Edge voice** (when available)
- **Zoom Animation**: Orb zooms in/out rhythmically like a talking mouth
- Animation speed matches speech duration

### 5. **Continuous Conversation Loop** 🔄
- After AI responds, automatically starts listening again
- Natural conversation flow
- Click microphone to pause/resume anytime

## Visual Indicators

| State | Visual Effect | Orb Animation |
|-------|--------------|---------------|
| **Idle** | Blue glow | Gentle pulse |
| **Listening** | Purple glow + pulsing | Breathing zoom (1.0 → 1.1) |
| **Speaking** | Enhanced blue glow | Rapid zoom (mouth-like) |
| **Processing** | Normal glow | Gentle scale |

## How to Use

### Setup:
1. Add your Groq API key to `.env`:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

2. Get a free Groq API key:
   - Visit: https://console.groq.com/
   - Sign up and create an API key
   - Free tier includes generous limits

3. Restart dev server:
   ```bash
   npm run dev
   ```

### User Interaction:
1. **Navigate to home page** → Orb welcomes you automatically
2. **Speak naturally** → AI listens and processes
3. **Get AI response** → Orb talks back with zoom animation
4. **Click microphone icon** → Manually start/stop listening
5. **Click orb** → Quick start/stop shortcut

## Technical Architecture

### Voice Flow:
```
User Speech → Speech Recognition API → Text
    ↓
Text → Groq API (llama-3.1-8b-instant) → AI Response
    ↓
AI Response → Speech Synthesis API → Spoken Audio
    ↓
Audio Playing → Zoom Animation (mouth-like)
    ↓
Complete → Auto Start Listening Again
```

### Animation States:
```typescript
// Welcome Animation
scale: [1, 1.3, 1] // duration: 1s

// Listening Animation  
scale: [1, 1.1, 1] // repeat: infinite

// Speaking Animation
scale: [1, 1.15, 1, 1.1, 1, 1.12, 1] // dynamic repeat based on text length
```

## Files Created/Modified

### New Files:
- `src/services/groqAI.ts` - Groq API integration
- `src/services/voiceAssistant.ts` - Speech recognition & synthesis
- `.env` - Environment variables (add your API key here)
- `GROQ_API_SETUP.md` - Setup instructions

### Modified Files:
- `src/pages/DomainSelection.tsx` - Added voice interaction to orb
- `package.json` - Added groq-sdk dependency

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Speech Recognition | ✅ | ✅ | ❌* | ✅ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Groq API | ✅ | ✅ | ✅ | ✅ |

*Firefox requires `media.webspeech.recognition.enable` flag

## Customization

### Change AI Model:
```typescript
// In src/services/groqAI.ts
model: 'llama-3.1-8b-instant'
```

### Adjust Speech Rate/Pitch:
```typescript
// In DomainSelection.tsx
voiceAssistantRef.current?.speak(
  text,
  onStart,
  onEnd,
  1.0,  // rate (0.1 - 10)
  1.0   // pitch (0 - 2)
);
```

### Modify Zoom Animation:
```typescript
// In DomainSelection.tsx, speaking animation
orbControls.start({
  scale: [1, 1.15, 1, 1.1, 1, 1.12, 1], // Customize these values
  transition: { 
    duration: 0.3, 
    repeat: Math.ceil(aiResponse.length / 20),
    ease: "easeInOut" 
  }
});
```

## Troubleshooting

### "Microphone not working"
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser

### "No voice output"
- Check system volume
- Verify browser supports Web Speech API
- Try reloading page

### "Groq API error"
- Verify API key in `.env`
- Check API key is valid at console.groq.com
- Ensure `VITE_` prefix is present
- Restart dev server after adding key

## Performance Notes

- **Groq API**: Lightning-fast responses (~1-2s)
- **Speech Recognition**: Real-time processing
- **Animations**: GPU-accelerated with `will-change`
- **Memory**: Conversation history limited to prevent bloat

## Future Enhancements

Potential additions:
- [ ] Wake word detection ("Hey Graphify")
- [ ] Multi-language support
- [ ] Voice command shortcuts
- [ ] Audio visualization bars
- [ ] Save conversation history
- [ ] Emotion detection in voice
- [ ] Background music during interaction

---

**Enjoy your AI voice assistant!** 🎉
