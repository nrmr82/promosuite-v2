import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, FabricImage, Rect, filters } from 'fabric';

import './PortraitStudio.css';

// Minimalist Icons Component
const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const icons = {
    upload: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17,8 12,3 7,8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
    sparkles: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zM6 18l.5 2L9 21l-2.5.5L6 24l-.5-2.5L3 21l2.5-.5L6 18zM18 6l.5 2L21 9l-2.5.5L18 12l-.5-2.5L15 9l2.5-.5L18 6z"/>
      </svg>
    ),
    save: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
    ),
    download: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    close: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    crop: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
        <path d="M18 6H8a2 2 0 0 0-2 2v10"/>
      </svg>
    ),
    rotate: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polyline points="1,4 1,10 7,10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
    ),
    mask: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M20 16v-2a4 4 0 0 0-4-4V8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2a4 4 0 0 0-4 4v2"/>
        <rect x="2" y="16" width="20" height="4" rx="1"/>
      </svg>
    ),
    heal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>
      </svg>
    )
  };
  
  return icons[name] || null;
};

// Manual editing tools
const EDITING_TOOLS = {
  CROP: 'crop',
  ROTATE: 'rotate', 
  BRIGHTNESS: 'brightness',
  CONTRAST: 'contrast',
  SATURATION: 'saturation',
  FILTER: 'filter',
  MASK: 'mask',
  INPAINT: 'inpaint'
};

// Available filters
const FILTERS = {
  none: { name: 'Original', filter: null },
  sepia: { name: 'Sepia', filter: new filters.Sepia() },
  grayscale: { name: 'Black & White', filter: new filters.Grayscale() },
  vintage: { name: 'Vintage', filter: new filters.Vintage() },
  polaroid: { name: 'Polaroid', filter: new filters.Polaroid() },
  blur: { name: 'Blur', filter: new filters.Blur({ blur: 0.2 }) },
  sharpen: { name: 'Sharpen', filter: new filters.Convolute({
    matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
  })}
};

const PortraitStudio = forwardRef(({
  initialImage = null,
  onSave = () => {},
  onClose = () => {},
  onExport = () => {},
  user = null
}, ref) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [currentTool, setCurrentTool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [hasImage, setHasImage] = useState(false);
  
  // Adjustment states
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [rotation, setRotation] = useState(0);
  
  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  
  // Mask/Inpainting state
  const [maskMode, setMaskMode] = useState(false);

  // Initialize canvas with proper React lifecycle management
  useEffect(() => {
    let fabricCanvas = null;
    
    const initializeCanvas = () => {
      if (canvasRef.current && !canvas) {
        try {
          fabricCanvas = new Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#1a1a1a', // Match theme
            selection: true,
            preserveObjectStacking: true
          });
          
          // Configure drawing for masking
          fabricCanvas.isDrawingMode = false;
          fabricCanvas.freeDrawingBrush.width = 10;
          fabricCanvas.freeDrawingBrush.color = 'rgba(233, 30, 99, 0.8)'; // Pink theme color
          
          // Add event listeners for React state sync
          fabricCanvas.on('selection:created', () => {
            // Sync selection state if needed
          });
          
          fabricCanvas.on('selection:cleared', () => {
            // Sync selection state if needed
          });
          
          fabricCanvas.on('object:modified', () => {
            // Auto-save state on modifications
            fabricCanvas.renderAll();
          });
          
          setCanvas(fabricCanvas);
          
          // Load initial image if provided
          if (initialImage) {
            loadImageToCanvas(fabricCanvas, initialImage);
          }
          
        } catch (error) {
          console.error('Failed to initialize Fabric canvas:', error);
        }
      }
    };
    
    initializeCanvas();
    
    // Cleanup function - CRITICAL for React compatibility
    return () => {
      if (fabricCanvas) {
        try {
          // Remove all event listeners
          fabricCanvas.off('selection:created');
          fabricCanvas.off('selection:cleared');
          fabricCanvas.off('object:modified');
          
          // Clear all objects
          fabricCanvas.clear();
          
          // Dispose of the canvas
          fabricCanvas.dispose();
          fabricCanvas = null;
        } catch (error) {
          console.error('Error disposing Fabric canvas:', error);
        }
      }
    };
  }, [canvas, initialImage, loadImageToCanvas]); // Include dependencies

  const loadImageToCanvas = useCallback(async (fabricCanvas, imageSource) => {
    if (!fabricCanvas) return;
    
    setIsLoading(true);
    
    const loadImage = (src) => {
      try {
        FabricImage.fromURL(src, { crossOrigin: 'anonymous' }).then((img) => {
          if (!img || !fabricCanvas) {
            setIsLoading(false);
            return;
          }
          
          // Scale image to fit canvas while maintaining aspect ratio
          const canvasAspect = fabricCanvas.width / fabricCanvas.height;
          const imageAspect = img.width / img.height;
          
          let scale;
          if (imageAspect > canvasAspect) {
            scale = (fabricCanvas.width * 0.9) / img.width; // 90% of canvas width
          } else {
            scale = (fabricCanvas.height * 0.9) / img.height; // 90% of canvas height
          }
          
          img.scale(scale);
          img.set({
            left: (fabricCanvas.width - img.width * scale) / 2,
            top: (fabricCanvas.height - img.height * scale) / 2,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#e91e63',
            cornerStyle: 'circle',
            borderColor: '#e91e63',
            transparentCorners: false
          });
          
          // Clear canvas and add new image
          fabricCanvas.clear();
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          
          setCurrentImage(img);
          setHasImage(true);
          setIsLoading(false);
        }).catch((error) => {
          console.error('Error loading image to canvas:', error);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error loading image to canvas:', error);
        setIsLoading(false);
      }
    };
    
    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => loadImage(e.target.result);
      reader.readAsDataURL(imageSource);
    } else {
      loadImage(imageSource);
    }
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/') && canvas) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please choose an image under 10MB.');
        return;
      }
      
      // Validate image type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please choose a JPEG, PNG, GIF, or WebP image.');
        return;
      }
      
      loadImageToCanvas(canvas, file);
    }
    
    // Clear the input so same file can be uploaded again
    event.target.value = '';
  }, [canvas, loadImageToCanvas]);

  const handleToolChange = useCallback((tool) => {
    setCurrentTool(tool);
    
    // Reset modes
    setCropMode(false);
    setMaskMode(false);
    
    if (canvas) {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      
      switch (tool) {
        case EDITING_TOOLS.CROP:
          setCropMode(true);
          setupCropMode();
          break;
        case EDITING_TOOLS.MASK:
        case EDITING_TOOLS.INPAINT:
          setMaskMode(true);
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.color = 'rgba(255, 0, 0, 0.5)';
          break;
        default:
          break;
      }
    }
  }, [canvas, setupCropMode]);

  const setupCropMode = useCallback(() => {
    if (!canvas || !currentImage) return;
    
    // Create crop rectangle
    const rect = new Rect({
      left: currentImage.left + 50,
      top: currentImage.top + 50,
      width: currentImage.width * currentImage.scaleX - 100,
      height: currentImage.height * currentImage.scaleY - 100,
      fill: 'transparent',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      hasControls: true,
      hasBorders: true
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setCropRect(rect);
    canvas.renderAll();
  }, [canvas, currentImage]);

  const applyCrop = useCallback(() => {
    if (!canvas || !currentImage || !cropRect) return;
    
    setIsLoading(true);
    
    // Get crop dimensions
    const cropData = {
      left: cropRect.left - currentImage.left,
      top: cropRect.top - currentImage.top,
      width: cropRect.width * cropRect.scaleX,
      height: cropRect.height * cropRect.scaleY
    };
    
    // Create cropped image
    const canvasEl = document.createElement('canvas');
    const ctx = canvasEl.getContext('2d');
    
    canvasEl.width = cropData.width;
    canvasEl.height = cropData.height;
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(
        img,
        cropData.left / currentImage.scaleX,
        cropData.top / currentImage.scaleY,
        cropData.width / currentImage.scaleX,
        cropData.height / currentImage.scaleY,
        0, 0,
        cropData.width,
        cropData.height
      );
      
      // Load cropped image back to canvas
      loadImageToCanvas(canvas, canvasEl.toDataURL());
      
      // Cleanup
      canvas.remove(cropRect);
      setCropRect(null);
      setCropMode(false);
      setCurrentTool(null);
    };
    
    img.src = currentImage.getSrc();
  }, [canvas, currentImage, cropRect, loadImageToCanvas]);

  const applyRotation = useCallback((angle) => {
    if (!canvas || !currentImage) return;
    
    setRotation(prev => {
      const newRotation = prev + angle;
      currentImage.rotate(newRotation);
      canvas.renderAll();
      return newRotation;
    });
  }, [canvas, currentImage]);

  const applyAdjustment = useCallback((type, value) => {
    if (!canvas || !currentImage) return;
    
    let filter;
    
    switch (type) {
      case 'brightness':
        setBrightness(value);
        filter = new filters.Brightness({ brightness: value / 100 });
        break;
      case 'contrast':
        setContrast(value);
        filter = new filters.Contrast({ contrast: value / 100 });
        break;
      case 'saturation':
        setSaturation(value);
        filter = new filters.Saturation({ saturation: value / 100 });
        break;
      default:
        return;
    }
    
    // Apply filter
    const currentFilters = currentImage.filters || [];
    const existingFilterIndex = currentFilters.findIndex(f => f.type === filter.type);
    
    if (existingFilterIndex >= 0) {
      currentFilters[existingFilterIndex] = filter;
    } else {
      currentFilters.push(filter);
    }
    
    currentImage.filters = currentFilters;
    currentImage.applyFilters();
    canvas.renderAll();
  }, [canvas, currentImage]);

  const applyFilter = useCallback((filterName) => {
    if (!canvas || !currentImage) return;
    
    setCurrentFilter(filterName);
    
    const filterConfig = FILTERS[filterName];
    if (filterConfig.filter) {
      currentImage.filters = [filterConfig.filter];
    } else {
      currentImage.filters = [];
    }
    
    currentImage.applyFilters();
    canvas.renderAll();
  }, [canvas, currentImage]);

  const handleBeautify = useCallback(async () => {
    if (!user) {
      alert('Please sign in to use AI beautification');
      return;
    }
    
    if (!canvas || !currentImage) {
      alert('Please load an image first');
      return;
    }
    
    setIsBeautifying(true);
    
    try {
      // Get current image data
      const imageDataURL = canvas.toDataURL('image/png');
      
      // Call backend AI beautification
      const response = await fetch('/api/beautify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          image: imageDataURL,
          options: {
            enhance_face: true,
            smooth_skin: true,
            brighten_eyes: true,
            enhance_lips: false
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Beautification failed');
      }
      
      const result = await response.json();
      
      // Load beautified image
      loadImageToCanvas(canvas, result.enhanced_image);
      
      console.log('AI beautification completed successfully');
    } catch (error) {
      console.error('Beautification error:', error);
      alert('AI beautification failed. Please try again.');
    } finally {
      setIsBeautifying(false);
    }
  }, [canvas, currentImage, user, loadImageToCanvas]);

  const handleInpaint = useCallback(async () => {
    if (!user) {
      alert('Please sign in to use AI inpainting');
      return;
    }
    
    if (!canvas || !currentImage) {
      alert('Please load an image first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get mask data from canvas drawing
      const maskCanvas = document.createElement('canvas');
      const maskCtx = maskCanvas.getContext('2d');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      
      // Extract mask from drawing
      canvas.getObjects('path').forEach(path => {
        if (path.stroke && path.stroke.includes('255, 0, 0')) {
          maskCtx.strokeStyle = 'white';
          maskCtx.lineWidth = path.strokeWidth;
          maskCtx.stroke(path.path);
        }
      });
      
      const maskDataURL = maskCanvas.toDataURL('image/png');
      const imageDataURL = currentImage.toDataURL('image/png');
      
      // Call backend inpainting service
      const response = await fetch('/api/inpaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          image: imageDataURL,
          mask: maskDataURL,
          prompt: 'remove object and fill with background'
        })
      });
      
      if (!response.ok) {
        throw new Error('Inpainting failed');
      }
      
      const result = await response.json();
      
      // Load inpainted image
      loadImageToCanvas(canvas, result.inpainted_image);
      
      // Clear mask drawings
      canvas.getObjects('path').forEach(path => {
        if (path.stroke && path.stroke.includes('255, 0, 0')) {
          canvas.remove(path);
        }
      });
      
      console.log('AI inpainting completed successfully');
    } catch (error) {
      console.error('Inpainting error:', error);
      alert('AI inpainting failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [canvas, currentImage, user, loadImageToCanvas]);

  const handleSave = useCallback(async () => {
    if (!canvas || !hasImage) {
      alert('Please load an image first');
      return;
    }
    
    setIsLoading(true);
    try {
      // Export with high quality
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Validate the export
      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Failed to export canvas');
      }
      
      onSave(dataURL);
      console.log('Portrait saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [canvas, onSave, hasImage]);

  const handleExport = useCallback(() => {
    if (!canvas || !hasImage) {
      alert('Please load an image first');
      return;
    }
    
    try {
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Validate the export
      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Failed to export canvas');
      }
      
      // Create and trigger download
      const link = document.createElement('a');
      link.download = `portrait-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link); // Needed for Firefox
      link.click();
      document.body.removeChild(link);
      
      onExport(dataURL);
      console.log('Image exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export image. Please try again.');
    }
  }, [canvas, onExport, hasImage]);

  const resetAdjustments = useCallback(() => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setRotation(0);
    setCurrentFilter('none');
    
    if (currentImage) {
      currentImage.filters = [];
      currentImage.rotate(0);
      currentImage.applyFilters();
      canvas.renderAll();
    }
  }, [canvas, currentImage]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleSave,
    handleExport,
    canvas
  }), [handleSave, handleExport, canvas]);

  return (
    <div className="portrait-studio">
      {/* Header */}
      <div className="portrait-studio-header">
        <div className="header-left">
          <h2>Portrait Studio</h2>
          <div className="header-actions">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload" className="btn btn-secondary">
              <Icon name="upload" size={16} color="currentColor" />
              Upload Image
            </label>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-primary beautify-btn"
            onClick={handleBeautify}
            disabled={isBeautifying || !currentImage}
          >
            <Icon name="sparkles" size={16} color="currentColor" />
            {isBeautifying ? 'Beautifying...' : 'AI Beautify'}
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading || !currentImage}
          >
            <Icon name="save" size={16} color="currentColor" />
            Save
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            disabled={!currentImage}
          >
            <Icon name="download" size={16} color="currentColor" />
            Export
          </button>
          
          <button className="btn btn-secondary" onClick={onClose}>
            <Icon name="close" size={16} color="currentColor" />
            Close
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="portrait-studio-content">
        {/* Sidebar with tools */}
        <div className="portrait-sidebar">
          {/* Manual Editing Tools */}
          <div className="tool-section">
            <h3>Manual Tools</h3>
            <div className="tool-grid">
              <button
                className={`tool-btn ${currentTool === EDITING_TOOLS.CROP ? 'active' : ''}`}
                onClick={() => handleToolChange(EDITING_TOOLS.CROP)}
              >
                <Icon name="crop" size={16} color="currentColor" />
                Crop
              </button>
              <button
                className={`tool-btn ${currentTool === EDITING_TOOLS.ROTATE ? 'active' : ''}`}
                onClick={() => handleToolChange(EDITING_TOOLS.ROTATE)}
              >
                <Icon name="rotate" size={16} color="currentColor" />
                Rotate
              </button>
              <button
                className={`tool-btn ${currentTool === EDITING_TOOLS.MASK ? 'active' : ''}`}
                onClick={() => handleToolChange(EDITING_TOOLS.MASK)}
              >
                <Icon name="mask" size={16} color="currentColor" />
                Mask
              </button>
              <button
                className={`tool-btn ${currentTool === EDITING_TOOLS.INPAINT ? 'active' : ''}`}
                onClick={() => handleToolChange(EDITING_TOOLS.INPAINT)}
              >
                <Icon name="heal" size={16} color="currentColor" />
                Inpaint
              </button>
            </div>
          </div>

          {/* Tool-specific controls */}
          {currentTool === EDITING_TOOLS.CROP && cropMode && (
            <div className="tool-controls">
              <h4>Crop Controls</h4>
              <button className="btn btn-primary" onClick={applyCrop}>
                Apply Crop
              </button>
            </div>
          )}

          {currentTool === EDITING_TOOLS.ROTATE && (
            <div className="tool-controls">
              <h4>Rotation</h4>
              <div className="rotate-buttons">
                <button className="btn btn-secondary" onClick={() => applyRotation(-90)}>
                  <Icon name="rotate" size={14} color="currentColor" style={{transform: 'scaleX(-1)'}} />
                  -90°
                </button>
                <button className="btn btn-secondary" onClick={() => applyRotation(90)}>
                  <Icon name="rotate" size={14} color="currentColor" />
                  +90°
                </button>
              </div>
            </div>
          )}

          {(currentTool === EDITING_TOOLS.MASK || currentTool === EDITING_TOOLS.INPAINT) && maskMode && (
            <div className="tool-controls">
              <h4>{currentTool === EDITING_TOOLS.INPAINT ? 'Inpaint' : 'Mask'} Mode</h4>
              <p>Draw on the image to create a mask</p>
              {currentTool === EDITING_TOOLS.INPAINT && (
                <button className="btn btn-primary" onClick={handleInpaint}>
                  Apply Inpainting
                </button>
              )}
            </div>
          )}

          {/* Adjustments */}
          <div className="tool-section">
            <h3>Adjustments</h3>
            
            <div className="adjustment-control">
              <label>Brightness</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={brightness}
                onChange={(e) => applyAdjustment('brightness', parseInt(e.target.value))}
              />
              <span>{brightness}</span>
            </div>
            
            <div className="adjustment-control">
              <label>Contrast</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={contrast}
                onChange={(e) => applyAdjustment('contrast', parseInt(e.target.value))}
              />
              <span>{contrast}</span>
            </div>
            
            <div className="adjustment-control">
              <label>Saturation</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={saturation}
                onChange={(e) => applyAdjustment('saturation', parseInt(e.target.value))}
              />
              <span>{saturation}</span>
            </div>
            
            <button className="btn btn-secondary reset-btn" onClick={resetAdjustments}>
              Reset All
            </button>
          </div>

          {/* Filters */}
          <div className="tool-section">
            <h3>Filters</h3>
            <div className="filter-grid">
              {Object.entries(FILTERS).map(([key, filter]) => (
                <button
                  key={key}
                  className={`filter-btn ${currentFilter === key ? 'active' : ''}`}
                  onClick={() => applyFilter(key)}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="portrait-canvas-area">
          <canvas
            ref={canvasRef}
            className="portrait-canvas"
          />
          
          {!currentImage && (
            <div className="canvas-placeholder">
              <p>Upload an image to start editing</p>
              <label htmlFor="image-upload" className="btn btn-primary">
                <Icon name="upload" size={16} color="currentColor" />
                Choose Image
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {(isLoading || isBeautifying) && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>{isBeautifying ? 'Applying AI beautification...' : 'Loading...'}</p>
        </div>
      )}
    </div>
  );
});

export default PortraitStudio;
