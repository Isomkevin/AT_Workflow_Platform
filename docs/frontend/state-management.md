# State Management

**Purpose**: Document frontend state management patterns and data flow.

**Audience**: Frontend engineers working on the workflow builder UI.

## State Architecture

The frontend uses React's built-in state management with hooks. State is managed at the component level with clear data flow.

## State Structure

### Workflow Builder State

```typescript
interface WorkflowBuilderState {
  // React Flow state
  nodes: Node[];
  edges: Edge[];
  
  // UI state
  selectedNode: Node | null;
  isConfigPanelOpen: boolean;
  
  // Workflow state
  workflowSpec: WorkflowSpec | null;
  validationResult: ValidationResult | null;
  
  // Loading states
  isSaving: boolean;
  isValidating: boolean;
}
```

## State Management Patterns

### React Flow State

React Flow manages its own internal state for nodes and edges:

```typescript
const [nodes, setNodes] = useState<Node[]>([]);
const [edges, setEdges] = useState<Edge[]>([]);

const onNodesChange = useCallback((changes: NodeChange[]) => {
  setNodes((nds) => applyNodeChanges(changes, nds));
}, []);

const onEdgesChange = useCallback((changes: EdgeChange[]) => {
  setEdges((eds) => applyEdgeChanges(changes, eds));
}, []);
```

### Node Selection State

```typescript
const [selectedNode, setSelectedNode] = useState<Node | null>(null);

const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
  setSelectedNode(node);
  setIsConfigPanelOpen(true);
}, []);
```

### Workflow Specification State

```typescript
const [workflowSpec, setWorkflowSpec] = useState<WorkflowSpec | null>(null);

const generateWorkflowSpec = useCallback(() => {
  const spec = convertToWorkflowSpec(nodes, edges, metadata);
  setWorkflowSpec(spec);
}, [nodes, edges]);
```

## Data Flow

### Node Creation Flow

```
User drags node from sidebar
    ↓
onDragStart: Set drag data
    ↓
User drops on canvas
    ↓
onDrop: Create new node
    ↓
Add node to nodes array
    ↓
React Flow renders node
```

### Node Configuration Flow

```
User clicks node
    ↓
onNodeClick: Set selectedNode
    ↓
Open config panel
    ↓
User edits config
    ↓
Update node in nodes array
    ↓
React Flow re-renders node
```

### Workflow Save Flow

```
User clicks "Save Workflow"
    ↓
Generate WorkflowSpec from nodes/edges
    ↓
Set isSaving: true
    ↓
POST /api/workflows/validate
    ↓
Update validationResult
    ↓
If valid: Save workflow (future)
    ↓
Set isSaving: false
```

## State Updates

### Immutable Updates

All state updates use immutable patterns:

```typescript
// Update node config
const updateNodeConfig = (nodeId: string, config: Record<string, unknown>) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, config } }
        : node
    )
  );
};
```

### Batch Updates

Multiple state updates are batched:

```typescript
const addNode = (node: Node) => {
  setNodes((nds) => [...nds, node]);
  setSelectedNode(node);
  setIsConfigPanelOpen(true);
};
```

## State Persistence

### Current: In-Memory

State is stored in component state (lost on refresh).

### Planned: Local Storage

```typescript
// Save to localStorage
const saveWorkflowToStorage = (spec: WorkflowSpec) => {
  localStorage.setItem('workflow-draft', JSON.stringify(spec));
};

// Load from localStorage
const loadWorkflowFromStorage = (): WorkflowSpec | null => {
  const stored = localStorage.getItem('workflow-draft');
  return stored ? JSON.parse(stored) : null;
};
```

### Future: Database

Workflows will be persisted to database via API.

## State Synchronization

### React Flow ↔ WorkflowSpec

**To WorkflowSpec**:
```typescript
const nodesToWorkflowSpec = (nodes: Node[], edges: Edge[]): WorkflowSpec => {
  // Convert React Flow nodes/edges to WorkflowSpec
};
```

**From WorkflowSpec**:
```typescript
const workflowSpecToNodes = (spec: WorkflowSpec): { nodes: Node[], edges: Edge[] } => {
  // Convert WorkflowSpec to React Flow nodes/edges
};
```

## Error State

### Validation Errors

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
```

### Display Errors

- Show errors in config panel
- Highlight nodes with errors
- Show error messages in UI

## Loading States

### Async Operations

```typescript
const [isValidating, setIsValidating] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isExecuting, setIsExecuting] = useState(false);
```

### Loading Indicators

- Show loading spinner during API calls
- Disable buttons during operations
- Show progress for long operations

## State Optimization

### Memoization

```typescript
const nodeTypes = useMemo(() => ({
  trigger: CustomNode,
  action: CustomNode,
  logic: CustomNode,
  state: CustomNode,
}), []);
```

### Callback Optimization

```typescript
const onConnect = useCallback((params: Connection) => {
  setEdges((eds) => addEdge(params, eds));
}, []);
```

## Related Documentation

- [UI Architecture](ui-architecture.md) - Frontend components
- [System Overview](../architecture/system-overview.md) - Overall architecture
- [API Design](../backend/api-design.md) - Backend API
