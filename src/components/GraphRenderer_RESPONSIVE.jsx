import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';
import { zoom } from 'd3-zoom';
import './GraphRenderer.css';

/**
 * FULLY RESPONSIVE Graph Renderer
 * Features: Auto-resize, bounding box calculation, auto-fit scaling, mobile optimization
 */
export default function GraphRenderer({ 
  graphData, 
  graphVersion, 
  width = '100%', 
  height = '100%',
  enableAnimation = true,
  isMobile = false
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 550 });

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setDimensions({
        width: rect.width || 700,
        height: rect.height || 550
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;
    if (!graphData.nodes || graphData.nodes.length === 0) return;
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const svg = select(svgRef.current);
    const actualWidth = dimensions.width;
    const actualHeight = dimensions.height;
    
    // Stop existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Remove render layers but keep defs for reuse
    svg.selectAll('g.render-layer').remove();
    svg.selectAll('text.simplify-badge').remove();

    // RESPONSIVE NODE RADIUS
    const nodeRadius = isMobile 
      ? Math.max(30, Math.min(actualWidth, actualHeight) * 0.055)
      : Math.max(40, Math.min(actualWidth, actualHeight) * 0.05);
    
    const margin = isMobile ? 40 : 80;

    // Deep copy nodes and edges with guardrails
    const MAX_NODES = 120;
    const MAX_EDGES = 320;
    const nodes = graphData.nodes.slice(0, MAX_NODES).map(n => ({ ...n }));
    
    // Validate and filter edges
    const nodeIds = new Set(nodes.map(n => n.id));
    let edges = (graphData.edges || [])
      .filter(e => {
        const sourceExists = nodeIds.has(e.source) || nodeIds.has(e.source.id);
        const targetExists = nodeIds.has(e.target) || nodeIds.has(e.target.id);
        return sourceExists && targetExists;
      })
      .map(e => ({ ...e }));

    if (edges.length > MAX_EDGES) {
      edges = edges.slice(0, MAX_EDGES);
    }

    const simplified = graphData.nodes.length > nodes.length || (graphData.edges?.length || 0) > edges.length;

    // ===== DEFS: Filters, Gradients, Markers =====
    let defs = svg.select('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
    }

    // NEON GLOW FILTER - Reduced intensity on mobile
    const glowStdDev = isMobile ? '2' : '4';
    let glowFilter = defs.select(`#neon-glow-${graphVersion}`);
    if (glowFilter.empty()) {
      glowFilter = defs.append('filter')
        .attr('id', `neon-glow-${graphVersion}`)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');

      glowFilter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', glowStdDev)
        .attr('result', 'blur');

      glowFilter.append('feColorMatrix')
        .attr('in', 'blur')
        .attr('type', 'matrix')
        .attr('values', '0 0 0 0 0.23  0 0 0 0 1  0 0 0 0 0.9  0 0 0 1 0')
        .attr('result', 'glow');

      const feMerge = glowFilter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'glow');
      feMerge.append('feMergeNode').attr('in', isMobile ? 'SourceGraphic' : 'glow');
      feMerge.append('feMergeNode').attr('in', isMobile ? 'SourceGraphic' : 'glow');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    // SHADOW FILTER
    let shadowFilter = defs.select(`#drop-shadow-${graphVersion}`);
    if (shadowFilter.empty()) {
      shadowFilter = defs.append('filter')
        .attr('id', `drop-shadow-${graphVersion}`)
        .attr('height', '130%');

      shadowFilter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', isMobile ? '2' : '3');

      shadowFilter.append('feOffset')
        .attr('dx', '0')
        .attr('dy', isMobile ? '1' : '2')
        .attr('result', 'offsetblur');

      shadowFilter.append('feComponentTransfer')
        .append('feFuncA')
        .attr('type', 'linear')
        .attr('slope', '0.4');

      const feMerge2 = shadowFilter.append('feMerge');
      feMerge2.append('feMergeNode');
      feMerge2.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    // RADIAL GRADIENT FOR NODES
    let gradient = defs.select(`#node-gradient-${graphVersion}`);
    if (gradient.empty()) {
      gradient = defs.append('radialGradient')
        .attr('id', `node-gradient-${graphVersion}`);
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3AFFE5')
        .attr('stop-opacity', '1');
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#22D3EE')
        .attr('stop-opacity', '0.9');
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#0891B2')
        .attr('stop-opacity', '0.8');
    }

    // PROFESSIONAL ARROW MARKER - Responsive size
    const markerSize = isMobile ? 6 : 8;
    let marker = defs.select(`#arrowhead-${graphVersion}`);
    if (marker.empty()) {
      marker = defs.append('marker')
        .attr('id', `arrowhead-${graphVersion}`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', markerSize)
        .attr('markerHeight', markerSize)
        .attr('orient', 'auto');
      marker.append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', '#3AFFE5')
        .attr('opacity', 0.9);
    }

    // Create container group
    const g = svg.append('g').attr('class', 'render-layer');

    // Zoom behavior - adjusted for mobile
    const zoomBehavior = zoom()
      .scaleExtent(isMobile ? [0.5, 2] : [0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // ===== BOUNDARY FORCE =====
    function boundaryForce() {
      return () => {
        nodes.forEach(node => {
          node.x = Math.max(margin, Math.min(actualWidth - margin, node.x));
          node.y = Math.max(margin, Math.min(actualHeight - margin, node.y));
        });
      };
    }

    // ===== FORCE SIMULATION - Responsive parameters =====
    const isTreeLayout = graphData.layout === 'tree';
    const linkDistance = isMobile 
      ? (isTreeLayout ? 100 : 80)
      : (isTreeLayout ? 150 : 120);
    const chargeStrength = simplified ? -200 : (isMobile ? -400 : (isTreeLayout ? -800 : -600));
    
    const simulation = forceSimulation(nodes)
      .force('link', forceLink(edges)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(isTreeLayout ? 0.1 : 0.5))
      .force('charge', forceManyBody().strength(isTreeLayout ? -400 : chargeStrength))
      .force('center', forceCenter(actualWidth / 2, actualHeight / 2))
      .force('collision', forceCollide().radius((simplified ? nodeRadius * 0.65 : nodeRadius) + (isMobile ? 12 : 20)))
      .force('x', forceX(actualWidth / 2).strength(isTreeLayout ? 0 : 0.05))
      .force('y', forceY(actualHeight / 2).strength(isTreeLayout ? 0 : 0.05))
      .force('boundary', boundaryForce());
    
    if (isTreeLayout) {
      simulation.alpha(0.3).alphaDecay(0.1);
    }

    simulationRef.current = simulation;

    // ===== DRAW EDGES =====
    const edgeGroup = g.append('g').attr('class', 'edges');
    
    const edgeElements = edgeGroup.selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#3AFFE5')
      .attr('stroke-width', simplified ? (isMobile ? 1.4 : 1.8) : (isMobile ? 2 : 2.5))
      .attr('stroke-opacity', enableAnimation ? 0 : 0.6)
      .attr('marker-end', simplified ? null : `url(#arrowhead-${graphVersion})`);

    // Arrow growth animation - faster on mobile
    if (enableAnimation && !simplified) {
      edgeElements.transition()
        .delay((d, i) => i * (isMobile ? 100 : 150))
        .duration(isMobile ? 400 : 600)
        .attr('stroke-opacity', 0.6);
    }

    // ===== DRAW NODES =====
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('opacity', enableAnimation ? 0 : 1);

    // Node circles with premium styling
    nodeElements.append('circle')
      .attr('r', simplified ? nodeRadius * 0.8 : nodeRadius)
      .attr('fill', simplified ? '#1f9cb5' : `url(#node-gradient-${graphVersion})`)
      .attr('stroke', '#3AFFE5')
      .attr('stroke-width', isMobile ? 2 : 3)
      .attr('filter', simplified ? null : `url(#neon-glow-${graphVersion})`)
      .style('cursor', 'pointer');

    // RESPONSIVE FONT SIZE for node labels
    const baseFontSize = isMobile 
      ? Math.max(9, nodeRadius * 0.22)
      : Math.max(11, nodeRadius * 0.21);

    // Node labels with smart text wrapping
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#0F172A')
      .attr('font-size', `${baseFontSize}px`)
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .style('user-select', 'none')
      .each(function(d) {
        const text = select(this);
        const maxWidth = nodeRadius * 1.6;
        const maxCharsPerLine = isMobile ? 10 : 15;
        const words = d.label.split(' ');
        
        // If single word is too long, truncate it
        if (words.length === 1 && d.label.length > maxCharsPerLine) {
          text.text(d.label.substring(0, maxCharsPerLine - 2) + '..');
          return;
        }
        
        // For multiple words, wrap intelligently (max 2 lines)
        if (words.length > 1) {
          text.text('');
          
          const midPoint = Math.ceil(words.length / 2);
          const line1 = words.slice(0, midPoint).join(' ');
          const line2 = words.slice(midPoint).join(' ');
          
          const truncateLine = (line) => {
            if (line.length > maxCharsPerLine) {
              return line.substring(0, maxCharsPerLine - 2) + '..';
            }
            return line;
          };
          
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', '-0.4em')
            .text(truncateLine(line1));
          
          if (line2) {
            text.append('tspan')
              .attr('x', 0)
              .attr('dy', '1.2em')
              .text(truncateLine(line2));
          }
        } else {
          text.text(d.label);
        }
      });

    // Fade-in animation for nodes - faster on mobile
    if (enableAnimation && !simplified) {
      nodeElements.transition()
        .delay((d, i) => i * (isMobile ? 60 : 80))
        .duration(isMobile ? 400 : 500)
        .attr('opacity', 1);
    }

    // ===== UPDATE POSITIONS =====
    simulation.on('tick', () => {
      edgeElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return d.target.x - (dx / dist) * (nodeRadius + 15);
        })
        .attr('y2', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return d.target.y - (dy / dist) * (nodeRadius + 15);
        });

      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // ===== AUTO-FIT GRAPH TO CONTAINER =====
    const autoFitGraph = () => {
      // Compute bounding box of all nodes
      const bounds = nodes.reduce((acc, node) => {
        return {
          minX: Math.min(acc.minX, node.x),
          maxX: Math.max(acc.maxX, node.x),
          minY: Math.min(acc.minY, node.y),
          maxY: Math.max(acc.maxY, node.y)
        };
      }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

      const graphWidth = bounds.maxX - bounds.minX + 2 * nodeRadius + 40;
      const graphHeight = bounds.maxY - bounds.minY + 2 * nodeRadius + 40;

      // Calculate scale to fit inside container (with 85% safety margin)
      const scaleX = (actualWidth / graphWidth) * 0.85;
      const scaleY = (actualHeight / graphHeight) * 0.85;
      const scale = Math.min(scaleX, scaleY, isMobile ? 1.2 : 1.5);

      // Center the graph
      const graphCenterX = (bounds.minX + bounds.maxX) / 2;
      const graphCenterY = (bounds.minY + bounds.maxY) / 2;
      const translateX = actualWidth / 2 - graphCenterX * scale;
      const translateY = actualHeight / 2 - graphCenterY * scale;

      svg.transition()
        .duration(isMobile ? 500 : 750)
        .call(zoomBehavior.transform, 
          { k: scale, x: translateX, y: translateY });
    };

    // Auto-zoom to fit if specified OR for tree layout
    if (graphData.autoZoom || isTreeLayout) {
      simulation.on('end', autoFitGraph);
    }

    if (simplified) {
      svg.append('text')
        .attr('class', 'simplify-badge')
        .attr('x', actualWidth - 10)
        .attr('y', actualHeight - 10)
        .attr('text-anchor', 'end')
        .attr('fill', 'rgba(255,255,255,0.75)')
        .attr('font-size', 10)
        .text('Simplified for performance');
    }

    // Fade in SVG
    svg.style('opacity', 0)
      .transition()
      .duration(300)
      .style('opacity', 1);

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };

  }, [graphData, graphVersion, dimensions, enableAnimation, isMobile]);

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
          borderRadius: 'clamp(8px, 2vw, 16px)',
          border: '1px solid rgba(58, 255, 229, 0.15)',
          display: 'block'
        }}
      />
    </div>
  );
}
