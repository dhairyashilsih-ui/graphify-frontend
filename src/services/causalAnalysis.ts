import { GraphNode, GraphLink } from '../components/CausalGraph';
import { validateReasoningResponse } from '../utils/reasoningValidator';

const BACKEND_URL = 'http://localhost:3001';

interface CausalExtractionResponse {
  nodes: GraphNode[];
  links: GraphLink[];
  summary: string;
  unavailable?: boolean;
}

function isValidGraph(graph: any): graph is CausalExtractionResponse {
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.links)) return false;
  if (graph.nodes.length === 0 || graph.links.length === 0) return false;
  const nodesValid = graph.nodes.every((n: any) => typeof n.id === 'string' && typeof n.label === 'string');
  const linksValid = graph.links.every((l: any) => l && (typeof l.source === 'string' || typeof l.source?.id === 'string') && (typeof l.target === 'string' || typeof l.target?.id === 'string'));
  return nodesValid && linksValid;
}

function buildGraphFromRelationships(relationships: any[]): CausalExtractionResponse {
  const nodesMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  relationships.forEach((rel, idx) => {
    const source = rel.source || rel.cause;
    const target = rel.target || rel.effect;
    if (!source || !target) return;

    const sourceId = String(source);
    const targetId = String(target);

    if (!nodesMap.has(sourceId)) {
      nodesMap.set(sourceId, { id: sourceId, label: String(rel.source_label || source), type: rel.source_type || 'entity' });
    }
    if (!nodesMap.has(targetId)) {
      nodesMap.set(targetId, { id: targetId, label: String(rel.target_label || target), type: rel.target_type || 'result' });
    }

    links.push({
      source: sourceId,
      target: targetId,
      type: rel.type || rel.relation || 'causes',
      strength: typeof rel.strength === 'number' ? Math.max(0, Math.min(1, rel.strength)) : 0.7
    });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    links,
    summary: relationships.length ? 'Causal relationships extracted from backend response' : 'No relationships provided'
  };
}

export async function extractCausalRelationships(
  prompt: string,
  response: string,
  domain: string
): Promise<CausalExtractionResponse> {
  try {
    const apiResponse = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: response || prompt,
        domain,
        generateTTS: false,
        returnGraph: true
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend API Error:', apiResponse.status, errorData);
      throw new Error(`Backend API error (${apiResponse.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await apiResponse.json();

    console.log('🔍 Backend response:', data);

    const rawModel =
      data?.data?.raw_model_output ||
      data?.data?.raw ||
      data?.raw_response ||
      data?.rawResponse ||
      undefined;

    if (typeof rawModel === 'string') {
      const validation = validateReasoningResponse(rawModel);
      if (!validation.ok) {
        console.warn('Reasoning validation failed for causal analysis:', { error: validation.error, snippet: validation.debugSnippet });
        return {
          nodes: [],
          links: [],
          summary: validation.error || 'Reasoning format error, please try again.',
          unavailable: true
        };
      }

      if (validation.data?.causal_graph && validation.data.causal_graph.nodes.length && validation.data.causal_graph.links.length) {
        return {
          nodes: validation.data.causal_graph.nodes,
          links: validation.data.causal_graph.links,
          summary: 'Causal graph returned by validated model output'
        };
      }
    }

    // Preferred: backend supplies a causal_graph with nodes/links
    const backendGraph = data?.data?.causal_graph || data?.causal_graph;
    if (backendGraph) {
      if (isValidGraph(backendGraph)) {
        return {
          nodes: backendGraph.nodes,
          links: backendGraph.links,
          summary: backendGraph.summary || 'Causal graph returned by backend'
        };
      }
      return {
        nodes: [],
        links: [],
        summary: 'Reasoning format error, please try again.',
        unavailable: true
      };
    }

    // Secondary: backend supplies causal_relationships (source/target pairs)
    if (Array.isArray(data?.data?.causal_relationships)) {
      return buildGraphFromRelationships(data.data.causal_relationships);
    }

    // No trustworthy structured graph available
    return {
      nodes: [],
      links: [],
      summary: 'Graph unavailable: backend did not return a structured causal graph.',
      unavailable: true
    };
  } catch (error) {
    console.error('Error extracting causal relationships:', error);
    
    // Return empty graph on error
    return {
      nodes: [],
      links: [],
      summary: 'Graph unavailable: failed to extract causal relationships.',
      unavailable: true
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

  // If new graph is unavailable, keep existing graph but update summary
  if (newGraph.unavailable) {
    return {
      nodes: existingNodes,
      links: existingLinks,
      summary: newGraph.summary,
      unavailable: true
    };
  }
  
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
