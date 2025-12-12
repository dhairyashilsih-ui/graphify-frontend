import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AuthUser } from './pages/Login';

// Lazy load heavy domain pages
const Agriculture = lazy(() => import('./pages/Agriculture_NEW'));
const Health = lazy(() => import('./pages/Health'));
const Education = lazy(() => import('./pages/Education'));
const Finance = lazy(() => import('./pages/Finance'));
const Transport = lazy(() => import('./pages/Transport'));
const UniversalAI = lazy(() => import('./pages/UniversalAI'));
const DomainSelection = lazy(() => import('./pages/DomainSelection'));
const Login = lazy(() => import('./pages/Login'));

type Page =
  | 'login'
  | 'domains'
  | 'agriculture'
  | 'health'
  | 'education'
  | 'finance'
  | 'transport'
  | 'universal-ai';

function App() {
  const initialUser = (() => {
    const stored = localStorage.getItem('fusion_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch (err) {
      console.error('Failed to parse stored user', err);
      return null;
    }
  })();

  // Start on login if no user; otherwise restore last visited page
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (initialUser) {
      const lastPage = localStorage.getItem('fusion_current_page') as Page;
      return lastPage || 'domains';
    }
    return 'login';
  });

  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialUser);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) return;
    localStorage.setItem('fusion_current_page', currentPage);
  }, [currentPage, isAuthenticated]);

  const handleAuthenticated = (authUser: AuthUser) => {
    setUser(authUser);
    setIsAuthenticated(true);
    localStorage.setItem('fusion_user', JSON.stringify(authUser));
    setCurrentPage('domains');
  };

  const handleLogout = () => {
    localStorage.removeItem('fusion_user');
    localStorage.removeItem('fusion_current_page');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {isAuthenticated && user && (
        <>
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl px-4 py-2 shadow-lg shadow-indigo-500/20">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="h-9 w-9 rounded-full border border-white/20 object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-500/70 flex items-center justify-center text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-100 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 hover:bg-rose-500/30 transition"
            >
              Sign out
            </button>
          </div>
          <motion.div
            className="fixed top-6 left-6 z-40 text-lg font-semibold text-white/90"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          >
            Graphify • <span className="text-indigo-200">{user.name}</span>
          </motion.div>
        </>
      )}
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>}>
          {currentPage === 'login' && (
            <Login key="login" onAuthenticated={handleAuthenticated} />
          )}
          {currentPage === 'domains' && isAuthenticated && (
            <DomainSelection key="domains" onSelectDomain={(domain) => setCurrentPage(domain as Page)} />
          )}
          {currentPage === 'agriculture' && isAuthenticated && (
            <Agriculture key="agriculture" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'health' && isAuthenticated && (
            <Health key="health" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'education' && isAuthenticated && (
            <Education key="education" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'finance' && isAuthenticated && (
            <Finance key="finance" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'transport' && isAuthenticated && (
            <Transport key="transport" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'universal-ai' && isAuthenticated && (
            <UniversalAI key="universal-ai" onBack={() => setCurrentPage('domains')} />
          )}
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

export default App;
