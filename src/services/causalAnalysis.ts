import { GraphNode, GraphLink } from '../components/CausalGraph';

const BACKEND_URL = 'http://localhost:3001';

interface CausalExtractionResponse {
  nodes: GraphNode[];
  links: GraphLink[];
  summary: string;
}

function generateBasicGraph(prompt: string, response: string, domain: string): CausalExtractionResponse {
  // Create a simple graph from the query and response
  const queryNode: GraphNode = {
    id: 'query-' + Date.now(),
    label: prompt.substring(0, 30),
    type: 'entity'
  };
  
  const analysisNode: GraphNode = {
    id: 'analysis-' + Date.now(),
    label: `${domain} Analysis`,
    type: 'action'
  };
  
  const resultNode: GraphNode = {
    id: 'result-' + Date.now(),
    label: response.substring(0, 30) + '...',
    type: 'result'
  };
  
  return {
    nodes: [queryNode, analysisNode, resultNode],
    links: [
      { source: queryNode.id, target: analysisNode.id, type: 'causes', strength: 0.9 },
      { source: analysisNode.id, target: resultNode.id, type: 'causes', strength: 0.9 }
    ],
    summary: `Query processed through ${domain} analysis`
  };
}

function parseCausalRelationshipsFromBackend(backendData: any, domain: string): CausalExtractionResponse {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  
  // Create a central hub node for the query
  const hubId = 'query-hub';
  nodes.push({
    id: hubId,
    label: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Analysis`,
    type: 'concept'
  });
  
  // Parse causal relationships and connect to hub
  if (backendData.causal_relationships && Array.isArray(backendData.causal_relationships)) {
    backendData.causal_relationships.forEach((rel: any, index: number) => {
      const causeText = rel.cause || rel.source || 'Unknown Cause';
      const effectText = rel.effect || rel.target || 'Unknown Effect';
      
      const causeId = `cause-${index}`;
      const effectId = `effect-${index}`;
      
      nodes.push({
        id: causeId,
        label: causeText.substring(0, 20),
        type: 'entity'
      });
      
      nodes.push({
        id: effectId,
        label: effectText.substring(0, 20),
        type: 'result'
      });
      
      // Connect cause to hub
      if (index === 0) {
        links.push({
          source: hubId,
          target: causeId,
          type: 'relates',
          strength: 0.9
        });
      }
      
      // Main causal link
      links.push({
        source: causeId,
        target: effectId,
        type: 'causes',
        strength: rel.strength || 0.8
      });
      
      // Chain effects together
      if (index > 0) {
        links.push({
          source: `effect-${index - 1}`,
          target: causeId,
          type: 'influences',
          strength: 0.6
        });
      }
    });
  }
  
  // Add insights and connect to hub or last effect
  if (backendData.insights && Array.isArray(backendData.insights)) {
    const lastEffectId = backendData.causal_relationships?.length > 0 
      ? `effect-${backendData.causal_relationships.length - 1}` 
      : hubId;
    
    backendData.insights.forEach((insight: string, index: number) => {
      const insightId = `insight-${index}`;
      nodes.push({
        id: insightId,
        label: insightText.substring(0, 20),
        type: 'concept'
      });
      
      // Connect to the graph
      if (index === 0) {
        links.push({
          source: lastEffectId,
          target: insightId,
          type: 'relates',
          strength: 0.7
        });
      } else {
        links.push({
          source: `insight-${index - 1}`,
          target: insightId,
          type: 'relates',
          strength: 0.6
        });
      }
    });
  }
  
  // Add recommendations and connect to insights
  if (backendData.recommendations && Array.isArray(backendData.recommendations)) {
    backendData.recommendations.forEach((rec: string, index: number) => {
      const recId = `action-${index}`;
      nodes.push({
        id: recId,
        label: rec.substring(0, 20),
        type: 'action'
      });
      
      // Connect to insights or hub
      const sourceId = backendData.insights?.length > index 
        ? `insight-${index}` 
        : (backendData.insights?.length > 0 ? `insight-${backendData.insights.length - 1}` : hubId);
      
      links.push({
        source: sourceId,
        target: recId,
        type: 'influences',
        strength: 0.8
      });
    });
  }
  
  // Final safety: if we only have hub, create chain
  if (nodes.length === 1) {
    nodes.push(
      { id: 'n1', label: 'Query Input', type: 'entity' },
      { id: 'n2', label: 'AI Processing', type: 'action' },
      { id: 'n3', label: 'Analysis Result', type: 'result' }
    );
    links.push(
      { source: hubId, target: 'n1', type: 'relates', strength: 0.8 },
      { source: 'n1', target: 'n2', type: 'causes', strength: 0.9 },
      { source: 'n2', target: 'n3', type: 'causes', strength: 0.9 }
    );
  }
  
  return {
    nodes,
    links,
    summary: `Connected ${domain} graph with ${nodes.length} nodes and ${links.length} relationships`
  };
}

export async function extractCausalRelationships(
  prompt: string,
  response: string,
  domain: string
): Promise<CausalExtractionResponse> {
  try {
    // Create a concise extraction prompt to avoid token limits
    const extractionPrompt = `Extract a causal graph from this query: "${prompt}"

Create a JSON graph showing relationships:
{
  "nodes": [{"id": "node1", "label": "Label", "type": "entity|concept|action|result"}],
  "links": [{"source": "node1", "target": "node2", "type": "causes|relates|influences|depends", "strength": 0.9}],
  "summary": "Brief summary"
}

Focus on key entities and relationships from the query.`;

    // Use the backend API which has working Gemini integration
    const apiResponse = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: extractionPrompt,
        domain: 'universal-ai',
        generateTTS: false
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend API Error:', apiResponse.status, errorData);
      throw new Error(`Backend API error (${apiResponse.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await apiResponse.json();
    
    console.log('🔍 Backend response:', data);
    
    // Check if backend already provided causal relationships
    if (data.data?.causal_relationships && Array.isArray(data.data.causal_relationships)) {
      return parseCausalRelationshipsFromBackend(data.data, domain);
    }
    
    const generatedText = data.analysis?.response || data.data?.summary || data.data?.insights?.join('\n') || '';
    
    console.log('📝 Generated text:', generatedText);
    
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = generatedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                      generatedText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.warn('No JSON found in response, generating graph from backend data');
      // Use backend data if available
      if (data.data) {
        return parseCausalRelationshipsFromBackend(data.data, domain);
      }
      return generateBasicGraph(prompt, response, domain);
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const extracted: CausalExtractionResponse = JSON.parse(jsonText);

    // Validate and ensure unique IDs
    const nodeIds = new Set(extracted.nodes.map(n => n.id));
    extracted.links = extracted.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return extracted;
  } catch (error) {
    console.error('Error extracting causal relationships:', error);
    
    // Return empty graph on error
    return {
      nodes: [],
      links: [],
      summary: 'Failed to extract causal relationships. Please try again.'
    };
  }
}

export async function buildIncrementalGraph(
  existingNodes: GraphNode[],
  existingLinks: GraphLink[],
  newPrompt: string,
  newResponse: string,
  domain: string
): Promise<CausalExtractionResponse> {
  const newGraph = await extractCausalRelationships(newPrompt, newResponse, domain);
  
  // Merge with existing graph
  const nodeMap = new Map(existingNodes.map(n => [n.id, n]));
  const linkSet = new Set(existingLinks.map(l => 
    `${typeof l.source === 'string' ? l.source : l.source.id}-${typeof l.target === 'string' ? l.target : l.target.id}-${l.type}`
  ));

  // Add new nodes
  newGraph.nodes.forEach(node => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
    }
  });

  // Add new links
  const mergedLinks = [...existingLinks];
  newGraph.links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    const linkKey = `${sourceId}-${targetId}-${link.type}`;
    
    if (!linkSet.has(linkKey)) {
      mergedLinks.push(link);
      linkSet.add(linkKey);
    }
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links: mergedLinks,
    summary: newGraph.summary
  };
}

export function exportGraphData(nodes: GraphNode[], links: GraphLink[]): string {
  return JSON.stringify({ nodes, links }, null, 2);
}

export function importGraphData(jsonData: string): { nodes: GraphNode[], links: GraphLink[] } {
  try {
    const data = JSON.parse(jsonData);
    return {
      nodes: data.nodes || [],
      links: data.links || []
    };
  } catch (error) {
    console.error('Error importing graph data:', error);
    return { nodes: [], links: [] };
  }
}
