import { 
  WireframeComponent, 
  Position, 
  ComponentType, 
  PaletteItem,
  CanvasState,
  ValidationResult,
  ValidationError
} from '../types/wireframeBuilder';
import { COMPONENT_PALETTE } from '../constants/componentPalette';

// Generate unique component ID
export const generateComponentId = (type: ComponentType): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `${type}_${timestamp}_${random}`;
};

// Create a new component from palette item
export const createComponentFromPalette = (
  paletteItem: PaletteItem,
  position: Position
): WireframeComponent => {
  return {
    id: generateComponentId(paletteItem.type),
    type: paletteItem.type,
    position: {
      x: position.x,
      y: position.y,
      width: paletteItem.defaultSize.width,
      height: paletteItem.defaultSize.height,
      zIndex: 1
    },
    content: { ...paletteItem.defaultContent },
    styling: { ...paletteItem.defaultStyling }
  };
};

// Snap position to grid
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Check if position is within canvas bounds
export const isWithinCanvas = (
  position: Position,
  canvasWidth: number,
  canvasHeight: number
): boolean => {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + position.width <= canvasWidth &&
    position.y + position.height <= canvasHeight
  );
};

// Check if two components overlap
export const doComponentsOverlap = (
  component1: WireframeComponent,
  component2: WireframeComponent
): boolean => {
  const rect1 = component1.position;
  const rect2 = component2.position;
  
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect2.x + rect2.width <= rect1.x ||
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  );
};

// Find component at specific coordinates
export const findComponentAtPosition = (
  components: WireframeComponent[],
  x: number,
  y: number
): WireframeComponent | null => {
  // Sort by z-index (highest first) to get topmost component
  const sortedComponents = [...components].sort((a, b) => b.position.zIndex - a.position.zIndex);
  
  for (const component of sortedComponents) {
    const { x: compX, y: compY, width, height } = component.position;
    if (x >= compX && x <= compX + width && y >= compY && y <= compY + height) {
      return component;
    }
  }
  
  return null;
};

// Calculate next z-index for new component
export const getNextZIndex = (components: WireframeComponent[]): number => {
  if (components.length === 0) return 1;
  return Math.max(...components.map(c => c.position.zIndex)) + 1;
};

// Move component to front
export const bringToFront = (component: WireframeComponent, allComponents: WireframeComponent[]): WireframeComponent => {
  const nextZIndex = getNextZIndex(allComponents);
  return {
    ...component,
    position: {
      ...component.position,
      zIndex: nextZIndex
    }
  };
};

// Move component to back
export const sendToBack = (component: WireframeComponent, allComponents: WireframeComponent[]): WireframeComponent => {
  const minZIndex = Math.min(...allComponents.map(c => c.position.zIndex));
  return {
    ...component,
    position: {
      ...component.position,
      zIndex: minZIndex - 1
    }
  };
};

// Update component position
export const updateComponentPosition = (
  component: WireframeComponent,
  newPosition: Partial<Position>
): WireframeComponent => {
  return {
    ...component,
    position: {
      ...component.position,
      ...newPosition
    }
  };
};

// Update component content
export const updateComponentContent = (
  component: WireframeComponent,
  newContent: Partial<WireframeComponent['content']>
): WireframeComponent => {
  return {
    ...component,
    content: {
      ...component.content,
      ...newContent
    }
  };
};

// Update component styling
export const updateComponentStyling = (
  component: WireframeComponent,
  newStyling: Partial<WireframeComponent['styling']>
): WireframeComponent => {
  return {
    ...component,
    styling: {
      ...component.styling,
      ...newStyling
    }
  };
};

// Remove component by ID
export const removeComponent = (
  components: WireframeComponent[],
  componentId: string
): WireframeComponent[] => {
  return components.filter(component => component.id !== componentId);
};

// Duplicate component
export const duplicateComponent = (component: WireframeComponent): WireframeComponent => {
  return {
    ...component,
    id: generateComponentId(component.type),
    position: {
      ...component.position,
      x: component.position.x + 20, // Offset slightly
      y: component.position.y + 20,
      zIndex: 1 // Will be updated when added to canvas
    }
  };
};

// Validate component
export const validateComponent = (component: WireframeComponent): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Check required fields
  if (!component.id) {
    errors.push({ field: 'id', message: 'Component ID is required', componentId: component.id });
  }
  
  if (!component.type) {
    errors.push({ field: 'type', message: 'Component type is required', componentId: component.id });
  }
  
  // Check position
  if (component.position.width <= 0) {
    errors.push({ field: 'position.width', message: 'Width must be greater than 0', componentId: component.id });
  }
  
  if (component.position.height <= 0) {
    errors.push({ field: 'position.height', message: 'Height must be greater than 0', componentId: component.id });
  }
  
  if (component.position.x < 0) {
    errors.push({ field: 'position.x', message: 'X position cannot be negative', componentId: component.id });
  }
  
  if (component.position.y < 0) {
    errors.push({ field: 'position.y', message: 'Y position cannot be negative', componentId: component.id });
  }
  
  // Check content
  if (!component.content.text && !component.content.placeholder) {
    errors.push({ field: 'content', message: 'Component must have text or placeholder content', componentId: component.id });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate canvas state
export const validateCanvas = (state: CanvasState): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validate each component
  for (const component of state.components) {
    const componentValidation = validateComponent(component);
    errors.push(...componentValidation.errors);
  }
  
  // Check for overlapping components (optional warning)
  for (let i = 0; i < state.components.length; i++) {
    for (let j = i + 1; j < state.components.length; j++) {
      if (doComponentsOverlap(state.components[i], state.components[j])) {
        errors.push({
          field: 'position',
          message: `Component "${state.components[i].id}" overlaps with "${state.components[j].id}"`,
          componentId: state.components[i].id
        });
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Convert canvas state to wireframe format (for API integration)
export const canvasToWireframe = (state: CanvasState, title: string, description: string) => {
  return {
    id: `wireframe_${Date.now()}`,
    title,
    description,
    components: state.components.map(component => ({
      id: component.id,
      type: component.type,
      x: component.position.x,
      y: component.position.y,
      width: component.position.width,
      height: component.position.height,
      content: component.content.text || component.content.placeholder || component.type,
      style: component.styling
    })),
    device: 'desktop' as const,
    dimensions: {
      width: 1200,
      height: 800
    }
  };
};

// Generate default canvas state
export const createDefaultCanvasState = (): CanvasState => {
  return {
    components: [],
    selectedComponentId: null,
    draggedComponent: null,
    isDragging: false,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true
  };
};

// Get component display name
export const getComponentDisplayName = (type: ComponentType): string => {
  const paletteItem = COMPONENT_PALETTE.find(item => item.type === type);
  return paletteItem?.label || type;
};

// Get component icon
export const getComponentIcon = (type: ComponentType): string => {
  const paletteItem = COMPONENT_PALETTE.find(item => item.type === type);
  return paletteItem?.icon || '📦';
};
