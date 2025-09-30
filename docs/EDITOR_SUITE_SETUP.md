# PromoSuite Professional Editor Suite Setup

This document provides complete setup instructions for the new integrated editor suite featuring professional flyer creation and portrait photo editing with AI capabilities.

## 🎯 Overview

The editor suite includes:

1. **Flyer Studio** - Professional flyer/card editor with Polotno integration
2. **Portrait Studio** - Advanced photo editor with manual tools + AI beautification
3. **Unified Modal Interface** - Seamless switching between editors
4. **AI Backend** - FastAPI microservice for AI-powered enhancements

## 🚀 Features

### Flyer Studio
- ✨ **AI Layout Optimization** - Intelligent spacing and alignment
- 📐 **Professional Templates** - Business, event, sale templates
- 🎨 **Polotno Integration** - Full Canva-style editing experience
- 💾 **Save/Export** - High-quality PNG/PDF export

### Portrait Studio
- 🖼️ **Manual Editing Tools** - Crop, rotate, adjust brightness/contrast/saturation
- 🎭 **Advanced Filters** - Sepia, B&W, vintage, blur, sharpen
- 🤖 **AI Beautification** - Face enhancement, skin smoothing
- 🩹 **AI Inpainting** - Object removal with background fill

### Unified Interface
- 🔄 **Mode Switching** - Toggle between flyer and portrait editing
- 🎨 **Consistent Theming** - Dark theme with pink (#e91e63) accents
- 📱 **Responsive Design** - Works on desktop, tablet, mobile
- ⚡ **Single-Color Icons** - Minimalist design throughout

## 📦 Installation

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd promosuite-v2
   npm install
   ```

2. **Verify Required Packages**
   The following packages should already be installed:
   - `polotno` - For flyer editing
   - `fabric` - For portrait canvas manipulation
   - `react-image-crop` - For cropping functionality
   - `html2canvas` - For canvas export

### Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Create Python Virtual Environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\\Scripts\\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start Backend Server**
   ```bash
   python main.py
   ```
   
   The backend will run on `http://localhost:8000`

### Development Server

1. **Start React Development Server**
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## 🎮 Usage

### Opening the Editor

1. Navigate to the **FlyerPro** page in your app
2. Click the **"Try Editor"** button in the Advanced Image Editor card
3. The unified editor modal will open with both editing modes available

### Flyer Studio Mode

1. **Templates**: Browse and select from professional templates
2. **AI Optimization**: Click "✨ Auto Layout" to optimize spacing and alignment
3. **Editing**: Use the sidebar panels for:
   - Templates and layouts
   - Text and elements
   - Photo uploads
4. **Save/Export**: Use header buttons to save or export as PNG

### Portrait Studio Mode

1. **Upload Image**: Click "📁 Upload Image" to load a photo
2. **Manual Tools**: 
   - **Crop**: Select crop tool, resize selection, apply
   - **Rotate**: Use -90°/+90° buttons
   - **Adjustments**: Use sliders for brightness, contrast, saturation
   - **Filters**: Apply various artistic filters
3. **AI Tools**:
   - **✨ AI Beautify**: Enhance faces with one click
   - **🩹 Inpaint**: Draw mask areas to remove objects
4. **Save/Export**: Save your edited photo or export as PNG

## 🔧 API Endpoints

The backend provides the following AI-powered endpoints:

### Portrait Beautification
```
POST /api/beautify
Authorization: Bearer <token>
Content-Type: application/json

{
  "image": "data:image/png;base64,<base64_image>",
  "options": {
    "enhance_face": true,
    "smooth_skin": true,
    "brighten_eyes": true,
    "enhance_lips": false
  }
}
```

### Layout Optimization  
```
POST /api/optimize-layout
Authorization: Bearer <token>
Content-Type: application/json

{
  "layout": {<polotno_json_layout>},
  "type": "flyer",
  "optimization_level": "standard"
}
```

### Image Inpainting
```
POST /api/inpaint
Authorization: Bearer <token>
Content-Type: application/json

{
  "image": "data:image/png;base64,<base64_image>",
  "mask": "data:image/png;base64,<base64_mask>",
  "prompt": "remove object and fill with background"
}
```

## 🎨 Theming

The editor suite uses your project's established design system:

- **Primary Color**: `#e91e63` (Pink)
- **Background**: `#1a1a1a` (Dark)
- **Text**: `#ffffff` (White primary), `#cccccc` (Secondary)
- **Cards/Panels**: `rgba(42, 42, 42, 0.6)`
- **Borders**: `rgba(51, 51, 51, 0.8)`

All components follow these colors for consistency with your existing PromoSuite interface.

## 🔮 Future AI Integration

To add real AI capabilities (currently simulated):

### For Portrait Beautification
1. Install PyTorch: `pip install torch torchvision`
2. Install GFPGAN: `pip install gfpgan`
3. Update the `/api/beautify` endpoint in `backend/main.py`
4. Download model weights and configure paths

### For Advanced Inpainting
1. Install diffusers: `pip install diffusers transformers`
2. Use Stable Diffusion inpainting models
3. Update the `/api/inpaint` endpoint
4. Configure GPU acceleration if available

## 📱 Mobile Support

The editor suite is fully responsive:

- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Optimized layout with touch-friendly controls  
- **Mobile**: Stacked layout with bottom navigation

## 🐛 Troubleshooting

### Common Issues

1. **Editor doesn't open**: Check browser console for JavaScript errors
2. **AI features fail**: Ensure backend is running on port 8000
3. **CORS errors**: Verify backend CORS settings include your frontend URL
4. **Upload failures**: Check file size limits and format support

### Debug Mode

Add to your environment for additional logging:
```bash
export DEBUG=true
```

## 📄 License Compliance

All integrated modules are MIT/Apache licensed:

- **Polotno**: MIT License
- **Fabric.js**: MIT License  
- **FastAPI**: MIT License
- **React**: MIT License

No closed-source SDKs or proprietary code is used.

## 🤝 Contributing

To add new features:

1. **New Tools**: Add to `EDITING_TOOLS` constant in PortraitStudio
2. **New Templates**: Add to `FLYER_TEMPLATES` array in FlyerStudio
3. **New AI Features**: Extend backend endpoints and frontend handlers
4. **New Icons**: Add to the `Icon` component in each editor

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify backend logs at `http://localhost:8000/health`
3. Test with the standalone editor components
4. Review network requests in browser dev tools

The editor suite is designed to be self-contained and easily debuggable for smooth development experience.