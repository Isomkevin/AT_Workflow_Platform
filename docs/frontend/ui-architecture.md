# UI Architecture

**Purpose**: Document the frontend architecture and React Flow-based workflow builder.

**Audience**: Frontend engineers, UI/UX designers, and contributors.

## Technology Stack

- **React 18+**: UI framework
- **TypeScript 5+**: Type safety
- **React Flow**: Visual workflow canvas
- **Vite**: Build tool and dev server

## Project Structure

```
/frontend/workflow-builder
  /src
    /components
      WorkflowBuilder.tsx    # Main canvas component
      CustomNode.tsx         # Node rendering
      NodeConfigPanel.tsx    # Node configuration UI
      NodePanel.tsx          # Node palette/sidebar
    App.tsx                  # Root component
    main.tsx                 # Entry point
  vite.config.ts            # Vite configuration
  package.json
```

## Component Architecture

### WorkflowBuilder

**Location**: `src/components/WorkflowBuilder.tsx`

**Responsibilities**:
- React Flow canvas setup
- Node and edge management
- Workflow state management
- API integration (validate, compile, save)

**Key Features**:
- Drag-and-drop nodes
- Connect nodes with edges
- Node selection and configuration
- Workflow validation
- Save workflow

### CustomNode

**Location**: `src/components/CustomNode.tsx`

**Responsibilities**:
- Render individual nodes
- Display node type and label
- Show node status (if executing)
- Handle node selection

**Node Types**:
- Triggers (entry points)
- Actions (AT operations)
- Logic (conditionals, switches)
- State (session operations)

### NodeConfigPanel

**Location**: `src/components/NodeConfigPanel.tsx`

**Responsibilities**:
- Display node configuration form
- Update node config on changes
- Validate node configuration
- Show configuration errors

### NodePanel

**Location**: `src/components/NodePanel.tsx`

**Responsibilities**:
- Display available node types
- Organize nodes by category
- Handle node drag start
- Filter/search nodes

## React Flow Integration

### Canvas Setup

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  nodeTypes={nodeTypes}
  connectionLineType={ConnectionLineType.SmoothStep}
  defaultEdgeOptions={{ type: 'smoothstep' }}
>
  <Controls />
  <Background />
</ReactFlow>
```

### Node Types

Custom node types registered with React Flow:

```typescript
const nodeTypes = {
  trigger: CustomNode,
  action: CustomNode,
  logic: CustomNode,
  state: CustomNode,
};
```

### Edge Types

- **Smooth Step**: Default edge type
- **Conditional**: Edges with conditions (future)

## State Management

### Workflow State

```typescript
interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  workflowSpec: WorkflowSpec | null;
}
```

### State Updates

- **Node Changes**: React Flow `onNodesChange` handler
- **Edge Changes**: React Flow `onEdgesChange` handler
- **Node Selection**: Update `selectedNode` state
- **Config Updates**: Update node config in nodes array

## API Integration

### Validation

```typescript
const validateWorkflow = async (spec: WorkflowSpec) => {
  const response = await fetch('/api/workflows/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spec),
  });
  return response.json();
};
```

### Compilation

```typescript
const compileWorkflow = async (spec: WorkflowSpec) => {
  const response = await fetch('/api/workflows/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spec),
  });
  return response.json();
};
```

### Execution (Future)

```typescript
const executeWorkflow = async (
  spec: WorkflowSpec,
  triggerPayload: Record<string, unknown>
) => {
  const response = await fetch('/api/workflows/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow: spec, triggerPayload }),
  });
  return response.json();
};
```

## Workflow Specification Generation

### From React Flow to WorkflowSpec

```typescript
const generateWorkflowSpec = (
  nodes: Node[],
  edges: Edge[],
  metadata: WorkflowMetadata
): WorkflowSpec => {
  const trigger = nodes.find(n => n.type?.startsWith('trigger'));
  const workflowNodes = nodes.map(node => ({
    id: node.id,
    type: node.type!,
    label: node.data.label,
    config: node.data.config || {},
    position: node.position,
  }));
  
  const workflowEdges = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
  }));

  return {
    metadata,
    trigger: trigger as TriggerNode,
    nodes: workflowNodes,
    edges: workflowEdges,
  };
};
```

## Node Configuration

### Configuration Forms

Each node type has a configuration form:

```typescript
interface NodeConfig {
  // Node-specific configuration
  [key: string]: unknown;
}
```

### Variable Support

Configuration fields support variable syntax:

```typescript
{
  "to": "{{msisdn}}",
  "message": "Hello {{name}}"
}
```

### Validation

- Client-side validation before save
- Server-side validation via API
- Real-time validation feedback

## User Interactions

### Creating Nodes

1. Drag node from sidebar
2. Drop on canvas
3. Node appears at drop position
4. Node is automatically selected

### Connecting Nodes

1. Hover over node output handle
2. Drag to target node input handle
3. Edge is created
4. Edge is validated

### Configuring Nodes

1. Click on node
2. Node config panel opens
3. Edit configuration fields
4. Changes saved to node state

### Saving Workflow

1. Click "Save Workflow"
2. Generate WorkflowSpec from state
3. Validate workflow via API
4. Show validation results
5. Save to storage (future: database)

## Styling

### CSS Architecture

- **Global Styles**: `index.css`
- **Component Styles**: `App.css`
- **React Flow Styles**: Imported from `reactflow/dist/style.css`

### Theme

- Color scheme: Configurable via CSS variables
- Node colors: Type-based (trigger, action, logic, state)
- Edge colors: Status-based (default, error, success)

## Performance Considerations

### Optimization

- **Node Rendering**: Only render visible nodes (React Flow handles)
- **State Updates**: Batch state updates
- **API Calls**: Debounce validation calls
- **Large Workflows**: Virtualize node list (future)

### Limitations

- Large workflows (>100 nodes) may be slow
- Complex workflows may have rendering issues
- Browser memory usage for very large workflows

## Future Enhancements

### Planned Features

- **Workflow Templates**: Pre-built workflow templates
- **Execution Replay**: Visual execution replay
- **Collaboration**: Multi-user editing (future)
- **Version Control**: Workflow versioning UI
- **Import/Export**: JSON import/export

## Related Documentation

- [State Management](state-management.md) - Frontend state handling
- [System Overview](../architecture/system-overview.md) - Overall architecture
- [API Design](../backend/api-design.md) - Backend API
