# 🔗 Real-Time Causal Graph Feature

## Overview
This feature creates **dynamic causal relationship graphs** that visualize how concepts, entities, and actions connect in AI-generated responses. The graph updates in real-time as the AI analyzes domain-specific queries.

## 🎯 How It Works

### 1. **User Input**
- User enters a query in any domain (Agriculture, Health, etc.)
- Query is sent to Google Gemini AI for analysis

### 2. **AI Analysis**
- Gemini processes the query with domain context
- Generates comprehensive response with recommendations

### 3. **Causal Extraction**
- A second Gemini API call extracts causal relationships from the response
- Identifies:
  - **Entities**: Key objects, people, or concepts
  - **Concepts**: Abstract ideas and principles
  - **Actions**: Activities and processes
  - **Results**: Outcomes and effects

### 4. **Relationship Mapping**
- Maps connections between nodes:
  - **Causes**: Direct causal relationships (red, solid line)
  - **Relates**: Associative relationships (blue, dashed line)
  - **Influences**: Indirect influence (purple, dotted line)
  - **Depends**: Dependency relationships (green, sparse dots)

### 5. **Interactive Visualization**
- D3.js force-directed graph renders the relationships
- Nodes are color-coded by type
- Links show relationship strength
- Interactive: drag nodes, zoom, pan

## 🚀 Usage

### In Agriculture Page:
```typescript
// User asks: "How does soil pH affect crop yield?"
// AI Response includes analysis
// Causal Graph extracts:

Nodes:
- "Soil pH" (entity)
- "Nutrient Availability" (concept)
- "Root Development" (action)
- "Crop Yield" (result)

Links:
- Soil pH → influences → Nutrient Availability (0.9 strength)
- Nutrient Availability → causes → Root Development (0.8 strength)
- Root Development → causes → Crop Yield (0.95 strength)
```

## 🔑 API Configuration

### Gemini API Key
Located in: `src/services/causalAnalysis.ts`
```typescript
const GEMINI_API_KEY = 'AIzaSyBIyc_Gubv_N2XDCCHQD9HN5UnzgzejXm8';
```

### API Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

## 📊 Graph Features

### Interactive Controls
- **Zoom**: Mouse wheel or pinch gesture
- **Pan**: Click and drag background
- **Move Nodes**: Drag individual nodes
- **Fullscreen**: Toggle fullscreen mode
- **Download**: Export as SVG

### Visual Elements
- **Node Colors**:
  - 🔵 Blue: Entities
  - 🟣 Purple: Concepts
  - 🌸 Pink: Actions
  - 🟢 Green: Results

- **Link Styles**:
  - ━━ Solid Red: Causes
  - ┈┈ Dashed Blue: Relates
  - ··· Dotted Purple: Influences
  - ‥‥ Sparse Green: Depends

### Physics Simulation
- Force-directed layout automatically arranges nodes
- Collision detection prevents overlap
- Center gravity keeps graph focused
- Link distance based on relationship strength

## 🎨 Components

### 1. CausalGraph.tsx
Main visualization component using D3.js
- Force simulation
- SVG rendering
- Interaction handling
- Legend and controls

### 2. causalAnalysis.ts
Service for extracting relationships
- Gemini API integration
- JSON parsing and validation
- Incremental graph building
- Export/import functionality

### 3. Agriculture.tsx (Example Integration)
Shows how to integrate in domain pages
- State management for graph data
- API response processing
- TTS audio playback
- Real-time updates

## 🔄 Incremental Graph Building

The graph can build incrementally across multiple queries:

```typescript
// First query adds initial nodes
buildIncrementalGraph([], [], "What is soil pH?", response, "agriculture");

// Second query adds more nodes and links, preserving existing ones
buildIncrementalGraph(existingNodes, existingLinks, "How to improve it?", response, "agriculture");
```

## 🛠️ Customization

### Add More Node Types
Edit `GraphNode` interface in `CausalGraph.tsx`:
```typescript
type: 'entity' | 'concept' | 'action' | 'result' | 'your-new-type'
```

### Add More Link Types
Edit `GraphLink` interface:
```typescript
type: 'causes' | 'relates' | 'influences' | 'depends' | 'your-new-type'
```

### Adjust Graph Physics
In `CausalGraph.tsx`:
```typescript
const simulation = d3.forceSimulation<GraphNode>(nodes)
  .force('link', d3.forceLink<GraphNode, GraphLink>(links)
    .distance(150)  // Change link distance
    .strength(d => d.strength))
  .force('charge', d3.forceManyBody().strength(-300))  // Change repulsion
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(50));  // Change collision radius
```

## 📱 Responsive Design

- Mobile: Single column, smaller graph
- Tablet: Side-by-side with adjusted sizes
- Desktop: Full two-column layout with large graph

## 🐛 Debugging

Enable console logs to see extraction process:
```javascript
console.log('🔗 Causal graph extracted:', causalData);
```

Check for:
- API response format
- JSON parsing errors
- Node ID uniqueness
- Link source/target validity

## 🔮 Future Enhancements

1. **Temporal Graphs**: Show how relationships evolve over time
2. **3D Visualization**: Use Three.js for 3D graphs
3. **Graph Analytics**: Calculate centrality, clusters, paths
4. **Export Formats**: PNG, JSON, GraphML
5. **Collaborative Editing**: Multi-user graph building
6. **Smart Suggestions**: AI-suggested relationships
7. **Pattern Recognition**: Identify common causal patterns

## 💡 Tips

1. **Ask Detailed Questions**: More specific queries = better graphs
2. **Domain Context**: Include domain-specific terminology
3. **Follow-up Questions**: Build on previous queries for richer graphs
4. **Explore Nodes**: Click nodes to see details
5. **Rearrange**: Drag nodes to improve visibility

## 🎓 Example Queries

### Agriculture
- "How does irrigation timing affect crop yield?"
- "What causes soil erosion and how to prevent it?"
- "Explain the relationship between fertilizer and plant growth"

### Healthcare
- "How does exercise influence cardiovascular health?"
- "What causes diabetes complications?"
- "Explain the connection between stress and immunity"

## 📚 Dependencies

- **d3** (^7.9.0): Graph visualization
- **framer-motion** (^12.23.22): Animations
- **lucide-react** (^0.344.0): Icons
- **@types/d3** (^7.4.3): TypeScript types

## 🤝 Contributing

To extend this feature to other domains:

1. Copy the Agriculture integration pattern
2. Import `CausalGraph` and `buildIncrementalGraph`
3. Add state for graph nodes and links
4. Call `buildIncrementalGraph` in your submit handler
5. Render `CausalGraph` component with the data

---

**Built with ❤️ using Google Gemini AI and D3.js**
