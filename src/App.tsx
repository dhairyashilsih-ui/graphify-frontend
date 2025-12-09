import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

// Lazy load heavy domain pages
const Agriculture = lazy(() => import('./pages/AgricultureSection'));
const Health = lazy(() => import('./pages/Health'));
const Education = lazy(() => import('./pages/Education'));
const Finance = lazy(() => import('./pages/Finance'));
const Transport = lazy(() => import('./pages/Transport'));
const UniversalAI = lazy(() => import('./pages/UniversalAI'));
const DomainSelection = lazy(() => import('./pages/DomainSelection'));

type Page = 'domains' | 'agriculture' | 'health' | 'education' | 'finance' | 'transport' | 'universal-ai';

function App() {
  // Start directly on domains page or restore last visited page
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const lastPage = localStorage.getItem('fusion_current_page') as Page;
    return lastPage || 'domains';
  });

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fusion_current_page', currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>}>
          {currentPage === 'domains' && (
            <DomainSelection key="domains" onSelectDomain={(domain) => setCurrentPage(domain as Page)} />
          )}
          {currentPage === 'agriculture' && (
            <Agriculture key="agriculture" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'health' && (
            <Health key="health" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'education' && (
            <Education key="education" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'finance' && (
            <Finance key="finance" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'transport' && (
            <Transport key="transport" onBack={() => setCurrentPage('domains')} />
          )}
          {currentPage === 'universal-ai' && (
            <UniversalAI key="universal-ai" onBack={() => setCurrentPage('domains')} />
          )}
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

export default App;
