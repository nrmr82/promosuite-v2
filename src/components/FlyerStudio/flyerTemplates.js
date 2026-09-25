// Starter flyer templates for FlyerStudio. Coordinates are in page pixels
// (PAGE_WIDTH x PAGE_HEIGHT). Rects with photoSlot: true are placeholders that an
// uploaded photo fills when the slot is selected.

export const PAGE_WIDTH = 800;
export const PAGE_HEIGHT = 1000;

const PINK = '#e91e63';
const NAVY = '#0f172a';

export const FLYER_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    background: '#ffffff',
    elements: [],
  },
  {
    id: 'just-listed',
    name: 'Just Listed',
    background: '#ffffff',
    elements: [
      { type: 'rect', left: 0, top: 0, width: 800, height: 150, fill: NAVY },
      { type: 'text', text: 'JUST LISTED', left: 40, top: 38, width: 720, fontSize: 64, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'rect', left: 40, top: 180, width: 720, height: 420, fill: '#e2e8f0', photoSlot: true },
      { type: 'text', text: 'Property photo: select this box, then upload', slotHint: true, left: 40, top: 375, width: 720, fontSize: 22, fill: '#64748b', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'text', text: '$725,000', left: 40, top: 630, width: 720, fontSize: 56, fontWeight: 'bold', fill: PINK, textAlign: 'center', fontFamily: 'Arial' },
      { type: 'text', text: '123 Maple Street, Springfield', left: 40, top: 705, width: 720, fontSize: 30, fill: NAVY, textAlign: 'center', fontFamily: 'Arial' },
      { type: 'text', text: '4 Beds  •  3 Baths  •  2,450 sq ft', left: 40, top: 755, width: 720, fontSize: 26, fill: '#475569', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'rect', left: 0, top: 870, width: 800, height: 130, fill: PINK },
      { type: 'text', text: 'Jane Agent  |  (555) 123-4567  |  jane@realty.com', left: 40, top: 918, width: 720, fontSize: 24, fill: '#ffffff', textAlign: 'center', fontFamily: 'Arial' },
    ],
  },
  {
    id: 'open-house',
    name: 'Open House',
    background: '#fdf2f8',
    elements: [
      { type: 'text', text: 'OPEN HOUSE', left: 40, top: 50, width: 720, fontSize: 80, fontWeight: 'bold', fill: PINK, textAlign: 'center', fontFamily: 'Georgia' },
      { type: 'text', text: 'Saturday, June 14  •  1 PM – 4 PM', left: 40, top: 160, width: 720, fontSize: 30, fill: NAVY, textAlign: 'center', fontFamily: 'Arial' },
      { type: 'rect', left: 60, top: 230, width: 680, height: 400, fill: '#fbcfe8', rx: 16, ry: 16, photoSlot: true },
      { type: 'text', text: 'Property photo: select this box, then upload', slotHint: true, left: 60, top: 415, width: 680, fontSize: 22, fill: '#9d174d', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'text', text: '48 Ocean View Drive', left: 40, top: 665, width: 720, fontSize: 40, fontWeight: 'bold', fill: NAVY, textAlign: 'center', fontFamily: 'Georgia' },
      { type: 'text', text: 'Stunning 3 bed, 2 bath home with ocean views, updated kitchen and a private garden.', left: 90, top: 730, width: 620, fontSize: 24, fill: '#334155', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'circle', left: 355, top: 850, radius: 45, fill: NAVY },
      { type: 'text', text: 'Come say hello!', left: 40, top: 950, width: 720, fontSize: 22, fill: NAVY, textAlign: 'center', fontFamily: 'Arial' },
    ],
  },
  {
    id: 'just-sold',
    name: 'Just Sold',
    background: NAVY,
    elements: [
      { type: 'rect', left: 40, top: 40, width: 720, height: 920, fill: 'rgba(0,0,0,0)', stroke: '#fbbf24', strokeWidth: 4 },
      { type: 'text', text: 'JUST SOLD', left: 60, top: 90, width: 680, fontSize: 90, fontWeight: 'bold', fill: '#fbbf24', textAlign: 'center', fontFamily: 'Impact' },
      { type: 'rect', left: 100, top: 230, width: 600, height: 380, fill: '#1e293b', photoSlot: true },
      { type: 'text', text: 'Property photo: select this box, then upload', slotHint: true, left: 100, top: 405, width: 600, fontSize: 20, fill: '#94a3b8', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'text', text: 'Sold above asking in 7 days', left: 60, top: 650, width: 680, fontSize: 36, fill: '#ffffff', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'text', text: 'Thinking of selling? Let’s talk about what your home is worth.', left: 100, top: 720, width: 600, fontSize: 24, fill: '#cbd5e1', textAlign: 'center', fontFamily: 'Arial' },
      { type: 'text', text: 'Jane Agent  •  (555) 123-4567', left: 60, top: 870, width: 680, fontSize: 26, fontWeight: 'bold', fill: '#fbbf24', textAlign: 'center', fontFamily: 'Arial' },
    ],
  },
];
