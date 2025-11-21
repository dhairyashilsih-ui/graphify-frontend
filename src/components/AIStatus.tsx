import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader, Cpu, Database, Wifi } from 'lucide-react';
import { localAI } from '../services/localAI';

interface AIStatusProps {
  className?: string;
}

export default function AIStatus({ className = "" }: AIStatusProps) {
  const [status, setStatus] = useState({
    ai_backend: 'checking',
    local_models: 0,
    fallback_active: true
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const systemStatus = await localAI.getSystemStatus();
      setStatus(systemStatus);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus({
        ai_backend: 'unavailable',
        local_models: 0,
        fallback_active: true
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'checking': return 'text-blue-400';
      default: return 'text-red-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertCircle;
      case 'checking': return Loader;
      default: return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon(status.ai_backend);

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 ${className}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      {/* Compact Status Indicator */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-md border border-gray-600/50 rounded-lg px-3 py-2 text-sm"
      >
        <StatusIcon 
          className={`w-4 h-4 ${getStatusColor(status.ai_backend)} ${status.ai_backend === 'checking' ? 'animate-spin' : ''}`} 
        />
        <span className="text-gray-300">
          {status.fallback_active ? 'Offline' : 'Local AI'}
        </span>
      </motion.button>

      {/* Expanded Status Panel */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-12 right-0 w-80 bg-gray-800/95 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">GraphoraX AI Status</h3>
            <motion.button
              onClick={() => setIsExpanded(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </motion.button>
          </div>

          {/* AI Backend Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">AI Backend</span>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(status.ai_backend)}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm capitalize">{status.ai_backend}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Local Models</span>
              </div>
              <span className="text-sm text-gray-400">
                {status.local_models} installed
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Connection</span>
              </div>
              <span className={`text-sm ${status.fallback_active ? 'text-yellow-400' : 'text-green-400'}`}>
                {status.fallback_active ? 'Fallback Mode' : 'Local Processing'}
              </span>
            </div>
          </div>

          {/* Status Messages */}
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
            {status.ai_backend === 'healthy' && !status.fallback_active && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-400 font-medium">Local AI Active</p>
                  <p className="text-xs text-gray-400">Running with {status.local_models} models</p>
                </div>
              </div>
            )}

            {status.ai_backend === 'degraded' && (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-400 font-medium">Degraded Performance</p>
                  <p className="text-xs text-gray-400">Some features may be limited</p>
                </div>
              </div>
            )}

            {status.ai_backend === 'unavailable' && (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Local AI Unavailable</p>
                  <p className="text-xs text-gray-400">Using intelligent fallback responses</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <motion.button
              onClick={checkStatus}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
            >
              Refresh Status
            </motion.button>

            {status.ai_backend === 'unavailable' && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>To enable local AI:</p>
                <p>1. Start backend: <code className="bg-gray-700 px-1 rounded">cd backend && npm start</code></p>
                <p>2. Install models: <code className="bg-gray-700 px-1 rounded">ollama pull llama3.1:8b</code></p>
              </div>
            )}
          </div>

          {/* Last Check */}
          <div className="mt-3 pt-3 border-t border-gray-600/30">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last checked:</span>
              <span>{lastCheck.toLocaleTimeString()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}