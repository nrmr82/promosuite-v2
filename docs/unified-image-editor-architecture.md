# Unified Image Editor Architecture

## Overview
A comprehensive image editor that integrates design capabilities, AI beautification, and advanced inpainting tools into the existing FlyerPro workflow.

## Core Technologies
- **Polotno SDK**: Canvas-based design editor foundation
- **InpaintWeb**: WebGPU-powered inpainting and background removal
- **AI Beautification**: Credit-based prompt-driven image enhancement
- **React 18**: Component framework
- **WebGPU**: High-performance graphics processing

## Architecture Components

### 1. UnifiedImageEditor (Main Container)
```
UnifiedImageEditor/
├── components/
│   ├── EditorCanvas/           # Polotno-based canvas
│   ├── ToolbarSystem/          # Unified toolbar
│   ├── SidePanels/            # Context-aware panels
│   ├── AIBeautifier/          # Credit-based AI enhancement
│   ├── InpaintingTools/       # WebGPU inpainting
│   └── FileManager/           # Import/Export system
├── services/
│   ├── polotno-bridge/        # Canvas operations
│   ├── inpainting-engine/     # WebGPU processing
│   ├── ai-beautifier/         # Credit-based AI
│   └── credit-manager/        # Usage tracking
├── hooks/
│   ├── useCanvasState/        # Canvas state management
│   ├── useInpainting/         # Inpainting operations
│   └── useCredits/            # Credit system
└── utils/
    ├── image-processing/      # Core image operations
    ├── performance/           # Optimization
    └── validation/            # Error handling
```

### 2. Feature Integration Map

#### Design Editor (Polotno Base)
- ✅ Multi-layer canvas with drag-drop
- ✅ Text editing with rich typography
- ✅ Shape tools and vector graphics
- ✅ Template system
- ✅ Image manipulation
- ✅ Undo/Redo system
- ✅ Export functionality

#### AI Beautification (Credit-based)
- 🎯 **One-click presets**:
  - "Enhance Portrait" (5 credits)
  - "Brighten Image" (3 credits)
  - "Smooth Skin" (4 credits)
  - "Professional Touch" (6 credits)
- 🎯 **Custom prompts**:
  - Text input for specific enhancements
  - Credit cost varies by complexity (3-10 credits)
- 🎯 **Preview system**:
  - Before/after comparison
  - Process confirmation before credit deduction

#### Inpainting Tools (InpaintWeb)
- 🎯 **Object removal**: WebGPU-powered inpainting
- 🎯 **Background replacement**: Smart background removal
- 🎯 **Brush-based selection**: Precise area selection
- 🎯 **Content-aware fill**: Intelligent fill algorithms

### 3. UI/UX Design

#### Main Interface Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [File] [Edit] [View] [AI Beautify] [Credits: 45] [Export]  │
├─────────────────────────────────────────────────────────────┤
│ 📐 ✏️ 🎨 🖼️ | 🤖 AI | 🎯 Inpaint | 📤 Export             │
├─────┬───────────────────────────────────────────────┬───────┤
│     │                                               │       │
│ L   │              CANVAS AREA                      │   R   │
│ A   │          (Polotno Integration)                │   I   │
│ Y   │                                               │   G   │
│ E   │                                               │   H   │
│ R   │                                               │   T   │
│ S   │                                               │       │
│     │                                               │ P A N │
│     │                                               │ E L S │
│     └───────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│          Status Bar | Processing... | Ready                 │
└─────────────────────────────────────────────────────────────┘
```

#### Context-Aware Right Panel
- **Design Mode**: Layers, Properties, Colors
- **AI Mode**: Beautification options, Credit usage, Preview
- **Inpaint Mode**: Brush settings, Selection tools, Processing

### 4. Credit System Integration
```typescript
interface CreditSystem {
  checkBalance: (requiredCredits: number) => boolean;
  deductCredits: (operation: string, cost: number) => Promise<void>;
  showInsufficientCredits: () => void;
  trackUsage: (operation: string, cost: number) => void;
}
```

### 5. Data Flow Architecture
```
User Action → Tool Selection → Processing Pipeline → Canvas Update
     ↓              ↓                    ↓                ↓
 UI Event → Service Layer → WebGPU/AI API → State Update
     ↓              ↓                    ↓                ↓
Credit Check → API Call → Result Processing → UI Feedback
```

### 6. Performance Optimization
- **Lazy Loading**: Load tools only when needed
- **Memory Management**: Efficient canvas memory usage
- **WebGPU Batching**: Batch processing for inpainting
- **Credit Caching**: Cache AI results to avoid re-processing

### 7. Integration Points

#### FlyerPro Integration
```typescript
interface EditorLauncher {
  openEditor: (options?: EditorOptions) => Promise<void>;
  onSave: (imageData: ImageData) => void;
  onClose: () => void;
  initialImage?: string;
  returnTo?: string;
}
```

#### Credit Management
```typescript
interface CreditManager {
  currentBalance: number;
  deductCredits: (amount: number, operation: string) => Promise<boolean>;
  showPricingModal: () => void;
  trackOperation: (operation: string, cost: number) => void;
}
```

## Implementation Phases

### Phase 1: Foundation
1. Set up project structure
2. Install and configure dependencies
3. Create base components
4. Integrate Polotno SDK

### Phase 2: Core Features
1. Implement canvas editor
2. Add basic inpainting tools
3. Create unified toolbar
4. Set up file management

### Phase 3: AI Integration
1. Implement credit system
2. Add AI beautification presets
3. Create prompt-based enhancement
4. Add usage tracking

### Phase 4: Polish & Integration
1. Performance optimization
2. UI/UX refinements
3. FlyerPro integration
4. Testing and debugging

## Credit Pricing Structure
- **One-click presets**: 3-6 credits
- **Custom prompts**: 5-10 credits based on complexity
- **Inpainting operations**: 2-4 credits based on area size
- **Background removal**: 4 credits
- **Bulk operations**: 20% discount for 5+ images

## Technical Requirements
- **Browser**: Modern browsers with WebGPU support
- **Memory**: Minimum 4GB RAM recommended
- **Network**: Required for AI processing API calls
- **Storage**: Local storage for temporary files and cache