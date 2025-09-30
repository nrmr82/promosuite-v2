"""
PromoSuite AI Backend - FastAPI microservice for image enhancement and layout optimization
Provides endpoints for AI portrait beautification and flyer layout auto-adjustment
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
import base64
import io
import json
import logging
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="PromoSuite AI Backend",
    description="AI-powered image enhancement and layout optimization service",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request/Response Models
class BeautifyRequest(BaseModel):
    image: str  # Base64 encoded image
    options: Dict[str, Any] = {
        "enhance_face": True,
        "smooth_skin": True,
        "brighten_eyes": True,
        "enhance_lips": False
    }

class BeautifyResponse(BaseModel):
    enhanced_image: str  # Base64 encoded enhanced image
    processing_time: float
    enhancements_applied: Dict[str, bool]

class LayoutOptimizationRequest(BaseModel):
    layout: Dict[str, Any]  # Polotno JSON layout
    type: str = "flyer"  # "flyer" or "card"
    optimization_level: str = "standard"  # "minimal", "standard", "aggressive"

class LayoutOptimizationResponse(BaseModel):
    data: Dict[str, Any]  # Optimized Polotno JSON layout
    changes_made: list
    optimization_score: float

class InpaintRequest(BaseModel):
    image: str  # Base64 encoded image
    mask: str   # Base64 encoded mask
    prompt: str = "remove object and fill with background"

class InpaintResponse(BaseModel):
    inpainted_image: str  # Base64 encoded result
    processing_time: float

# Authentication helper
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate JWT token and return user info
    In production, this would validate against your auth service
    """
    token = credentials.credentials
    # For demo purposes, accept any token
    # In production, validate JWT token here
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    return {"user_id": "demo_user", "credits": 100}

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "PromoSuite AI Backend"
    }

# AI Portrait Beautification Endpoint
@app.post("/api/beautify", response_model=BeautifyResponse)
async def beautify_portrait(
    request: BeautifyRequest,
    user: dict = Depends(get_current_user)
):
    """
    AI-powered portrait beautification using GFPGAN or CodeFormer
    """
    try:
        logger.info(f"Beautification request from user {user['user_id']}")
        
        # Decode base64 image
        image_data = base64.b64decode(request.image.split(',')[1])  # Remove data:image/png;base64,
        
        # For demo purposes, we'll simulate processing
        # In production, integrate with GFPGAN or CodeFormer here
        import time
        processing_start = time.time()
        
        # Simulate AI processing time
        time.sleep(2)  # Remove in production
        
        # For demo, return the same image (in production, return enhanced image)
        enhanced_image_b64 = request.image
        
        processing_time = time.time() - processing_start
        
        # Track enhancements applied
        enhancements_applied = {
            "face_enhancement": request.options.get("enhance_face", True),
            "skin_smoothing": request.options.get("smooth_skin", True),
            "eye_brightening": request.options.get("brighten_eyes", True),
            "lip_enhancement": request.options.get("enhance_lips", False)
        }
        
        logger.info(f"Beautification completed in {processing_time:.2f}s")
        
        return BeautifyResponse(
            enhanced_image=enhanced_image_b64,
            processing_time=processing_time,
            enhancements_applied=enhancements_applied
        )
        
    except Exception as e:
        logger.error(f"Beautification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Portrait beautification failed")

# AI Layout Optimization Endpoint
@app.post("/api/optimize-layout", response_model=LayoutOptimizationResponse)
async def optimize_layout(
    request: LayoutOptimizationRequest,
    user: dict = Depends(get_current_user)
):
    """
    AI-powered layout optimization for flyers using GPT-based heuristics
    """
    try:
        logger.info(f"Layout optimization request from user {user['user_id']}")
        
        layout = request.layout.copy()
        changes_made = []
        
        # Simple layout optimization rules
        # In production, use more sophisticated AI/ML models
        
        if "pages" in layout and layout["pages"]:
            page = layout["pages"][0]
            elements = page.get("children", [])
            
            optimized_elements = []
            y_offset = 50  # Start with some top margin
            
            for i, element in enumerate(elements):
                # Optimize text alignment
                if element.get("type") == "text":
                    # Center align titles and headers
                    if element.get("fontSize", 12) > 24:
                        element["align"] = "center"
                        changes_made.append(f"Centered title text: {element.get('text', '')[:30]}...")
                    
                    # Improve spacing between elements
                    if i > 0:
                        prev_element = optimized_elements[-1]
                        min_spacing = 20
                        if element["y"] - (prev_element["y"] + prev_element.get("height", 50)) < min_spacing:
                            element["y"] = prev_element["y"] + prev_element.get("height", 50) + min_spacing
                            changes_made.append("Improved element spacing")
                
                # Optimize shape positioning
                elif element.get("type") == "rect":
                    # Ensure shapes don't overlap with text
                    element["cornerRadius"] = max(element.get("cornerRadius", 0), 5)
                    changes_made.append("Improved shape corner radius")
                
                optimized_elements.append(element)
            
            page["children"] = optimized_elements
        
        # Calculate optimization score
        optimization_score = len(changes_made) * 0.1 + 0.7  # Simple scoring
        
        logger.info(f"Layout optimization completed with {len(changes_made)} changes")
        
        return LayoutOptimizationResponse(
            data=layout,
            changes_made=changes_made,
            optimization_score=min(optimization_score, 1.0)
        )
        
    except Exception as e:
        logger.error(f"Layout optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail="Layout optimization failed")

# AI Inpainting Endpoint
@app.post("/api/inpaint", response_model=InpaintResponse)
async def inpaint_image(
    request: InpaintRequest,
    user: dict = Depends(get_current_user)
):
    """
    AI-powered image inpainting for object removal
    """
    try:
        logger.info(f"Inpainting request from user {user['user_id']}")
        
        # Decode base64 images
        image_data = base64.b64decode(request.image.split(',')[1])
        mask_data = base64.b64decode(request.mask.split(',')[1])
        
        # For demo purposes, simulate processing
        # In production, integrate with inpainting model here
        import time
        processing_start = time.time()
        
        # Simulate AI processing time
        time.sleep(3)  # Remove in production
        
        # For demo, return the original image (in production, return inpainted image)
        inpainted_image_b64 = request.image
        
        processing_time = time.time() - processing_start
        
        logger.info(f"Inpainting completed in {processing_time:.2f}s")
        
        return InpaintResponse(
            inpainted_image=inpainted_image_b64,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Inpainting error: {str(e)}")
        raise HTTPException(status_code=500, detail="Image inpainting failed")

# Credits endpoint (for checking user credits)
@app.get("/api/credits")
async def get_user_credits(user: dict = Depends(get_current_user)):
    """Get current user's credit balance"""
    return {
        "credits": user.get("credits", 0),
        "user_id": user["user_id"]
    }

# Usage statistics endpoint
@app.get("/api/stats")
async def get_usage_stats():
    """Get service usage statistics"""
    return {
        "total_beautifications": 1234,
        "total_layout_optimizations": 567,
        "total_inpainting_operations": 89,
        "uptime": "99.9%",
        "avg_processing_time": {
            "beautification": 2.3,
            "layout_optimization": 0.8,
            "inpainting": 4.1
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)