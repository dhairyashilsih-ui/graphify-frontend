import { useState, useCallback, useRef } from 'react';

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

export const useRealTimeGraph = () => {
  const [graphState, setGraphState] = useState<RealTimeGraphState>({
    nodes: [],
    links: [],
    isBuilding: false,
    currentStep: 0,
    totalSteps: 0,
    buildingMessage: ''
  });

  const buildTimeoutRef = useRef<NodeJS.Timeout>();
  const nodeCounter = useRef(0);

  // Initialize graph building from API response
  const startRealtimeBuilding = useCallback(async (
    apiResponse: any,
    onProgress?: (step: number, total: number, message: string) => void
  ) => {
    // Clear any existing timeout
    if (buildTimeoutRef.current) {
      clearTimeout(buildTimeoutRef.current);
    }

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

    // Extract key agricultural words/concepts from the AI response
    const extractKeyWords = (text: string, additionalTexts: string[] = []): string[] => {
      const allText = [text, ...additionalTexts].join(' ').toLowerCase();
      
      // Define comprehensive agricultural keywords to extract
      const agricultureKeywords = [
        'soil', 'crop', 'water', 'fertilizer', 'nitrogen', 'phosphorus', 'potassium',
        'irrigation', 'drainage', 'ph', 'nutrients', 'organic', 'compost', 'manure',
        'pest', 'disease', 'fungus', 'bacteria', 'insect', 'weed', 'herbicide',
        'pesticide', 'fungicide', 'yield', 'harvest', 'growth', 'seeds', 'planting',
        'weather', 'climate', 'temperature', 'rainfall', 'drought', 'humidity',
        'market', 'price', 'demand', 'supply', 'profit', 'cost', 'economy',
        'sustainable', 'environment', 'ecology', 'biodiversity', 'carbon'
      ];
      
      // Find which keywords appear in the text
      const foundKeywords = agricultureKeywords.filter(keyword => 
        allText.includes(keyword)
      );
      
      // If we found enough keywords, use them
      if (foundKeywords.length >= 3) {
        return foundKeywords
          .slice(0, 4) // Limit to 4 words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize
      }
      
      // Fallback: Extract important words from the text using NLP-like approach
      const words = allText.match(/\b[a-z]{4,}\b/g) || [];
      const wordFreq = new Map();
      
      words.forEach(word => {
        if (!['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'their', 'time', 'more', 'very', 'when', 'much', 'many', 'some', 'these', 'would', 'other', 'into', 'after', 'first', 'well', 'also'].includes(word)) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
      
      const topWords = Array.from(wordFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
      
      if (topWords.length >= 3) {
        return topWords;
      }
      
      // Final fallback: Default agricultural concepts
      return ['Soil', 'Crop', 'Water', 'Nutrients'];
    };

    const keyWords = extractKeyWords(fullText, [...insights, ...recommendations]);
    
    // Create word nodes with proper sequencing for flowline
    const nodes: GraphNode[] = keyWords.map((word: string, index: number) => ({
      id: `word_${index + 1}`,
      label: word,
      group: index,
      confidence: 1.0 - (index * 0.05), // Small confidence variation
      timestamp: Date.now() + index * 100,
      flowIndex: index // Add flow index for flowline positioning
    }));

    // Create fully connected graph - every node connects to every other node
    const links: GraphLink[] = [];
    
    // Main sequential flow (primary connections)
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
        value: 10,
        strength: 1.0,
        type: 'positive',
        timestamp: Date.now() + i * 100,
        flowDirection: 'forward' as const
      });
    }
    
    // Add all other possible connections (fully connected)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 2; j < nodes.length; j++) { // Skip adjacent nodes (already connected above)
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          value: 6,
          strength: 0.6,
          type: 'positive',
          timestamp: Date.now() + (i * nodes.length + j) * 100,
          flowDirection: 'branch' as const
        });
      }
    }
    
    // Add reverse connections for full connectivity
    for (let i = nodes.length - 1; i > 0; i--) {
      for (let j = i - 2; j >= 0; j--) { // Skip adjacent reverse connections
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          value: 4,
          strength: 0.4,
          type: 'positive',
          timestamp: Date.now() + (i * nodes.length + j + 100) * 100,
          flowDirection: 'feedback' as const
        });
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
        buildTimeoutRef.current = setTimeout(() => {
          console.log(`🟢 Adding node ${i + 1}:`, nodes[i]);
          setGraphState(prev => ({
            ...prev,
            nodes: [...prev.nodes, { ...nodes[i], active: true }],
            currentStep: i + 1,
            buildingMessage: `Processing: ${nodes[i].label}`
          }));
          onProgress?.(i + 1, totalSteps, `Processing: ${nodes[i].label}`);
          resolve(void 0);
        }, 800 + Math.random() * 400); // Much slower: 800-1200ms per node
      });
    }

    // Progressive link addition (slower timing)
    for (let i = 0; i < links.length; i++) {
      await new Promise(resolve => {
        buildTimeoutRef.current = setTimeout(() => {
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
        }, 500 + Math.random() * 300); // Slower: 500-800ms per link
      });
    }

    // Finalize
    await new Promise(resolve => {
      buildTimeoutRef.current = setTimeout(() => {
        setGraphState(prev => ({
          ...prev,
          isBuilding: false,
          buildingMessage: 'Graph construction complete!'
        }));
        onProgress?.(totalSteps, totalSteps, 'Graph construction complete!');
        resolve(void 0);
      }, 500);
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
    if (buildTimeoutRef.current) {
      clearTimeout(buildTimeoutRef.current);
    }
    
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
      await new Promise(resolve => setTimeout(resolve, 1200)); // Slower: 1.2 seconds per node
      addNode(demoNodes[i]);
      onProgress?.(i + 1, demoNodes.length + demoLinks.length, `Processing: ${demoNodes[i].label}`);
    }

    // Add links progressively (slower timing)
    for (let i = 0; i < demoLinks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Slower: 0.8 seconds per link
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