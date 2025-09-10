// Core types for the drag-and-drop wireframe builder

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface Content {
  text?: string;
  placeholder?: string;
  icon?: string;
  image?: string;
  link?: string;
}

export interface Styling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  display?: 'block' | 'flex' | 'grid' | 'inline-block';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  border?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  overflow?: 'visible' | 'hidden';
  position?: 'static' | 'relative' | 'absolute';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  cursor?: 'pointer' | 'default' | 'not-allowed' | 'grab' | 'grabbing';
}

export type ComponentType = 
  | 'header'
  | 'footer'
  | 'button'
  | 'text'
  | 'image'
  | 'card'
  | 'form'
  | 'navigation'
  | 'sidebar'
  | 'hero'
  | 'product-card'
  | 'chart'
  | 'table'
  | 'list'
  | 'modal'
  | 'alert'
  | 'container'
  | 'section'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'shopping-cart'
  | 'checkout'
  | 'price'
  | 'rating'
  | 'filter'
  | 'widget'
  | 'metric'
  | 'timeline'
  | 'calendar'
  | 'profile'
  | 'settings'
  | 'dashboard-card'
  | 'comment'
  | 'like'
  | 'share'
  | 'follow'
  | 'feed'
  | 'accordion'
  | 'tabs'
  | 'slider'
  | 'dropdown'
  | 'popover'
  | 'drawer';

export interface WireframeComponent {
  id: string;
  type: ComponentType;
  position: Position;
  content: Content;
  styling: Styling;
}

export interface WireframeCanvas {
  id: string;
  title: string;
  description: string;
  components: WireframeComponent[];
  device: 'desktop' | 'tablet' | 'mobile';
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Drag and drop specific types
export interface DragItem {
  type: 'component';
  componentType: ComponentType;
  source: 'palette' | 'canvas';
  componentId?: string;
}

export interface DropTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  accepts: ComponentType[];
}

// Component palette item
export interface PaletteItem {
  type: ComponentType;
  label: string;
  icon: string;
  description: string;
  defaultContent: Content;
  defaultStyling: Styling;
  defaultSize: {
    width: number;
    height: number;
  };
}

// Canvas state management
export interface CanvasState {
  components: WireframeComponent[];
  selectedComponentId: string | null;
  draggedComponent: DragItem | null;
  isDragging: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
}

// Component selection and editing
export interface ComponentSelection {
  componentId: string;
  isSelected: boolean;
  isResizing: boolean;
  isMoving: boolean;
  resizeHandle?: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
}

// History management for undo/redo
export interface HistoryState {
  past: WireframeComponent[][];
  present: WireframeComponent[];
  future: WireframeComponent[][];
}

// Export/Import types
export interface WireframeExport {
  canvas: WireframeCanvas;
  metadata: {
    version: string;
    exportedAt: string;
    exportedBy: string;
  };
}

// Event types for drag and drop
export interface DragEvent {
  type: 'dragstart' | 'drag' | 'dragend' | 'dragover' | 'drop';
  componentId?: string;
  componentType?: ComponentType;
  position?: Position;
  clientX: number;
  clientY: number;
}

// Grid system types
export interface GridConfig {
  size: number;
  snapToGrid: boolean;
  showGrid: boolean;
  color: string;
  opacity: number;
}

// Component properties panel
export interface ComponentProperties {
  componentId: string;
  position: Position;
  content: Content;
  styling: Styling;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  componentId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
