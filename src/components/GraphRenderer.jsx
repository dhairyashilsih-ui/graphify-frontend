import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';
import { zoom } from 'd3-zoom';
import './GraphRenderer.css';

/**
 * NEW Premium Graph Renderer
 * Features: Neon glow, professional arrows, collision detection, boundary constraints
 */
export default function GraphRenderer({ 
  graphData, 
  graphVersion, 
  width = 700, 
  height = 550,
  enableAnimation = true,
  backgroundColor = 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
  borderColor = 'rgba(58, 255, 229, 0.15)',
  nodeColor = '#2EE6D6',
  edgeColor = '#1ED3C6',
  textColor = '#003C3A'
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;
    if (!graphData.nodes || graphData.nodes.length === 0) return;

    // Get actual container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const actualWidth = containerRect.width || 700;
    const actualHeight = containerRect.height || 550;

    const svg = select(svgRef.current);
    
    // CLEAR EVERYTHING
    svg.selectAll('*').remove();
    
    // Stop existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Responsive node radius based on container size
    const nodeRadius = Math.max(35, Math.min(actualWidth, actualHeight) * 0.08);
    const margin = Math.max(40, Math.min(actualWidth, actualHeight) * 0.12);

    // Deep copy nodes and edges
    const nodes = graphData.nodes.map(n => ({ ...n }));
    
    // Validate and filter edges
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = (graphData.edges || [])
      .filter(e => {
        const sourceExists = nodeIds.has(e.source) || nodeIds.has(e.source.id);
        const targetExists = nodeIds.has(e.target) || nodeIds.has(e.target.id);
        if (!sourceExists || !targetExists) {
          console.warn(`Skipping invalid edge:`, e);
        }
        return sourceExists && targetExists;
      })
      .map(e => ({ ...e }));

    // ===== DEFS: Filters, Gradients, Markers =====
    const defs = svg.append('defs');

    // NEON TEAL GLOW FILTER - Health Theme
    const glowFilter = defs.append('filter')
      .attr('id', `neon-glow-${graphVersion}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '5')
      .attr('result', 'blur');

    // Convert hex color to RGB for matrix (dynamically based on nodeColor)
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 0.18, g: 0.90, b: 0.84 };
    };
    const rgb = hexToRgb(nodeColor);
    
    glowFilter.append('feColorMatrix')
      .attr('in', 'blur')
      .attr('type', 'matrix')
      .attr('values', `0 0 0 0 ${rgb.r}  0 0 0 0 ${rgb.g}  0 0 0 0 ${rgb.b}  0 0 0 0.55 0`)
      .attr('result', 'glow');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'glow');
    feMerge.append('feMergeNode').attr('in', 'glow');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // SHADOW FILTER
    const shadowFilter = defs.append('filter')
      .attr('id', `drop-shadow-${graphVersion}`)
      .attr('height', '130%');

    shadowFilter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', '3');

    shadowFilter.append('feOffset')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('result', 'offsetblur');

    shadowFilter.append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', '0.4');

    const feMerge2 = shadowFilter.append('feMerge');
    feMerge2.append('feMergeNode');
    feMerge2.append('feMergeNode').attr('in', 'SourceGraphic');

    // NODE GRADIENT using custom nodeColor
    const gradient = defs.append('radialGradient')
      .attr('id', `node-gradient-${graphVersion}`);
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', nodeColor)
      .attr('stop-opacity', '1');
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', nodeColor)
      .attr('stop-opacity', '1');

    // PROFESSIONAL ARROW MARKER using custom edgeColor
    defs.append('marker')
      .attr('id', `arrowhead-${graphVersion}`)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 10)
      .attr('refY', 5)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', edgeColor)
      .attr('opacity', 1);

    // Create container group
    const g = svg.append('g');

    // Zoom behavior
    const zoomBehavior = zoom()
      .scaleExtent([0.3, 3])
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

    // ===== FORCE SIMULATION =====
    // Responsive forces based on container size
    const isTreeLayout = graphData.layout === 'tree';
    const linkDistance = isTreeLayout 
      ? Math.max(80, actualWidth * 0.15)
      : Math.max(60, actualWidth * 0.12);
    const chargeStrength = isTreeLayout 
      ? Math.max(-800, -actualWidth * 0.8)
      : Math.max(-600, -actualWidth * 0.6);
    
    // For tree layout, use fixed positions (fx, fy are already set)
    // For other layouts, let forces move nodes
    const simulation = forceSimulation(nodes)
      .force('link', forceLink(edges)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(isTreeLayout ? 0.1 : 0.5))
      .force('charge', forceManyBody().strength(isTreeLayout ? -400 : chargeStrength))
      .force('center', forceCenter(actualWidth / 2, actualHeight / 2))
      .force('collision', forceCollide().radius(nodeRadius + Math.max(15, actualWidth * 0.025)))
      .force('x', forceX(actualWidth / 2).strength(isTreeLayout ? 0 : 0.05))
      .force('y', forceY(actualHeight / 2).strength(isTreeLayout ? 0 : 0.05))
      .force('boundary', boundaryForce());
    
    // For tree layout, stop simulation quickly since positions are fixed
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
      .attr('stroke', edgeColor)
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', enableAnimation ? 0 : 0.85)
      .attr('marker-end', `url(#arrowhead-${graphVersion})`);

    // Arrow growth animation
    if (enableAnimation) {
      edgeElements.transition()
        .delay((d, i) => i * 150)
        .duration(600)
        .attr('stroke-opacity', 0.85);
    }

    // ===== DRAW NODES =====
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('opacity', enableAnimation ? 0 : 1);

    // Node circles with premium styling - responsive stroke width
    nodeElements.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', nodeColor)
      .attr('stroke', 'none')
      .attr('filter', `url(#neon-glow-${graphVersion})`)
      .style('cursor', 'pointer');

    // Node labels with smart text wrapping - responsive font size
    const fontSize = Math.max(9, nodeRadius * 0.22);
    const maxCharsPerLine = actualWidth < 500 ? 10 : 15;
    
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', textColor)
      .attr('font-size', `${fontSize}px`)
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .style('user-select', 'none')
      .each(function(d) {
        const text = select(this);
        const maxWidth = nodeRadius * 1.6; // Max text width
        const words = d.label.split(' ');
        
        // If single word is too long, truncate it
        if (words.length === 1 && d.label.length > maxCharsPerLine) {
          text.text(d.label.substring(0, maxCharsPerLine - 2) + '..');
          return;
        }
        
        // For multiple words, wrap intelligently
        if (words.length > 1) {
          text.text('');
          
          // Try to fit in 2 lines max
          const midPoint = Math.ceil(words.length / 2);
          const line1 = words.slice(0, midPoint).join(' ');
          const line2 = words.slice(midPoint).join(' ');
          
          // Check if lines are too long
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
          // Single word that fits
          text.text(d.label);
        }
      });

    // Fade-in animation for nodes
    if (enableAnimation) {
      nodeElements.transition()
        .delay((d, i) => i * 80)
        .duration(500)
        .attr('opacity', 1);
    }

    // ===== UPDATE POSITIONS =====
    simulation.on('tick', () => {
      // Update edges
      edgeElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => {
          // Shorten edge to account for node radius and arrow
          // Extra gap to ensure arrow is fully visible
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

      // Update nodes
      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Auto-zoom to fit if specified OR for tree layout
    if (graphData.autoZoom || isTreeLayout) {
      simulation.on('end', () => {
        const bounds = nodeElements.nodes().reduce((acc, node) => {
          const transform = node.getAttribute('transform');
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);
            return {
              minX: Math.min(acc.minX, x),
              maxX: Math.max(acc.maxX, x),
              minY: Math.min(acc.minY, y),
              maxY: Math.max(acc.maxY, y)
            };
          }
          return acc;
        }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

        // Mobile-optimized padding and scaling
        const isMobile = actualWidth < 500;
        // Account for arrowheads and stroke width in effective bounds
        const arrowSize = Math.max(8, nodeRadius * 0.18);
        const strokeW = Math.max(2, actualWidth * 0.003);
        const extraEdgeBuffer = arrowSize + strokeW + 6;

        // Padding inside container to avoid touching rounded borders
        const padding = isMobile ? 30 : 38;

        // Prefer actual rendered bounds via SVG bbox to include arrows and text
        let effectiveMinX = bounds.minX - nodeRadius - extraEdgeBuffer;
        let effectiveMaxX = bounds.maxX + nodeRadius + extraEdgeBuffer;
        let effectiveMinY = bounds.minY - nodeRadius - extraEdgeBuffer;
        let effectiveMaxY = bounds.maxY + nodeRadius + extraEdgeBuffer;

        let bboxCenterX = null;
        let bboxCenterY = null;
        try {
          const bbox = g.node().getBBox();
          // Use bbox when it looks valid
          if (bbox && isFinite(bbox.x) && isFinite(bbox.y) && isFinite(bbox.width) && isFinite(bbox.height) && bbox.width > 0 && bbox.height > 0) {
            effectiveMinX = bbox.x - extraEdgeBuffer;
            effectiveMaxX = bbox.x + bbox.width + extraEdgeBuffer;
            effectiveMinY = bbox.y - extraEdgeBuffer;
            effectiveMaxY = bbox.y + bbox.height + extraEdgeBuffer;
            bboxCenterX = bbox.x + bbox.width / 2;
            bboxCenterY = bbox.y + bbox.height / 2;
          }
        } catch (_) {
          // Fallback to computed bounds above
        }

        const graphWidth = effectiveMaxX - effectiveMinX;
        const graphHeight = effectiveMaxY - effectiveMinY;

        // Calculate scale to fit graph within container
        const scaleX = (actualWidth - padding * 2) / graphWidth;
        const scaleY = (actualHeight - padding * 2) / graphHeight;

        // Mobile gets tighter fit; desktop preserves original behavior
        const maxScale = isMobile ? 1.05 : (isTreeLayout ? 1.3 : 1.5);
        const minScale = isMobile ? 0.7 : 0.5;
        const baseScale = Math.max(minScale, Math.min(scaleX, scaleY, maxScale));
        const scale = isMobile ? baseScale * 0.92 : baseScale;

        // Center the graph with proper offset using effective bounds center
        // Prefer bbox center when available to center overall drawn graph
        const centerX = bboxCenterX ?? (effectiveMinX + effectiveMaxX) / 2;
        const centerY = bboxCenterY ?? (effectiveMinY + effectiveMaxY) / 2;
        // Center within the inner content area (accounting for padding)
        const innerWidth = actualWidth - padding * 2;
        const innerHeight = actualHeight - padding * 2;

        // On mobile, align content toward the left padding for better visibility in narrow viewports
        const translateX = isMobile
          ? padding - scale * effectiveMinX + 6
          : padding + innerWidth / 2 - scale * centerX;
        const translateY = padding + innerHeight / 2 - scale * centerY;

        // Constrain zoom to keep content within padded container
        zoomBehavior
          .scaleExtent([minScale, maxScale])
          .translateExtent([[ -padding, -padding ], [ actualWidth + padding, actualHeight + padding ]]);

        svg.transition()
          .duration(750)
          .call(zoomBehavior.transform, 
            { k: scale, x: translateX, y: translateY });
      });
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

  }, [graphData, graphVersion, width, height, enableAnimation]);

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          background: backgroundColor,
          borderRadius: '16px',
          border: `1px solid ${borderColor}`,
          display: 'block'
        }}
      />
    </div>
  );
}
