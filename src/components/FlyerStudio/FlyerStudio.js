import React, {
  useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle,
} from 'react';
import { Canvas, Textbox, Rect, Circle, Line, FabricImage } from 'fabric';
import { FLYER_TEMPLATES, PAGE_WIDTH, PAGE_HEIGHT } from './flyerTemplates';

import './FlyerStudio.css';

// Custom properties kept when the design is serialized
const EXTRA_PROPS = ['photoSlot', 'slotHint'];
const HISTORY_LIMIT = 50;
const FONTS = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Courier New', 'Impact'];

const BASE = { originX: 'left', originY: 'top' };

// Build a Fabric object from a template element
function createObject(el) {
  const { type, text, photoSlot, slotHint, ...props } = el;
  let obj;
  if (type === 'text') obj = new Textbox(text, { ...BASE, ...props });
  else if (type === 'rect') obj = new Rect({ ...BASE, ...props });
  else if (type === 'circle') obj = new Circle({ ...BASE, ...props });
  else return null;
  if (photoSlot) obj.photoSlot = true;
  if (slotHint) obj.slotHint = true;
  return obj;
}

function snapshotOf(obj) {
  if (!obj) return null;
  return {
    kind: obj.type === 'textbox' ? 'text' : obj.type,
    fill: typeof obj.fill === 'string' ? obj.fill : '#000000',
    stroke: obj.stroke || '',
    fontSize: obj.fontSize,
    fontFamily: obj.fontFamily,
    fontWeight: obj.fontWeight,
    fontStyle: obj.fontStyle,
    textAlign: obj.textAlign,
    opacity: obj.opacity ?? 1,
    photoSlot: !!obj.photoSlot,
  };
}

// <input type="color"> only accepts #rrggbb
function toHex(color) {
  if (typeof color !== 'string') return '#000000';
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) return `#${color.slice(1).split('').map((c) => c + c).join('')}`;
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) return `#${m.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  if (color === 'white') return '#ffffff';
  return '#000000';
}

const FlyerStudio = forwardRef(({
  initialTemplate = null,
  onSave = () => {},
  onClose = () => {},
  onExport = () => {},
}, ref) => {
  const hostRef = useRef(null);
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const historyRef = useRef({ stack: [], index: -1, paused: false });

  const [zoom, setZoom] = useState(0.6);
  const [selection, setSelection] = useState(null);
  const [background, setBackground] = useState('#ffffff');
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [templateId, setTemplateId] = useState(null);

  const updateHistoryState = () => {
    const h = historyRef.current;
    setHistoryState({ canUndo: h.index > 0, canRedo: h.index < h.stack.length - 1 });
  };

  const recordHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const h = historyRef.current;
    if (!canvas || h.paused) return;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(JSON.stringify(canvas.toObject(EXTRA_PROPS)));
    if (h.stack.length > HISTORY_LIMIT) h.stack.shift();
    h.index = h.stack.length - 1;
    updateHistoryState();
  }, []);

  const refreshSelection = useCallback(() => {
    setSelection(snapshotOf(canvasRef.current?.getActiveObject()));
  }, []);

  // Replace the whole design with serialized Fabric JSON
  const loadJSON = useCallback(async (json) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const h = historyRef.current;
    h.paused = true;
    await canvas.loadFromJSON(json);
    h.paused = false;
    setBackground(toHex(canvas.backgroundColor || '#ffffff'));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    refreshSelection();
  }, [refreshSelection]);

  const applyTemplate = useCallback((template) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const h = historyRef.current;
    h.paused = true;
    canvas.clear();
    canvas.backgroundColor = template.background || '#ffffff';
    template.elements.forEach((el) => {
      const obj = createObject(el);
      if (obj) canvas.add(obj);
    });
    h.paused = false;
    setBackground(toHex(canvas.backgroundColor));
    setTemplateId(template.id);
    canvas.requestRenderAll();
    refreshSelection();
    recordHistory();
  }, [recordHistory, refreshSelection]);

  // Create the Fabric canvas. The <canvas> element is created here so React
  // StrictMode's mount/unmount/mount never re-initializes a disposed element.
  useEffect(() => {
    const el = document.createElement('canvas');
    hostRef.current.appendChild(el);
    const canvas = new Canvas(el, {
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;

    const onChange = () => { recordHistory(); refreshSelection(); };
    canvas.on('object:added', onChange);
    canvas.on('object:modified', onChange);
    canvas.on('object:removed', onChange);
    canvas.on('selection:created', refreshSelection);
    canvas.on('selection:updated', refreshSelection);
    canvas.on('selection:cleared', refreshSelection);

    if (initialTemplate?.objects) {
      loadJSON(initialTemplate).then(recordHistory);
    } else if (initialTemplate?.elements) {
      applyTemplate(initialTemplate);
    } else {
      applyTemplate(FLYER_TEMPLATES.find((t) => t.id === 'just-listed'));
    }

    return () => {
      canvasRef.current = null;
      historyRef.current = { stack: [], index: -1, paused: false };
      canvas.dispose();
      el.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the displayed size in sync with zoom; the design stays PAGE_WIDTH x PAGE_HEIGHT
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setDimensions({ width: PAGE_WIDTH * zoom, height: PAGE_HEIGHT * zoom });
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
  }, [zoom]);

  const fitToScreen = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const z = Math.min((vp.clientWidth - 48) / PAGE_WIDTH, (vp.clientHeight - 48) / PAGE_HEIGHT);
    setZoom(Math.max(0.2, Math.min(2, Number(z.toFixed(2)))));
  }, []);

  useEffect(() => { fitToScreen(); }, [fitToScreen]);

  // ---- Adding content ----
  const addObject = useCallback((obj) => {
    const canvas = canvasRef.current;
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }, []);

  const addText = (preset) => {
    const presets = {
      heading: { text: 'Add a heading', fontSize: 56, fontWeight: 'bold' },
      subheading: { text: 'Add a subheading', fontSize: 32, fontWeight: 'normal' },
      body: { text: 'Add some body text', fontSize: 22, fontWeight: 'normal' },
    };
    const p = presets[preset];
    addObject(new Textbox(p.text, {
      ...BASE, left: 100, top: 100, width: 600, fontSize: p.fontSize, fontWeight: p.fontWeight,
      fill: '#0f172a', fontFamily: 'Arial', textAlign: 'center',
    }));
  };

  const addShape = (shape) => {
    if (shape === 'rect') addObject(new Rect({ ...BASE, left: 250, top: 350, width: 300, height: 200, fill: '#e91e63' }));
    if (shape === 'circle') addObject(new Circle({ ...BASE, left: 300, top: 350, radius: 100, fill: '#0ea5e9' }));
    if (shape === 'line') addObject(new Line([100, 500, 700, 500], { ...BASE, stroke: '#0f172a', strokeWidth: 4 }));
    if (shape === 'photo') {
      addObject(Object.assign(
        new Rect({ ...BASE, left: 150, top: 300, width: 500, height: 350, fill: '#e2e8f0' }),
        { photoSlot: true },
      ));
    }
  };

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const canvas = canvasRef.current;
    const img = await FabricImage.fromURL(dataUrl);
    const slot = canvas.getActiveObject();

    if (slot?.photoSlot) {
      // Cover the slot, cropping the overflow
      const w = slot.getScaledWidth();
      const hgt = slot.getScaledHeight();
      const scale = Math.max(w / img.width, hgt / img.height);
      const cropW = w / scale;
      const cropH = hgt / scale;
      img.set({
        ...BASE,
        left: slot.left,
        top: slot.top,
        cropX: (img.width - cropW) / 2,
        cropY: (img.height - cropH) / 2,
        width: cropW,
        height: cropH,
        scaleX: scale,
        scaleY: scale,
      });
      // Remove the slot and the "select this box" hint text sitting on it
      const inSlot = (o) => {
        const c = o.getCenterPoint();
        return c.x >= slot.left && c.x <= slot.left + w && c.y >= slot.top && c.y <= slot.top + hgt;
      };
      const hints = canvas.getObjects().filter((o) => o.slotHint && inSlot(o));
      const index = canvas.getObjects().indexOf(slot);
      historyRef.current.paused = true;
      canvas.remove(slot, ...hints);
      historyRef.current.paused = false;
      canvas.insertAt(index, img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    } else {
      const scale = Math.min(1, (PAGE_WIDTH * 0.8) / img.width, (PAGE_HEIGHT * 0.6) / img.height);
      img.set({
        ...BASE,
        scaleX: scale,
        scaleY: scale,
        left: (PAGE_WIDTH - img.width * scale) / 2,
        top: (PAGE_HEIGHT - img.height * scale) / 2,
      });
      addObject(img);
    }
  };

  // ---- Editing the selection ----
  const updateSelected = (props) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.set(props);
    obj.setCoords();
    canvas.requestRenderAll();
    recordHistory();
    refreshSelection();
  };

  const alignSelected = (where) => {
    const obj = canvasRef.current?.getActiveObject();
    if (!obj) return;
    const w = obj.getScaledWidth();
    const left = where === 'left' ? 0 : where === 'right' ? PAGE_WIDTH - w : (PAGE_WIDTH - w) / 2;
    updateSelected({ left });
  };

  const arrange = (direction) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    if (direction === 'forward') canvas.bringObjectForward(obj);
    if (direction === 'backward') canvas.sendObjectBackwards(obj);
    if (direction === 'front') canvas.bringObjectToFront(obj);
    if (direction === 'back') canvas.sendObjectToBack(obj);
    canvas.requestRenderAll();
    recordHistory();
  };

  const duplicateSelected = async () => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    const copy = await obj.clone(EXTRA_PROPS);
    copy.set({ left: obj.left + 20, top: obj.top + 20 });
    addObject(copy);
  };

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    const objs = canvas?.getActiveObjects() || [];
    if (!objs.length) return;
    historyRef.current.paused = true;
    objs.forEach((o) => canvas.remove(o));
    historyRef.current.paused = false;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    recordHistory();
    refreshSelection();
  }, [recordHistory, refreshSelection]);

  const changeBackground = (color) => {
    const canvas = canvasRef.current;
    canvas.backgroundColor = color;
    setBackground(color);
    canvas.requestRenderAll();
    recordHistory();
  };

  // ---- History ----
  const stepHistory = useCallback(async (delta) => {
    const h = historyRef.current;
    const next = h.index + delta;
    if (next < 0 || next >= h.stack.length) return;
    h.index = next;
    await loadJSON(JSON.parse(h.stack[next]));
    updateHistoryState();
  }, [loadJSON]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKeyDown = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (canvas.getActiveObject()?.isEditing) return;

      const mod = e.ctrlKey || e.metaKey;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvas.getActiveObject()) { e.preventDefault(); deleteSelected(); }
      } else if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        stepHistory(e.shiftKey ? 1 : -1);
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        stepHistory(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelected, stepHistory]);

  // ---- Output ----
  const renderImage = useCallback((format = 'png', quality = 1) => {
    const canvas = canvasRef.current;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    // Export at 2x the page size regardless of the on-screen zoom
    return canvas.toDataURL({ format, quality, multiplier: 2 / canvas.getZoom() });
  }, []);

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave({
      image: renderImage('png'),
      data: canvas.toObject(EXTRA_PROPS),
      template: templateId,
    });
  }, [onSave, renderImage, templateId]);

  const handleExport = useCallback(async (format = 'png', quality = 1) => {
    if (!canvasRef.current) return;
    const dataURL = renderImage(format, quality);
    const link = document.createElement('a');
    link.download = `flyer.${format === 'jpeg' ? 'jpg' : format}`;
    link.href = dataURL;
    link.click();
    onExport(dataURL);
  }, [onExport, renderImage]);

  useImperativeHandle(ref, () => ({
    handleSave,
    handleExport,
    get canvas() { return canvasRef.current; },
  }), [handleSave, handleExport]);

  const isText = selection?.kind === 'text';

  return (
    <div className="flyer-studio">
      <div className="flyer-studio-header">
        <div className="header-left">
          <h2>Flyer Studio</h2>
          <div className="header-actions">
            <button className="fs-btn" onClick={() => stepHistory(-1)} disabled={!historyState.canUndo} title="Undo (Ctrl+Z)">↶ Undo</button>
            <button className="fs-btn" onClick={() => stepHistory(1)} disabled={!historyState.canRedo} title="Redo (Ctrl+Y)">↷ Redo</button>
            <span className="fs-divider" />
            <button className="fs-btn" onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))} title="Zoom out">−</button>
            <span className="fs-zoom">{Math.round(zoom * 100)}%</span>
            <button className="fs-btn" onClick={() => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(2))))} title="Zoom in">+</button>
            <button className="fs-btn" onClick={fitToScreen}>Fit</button>
            <span className="fs-divider" />
            <button className="fs-btn fs-btn-primary" onClick={() => handleExport('png')}>Export PNG</button>
          </div>
        </div>
        <div className="header-right">
          <button className="fs-btn fs-btn-primary" onClick={handleSave}>Save</button>
          <button className="fs-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="flyer-studio-content">
        {/* Left: add content */}
        <aside className="fs-panel fs-panel-left">
          <section>
            <h4>Templates</h4>
            <div className="fs-template-grid">
              {FLYER_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  className={`fs-template ${templateId === t.id ? 'active' : ''}`}
                  style={{ background: t.background }}
                  onClick={() => applyTemplate(t)}
                  title={`Start from ${t.name}`}
                >
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <h4>Text</h4>
            <button className="fs-add fs-add-heading" onClick={() => addText('heading')}>Add heading</button>
            <button className="fs-add fs-add-sub" onClick={() => addText('subheading')}>Add subheading</button>
            <button className="fs-add" onClick={() => addText('body')}>Add body text</button>
          </section>
          <section>
            <h4>Shapes</h4>
            <div className="fs-row">
              <button className="fs-btn" onClick={() => addShape('rect')}>▭ Box</button>
              <button className="fs-btn" onClick={() => addShape('circle')}>◯ Circle</button>
              <button className="fs-btn" onClick={() => addShape('line')}>― Line</button>
            </div>
          </section>
          <section>
            <h4>Photos</h4>
            <button className="fs-btn fs-btn-block" onClick={() => fileInputRef.current?.click()}>Upload photo</button>
            <button className="fs-btn fs-btn-block" onClick={() => addShape('photo')}>Add photo slot</button>
            <p className="fs-hint">Select a photo slot before uploading to fill it.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { handleImageFile(e.target.files[0]); e.target.value = ''; }}
            />
          </section>
        </aside>

        {/* Center: page */}
        <div className="fs-viewport" ref={viewportRef}>
          <div className="flyer-canvas-host" ref={hostRef} />
        </div>

        {/* Right: properties */}
        <aside className="fs-panel fs-panel-right">
          {!selection ? (
            <section>
              <h4>Page</h4>
              <label className="fs-field">
                <span>Background</span>
                <input type="color" value={background} onChange={(e) => changeBackground(e.target.value)} />
              </label>
              <p className="fs-hint">Click an element on the page to edit it. Double-click text to type.</p>
            </section>
          ) : (
            <>
              <section>
                <h4>{isText ? 'Text' : selection.photoSlot ? 'Photo slot' : selection.kind === 'image' ? 'Photo' : 'Shape'}</h4>
                {selection.kind !== 'image' && selection.kind !== 'line' && (
                  <label className="fs-field">
                    <span>{isText ? 'Color' : 'Fill'}</span>
                    <input type="color" value={toHex(selection.fill)} onChange={(e) => updateSelected({ fill: e.target.value })} />
                  </label>
                )}
                {(selection.kind === 'line' || selection.stroke) && (
                  <label className="fs-field">
                    <span>Outline</span>
                    <input type="color" value={toHex(selection.stroke)} onChange={(e) => updateSelected({ stroke: e.target.value })} />
                  </label>
                )}
                {isText && (
                  <>
                    <label className="fs-field">
                      <span>Font</span>
                      <select value={selection.fontFamily} onChange={(e) => updateSelected({ fontFamily: e.target.value })}>
                        {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </label>
                    <label className="fs-field">
                      <span>Size</span>
                      <input
                        type="number"
                        min="8"
                        max="200"
                        value={Math.round(selection.fontSize)}
                        onChange={(e) => updateSelected({ fontSize: Math.max(8, Number(e.target.value) || 8) })}
                      />
                    </label>
                    <div className="fs-row">
                      <button
                        className={`fs-btn ${selection.fontWeight === 'bold' ? 'active' : ''}`}
                        onClick={() => updateSelected({ fontWeight: selection.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      ><b>B</b></button>
                      <button
                        className={`fs-btn ${selection.fontStyle === 'italic' ? 'active' : ''}`}
                        onClick={() => updateSelected({ fontStyle: selection.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      ><i>I</i></button>
                      {['left', 'center', 'right'].map((a) => (
                        <button
                          key={a}
                          className={`fs-btn ${selection.textAlign === a ? 'active' : ''}`}
                          onClick={() => updateSelected({ textAlign: a })}
                          title={`Align text ${a}`}
                        >{a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}</button>
                      ))}
                    </div>
                  </>
                )}
                <label className="fs-field">
                  <span>Opacity</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={selection.opacity}
                    onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
                  />
                </label>
              </section>
              <section>
                <h4>Position</h4>
                <div className="fs-row">
                  <button className="fs-btn" onClick={() => alignSelected('left')}>Left</button>
                  <button className="fs-btn" onClick={() => alignSelected('center')}>Center</button>
                  <button className="fs-btn" onClick={() => alignSelected('right')}>Right</button>
                </div>
                <div className="fs-row">
                  <button className="fs-btn" onClick={() => arrange('front')} title="Bring to front">⤒ Front</button>
                  <button className="fs-btn" onClick={() => arrange('forward')} title="Bring forward">↑</button>
                  <button className="fs-btn" onClick={() => arrange('backward')} title="Send backward">↓</button>
                  <button className="fs-btn" onClick={() => arrange('back')} title="Send to back">⤓ Back</button>
                </div>
              </section>
              <section>
                <div className="fs-row">
                  <button className="fs-btn" onClick={duplicateSelected}>Duplicate</button>
                  <button className="fs-btn fs-btn-danger" onClick={deleteSelected}>Delete</button>
                </div>
              </section>
            </>
          )}
        </aside>
      </div>
    </div>
  );
});

export default FlyerStudio;
