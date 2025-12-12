import React from 'react';

export interface GraphRendererProps {
  graphData?: any;
  graphVersion?: number;
  width?: number | string;
  height?: number | string;
  enableAnimation?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  nodeColor?: string;
  edgeColor?: string;
  textColor?: string;
}

declare const GraphRenderer: React.FC<GraphRendererProps>;
export default GraphRenderer;
