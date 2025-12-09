# Environment Variables

## Groq API Configuration
Add your Groq API key to `.env` file:

```
VITE_GROQ_API_KEY=your_actual_groq_api_key_here
```

## How to Get Groq API Key:
1. Visit https://console.groq.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

## Important:
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Restart your dev server after adding the API key
