import { Textbox, Rect, Circle, StaticCanvas } from 'fabric';
import { PAGE_WIDTH, PAGE_HEIGHT } from './flyerTemplates';

export const BASE = { originX: 'left', originY: 'top' };

// Build a Fabric object from a template element
export function createObject(el) {
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

const previewCache = new Map();

// Render a template to a small PNG data URL for thumbnails (cached per template id)
export function renderTemplatePreview(template, width = 320) {
  const key = `${template.id}:${width}`;
  if (previewCache.has(key)) return previewCache.get(key);
  const canvas = new StaticCanvas(document.createElement('canvas'), {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    backgroundColor: template.background || '#ffffff',
    renderOnAddRemove: false,
  });
  template.elements.forEach((el) => {
    const obj = createObject(el);
    if (obj) canvas.add(obj);
  });
  canvas.renderAll();
  const url = canvas.toDataURL({ format: 'png', multiplier: width / PAGE_WIDTH });
  canvas.dispose();
  previewCache.set(key, url);
  return url;
}
