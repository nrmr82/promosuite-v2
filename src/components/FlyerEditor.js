import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Image,
  Square,
  Move,
  Copy,
  Trash2,
  Undo,
  Redo,
  Save,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import './FlyerEditor.css';

const FlyerEditor = ({ 
  template, 
  propertyData = {}, 
  brandData = {}, 
  onSave, 
  onExport, 
  onClose 
}) => {
  // Canvas and zoom state
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasSize] = useState({ width: 800, height: 1000 }); // 8.5x11 aspect ratio

  // Editor state
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Tool state
  const [activeTool, setActiveTool] = useState('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Property panel state
  const [showProperties] = useState(true);

  // Initialize template elements
  useEffect(() => {
    if (template) {
      // Create simple default elements
      const defaultElements = [
        {
          id: 'title',
          type: 'text',
          x: 50,
          y: 50,
          width: 700,
          height: 60,
          content: propertyData.title || 'Beautiful Property',
          fontSize: 32,
          fontWeight: 'bold',
          color: '#333333',
          zIndex: 1,
          locked: false,
          visible: true
        },
        {
          id: 'price',
          type: 'text',
          x: 50,
          y: 120,
          width: 200,
          height: 40,
          content: propertyData.price || '$XXX,XXX',
          fontSize: 24,
          fontWeight: 'bold',
          color: '#ff6b35',
          zIndex: 1,
          locked: false,
          visible: true
        },
        {
          id: 'address',
          type: 'text',
          x: 50,
          y: 170,
          width: 400,
          height: 30,
          content: propertyData.address || '123 Main Street',
          fontSize: 16,
          color: '#666666',
          zIndex: 1,
          locked: false,
          visible: true
        }
      ];
      
      setElements(defaultElements);
      setHistory([JSON.parse(JSON.stringify(defaultElements))]);
      setHistoryIndex(0);
    }
  }, [template, propertyData.address, propertyData.price, propertyData.title]);


  // History management
  const saveToHistory = (newElements) => {
    const newHistory = [...history.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(newElements))];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Element manipulation
  const addElement = (type) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 40 : 100,
      content: type === 'text' ? 'New Text' : 'New Element',
      fontSize: 16,
      color: '#333333',
      backgroundColor: type === 'shape' ? '#cccccc' : 'transparent',
      zIndex: Math.max(...elements.map(e => e.zIndex), 0) + 1,
      locked: false,
      visible: true
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElementId(newElement.id);
    saveToHistory(newElements);
  };

  const updateElement = (elementId, updates) => {
    const newElements = elements.map(element => 
      element.id === elementId 
        ? { ...element, ...updates }
        : element
    );
    setElements(newElements);
  };

  const deleteElement = (elementId) => {
    if (elementId === selectedElementId) {
      setSelectedElementId(null);
    }
    const newElements = elements.filter(element => element.id !== elementId);
    setElements(newElements);
    saveToHistory(newElements);
  };

  const duplicateElement = (elementId) => {
    const element = elements.find(e => e.id === elementId);
    if (element) {
      const newElement = {
        ...element,
        id: `element-${Date.now()}`,
        x: element.x + 10,
        y: element.y + 10,
        zIndex: Math.max(...elements.map(e => e.zIndex), 0) + 1
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      setSelectedElementId(newElement.id);
      saveToHistory(newElements);
    }
  };

  // Canvas interaction handlers
  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;

    // Find clicked element (top-most)
    const clickedElement = [...elements]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find(element => 
        x >= element.x && 
        x <= element.x + element.width && 
        y >= element.y && 
        y <= element.y + element.height &&
        element.visible &&
        !element.locked
      );

    if (clickedElement) {
      setSelectedElementId(clickedElement.id);
      setIsDragging(true);
      setDragStart({ x: x - clickedElement.x, y: y - clickedElement.y });
    } else {
      setSelectedElementId(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !selectedElementId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;

    updateElement(selectedElementId, {
      x: x - dragStart.x,
      y: y - dragStart.y
    });
  };

  const handleCanvasMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      saveToHistory(elements);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.3));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  // Get selected element
  const selectedElement = elements.find(e => e.id === selectedElementId);

  return (
    <div className="flyer-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-section">
          <h3 className="editor-title">FlyerPro Editor</h3>
        </div>

        <div className="toolbar-section tools">
          <button
            className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => setActiveTool('select')}
            title="Select Tool"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            className="tool-btn"
            onClick={() => addElement('text')}
            title="Add Text"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            className="tool-btn"
            onClick={() => addElement('image')}
            title="Add Image"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            className="tool-btn"
            onClick={() => addElement('shape')}
            title="Add Shape"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        <div className="toolbar-section">
          <button
            className="tool-btn"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            className="tool-btn"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        <div className="toolbar-section zoom-controls">
          <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="tool-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="tool-btn" onClick={handleZoomReset} title="Reset Zoom">
            Reset
          </button>
        </div>

        <div className="toolbar-section view-controls">
          <button
            className={`tool-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            className={`tool-btn ${showLayers ? 'active' : ''}`}
            onClick={() => setShowLayers(!showLayers)}
            title="Toggle Layers Panel"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        <div className="toolbar-section actions">
          <button className="tool-btn primary" onClick={() => onSave?.(elements)} title="Save">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="tool-btn secondary" onClick={() => onExport?.(elements)} title="Export">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="tool-btn" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="toolbar-section">
          <button className="tool-btn close" onClick={onClose} title="Close">
            ×
          </button>
        </div>
      </div>

      <div className="editor-workspace">
        {/* Left Panel - Layers */}
        {showLayers && (
          <div className="layers-panel">
            <h4>Layers</h4>
            <div className="layers-list">
              {[...elements]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((element) => (
                  <div
                    key={element.id}
                    className={`layer-item ${selectedElementId === element.id ? 'selected' : ''}`}
                    onClick={() => setSelectedElementId(element.id)}
                  >
                    <div className="layer-info">
                      <span className="layer-name">
                        {element.type === 'text' ? element.content.substring(0, 20) : element.id}
                      </span>
                      <span className="layer-type">{element.type}</span>
                    </div>
                    <div className="layer-controls">
                      <button
                        className="layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(element.id, { visible: !element.visible });
                        }}
                        title={element.visible ? 'Hide' : 'Show'}
                      >
                        {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        className="layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(element.id, { locked: !element.locked });
                        }}
                        title={element.locked ? 'Unlock' : 'Lock'}
                      >
                        {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="canvas-container">
          <div className="canvas-wrapper">
            <div
              ref={canvasRef}
              className="canvas"
              style={{
                transform: `scale(${zoom}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                width: canvasSize.width,
                height: canvasSize.height,
                backgroundImage: showGrid ? 
                  'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)' : 
                  'none',
                backgroundSize: showGrid ? '20px 20px' : 'none'
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {elements
                .filter(element => element.visible)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((element) => (
                  <div
                    key={element.id}
                    className={`canvas-element ${element.type} ${selectedElementId === element.id ? 'selected' : ''} ${element.locked ? 'locked' : ''}`}
                    style={{
                      position: 'absolute',
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      fontSize: element.fontSize,
                      color: element.color,
                      backgroundColor: element.backgroundColor || 'transparent',
                      textAlign: element.textAlign || 'left',
                      fontWeight: element.fontWeight || 'normal',
                      padding: element.padding || 0,
                      lineHeight: element.lineHeight || 'normal',
                      zIndex: element.zIndex,
                      border: selectedElementId === element.id ? '2px solid #007bff' : 'none',
                      cursor: element.locked ? 'not-allowed' : 'move'
                    }}
                  >
                    {element.type === 'text' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {element.content}
                      </div>
                    ) : element.type === 'image' ? (
                      <div className="image-placeholder">
                        {element.content}
                      </div>
                    ) : (
                      <div className="shape-placeholder">
                        Shape
                      </div>
                    )}
                    
                    {selectedElementId === element.id && !element.locked && (
                      <div className="selection-handles">
                        <div className="handle nw"></div>
                        <div className="handle ne"></div>
                        <div className="handle sw"></div>
                        <div className="handle se"></div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        {showProperties && selectedElement && (
          <div className="properties-panel">
            <div className="properties-header">
              <h4>Properties</h4>
              <div className="element-actions">
                <button
                  className="action-btn"
                  onClick={() => duplicateElement(selectedElementId)}
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  className="action-btn danger"
                  onClick={() => deleteElement(selectedElementId)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="properties-content">
              {/* Position & Size */}
              <div className="property-group">
                <label>Position & Size</label>
                <div className="property-row">
                  <div className="property-field">
                    <label>X</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateElement(selectedElementId, { x: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="property-field">
                    <label>Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateElement(selectedElementId, { y: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="property-row">
                  <div className="property-field">
                    <label>Width</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => updateElement(selectedElementId, { width: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="property-field">
                    <label>Height</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => updateElement(selectedElementId, { height: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>

              {/* Text Properties */}
              {selectedElement.type === 'text' && (
                <>
                  <div className="property-group">
                    <label>Text Content</label>
                    <textarea
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElementId, { content: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="property-group">
                    <label>Typography</label>
                    <div className="property-row">
                      <div className="property-field">
                        <label>Size</label>
                        <input
                          type="number"
                          value={selectedElement.fontSize || 16}
                          onChange={(e) => updateElement(selectedElementId, { fontSize: parseInt(e.target.value) || 16 })}
                        />
                      </div>
                      <div className="property-field">
                        <label>Weight</label>
                        <select
                          value={selectedElement.fontWeight || 'normal'}
                          onChange={(e) => updateElement(selectedElementId, { fontWeight: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="lighter">Light</option>
                        </select>
                      </div>
                    </div>

                    <div className="property-row">
                      <div className="property-field">
                        <label>Color</label>
                        <input
                          type="color"
                          value={selectedElement.color || '#333333'}
                          onChange={(e) => updateElement(selectedElementId, { color: e.target.value })}
                        />
                      </div>
                      <div className="property-field">
                        <label>Align</label>
                        <div className="align-controls">
                          <button
                            className={`align-btn ${selectedElement.textAlign === 'left' ? 'active' : ''}`}
                            onClick={() => updateElement(selectedElementId, { textAlign: 'left' })}
                          >
                            <AlignLeft className="w-4 h-4" />
                          </button>
                          <button
                            className={`align-btn ${selectedElement.textAlign === 'center' ? 'active' : ''}`}
                            onClick={() => updateElement(selectedElementId, { textAlign: 'center' })}
                          >
                            <AlignCenter className="w-4 h-4" />
                          </button>
                          <button
                            className={`align-btn ${selectedElement.textAlign === 'right' ? 'active' : ''}`}
                            onClick={() => updateElement(selectedElementId, { textAlign: 'right' })}
                          >
                            <AlignRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Layer Controls */}
              <div className="property-group">
                <label>Layer</label>
                <div className="property-row">
                  <div className="property-field">
                    <label>Z-Index</label>
                    <input
                      type="number"
                      value={selectedElement.zIndex}
                      onChange={(e) => updateElement(selectedElementId, { zIndex: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="layer-actions">
                  <button
                    className="action-btn"
                    onClick={() => updateElement(selectedElementId, { 
                      zIndex: Math.max(...elements.map(e => e.zIndex)) + 1 
                    })}
                  >
                    Bring to Front
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => updateElement(selectedElementId, { 
                      zIndex: Math.min(...elements.map(e => e.zIndex)) - 1 
                    })}
                  >
                    Send to Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlyerEditor;
