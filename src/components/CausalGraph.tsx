import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { zoom as d3Zoom, zoomTransform } from 'd3-zoom';
import { scaleOrdinal } from 'd3-scale';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { drag as d3Drag } from 'd3-drag';
import { motion } from 'framer-motion';
import { Network, Maximize2, Minimize2, Download } from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  type: 'entity' | 'concept' | 'action' | 'result';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'causes' | 'relates' | 'influences' | 'depends';
  strength: number;
}

interface CausalGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
  className?: string;
}

export default function CausalGraph({ nodes, links, onNodeClick, className = '' }: CausalGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: isFullscreen ? window.innerHeight - 100 : Math.min(600, container.clientHeight)
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Create main group
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Color scheme with gradients - more vibrant
    const colorScale = scaleOrdinal<string>()
      .domain(['entity', 'concept', 'action', 'result'])
      .range(['#60a5fa', '#a78bfa', '#f472b6', '#34d399']);

    // Link type styles - thinner, more elegant
    const linkStyles = {
      'causes': { color: '#f87171', dash: '0' },
      'relates': { color: '#60a5fa', dash: '8,4' },
      'influences': { color: '#c084fc', dash: '4,4' },
      'depends': { color: '#4ade80', dash: '2,6' }
    };

    // Create force simulation - more spread out
    const simulation = forceSimulation<GraphNode>(nodes)
      .force('link', forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(120)
        .strength(d => d.strength))
      .force('charge', forceManyBody().strength(-400))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(60));

    // Create arrow markers for directed edges
    const defs = svg.append('defs');
    Object.entries(linkStyles).forEach(([type, style]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', style.color);
    });

    // Create links - cleaner style
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => linkStyles[d.type]?.color || '#64748b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => linkStyles[d.type]?.dash || '0')
      .attr('marker-end', d => `url(#arrow-${d.type})`)
      .attr('opacity', 0.7);

    // Create link labels - smaller, cleaner
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', 9)
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 500)
      .text(d => d.type);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3Drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add circles to nodes - larger, more prominent
    node.append('circle')
      .attr('r', 28)
      .attr('fill', d => colorScale(d.type))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))')
      .on('click', (_, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    // Add glow effect - more vibrant
    node.append('circle')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', d => colorScale(d.type))
      .attr('stroke-width', 2)
      .attr('opacity', 0.4);

    // Add labels to nodes - better positioning and styling
    node.append('text')
      .attr('dy', 42)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 700)
      .attr('fill', '#f1f5f9')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.5)')
      .text(d => d.label);

    // Remove type badges for cleaner look

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      linkLabel
        .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, onNodeClick]);

  const downloadGraph = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'causal-graph.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Causal Relationship Graph</h3>
          <span className="text-xs text-slate-400">
            {nodes.length} nodes • {links.length} relationships
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadGraph}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Download Graph"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-150px)]' : 'h-[600px]'}`}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
        
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No relationships to display yet</p>
              <p className="text-sm text-slate-500 mt-2">Ask a question to generate the causal graph</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-300">Entity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-slate-300">Concept</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-slate-300">Action</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-300">Result</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-red-500"></div>
            <span className="text-slate-400">Causes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500" style={{ strokeDasharray: '5,5' }}></div>
            <span className="text-slate-400">Relates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-purple-500" style={{ strokeDasharray: '3,3' }}></div>
            <span className="text-slate-400">Influences</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500" style={{ strokeDasharray: '2,2' }}></div>
            <span className="text-slate-400">Depends</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
