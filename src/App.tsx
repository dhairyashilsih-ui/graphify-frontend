import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './pages/SplashScreen';
import DomainSelection from './pages/DomainSelection';
import Agriculture from './pages/Agriculture';
import Health from './pages/Health';
import Education from './pages/Education';
import Finance from './pages/Finance';
import Transport from './pages/Transport';
import UniversalAI from './pages/UniversalAI';

type Page = 'splash' | 'domains' | 'agriculture' | 'health' | 'education' | 'finance' | 'transport' | 'universal-ai';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('splash');

  useEffect(() => {
    if (currentPage === 'splash') {
      const timer = setTimeout(() => {
        setCurrentPage('domains');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentPage === 'splash' && (
          <SplashScreen key="splash" />
        )}
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
      </AnimatePresence>
    </div>
  );
}

export default App;
