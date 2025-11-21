import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  group: number;
  active?: boolean;
  timestamp?: number;
  confidence?: number;
  isNew?: boolean;
}

interface Link {
  source: string;
  target: string;
  value: number;
  strength?: number;
  type?: 'positive' | 'negative';
  timestamp?: number;
  isNew?: boolean;
}

interface GraphViewProps {
  nodes: Node[];
  links: Link[];
  isProgressive?: boolean;
  currentStep?: number;
  analysisSteps?: string[];
  isRealTime?: boolean;
  isBuilding?: boolean;
  buildingMessage?: string;
  onNodeClick?: (node: Node) => void;
}

export default function GraphView({ 
  nodes, 
  links, 
  isProgressive = false, 
  currentStep = 0, 
  analysisSteps = [],
  isRealTime = false,
  isBuilding = false,
  buildingMessage = '',
  onNodeClick
}: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Progressive rendering: show nodes/links based on current step
    const visibleNodes = isProgressive ? nodes.slice(0, currentStep + 1) : nodes;
    const visibleLinks = isProgressive 
      ? links.filter(link => 
          visibleNodes.some(n => n.id === link.source) && 
          visibleNodes.some(n => n.id === link.target)
        )
      : links;

    const svg = d3.select(svgRef.current);
    
    // Only clear if this is not a real-time update
    if (!isRealTime) {
      svg.selectAll('*').remove();
    }

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create or update simulation
    let simulation = simulationRef.current;
    if (!simulation || !isRealTime) {
      // Stop existing simulation
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      
      simulation = d3.forceSimulation(visibleNodes as any)
        .force('link', d3.forceLink(visibleLinks).id((d: any) => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(50));
      
      simulationRef.current = simulation;
    } else {
      // Update existing simulation with new data
      simulation.nodes(visibleNodes as any);
      const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
      if (linkForce) {
        linkForce.links(visibleLinks);
      }
      simulation.alpha(0.3).restart();
    }

    // Get or create main group
    let g = svg.select('g.main-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-group');
      
      const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          g.attr('transform', event.transform.toString());
        });

      svg.call(zoom as any);
    }

    // Create or get defs
    let defs = svg.select('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
      
      const gradient = defs.append('linearGradient')
        .attr('id', 'link-gradient')
        .attr('gradientUnits', 'userSpaceOnUse');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3b82f6')
        .attr('stop-opacity', 0.8);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#8b5cf6')
        .attr('stop-opacity', 0.8);

      // Add glow filter for new nodes
      const glowFilter = defs.append('filter')
        .attr('id', 'glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');

      glowFilter.append('feGaussianBlur')
        .attr('stdDeviation', '4')
        .attr('result', 'coloredBlur');

      const feMerge = glowFilter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      // Add pulse filter for real-time nodes
      const pulseFilter = defs.append('filter')
        .attr('id', 'pulse')
        .attr('x', '-100%')
        .attr('y', '-100%')
        .attr('width', '300%')
        .attr('height', '300%');

      pulseFilter.append('feGaussianBlur')
        .attr('stdDeviation', '6')
        .attr('result', 'coloredBlur');

      pulseFilter.append('feFlood')
        .attr('flood-color', '#00ff88')
        .attr('flood-opacity', '0.6')
        .attr('result', 'glowColor');

      pulseFilter.append('feComposite')
        .attr('in', 'glowColor')
        .attr('in2', 'coloredBlur')
        .attr('operator', 'in')
        .attr('result', 'softGlow');

      const feMergePulse = pulseFilter.append('feMerge');
      feMergePulse.append('feMergeNode').attr('in', 'softGlow');
      feMergePulse.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    const link = g.append('g')
      .selectAll('line')
      .data(visibleLinks)
      .enter()
      .append('line')
      .attr('stroke', 'url(#link-gradient)')
      .attr('stroke-width', (d: any) => Math.sqrt(d.value) * 2)
      .attr('stroke-opacity', 0.6);

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(visibleNodes)
      .enter()
      .append('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    nodeGroup.append('circle')
      .attr('r', 30)
      .attr('fill', (d: any) => {
        const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
        return colors[d.group % colors.length];
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)');

    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    nodeGroup.selectAll('circle')
      .transition()
      .duration(1000)
      .delay((_d: any, i: number) => i * 100)
      .attr('r', 30)
      .style('opacity', 1);

    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text((d: any) => d.label.substring(0, 8));

    nodeGroup.append('title')
      .text((d: any) => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, isProgressive, currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[500px] bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl overflow-hidden relative"
    >
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-white mb-1">Causal Reasoning Graph</h3>
        <p className="text-sm text-gray-400">Interactive visualization of AI analysis</p>
        {isProgressive && analysisSteps.length > 0 && (
          <div className="mt-4 space-y-2">
            {analysisSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.5,
                  x: 0 
                }}
                transition={{ delay: index * 0.2 }}
                className={`text-xs px-3 py-2 rounded-lg border ${
                  index <= currentStep
                    ? 'bg-blue-600/20 border-blue-500/30 text-blue-200'
                    : 'bg-gray-800/50 border-gray-700/30 text-gray-500'
                }`}
              >
                <span className="font-mono mr-2">{index + 1}.</span>
                {step}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">Submit a query to generate causal graph</p>
        </div>
      )}
      
      {isProgressive && nodes.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-400 mb-1">Progress</p>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / nodes.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-white font-mono">
                {currentStep + 1}/{nodes.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
