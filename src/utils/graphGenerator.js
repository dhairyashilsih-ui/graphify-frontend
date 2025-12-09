// NEW Graph Generator - Single Groq call with keywords and layout hints
// AI returns reasoning steps with keywords, we build graphs locally

// Generate optimized prompt for single Groq API call
export const generateReasoningPrompt = (question, domain = 'general') => {
  const domainInstructions = {
    agriculture: 'agricultural concepts: Soil, Water, Climate, NPK, pH, Irrigation, Pests, Yield, etc.',
    health: 'health concepts: Cardiovascular, Nutrition, Exercise, Metabolism, Prevention, Treatment, Symptoms, Diagnosis, etc.',
    general: 'domain-specific concepts relevant to the question'
  };

  const domainTerms = domainInstructions[domain] || domainInstructions.general;

  return [
    {
      role: 'system',
      content: `You are an expert AI reasoning engine. Given a user question, break down your reasoning into clear steps.

RETURN ONLY THIS JSON STRUCTURE:

{
  "steps": [
    {
      "title": "Step title (5-8 words)",
      "text": "Explanation of this reasoning step (2-3 sentences)",
      "keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4", "Keyword5"],
      "graphShape": "circle|radial|tree|chain|cluster|snake|diamond|grid|fishbone"
    }
  ],
  "summaryKeywords": ["Key1", "Key2", ..., "Key12"],
  "final_answer": "Complete answer to the question"
}

RULES:
1. Create 4-6 reasoning steps
2. Each step has 5-7 keywords (${domainTerms})
3. Keywords should show causal flow (cause → effect → result)
4. MUST vary graphShape per step - NEVER repeat the same shape twice
5. Summary keywords: 12-16 most important concepts from all steps
6. Use domain-specific terminology appropriate to the question
7. Make keywords concrete, not vague (e.g., "Hypertension Risk" not "Problem")
8. Graph shapes:
   - fishbone: Use for cause-effect, problem diagnosis, "why" questions
   - diamond: Use for converging factors or diverging solutions
   - snake: Use for multi-stage sequences (better than chain)
   - radial: Use for hub concepts with dependencies
   - tree: Use for hierarchical breakdowns
   - grid: Use for comparisons or multi-factor analysis
   - circle: Use for cyclical processes only
   - cluster: Use for grouping related concepts
   - chain: AVOID unless specifically linear (prefer snake or fishbone)
9. For sequential processes, prefer snake or fishbone over chain

No markdown. Just clean JSON.`
    },
    {
      role: 'user',
      content: `Question: ${question}`
    }
  ];
};

// Parse AI response and return structured data
export const parseReasoningResponse = (response) => {
  try {
    // Remove markdown code blocks if present
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Extract JSON from response
    const firstBrace = cleanResponse.indexOf('{');
    const lastBrace = cleanResponse.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON found in response');
    }
    
    const jsonStr = cleanResponse.substring(firstBrace, lastBrace + 1);
    const data = JSON.parse(jsonStr);
    
    // Validate structure
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error('Invalid steps structure');
    }
    
    // Normalize data
    const steps = data.steps.map((step, index) => ({
      title: step.title || `Step ${index + 1}`,
      text: step.text || '',
      keywords: step.keywords || [],
      graphShape: step.graphShape || 'circle'
    }));
    
    // Remove duplicate summary keywords and limit to 16
    const summaryKeywords = [...new Set(data.summaryKeywords || [])].slice(0, 16);
    
    return {
      steps,
      summaryKeywords,
      final_answer: data.final_answer || ''
    };
    
  } catch (error) {
    console.error('Failed to parse reasoning response:', error);
    
    // Return fallback structure
    return {
      steps: [
        {
          title: 'Analyzing Question',
          text: 'Processing your agricultural query...',
          keywords: ['Question', 'Context', 'Analysis', 'Data', 'Factors'],
          graphShape: 'circle'
        },
        {
          title: 'Identifying Factors',
          text: 'Examining key agricultural factors...',
          keywords: ['Soil', 'Water', 'Climate', 'Seeds', 'Management'],
          graphShape: 'radial'
        },
        {
          title: 'Forming Solution',
          text: 'Developing practical recommendations...',
          keywords: ['Research', 'Best Practice', 'Solution', 'Implementation'],
          graphShape: 'diamond'
        }
      ],
      summaryKeywords: ['Question', 'Analysis', 'Soil', 'Water', 'Climate', 'Solution'],
      final_answer: 'Please try asking your question again for a detailed answer.'
    };
  }
};

// Build graph structure from keywords using specified layout
export const buildGraphFromKeywords = (keywords, graphShape, width = 700, height = 550) => {
  if (!keywords || keywords.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes = keywords.map((keyword, index) => ({
    id: `node_${index}`,
    label: keyword,
    type: 'concept'
  }));

  const edges = [];
  const layouts = {
    circle: buildCircleLayout,
    radial: buildRadialLayout,
    tree: buildTreeLayout,
    chain: buildChainLayout,
    cluster: buildClusterLayout,
    snake: buildSnakeLayout,
    diamond: buildDiamondLayout,
    grid: buildGridLayout,
    fishbone: buildFishboneLayout
  };

  const layoutFunc = layouts[graphShape] || layouts.circle;
  const positions = layoutFunc(nodes.length, width, height);

  // Apply positions to nodes
  nodes.forEach((node, i) => {
    node.x = positions[i].x;
    node.y = positions[i].y;
    node.fx = positions[i].x;
    node.fy = positions[i].y;
  });

  // Build edges based on layout
  switch (graphShape) {
    case 'circle':
      for (let i = 0; i < nodes.length; i++) {
        edges.push({ source: nodes[i].id, target: nodes[(i + 1) % nodes.length].id });
      }
      break;
    
    case 'radial':
      if (nodes.length > 1) {
        for (let i = 1; i < nodes.length; i++) {
          edges.push({ source: nodes[0].id, target: nodes[i].id });
        }
      }
      break;
    
    case 'tree':
      const childrenPerParent = 3;
      for (let i = 1; i < nodes.length; i++) {
        const parentIndex = Math.floor((i - 1) / childrenPerParent);
        if (parentIndex < nodes.length) {
          edges.push({ source: nodes[parentIndex].id, target: nodes[i].id });
        }
      }
      break;
    
    case 'chain':
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({ source: nodes[i].id, target: nodes[i + 1].id });
      }
      break;
    
    case 'cluster':
      const clusterSize = Math.min(3, Math.ceil(nodes.length / 3));
      for (let i = 0; i < nodes.length; i++) {
        const clusterIndex = Math.floor(i / clusterSize);
        const clusterStart = clusterIndex * clusterSize;
        if (i > clusterStart) {
          edges.push({ source: nodes[clusterStart].id, target: nodes[i].id });
        }
        if (i === clusterStart && clusterStart > 0) {
          edges.push({ source: nodes[clusterStart - clusterSize].id, target: nodes[clusterStart].id });
        }
      }
      break;
    
    case 'snake':
      // Zigzag/snake pattern
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({ source: nodes[i].id, target: nodes[i + 1].id });
      }
      break;
    
    case 'diamond':
      // Diamond: converge then diverge
      if (nodes.length >= 3) {
        const midPoint = Math.floor(nodes.length / 2);
        // Converge to center
        for (let i = 0; i < midPoint; i++) {
          edges.push({ source: nodes[i].id, target: nodes[midPoint].id });
        }
        // Diverge from center
        for (let i = midPoint + 1; i < nodes.length; i++) {
          edges.push({ source: nodes[midPoint].id, target: nodes[i].id });
        }
      }
      break;
    
    case 'grid':
      // Grid: connect adjacent cells
      const gridCols = Math.ceil(Math.sqrt(nodes.length));
      for (let i = 0; i < nodes.length; i++) {
        const row = Math.floor(i / gridCols);
        const col = i % gridCols;
        // Connect right
        if (col < gridCols - 1 && i + 1 < nodes.length) {
          edges.push({ source: nodes[i].id, target: nodes[i + 1].id });
        }
        // Connect down
        if (i + gridCols < nodes.length) {
          edges.push({ source: nodes[i].id, target: nodes[i + gridCols].id });
        }
      }
      break;
    
    case 'fishbone':
      // Fishbone: spine with branches
      if (nodes.length >= 2) {
        const spineLength = Math.ceil(nodes.length / 2);
        // Create spine
        for (let i = 0; i < spineLength - 1; i++) {
          edges.push({ source: nodes[i].id, target: nodes[i + 1].id });
        }
        // Add branches to spine
        let branchIndex = spineLength;
        for (let i = 0; i < spineLength && branchIndex < nodes.length; i++) {
          edges.push({ source: nodes[branchIndex].id, target: nodes[i].id });
          branchIndex++;
        }
      }
      break;
  }

  return { nodes, edges };
};

// Layout Functions - Return {x, y} positions for each node

function buildCircleLayout(nodeCount, width, height) {
  const radius = Math.min(width, height) * 0.35;
  const centerX = width / 2;
  const centerY = height / 2;
  const angleStep = (2 * Math.PI) / nodeCount;

  return Array.from({ length: nodeCount }, (_, i) => ({
    x: centerX + radius * Math.cos(i * angleStep - Math.PI / 2),
    y: centerY + radius * Math.sin(i * angleStep - Math.PI / 2)
  }));
}

function buildRadialLayout(nodeCount, width, height) {
  if (nodeCount === 1) return [{ x: width / 2, y: height / 2 }];
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;
  const angleStep = (2 * Math.PI) / (nodeCount - 1);

  return [
    { x: centerX, y: centerY },
    ...Array.from({ length: nodeCount - 1 }, (_, i) => ({
      x: centerX + radius * Math.cos(i * angleStep),
      y: centerY + radius * Math.sin(i * angleStep)
    }))
  ];
}

function buildTreeLayout(nodeCount, width, height) {
  const positions = [];
  
  if (nodeCount === 1) {
    return [{ x: width / 2, y: height / 2 }];
  }
  
  // Create a more balanced tree with 2-3 children per parent
  const childrenPerNode = 3;
  const levels = Math.ceil(Math.log(nodeCount) / Math.log(childrenPerNode)) + 1;
  const verticalSpacing = height / (levels + 0.5);
  
  let nodeIndex = 0;
  let currentLevelStart = 0;
  
  for (let level = 0; level < levels && nodeIndex < nodeCount; level++) {
    let nodesInLevel;
    if (level === 0) {
      nodesInLevel = 1; // Root
    } else {
      const parentsInPreviousLevel = nodeIndex - currentLevelStart;
      nodesInLevel = Math.min(parentsInPreviousLevel * childrenPerNode, nodeCount - nodeIndex);
    }
    
    const horizontalSpacing = width / (nodesInLevel + 1);
    const y = verticalSpacing * (level + 1);
    
    for (let i = 0; i < nodesInLevel && nodeIndex < nodeCount; i++) {
      positions.push({
        x: horizontalSpacing * (i + 1),
        y: y
      });
      nodeIndex++;
    }
    
    currentLevelStart = nodeIndex - nodesInLevel;
  }
  
  return positions;
}

function buildChainLayout(nodeCount, width, height) {
  const spacing = width / (nodeCount + 1);
  const centerY = height / 2;
  
  return Array.from({ length: nodeCount }, (_, i) => ({
    x: spacing * (i + 1),
    y: centerY
  }));
}

function buildClusterLayout(nodeCount, width, height) {
  const clusterCount = Math.ceil(Math.sqrt(nodeCount / 2));
  const clusterSize = Math.ceil(nodeCount / clusterCount);
  const positions = [];
  
  const gridCols = Math.ceil(Math.sqrt(clusterCount));
  const gridSpacingX = width / (gridCols + 1);
  const gridSpacingY = height / (Math.ceil(clusterCount / gridCols) + 1);
  
  let nodeIndex = 0;
  for (let cluster = 0; cluster < clusterCount && nodeIndex < nodeCount; cluster++) {
    const clusterX = gridSpacingX * ((cluster % gridCols) + 1);
    const clusterY = gridSpacingY * (Math.floor(cluster / gridCols) + 1);
    
    const nodesInCluster = Math.min(clusterSize, nodeCount - nodeIndex);
    const angleStep = (2 * Math.PI) / nodesInCluster;
    const clusterRadius = 50;
    
    for (let i = 0; i < nodesInCluster; i++) {
      positions.push({
        x: clusterX + clusterRadius * Math.cos(i * angleStep),
        y: clusterY + clusterRadius * Math.sin(i * angleStep)
      });
      nodeIndex++;
    }
  }
  
  return positions;
}

function buildSnakeLayout(nodeCount, width, height) {
  const positions = [];
  const nodesPerRow = Math.ceil(Math.sqrt(nodeCount));
  const horizontalSpacing = width / (nodesPerRow + 1);
  const rows = Math.ceil(nodeCount / nodesPerRow);
  const verticalSpacing = height / (rows + 1);
  
  let nodeIndex = 0;
  for (let row = 0; row < rows && nodeIndex < nodeCount; row++) {
    const nodesInRow = Math.min(nodesPerRow, nodeCount - nodeIndex);
    const y = verticalSpacing * (row + 1);
    
    // Alternate direction each row (zigzag pattern)
    if (row % 2 === 0) {
      // Left to right
      for (let col = 0; col < nodesInRow; col++) {
        positions.push({
          x: horizontalSpacing * (col + 1),
          y: y
        });
        nodeIndex++;
      }
    } else {
      // Right to left
      for (let col = nodesInRow - 1; col >= 0; col--) {
        positions.push({
          x: horizontalSpacing * (col + 1),
          y: y
        });
        nodeIndex++;
      }
    }
  }
  
  return positions;
}

function buildDiamondLayout(nodeCount, width, height) {
  const positions = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  if (nodeCount === 1) {
    return [{ x: centerX, y: centerY }];
  }
  
  const midPoint = Math.floor(nodeCount / 2);
  const topCount = midPoint;
  const bottomCount = nodeCount - midPoint - 1;
  
  // Top section (converging to center)
  const topSpacing = Math.min(width * 0.8, 150);
  const topY = height * 0.2;
  for (let i = 0; i < topCount; i++) {
    const offset = (i - (topCount - 1) / 2) * topSpacing / topCount;
    positions.push({
      x: centerX + offset * 2,
      y: topY
    });
  }
  
  // Center node
  positions.push({ x: centerX, y: centerY });
  
  // Bottom section (diverging from center)
  const bottomY = height * 0.8;
  for (let i = 0; i < bottomCount; i++) {
    const offset = (i - (bottomCount - 1) / 2) * topSpacing / bottomCount;
    positions.push({
      x: centerX + offset * 2,
      y: bottomY
    });
  }
  
  return positions;
}

function buildGridLayout(nodeCount, width, height) {
  const positions = [];
  const cols = Math.ceil(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / cols);
  const horizontalSpacing = width / (cols + 1);
  const verticalSpacing = height / (rows + 1);
  
  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push({
      x: horizontalSpacing * (col + 1),
      y: verticalSpacing * (row + 1)
    });
  }
  
  return positions;
}

function buildFishboneLayout(nodeCount, width, height) {
  const positions = [];
  const centerY = height / 2;
  
  if (nodeCount === 1) {
    return [{ x: width / 2, y: centerY }];
  }
  
  // Spine nodes (horizontal backbone)
  const spineLength = Math.ceil(nodeCount / 2);
  const spineSpacing = width * 0.7 / spineLength;
  const spineStartX = width * 0.15;
  
  for (let i = 0; i < spineLength; i++) {
    positions.push({
      x: spineStartX + i * spineSpacing,
      y: centerY
    });
  }
  
  // Branch nodes (diagonal from spine)
  const branchCount = nodeCount - spineLength;
  const branchOffset = 80;
  
  for (let i = 0; i < branchCount; i++) {
    const spineIndex = i % spineLength;
    const isTop = i % 2 === 0;
    positions.push({
      x: spineStartX + spineIndex * spineSpacing,
      y: centerY + (isTop ? -branchOffset : branchOffset)
    });
  }
  
  return positions;
}
