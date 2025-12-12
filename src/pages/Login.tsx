import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { saveUserProfile } from '../services/user';

export type AuthUser = {
  sub?: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified?: boolean;
  hd?: string;
  locale?: string;
};

type LoginProps = {
  onAuthenticated: (user: AuthUser) => void;
};

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (options: Record<string, unknown>) => void;
      renderButton: (
        parent: HTMLElement,
        options: Record<string, unknown>
      ) => void;
      prompt: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

const backdropGradient =
  'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950';
const glassCard =
  'bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 rounded-3xl';

function Login({ onAuthenticated }: LoginProps) {
  const [googleReady, setGoogleReady] = useState(false);
  const [loadingClientId, setLoadingClientId] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const backendBaseUrl = useMemo(() => {
    const raw = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const trimmed = raw.replace(/\/$/, '');
    // Remove trailing /api to avoid double-prefixing
    return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchClientId() {
      try {
        const res = await fetch(`${backendBaseUrl}/api/config/google-client-id`);
        if (!res.ok) throw new Error(`Backend responded ${res.status}`);
        const data = await res.json();
        if (!data?.clientId) throw new Error('Google client ID missing in backend response');
        if (!cancelled) {
          setClientId(data.clientId);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load Google client ID from backend', err);
          setError('Google login is not configured on the server.');
        }
      } finally {
        if (!cancelled) setLoadingClientId(false);
      }
    }

    fetchClientId();
    return () => {
      cancelled = true;
    };
  }, [backendBaseUrl]);

  useEffect(() => {
    if (window.google) {
      setGoogleReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setError('Failed to load Google authentication.');
    document.head.appendChild(script);

    return () => {
      // Keep the script in place for subsequent navigations; no cleanup needed.
    };
  }, []);

  useEffect(() => {
    if (!googleReady || !clientId || !window.google || !buttonRef.current) {
      if (!clientId && !loadingClientId) {
        setError('Google login is not configured on the server.');
      }
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (!response.credential) {
            setError('No credential returned from Google.');
            return;
          }

          try {
            const payload = JSON.parse(
              atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
            );
            const user: AuthUser = {
              sub: payload.sub,
              name: payload.name || payload.given_name || 'User',
              email: payload.email || '',
              picture: payload.picture,
              emailVerified: payload.email_verified,
              hd: payload.hd,
              locale: payload.locale,
            };
            saveUserProfile(user);
            onAuthenticated(user);
          } catch (err) {
            console.error('Failed to parse Google credential', err);
            setError('Could not verify Google credential.');
          }
        },
        ux_mode: 'popup',
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width: 280,
      });

      window.google.accounts.id.prompt();
    } catch (err) {
      console.error('Google auth init failed', err);
      setError('Google authentication is unavailable right now.');
    }
  }, [clientId, googleReady, loadingClientId, onAuthenticated]);

  return (
    <div className={`min-h-screen ${backdropGradient} text-white overflow-hidden relative`}>
      <div className="absolute inset-0">
        <div className="absolute -left-10 -top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`max-w-3xl w-full ${glassCard} p-10 sm:p-12 lg:p-14`}
        >
          <div className="flex items-center gap-3 text-indigo-200 mb-4">
            <Sparkles className="h-6 w-6 text-indigo-300" />
            <span className="text-sm font-semibold uppercase tracking-widest">Fusion Access</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Sign in to continue
          </h1>
          <p className="text-lg text-slate-200/80 max-w-2xl mb-8">
            Securely authenticate with Google to access the full suite of AI domains. Your profile is kept locally for a seamless return experience.
          </p>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className={`${glassCard} p-6 sm:p-7 border-white/5 bg-white/5`}>
              <div className="flex items-center gap-3 text-slate-200 mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-semibold">Google-secured authentication</span>
              </div>
              <div ref={buttonRef} className="flex flex-col items-start" />
              {error && (
                <p className="mt-4 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
              {loadingClientId && !error && (
                <div className="mt-4 flex items-center gap-2 text-slate-300 text-sm">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  Fetching sign-in configuration...
                </div>
              )}
              {!googleReady && !error && (
                <div className="mt-4 flex items-center gap-2 text-slate-300 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Loading Google authentication...
                </div>
              )}
            </div>

            <div className="space-y-4 text-slate-200/90">
              <div className={`${glassCard} p-5 border-white/5`}>
                <div className="flex items-center gap-3 mb-2">
                  <LogIn className="h-5 w-5 text-sky-300" />
                  <span className="font-semibold">Why sign in?</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200/80">
                  We use your Google identity to personalize sessions and keep your AI explorations consistent. No passwords stored—just a safe sign-in with your Google account.
                </p>
              </div>

              <div className={`${glassCard} p-5 border-white/5`}>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-indigo-300" />
                  <span className="font-semibold">What happens next?</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200/80">
                  After signing in, you will land on the domain selection hub with access to Agriculture, Health, Education, Finance, Transport, and Universal AI experiences.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
