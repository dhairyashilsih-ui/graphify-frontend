import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

    const baseNodes = isProgressive ? nodes.slice(0, currentStep + 1) : nodes;
    const baseLinks = isProgressive
      ? links.filter(link => baseNodes.some(n => n.id === link.source) && baseNodes.some(n => n.id === link.target))
      : links;

    const MAX_NODES = 120;
    const MAX_LINKS = 320;
    const visibleNodes = baseNodes.slice(0, MAX_NODES);
    const nodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleLinks = baseLinks
      .filter(link => nodeIds.has(link.source as any) && nodeIds.has(link.target as any))
      .slice(0, MAX_LINKS);
    const simplified = baseNodes.length > visibleNodes.length || baseLinks.length > visibleLinks.length;

    const svg = d3.select(svgRef.current);
    if (!isRealTime) {
      svg.selectAll('*').remove();
    }

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    let simulation = simulationRef.current;
    if (!simulation || !isRealTime) {
      if (simulationRef.current) simulationRef.current.stop();
      simulation = d3.forceSimulation(visibleNodes as any)
        .force('link', d3.forceLink(visibleLinks).id((d: any) => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(simplified ? -250 : -400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(simplified ? 40 : 50));
      simulationRef.current = simulation;
    } else {
      simulation.nodes(visibleNodes as any);
      const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
      if (linkForce) linkForce.links(visibleLinks);
      simulation.alpha(0.3).restart();
    }

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

    let defs = svg.select('defs');
    if (defs.empty()) defs = svg.append('defs');

    if (defs.select('#link-gradient').empty()) {
      const gradient = defs.append('linearGradient')
        .attr('id', 'link-gradient')
        .attr('gradientUnits', 'userSpaceOnUse');
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.8);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#8b5cf6').attr('stop-opacity', 0.8);
    }

    if (defs.select('#glow').empty()) {
      const glowFilter = defs.append('filter')
        .attr('id', 'glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      glowFilter.append('feGaussianBlur').attr('stdDeviation', simplified ? '2.5' : '4').attr('result', 'coloredBlur');
      const feMerge = glowFilter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    if (defs.select('#pulse').empty()) {
      const pulseFilter = defs.append('filter')
        .attr('id', 'pulse')
        .attr('x', '-100%')
        .attr('y', '-100%')
        .attr('width', '300%')
        .attr('height', '300%');
      pulseFilter.append('feGaussianBlur').attr('stdDeviation', simplified ? '4' : '6').attr('result', 'coloredBlur');
      pulseFilter.append('feFlood').attr('flood-color', '#00ff88').attr('flood-opacity', simplified ? '0.4' : '0.6').attr('result', 'glowColor');
      pulseFilter.append('feComposite').attr('in', 'glowColor').attr('in2', 'coloredBlur').attr('operator', 'in').attr('result', 'softGlow');
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
      .attr('stroke-width', (d: any) => simplified ? 1.5 : Math.sqrt(d.value) * 2)
      .attr('stroke-opacity', simplified ? 0.45 : 0.6);

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(visibleNodes)
      .enter()
      .append('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)
      .on('click', (_event: any, d: any) => {
        if (onNodeClick) onNodeClick(d);
      });

    nodeGroup.append('circle')
      .attr('r', simplified ? 24 : 30)
      .attr('fill', (d: any) => {
        const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
        return colors[d.group % colors.length];
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', simplified ? 2 : 3)
      .attr('filter', simplified ? null : 'url(#glow)');

    nodeGroup.selectAll('circle')
      .transition()
      .duration(simplified ? 400 : 1000)
      .delay((_d: any, i: number) => i * 80)
      .attr('r', simplified ? 24 : 30)
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
  }, [nodes, links, isProgressive, currentStep, isRealTime, onNodeClick]);

  const MAX_NODES = 120;
  const MAX_LINKS = 320;
  const renderSimplified = nodes.length > MAX_NODES || links.length > MAX_LINKS;

  return (
    <motion.div
      className="h-full bg-slate-950 text-slate-50 rounded-xl border border-slate-800 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-full">
        <div className="lg:col-span-3 relative bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
          <svg ref={svgRef} className="w-full h-[600px] rounded-xl" />

          {renderSimplified && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-500/20 text-amber-200 text-xs font-semibold rounded-full border border-amber-400/40 shadow-lg">
              Simplified for performance
            </div>
          )}

          {isBuilding && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
              <div className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 shadow-lg text-sm text-slate-200">
                {buildingMessage || 'Building graph...'}
              </div>
            </div>
          )}

          {isProgressive && (
            <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:w-80 bg-slate-900/80 border border-slate-800 rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="font-semibold text-emerald-300">Progressive reasoning</span>
                <span className="font-mono text-slate-200">{currentStep + 1}/{nodes.length}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / Math.max(nodes.length, 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {analysisSteps.length > 0 && (
                <div className="mt-2 text-xs text-slate-300 line-clamp-2">
                  {analysisSteps[currentStep] || analysisSteps[analysisSteps.length - 1]}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-100">Graph Stats</h3>
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400">Nodes</div>
                <div className="text-lg font-bold text-slate-50">{nodes.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400">Links</div>
                <div className="text-lg font-bold text-slate-50">{links.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 col-span-2">
                <div className="text-slate-400">Mode</div>
                <div className="text-sm font-semibold text-emerald-300">{isRealTime ? 'Real-time' : 'Static'}</div>
              </div>
            </div>
          </div>

          {analysisSteps.length > 0 && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100">Reasoning Steps</h3>
                <span className="text-xs text-slate-400">{currentStep + 1}/{analysisSteps.length}</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {analysisSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-md text-xs border ${idx === currentStep ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100' : 'bg-slate-800/60 border-slate-800 text-slate-300'}`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
