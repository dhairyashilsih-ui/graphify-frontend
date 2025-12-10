import { useState, useCallback, useRef, useEffect } from 'react';

export interface GraphNode {
  id: string;
  label: string;
  group: number;
  active?: boolean;
  timestamp?: number;
  confidence?: number;
  flowIndex?: number; // For flowchart positioning
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
  strength?: number;
  type?: 'positive' | 'negative';
  timestamp?: number;
  flowDirection?: 'forward' | 'feedback' | 'branch'; // For flowchart styling
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface RealTimeGraphState {
  nodes: GraphNode[];
  links: GraphLink[];
  isBuilding: boolean;
  currentStep: number;
  totalSteps: number;
  buildingMessage: string;
}

type SupportedDomain = 'agriculture' | 'health' | 'finance' | 'education' | 'transport' | 'universal' | string;

export const useRealTimeGraph = () => {
  const [graphState, setGraphState] = useState<RealTimeGraphState>({
    nodes: [],
    links: [],
    isBuilding: false,
    currentStep: 0,
    totalSteps: 0,
    buildingMessage: ''
  });

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const nodeCounter = useRef(0);

  const clearTimers = useCallback(() => {
    if (timersRef.current.length) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }
  }, []);

  useEffect(() => () => {
    clearTimers();
  }, [clearTimers]);

  // Initialize graph building from API response
  const startRealtimeBuilding = useCallback(async (
    apiResponse: any,
    domain: SupportedDomain = 'universal',
    onProgress?: (step: number, total: number, message: string) => void
  ) => {
    // Clear any existing timers
    clearTimers();

    // Reset graph
    setGraphState({
      nodes: [],
      links: [],
      isBuilding: true,
      currentStep: 0,
      totalSteps: 0,
      buildingMessage: 'Initializing real-time graph construction...'
    });

    // Extract sequential steps from API response to create flowchart
    const insights = apiResponse.analysis?.insights || [];
    const recommendations = apiResponse.analysis?.recommendations || [];
    const fullText = apiResponse.text || apiResponse.response || '';

    const normalizeDomain = (raw: string): SupportedDomain => {
      const d = (raw || '').toLowerCase();
      if (d.startsWith('agri')) return 'agriculture';
      if (d.startsWith('heal')) return 'health';
      if (d.startsWith('fin')) return 'finance';
      if (d.startsWith('edu')) return 'education';
      if (d.startsWith('tran')) return 'transport';
      return 'universal';
    };

    const DOMAIN_KEYWORDS: Record<string, string[]> = {
      agriculture: ['soil','crop','water','fertilizer','nitrogen','phosphorus','potassium','irrigation','pest','disease','yield','harvest','climate','rainfall','drought','market','price','supply','demand','biodiversity'],
      health: ['patient','symptom','diagnosis','treatment','medication','therapy','exercise','sleep','stress','nutrition','blood','pressure','heart','glucose','infection','prevention','risk','immunity'],
      finance: ['revenue','cost','profit','margin','cash','flow','budget','investment','risk','return','portfolio','equity','debt','liquidity','market','volatility','inflation','savings','expense'],
      education: ['student','learning','curriculum','assessment','skills','literacy','engagement','motivation','practice','study','project','feedback','performance','retention','concept','course','teacher','peer'],
      transport: ['route','traffic','congestion','safety','fuel','emissions','logistics','delivery','capacity','schedule','delay','speed','load','maintenance','vehicle','driver','transit','rail','freight'],
      universal: []
    };

    const STOP_WORDS = new Set(['this','that','with','have','will','from','they','been','said','each','which','their','time','more','very','when','much','many','some','these','would','other','into','after','first','well','also','your','you','and','for','the','are','was','were','than','them','then','about','just','like','over','under','most','least','could','should','might','been','being','because','while','where','there','here','what','how','why','who','whom','whose','can','may']);

    const extractKeyWords = (text: string, additionalTexts: string[], domainName: SupportedDomain): string[] => {
      const dom = normalizeDomain(domainName);
      const domainList = DOMAIN_KEYWORDS[dom] || [];
      const allText = [text, ...additionalTexts].join(' ').toLowerCase();
      const tokens = allText.split(/[^a-z0-9]+/).filter(Boolean);

      // Domain-first extraction with order preserved by first appearance
      const positions = new Map<string, number>();
      tokens.forEach((tok, idx) => {
        if (domainList.includes(tok) && !positions.has(tok)) {
          positions.set(tok, idx);
        }
      });

      const domainHits = Array.from(positions.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([tok]) => tok);

      // Generic noun-ish extraction fallback
      const freq = new Map<string, { count: number; first: number }>();
      tokens.forEach((tok, idx) => {
        if (tok.length < 4) return;
        if (STOP_WORDS.has(tok)) return;
        const entry = freq.get(tok) || { count: 0, first: idx };
        freq.set(tok, { count: entry.count + 1, first: entry.first });
      });

      const generic = Array.from(freq.entries())
        .sort((a, b) => a[1].first - b[1].first)
        .map(([tok]) => tok);

      const combined = [...domainHits, ...generic];
      const seen = new Set<string>();
      const orderedUnique = combined.filter((tok) => {
        if (seen.has(tok)) return false;
        seen.add(tok);
        return true;
      });

      const limited = orderedUnique.slice(0, 8);
      return limited.length >= 3 ? limited.map((w) => w.charAt(0).toUpperCase() + w.slice(1)) : ['Context','Insight','Action'];
    };

    const keyWords = extractKeyWords(fullText, [...insights, ...recommendations], domain);
    
    // Create word nodes with proper sequencing for flowline
    const nodes: GraphNode[] = keyWords.map((word: string, index: number) => ({
      id: `word_${index + 1}`,
      label: word,
      group: index,
      confidence: 1.0 - (index * 0.05), // Small confidence variation
      timestamp: Date.now() + index * 100,
      flowIndex: index // Add flow index for flowline positioning
    }));

    // Create links with a capped connectivity to avoid O(n^2)
    const links: GraphLink[] = [];
    
    // Main sequential flow (primary connections)
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
        value: 8,
        strength: 0.8,
        type: 'positive',
        timestamp: Date.now() + i * 50,
        flowDirection: 'forward' as const
      });
    }

    // Add limited forward/branch connections to avoid O(n^2)
    const MAX_LINKS = 120;
    let linkBudget = MAX_LINKS - links.length;
    const maxFanOut = Math.max(1, Math.min(3, Math.floor(nodes.length / 2)));

    for (let i = 0; i < nodes.length && linkBudget > 0; i++) {
      for (let j = i + 2; j < nodes.length && linkBudget > 0 && j <= i + 1 + maxFanOut; j++) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          value: 5,
          strength: 0.6,
          type: 'positive',
          timestamp: Date.now() + (i * nodes.length + j) * 50,
          flowDirection: 'branch' as const
        });
        linkBudget--;
      }
    }

    // Add sparse feedback links
    for (let i = nodes.length - 1; i > 0 && linkBudget > 0; i--) {
      const backSteps = Math.min(2, i);
      for (let j = i - 2; j >= Math.max(0, i - backSteps) && linkBudget > 0; j--) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          value: 3,
          strength: 0.35,
          type: 'positive',
          timestamp: Date.now() + (i * nodes.length + j + 100) * 50,
          flowDirection: 'feedback' as const
        });
        linkBudget--;
      }
    }

    const totalSteps = nodes.length + links.length;

    setGraphState(prev => ({
      ...prev,
      totalSteps,
      buildingMessage: `Building graph with ${nodes.length} nodes and ${links.length} connections...`
    }));

    // Progressive node addition (slower timing)
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => {
        const timer = setTimeout(() => {
          console.log(`🟢 Adding node ${i + 1}:`, nodes[i]);
          setGraphState(prev => ({
            ...prev,
            nodes: [...prev.nodes, { ...nodes[i], active: true }],
            currentStep: i + 1,
            buildingMessage: `Processing: ${nodes[i].label}`
          }));
          onProgress?.(i + 1, totalSteps, `Processing: ${nodes[i].label}`);
          resolve(void 0);
        }, 400 + Math.random() * 200);
        timersRef.current.push(timer);
      });
    }

    // Progressive link addition (slower timing)
    for (let i = 0; i < links.length; i++) {
      await new Promise(resolve => {
        const timer = setTimeout(() => {
          const sourceLabel = nodes.find(n => n.id === links[i].source)?.label || links[i].source;
          const targetLabel = nodes.find(n => n.id === links[i].target)?.label || links[i].target;
          
          console.log(`🔗 Adding link ${i + 1}:`, {
            source: links[i].source,
            target: links[i].target,
            sourceLabel,
            targetLabel,
            flowDirection: links[i].flowDirection
          });
          
          setGraphState(prev => ({
            ...prev,
            links: [...prev.links, links[i]],
            currentStep: nodes.length + i + 1,
            buildingMessage: `Connecting: ${sourceLabel} → ${targetLabel}`
          }));
          onProgress?.(nodes.length + i + 1, totalSteps, `Connecting: ${sourceLabel} → ${targetLabel}`);
          resolve(void 0);
        }, 280 + Math.random() * 160);
        timersRef.current.push(timer);
      });
    }

    // Finalize
    await new Promise(resolve => {
      const timer = setTimeout(() => {
        setGraphState(prev => ({
          ...prev,
          isBuilding: false,
          buildingMessage: 'Graph construction complete!'
        }));
        onProgress?.(totalSteps, totalSteps, 'Graph construction complete!');
        resolve(void 0);
      }, 250);
      timersRef.current.push(timer);
    });

  }, []);

  // Add individual node in real-time
  const addNode = useCallback((node: Omit<GraphNode, 'timestamp'>) => {
    const newNode: GraphNode = {
      ...node,
      timestamp: Date.now(),
      active: true
    };

    setGraphState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  // Add individual link in real-time
  const addLink = useCallback((link: Omit<GraphLink, 'timestamp'>) => {
    const newLink: GraphLink = {
      ...link,
      timestamp: Date.now()
    };

    setGraphState(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  }, []);

  // Update node properties
  const updateNode = useCallback((nodeId: string, updates: Partial<GraphNode>) => {
    setGraphState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId 
          ? { ...node, ...updates, timestamp: Date.now() }
          : node
      )
    }));
  }, []);

  // Clear the graph
  const clearGraph = useCallback(() => {
    clearTimers();
    
    setGraphState({
      nodes: [],
      links: [],
      isBuilding: false,
      currentStep: 0,
      totalSteps: 0,
      buildingMessage: ''
    });
    nodeCounter.current = 0;
  }, []);

  // Simulate streaming updates (for demo/testing)
  const simulateStreamingUpdates = useCallback(async (
    onProgress?: (step: number, total: number, message: string) => void
  ) => {
    const demoNodes = [
      { id: 'word_1', label: 'Soil', group: 0, flowIndex: 0 },
      { id: 'word_2', label: 'Crop', group: 1, flowIndex: 1 },
      { id: 'word_3', label: 'Water', group: 2, flowIndex: 2 },
      { id: 'word_4', label: 'Nutrients', group: 3, flowIndex: 3 }
    ];

    // Create fully connected demo graph
    const demoLinks: Omit<GraphLink, 'timestamp'>[] = [];
    
    // Main sequential flow
    for (let i = 0; i < demoNodes.length - 1; i++) {
      demoLinks.push({
        source: demoNodes[i].id,
        target: demoNodes[i + 1].id,
        value: 10,
        strength: 1.0,
        flowDirection: 'forward' as const
      });
    }
    
    // Add all other possible connections (fully connected)
    for (let i = 0; i < demoNodes.length; i++) {
      for (let j = i + 2; j < demoNodes.length; j++) {
        demoLinks.push({
          source: demoNodes[i].id,
          target: demoNodes[j].id,
          value: 6,
          strength: 0.6,
          flowDirection: 'branch' as const
        });
      }
    }
    
    // Add reverse connections
    for (let i = demoNodes.length - 1; i > 0; i--) {
      for (let j = i - 2; j >= 0; j--) {
        demoLinks.push({
          source: demoNodes[i].id,
          target: demoNodes[j].id,
          value: 4,
          strength: 0.4,
          flowDirection: 'feedback' as const
        });
      }
    }

    clearGraph();
    
    setGraphState(prev => ({
      ...prev,
      isBuilding: true,
      totalSteps: demoNodes.length + demoLinks.length,
      buildingMessage: 'Starting real-time graph simulation...'
    }));

    // Add nodes progressively (slower timing)
    for (let i = 0; i < demoNodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      addNode(demoNodes[i]);
      onProgress?.(i + 1, demoNodes.length + demoLinks.length, `Processing: ${demoNodes[i].label}`);
    }

    // Add links progressively (slower timing)
    for (let i = 0; i < demoLinks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 420));
      addLink(demoLinks[i]);
      const sourceLabel = demoNodes.find(n => n.id === demoLinks[i].source)?.label || demoLinks[i].source;
      const targetLabel = demoNodes.find(n => n.id === demoLinks[i].target)?.label || demoLinks[i].target;
      onProgress?.(demoNodes.length + i + 1, demoNodes.length + demoLinks.length, `Connecting: ${sourceLabel} → ${targetLabel}`);
    }

    setGraphState(prev => ({
      ...prev,
      isBuilding: false,
      buildingMessage: 'Real-time graph simulation complete!'
    }));
  }, [addNode, addLink, clearGraph]);

  return {
    graphState,
    startRealtimeBuilding,
    addNode,
    addLink,
    updateNode,
    clearGraph,
    simulateStreamingUpdates
  };
};