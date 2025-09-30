import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

/**
 * Test component to verify Fabric.js works properly with React
 * This can be removed after testing
 */
const FabricIntegrationTest = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    let fabricCanvas = null;
    const results = [];

    try {
      // Test 1: Canvas initialization
      fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 300,
        backgroundColor: '#f0f0f0'
      });
      results.push('✅ Canvas initialization: SUCCESS');
      setCanvas(fabricCanvas);

      // Test 2: Add a simple rectangle
      const rect = new fabric.Rect({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        fill: '#e91e63'
      });
      fabricCanvas.add(rect);
      results.push('✅ Add rectangle: SUCCESS');

      // Test 3: Event listeners
      fabricCanvas.on('selection:created', () => {
        results.push('✅ Event listeners: SUCCESS');
        setTestResults([...results]);
      });

      // Test 4: Image loading test (optional)
      const testImageData = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="20" fill="#4CAF50"/>
        </svg>
      `);

      fabric.Image.fromURL(testImageData, (img) => {
        img.set({
          left: 200,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5
        });
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
        results.push('✅ Image loading: SUCCESS');
        setTestResults([...results]);
      });

      setTestResults([...results]);

    } catch (error) {
      results.push(`❌ Error: ${error.message}`);
      setTestResults([...results]);
    }

    // Cleanup
    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, []);

  const addTestCircle = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        left: Math.random() * 200 + 50,
        top: Math.random() * 150 + 50,
        radius: 30,
        fill: '#2196F3'
      });
      canvas.add(circle);
      canvas.renderAll();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3>Fabric.js + React Integration Test</h3>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />
          <div style={{ marginTop: '10px' }}>
            <button onClick={addTestCircle} style={{ 
              padding: '8px 16px', 
              backgroundColor: '#e91e63', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Add Circle (Test React Interaction)
            </button>
          </div>
        </div>
        
        <div>
          <h4>Test Results:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {testResults.map((result, index) => (
              <li key={index} style={{ 
                padding: '4px 0', 
                color: result.startsWith('✅') ? '#4CAF50' : '#f44336' 
              }}>
                {result}
              </li>
            ))}
          </ul>
          
          {testResults.length === 0 && (
            <p style={{ color: '#666' }}>Running tests...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FabricIntegrationTest;