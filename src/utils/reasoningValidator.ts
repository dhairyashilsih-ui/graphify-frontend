export interface ReasoningStep {
  title: string;
  text: string;
  keywords: string[];
  graphShape?: string;
}

export interface ReasoningGraphNode {
  id: string;
  label: string;
  type?: string;
}

export interface ReasoningGraphLink {
  source: string;
  target: string;
  relation?: string;
  strength?: number;
}

export interface ValidatedReasoning {
  steps: ReasoningStep[];
  summaryKeywords: string[];
  final_answer?: string;
  causal_graph?: {
    nodes: ReasoningGraphNode[];
    links: ReasoningGraphLink[];
  };
}

export interface ValidationResult {
  ok: boolean;
  data?: ValidatedReasoning;
  error?: string;
  debugSnippet?: string;
}

const STOP_KEYS = new Set(['', undefined, null]);

const MAX_DEBUG_LENGTH = 400;

function extractJsonSegments(raw: string): string[] {
  if (!raw) return [];
  const segments: string[] = [];

  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(raw)) !== null) {
    if (match[1]) {
      segments.push(match[1]);
    }
  }

  if (segments.length === 0) {
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      segments.push(raw.slice(firstBrace, lastBrace + 1));
    } else if (/^\s*\{[\s\S]*\}\s*$/.test(raw)) {
      segments.push(raw);
    }
  }

  return segments;
}

function isStringArray(arr: unknown, min = 0): arr is string[] {
  return Array.isArray(arr) && arr.filter((x) => typeof x === 'string' && !STOP_KEYS.has(x)).length >= min;
}

function validateGraph(nodes: any, links: any): nodes is ReasoningGraphNode[] {
  if (!Array.isArray(nodes) || !Array.isArray(links)) return false;
  const nodesOk = nodes.every((n) => n && typeof n.id === 'string' && typeof n.label === 'string');
  const linksOk = links.every((l) => l && (typeof l.source === 'string' || typeof l.source?.id === 'string') && (typeof l.target === 'string' || typeof l.target?.id === 'string'));
  return nodesOk && linksOk;
}

function normalizeSteps(rawSteps: any[]): ReasoningStep[] {
  return rawSteps.map((step, idx) => ({
    title: typeof step?.title === 'string' ? step.title : `Step ${idx + 1}`,
    text: typeof step?.text === 'string' ? step.text : '',
    keywords: isStringArray(step?.keywords, 1)
      ? step.keywords
      : [],
    graphShape: typeof step?.graphShape === 'string' ? step.graphShape : undefined,
  }));
}

export function validateReasoningResponse(raw: string): ValidationResult {
  const snippet = raw ? raw.slice(0, MAX_DEBUG_LENGTH) : undefined;
  const segments = extractJsonSegments(raw);

  for (const segment of segments) {
    try {
      const parsed = JSON.parse(segment);

      if (!parsed || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        continue;
      }

      const steps = normalizeSteps(parsed.steps);
      if (steps.length === 0) continue;

      const summaryKeywords = isStringArray(parsed.summaryKeywords, 1)
        ? Array.from(new Set(parsed.summaryKeywords)).slice(0, 20)
        : [];

      const final_answer = typeof parsed.final_answer === 'string' ? parsed.final_answer : undefined;

      let causalGraph;
      if (parsed.causal_graph && validateGraph(parsed.causal_graph.nodes, parsed.causal_graph.links)) {
        causalGraph = {
          nodes: parsed.causal_graph.nodes.map((n: any) => ({ id: String(n.id), label: String(n.label), type: typeof n.type === 'string' ? n.type : undefined })),
          links: parsed.causal_graph.links.map((l: any) => ({
            source: typeof l.source === 'string' ? l.source : l.source.id,
            target: typeof l.target === 'string' ? l.target : l.target.id,
            relation: typeof l.relation === 'string' ? l.relation : typeof l.type === 'string' ? l.type : undefined,
            strength: typeof l.strength === 'number' ? Math.max(0, Math.min(1, l.strength)) : undefined,
          })),
        };
      }

      return {
        ok: true,
        data: {
          steps,
          summaryKeywords,
          final_answer,
          causal_graph: causalGraph,
        },
      };
    } catch (err) {
      continue;
    }
  }

  console.warn('Reasoning validation failed: unable to parse valid JSON segment', { snippet });
  return {
    ok: false,
    error: 'Reasoning format error, please try again.',
    debugSnippet: snippet,
  };
}
