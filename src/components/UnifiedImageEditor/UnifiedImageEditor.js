import React, { useState, useCallback, useEffect } from 'react';
import { createStore } from 'polotno/model/store';

// Import professional components
import ModalWrapper from './components/ModalWrapper';
import EditorHeader from './components/EditorHeader';
import EditorSidebar from './components/EditorSidebar';
import CanvasArea from './components/CanvasArea';

// Import services
import { useCredits } from './hooks/useCredits';
import { useInpainting } from './hooks/useInpainting';
import { useCanvasState } from './hooks/useCanvasState';

// Import theme
import { EDITOR_THEME } from './theme/editorTheme';

const UnifiedImageEditor = ({ 
  initialImage = null, 
  onSave = () => {}, 
  onClose = () => {},
  onExport = () => {},
  returnTo = 'flyerpro'
}) => {
  // Core state
  const [store] = useState(() => createStore({ width: 800, height: 600 }));
  const [currentMode, setCurrentMode] = useState('design');
  const [isLoading, setIsLoading] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Custom hooks
  const { credits, deductCredits, checkBalance } = useCredits();
  const { processInpainting, isProcessing: inpaintProcessing } = useInpainting(store);
  const { saveState } = useCanvasState(store);

  // Initialize with initial image if provided
  useEffect(() => {
    if (initialImage) {
      loadImageToCanvas(initialImage);
    }
  }, [initialImage, loadImageToCanvas]);

  const loadImageToCanvas = useCallback(async (imageSource) => {
    setIsLoading(true);
    
    try {
      const page = store.pages[0];
      
      // If it's a File object, convert to data URL
      if (imageSource instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          page.addElement({
            type: 'image',
            src: e.target.result,
            x: 50,
            y: 50,
            width: 700,
            height: 500
          });
          setHasImage(true);
        };
        reader.readAsDataURL(imageSource);
      } else {
        // Direct URL
        page.addElement({
          type: 'image',
          src: imageSource,
          x: 50,
          y: 50,
          width: 700,
          height: 500
        });
        setHasImage(true);
      }
      
      saveState();
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [store, saveState]);

  const handleFileUpload = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      loadImageToCanvas(file);
    }
  }, [loadImageToCanvas]);

  const handleModeChange = useCallback((newMode) => {
    setCurrentMode(newMode);
  }, []);

  const handleAIProcess = useCallback(async (operation, options = {}) => {
    const requiredCredits = options.cost || 5;
    
    if (!checkBalance(requiredCredits)) {
      alert('Insufficient credits for this operation');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await deductCredits(requiredCredits, operation);
      
      // Save state for undo/redo
      saveState();
      
      console.log(`AI ${operation} completed successfully`);
    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkBalance, deductCredits, saveState]);

  const handleInpainting = useCallback(async (operation, options = {}) => {
    const requiredCredits = options.cost || 3;
    
    if (!checkBalance(requiredCredits)) {
      alert('Insufficient credits for inpainting');
      return;
    }

    try {
      setIsLoading(true);
      await processInpainting(operation, options);
      await deductCredits(requiredCredits, 'inpainting');
      saveState();
      console.log('Inpainting completed');
    } catch (error) {
      console.error('Inpainting error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkBalance, deductCredits, processInpainting, saveState]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const dataURL = await store.toDataURL();
      onSave(dataURL);
      console.log('Image saved successfully');
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [store, onSave]);

  const handleExport = useCallback(async (format = 'png', quality = 1) => {
    setIsLoading(true);
    
    try {
      const dataURL = await store.toDataURL({ 
        mimeType: `image/${format}`,
        quality 
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `edited-image.${format}`;
      link.href = dataURL;
      link.click();
      
      onExport(dataURL);
      console.log('Export completed');
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [store, onExport]);

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  }, [handleFileUpload]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => onClose(), 200); // Small delay for animation
  }, [onClose]);

  return (
    <ModalWrapper 
      isOpen={isModalOpen}
      onClose={handleModalClose}
      title="Advanced Image Editor"
      maxWidth="95vw"
      maxHeight="95vh"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          fontFamily: EDITOR_THEME.typography.fontFamily,
        }}
      >
        {/* Header */}
        <EditorHeader
          credits={credits}
          onUpload={handleUpload}
          onSave={handleSave}
          onExport={handleExport}
          onClose={handleModalClose}
          isLoading={isLoading}
          canSave={hasImage}
          canExport={hasImage}
        />

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            height: 'calc(100vh - 200px)', // Adjust based on header height
            overflow: 'hidden',
          }}
        >
          {/* Sidebar */}
          <EditorSidebar
            currentMode={currentMode}
            onModeChange={handleModeChange}
            credits={credits}
            onAIProcess={handleAIProcess}
            onInpaint={handleInpainting}
            isProcessing={isLoading || inpaintProcessing}
          />

          {/* Canvas Area */}
          <CanvasArea
            store={store}
            currentMode={currentMode}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            hasImage={hasImage}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UnifiedImageEditor;