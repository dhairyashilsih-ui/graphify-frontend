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
  flowIndex?: number; // For flowchart positioning
}

interface Link {
  source: string;
  target: string;
  value: number;
  strength?: number;
  type?: 'positive' | 'negative';
  timestamp?: number;
  isNew?: boolean;
  flowDirection?: 'forward' | 'feedback' | 'branch'; // For flowchart styling
}

interface RealTimeGraphViewProps {
  nodes: Node[];
  links: Link[];
  isBuilding?: boolean;
  buildingMessage?: string;
  currentStep?: number;
  totalSteps?: number;
  onNodeClick?: (node: Node) => void;
}

export default function RealTimeGraphView({ 
  nodes, 
  links, 
  isBuilding = false,
  buildingMessage = '',
  currentStep = 0,
  totalSteps = 0,
  onNodeClick
}: RealTimeGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous content if starting fresh
    if (nodes.length === 0) {
      svg.selectAll('*').remove();
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
      return;
    }

    // Initialize or update simulation
    if (!simulationRef.current) {
      svg.selectAll('*').remove();
      
      // Create defs for gradients and filters
      const defs = svg.append('defs');
      
      // Link gradients for different flow types
      const forwardGradient = defs.append('linearGradient')
        .attr('id', 'forward-gradient')
        .attr('gradientUnits', 'userSpaceOnUse');
      forwardGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3b82f6')
        .attr('stop-opacity', 0.8);
      forwardGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#06b6d4')
        .attr('stop-opacity', 0.8);

      const feedbackGradient = defs.append('linearGradient')
        .attr('id', 'feedback-gradient')
        .attr('gradientUnits', 'userSpaceOnUse');
      feedbackGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#f59e0b')
        .attr('stop-opacity', 0.6);
      feedbackGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ef4444')
        .attr('stop-opacity', 0.6);

      // Enhanced arrow markers for better visibility
      const arrowMarker = defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -6 12 12')
        .attr('refX', 70) // Position at edge of rectangular node
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto');
      arrowMarker.append('path')
        .attr('d', 'M0,-6L12,0L0,6L3,0Z') // Larger arrow shape
        .attr('fill', '#3b82f6')
        .attr('stroke', '#1e40af')
        .attr('stroke-width', 0.5);

      const feedbackArrow = defs.append('marker')
        .attr('id', 'feedback-arrow')
        .attr('viewBox', '0 -6 12 12')
        .attr('refX', 70)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto');
      feedbackArrow.append('path')
        .attr('d', 'M0,-6L12,0L0,6L3,0Z')
        .attr('fill', '#f59e0b')
        .attr('stroke', '#d97706')
        .attr('stroke-width', 0.5);

      const branchArrow = defs.append('marker')
        .attr('id', 'branch-arrow')
        .attr('viewBox', '0 -6 12 12')
        .attr('refX', 70)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto');
      branchArrow.append('path')
        .attr('d', 'M0,-6L12,0L0,6L3,0Z')
        .attr('fill', '#8b5cf6')
        .attr('stroke', '#7c3aed')
        .attr('stroke-width', 0.5);

      // Glow filter
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

      // Pulse filter for new nodes
      const pulseFilter = defs.append('filter')
        .attr('id', 'pulse')
        .attr('x', '-100%')
        .attr('y', '-100%')
        .attr('width', '300%')
        .attr('height', '300%');
      pulseFilter.append('feGaussianBlur')
        .attr('stdDeviation', '8')
        .attr('result', 'coloredBlur');
      pulseFilter.append('feFlood')
        .attr('flood-color', '#00ff88')
        .attr('flood-opacity', '0.8');

      // Enhanced glow filter for connection lines
      const lineGlowFilter = defs.append('filter')
        .attr('id', 'line-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      lineGlowFilter.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'coloredBlur');
      const lineMerge = lineGlowFilter.append('feMerge');
      lineMerge.append('feMergeNode').attr('in', 'coloredBlur');
      lineMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      // Main group for zoom/pan
      const g = svg.append('g').attr('class', 'main-group');

      // Zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.3, 3])
        .on('zoom', (event: any) => {
          g.attr('transform', event.transform);
        });
      svg.call(zoom as any);

      // Create simulation with link force to ensure connections work
      simulationRef.current = d3.forceSimulation()
        .force('link', d3.forceLink().id((d: any) => d.id).distance(150).strength(0.3))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2).strength(0.2))
        .force('collision', d3.forceCollide().radius(80))
        .alphaDecay(0.02)
        .velocityDecay(0.7);
    }

    const simulation = simulationRef.current;
    const g = svg.select('.main-group');

    // Position nodes in a linear flowline (horizontal line arrangement)
    const positionNodesInFlowline = (nodes: any[]) => {
      const margin = { top: 100, right: 80, bottom: 100, left: 80 };
      const availableWidth = width - margin.left - margin.right;
      
      // Sort nodes by flowIndex for proper order
      const sortedNodes = [...nodes].sort((a, b) => (a.flowIndex || 0) - (b.flowIndex || 0));
      
      // Arrange all nodes in a single horizontal line
      const stepX = sortedNodes.length > 1 ? availableWidth / (sortedNodes.length - 1) : 0;
      
      sortedNodes.forEach((node, index) => {
        // Position nodes evenly across the width
        node.x = margin.left + (index * stepX);
        node.y = height / 2; // Center vertically
        // Don't fix positions completely to allow slight movement for connections
        node.fx = null;
        node.fy = null;
      });
    };

    // Position nodes in linear flowline layout
    positionNodesInFlowline(nodes);

    // Update simulation data
    simulation.nodes(nodes);
    const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
    if (linkForce) {
      linkForce.links(links);
    }

    // Debug logging
    console.log('🔍 RealTimeGraphView - Updating with:', {
      nodeCount: nodes.length,
      linkCount: links.length,
      nodes: nodes.map(n => ({ id: n.id, label: n.label })),
      links: links.map(l => ({ source: l.source, target: l.target, flowDirection: l.flowDirection }))
    });

    // Update links with enhanced visibility
    const linkSelection = g.selectAll('.link')
      .data(links, (d: any) => `${d.source}-${d.target}`);
    
    linkSelection.exit().remove();
    
    const linkEnter = linkSelection.enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d: any) => {
        if (d.flowDirection === 'feedback') return '#f59e0b'; // Bright orange for feedback
        if (d.flowDirection === 'branch') return '#8b5cf6'; // Purple for branches
        return '#3b82f6'; // Blue for forward connections
      })
      .attr('stroke-width', (d: any) => {
        if (d.flowDirection === 'forward') return 5; // Thicker main connections
        if (d.flowDirection === 'feedback') return 4; // Medium feedback connections
        return 3; // Thinner branch connections
      })
      .attr('stroke-opacity', 0)
      .attr('stroke-dasharray', (d: any) => {
        if (d.flowDirection === 'feedback') return '10,5'; // Longer dashes for feedback
        if (d.flowDirection === 'branch') return '6,3'; // Medium dashes for branches
        return 'none'; // Solid lines for forward connections
      })
      .attr('marker-end', (d: any) => {
        if (d.flowDirection === 'feedback') return 'url(#feedback-arrow)';
        if (d.flowDirection === 'branch') return 'url(#branch-arrow)';
        return 'url(#arrow)';
      })
      .attr('filter', 'url(#line-glow)') // Add enhanced glow effect to all lines
      .style('cursor', 'pointer')
      .on('mouseover', function(_event: any, d: any) {
        // Highlight connection on hover
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', () => {
            const currentWidth = d.flowDirection === 'forward' ? 5 : 
                               d.flowDirection === 'feedback' ? 4 : 3;
            return currentWidth + 2; // Increase width on hover
          })
          .attr('stroke-opacity', 1.0);
      })
      .on('mouseout', function(_event: any, d: any) {
        // Reset connection appearance
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', () => {
            if (d.flowDirection === 'forward') return 5;
            if (d.flowDirection === 'feedback') return 4;
            return 3;
          })
          .attr('stroke-opacity', () => {
            if (d.flowDirection === 'forward') return 0.9;
            if (d.flowDirection === 'feedback') return 0.8;
            return 0.7;
          });
      });

    // Animate new links with enhanced visibility
    linkEnter.transition()
      .duration(1000)
      .attr('stroke-opacity', (d: any) => {
        if (d.flowDirection === 'forward') return 0.9; // Most visible for main flow
        if (d.flowDirection === 'feedback') return 0.8; // Highly visible for feedback
        return 0.7; // Visible for branch connections
      });

    const linkUpdate = linkEnter.merge(linkSelection as any) as any;

    // Update nodes
    const nodeSelection = g.selectAll('.node-group')
      .data(nodes, (d: any) => d.id);
    
    nodeSelection.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();
    
    const nodeEnter = nodeSelection.enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('opacity', 0)
      .call(d3.drag<any, any>()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add rounded rectangles for flowchart boxes instead of circles
    nodeEnter.append('rect')
      .attr('width', 0)
      .attr('height', 0)
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 15) // Rounded corners
      .attr('ry', 15)
      .attr('fill', (d: any) => {
        const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        return colors[d.group % colors.length];
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('filter', (d: any) => d.isNew ? 'url(#pulse)' : 'url(#glow)')
      .style('cursor', 'pointer');

    // Add multi-line text for flowchart boxes
    const textGroup = nodeEnter.append('g')
      .attr('class', 'text-group')
      .attr('pointer-events', 'none');

    textGroup.each(function(d: any) {
      const text = d3.select(this);
      const words = d.label.split(' ');
      const maxCharsPerLine = 12;
      const lines: string[] = [];
      let currentLine = '';

      words.forEach((word: string) => {
        if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
          currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);

      // Limit to 2 lines maximum
      const displayLines = lines.slice(0, 2);
      if (lines.length > 2) {
        displayLines[1] = displayLines[1].substring(0, 9) + '...';
      }

      displayLines.forEach((line, i) => {
        text.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', i === 0 ? '-0.2em' : '1em')
          .attr('fill', '#fff')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(line);
      });
    });

    // Add tooltips
    nodeEnter.append('title')
      .text((d: any) => `${d.label}${d.confidence ? ` (${Math.round(d.confidence * 100)}% confidence)` : ''}`);

    // Animate new flowchart boxes
    nodeEnter.transition()
      .duration(1000)
      .attr('opacity', 1)
      .select('rect')
      .attr('width', 120)
      .attr('height', 60)
      .attr('x', -60) // Center the rectangle
      .attr('y', -30);

    // Add click handler
    nodeEnter.on('click', (_event: any, d: any) => {
      onNodeClick?.(d);
    });

    const nodeUpdate = nodeEnter.merge(nodeSelection as any) as any;

    // Update simulation tick for flowchart layout
    simulation.on('tick', () => {
      linkUpdate
        .attr('x1', (d: any) => d.source.x || 0)
        .attr('y1', (d: any) => d.source.y || 0)
        .attr('x2', (d: any) => d.target.x || 0)
        .attr('y2', (d: any) => d.target.y || 0);

      nodeUpdate.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Minimal simulation restart since positions are mostly fixed
    simulation.alpha(0.05).restart();

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodes, links, onNodeClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[500px] bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl overflow-hidden relative"
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-white mb-1">
          Real-Time Causal Graph
        </h3>
        <p className="text-sm text-gray-400">
          Connected agricultural concepts from Gemini AI
        </p>
      </div>

      {/* Building Status */}
      {isBuilding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-10"
        >
          <div className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-200 font-medium">Building Graph</span>
            </div>
            {buildingMessage && (
              <p className="text-xs text-blue-300 mt-1 max-w-48 truncate">
                {buildingMessage}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Progress Indicator */}
      {(isBuilding || totalSteps > 0) && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-400 mb-1">Progress</p>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: totalSteps > 0 ? `${(currentStep / totalSteps) * 100}%` : '0%' 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-white font-mono">
                {currentStep}/{totalSteps}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Container */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />

      {/* Empty State */}
      {nodes.length === 0 && !isBuilding && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Submit a query to generate real-time graph</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}