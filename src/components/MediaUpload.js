import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Image,
  Video,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Copy
} from 'lucide-react';
import { uploadFile, getPublicUrl, BUCKETS } from '../utils/supabase';
import { getCurrentUser } from '../utils/supabase';
import './MediaUpload.css';

const MediaUpload = ({ 
  type = 'all', // 'image', 'video', 'all'
  multiple = true,
  maxSize = 10, // MB
  onUploadComplete,
  onUploadError,
  currentProduct = 'flyerpro'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const acceptedTypes = {
    image: {
      accept: 'image/*',
      types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    video: {
      accept: 'video/*',
      types: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
      extensions: ['.mp4', '.avi', '.mov', '.wmv', '.webm']
    },
    all: {
      accept: 'image/*,video/*',
      types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.avi', '.mov', '.wmv', '.webm']
    }
  };

  const validateFile = (file) => {
    const config = acceptedTypes[type];
    const errors = [];

    // Check file type
    if (!config.types.includes(file.type)) {
      errors.push('File type not supported');
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      errors.push(`File size must be less than ${maxSize}MB`);
    }

    return errors;
  };

  const generateFileName = (file, userId) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${userId}/${currentProduct}/${timestamp}_${random}.${extension}`;
  };

  const uploadFiles = useCallback(async (files) => {
    setUploading(true);
    const user = await getCurrentUser();
    
    if (!user) {
      if (onUploadError) onUploadError('User not authenticated');
      setUploading(false);
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const fileId = Math.random().toString(36).substring(2, 15);
      const uploadItem = {
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        error: null,
        url: null,
        publicUrl: null
      };

      setUploads(prev => [...prev, uploadItem]);

      try {
        // Validate file
        const errors = validateFile(file);
        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }

        // Generate file path
        const filePath = generateFileName(file, user.id);
        
        // Determine bucket based on file type and product
        const bucket = file.type.startsWith('image/') ? BUCKETS.USER_UPLOADS : BUCKETS.USER_UPLOADS;

        // Upload file to Supabase Storage
        const uploadResult = await uploadFile(bucket, filePath, file);
        
        // Get public URL
        const publicUrl = getPublicUrl(bucket, filePath);

        // Update upload status
        setUploads(prev => prev.map(item => 
          item.id === fileId 
            ? { 
                ...item, 
                status: 'complete', 
                progress: 100, 
                url: uploadResult.path,
                publicUrl: publicUrl 
              }
            : item
        ));

        // Save to media database (you'll need to create this table)
        const mediaRecord = {
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          public_url: publicUrl,
          bucket: bucket,
          product: currentProduct,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        };

        // You would save to a 'media' table here
        console.log('Media record to save:', mediaRecord);

        if (onUploadComplete) {
          onUploadComplete({
            ...uploadItem,
            status: 'complete',
            publicUrl: publicUrl,
            mediaRecord: mediaRecord
          });
        }

        return { success: true, item: uploadItem, mediaRecord };

      } catch (error) {
        console.error('Upload error:', error);
        
        setUploads(prev => prev.map(item => 
          item.id === fileId 
            ? { ...item, status: 'error', error: error.message }
            : item
        ));

        if (onUploadError) onUploadError(error.message);
        return { success: false, error: error.message };
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
  }, [type, maxSize, currentProduct, onUploadComplete, onUploadError]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(multiple ? files : files.slice(0, 1));
    }
  }, [multiple, uploadFiles]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      uploadFiles(files);
    }
  };

  const removeUpload = (uploadId) => {
    setUploads(prev => prev.filter(item => item.id !== uploadId));
  };

  const retryUpload = (uploadId) => {
    const upload = uploads.find(item => item.id === uploadId);
    if (upload) {
      uploadFiles([upload.file]);
      removeUpload(uploadId);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
    console.log('URL copied to clipboard:', url);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image size={20} />;
    } else if (fileType.startsWith('video/')) {
      return <Video size={20} />;
    }
    return <File size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="media-upload">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload files by clicking or dragging and dropping"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="upload-content">
          <div className="upload-icon" aria-hidden="true">
            {type === 'image' ? <Image size={32} /> : 
             type === 'video' ? <Video size={32} /> : 
             <Upload size={32} />}
          </div>
          
          <div className="upload-text">
            <h3>
              {dragActive 
                ? 'Drop files here' 
                : `Upload ${type === 'all' ? 'Media' : type === 'image' ? 'Images' : 'Videos'}`
              }
            </h3>
            <p>
              Drag and drop files here, or click to browse
            </p>
            <div className="upload-info">
              <span>Supported: {acceptedTypes[type].extensions.join(', ')}</span>
              <span>Max size: {maxSize}MB per file</span>
            </div>
          </div>

          <div className="upload-actions">
            <button className="upload-btn" type="button">
              <Plus size={16} />
              Choose Files
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes[type].accept}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="upload-progress">
          <div className="progress-header">
            <h4>
              {uploading ? 'Uploading...' : 'Upload Complete'}
              <span className="upload-count">({uploads.length})</span>
            </h4>
            {!uploading && (
              <button 
                className="clear-btn" 
                onClick={() => setUploads([])}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="upload-list">
            {uploads.map((upload) => (
              <div key={upload.id} className={`upload-item ${upload.status}`}>
                <div className="item-icon">
                  {getFileIcon(upload.type)}
                </div>

                <div className="item-info">
                  <div className="item-name">{upload.name}</div>
                  <div className="item-meta">
                    <span className="file-size">{formatFileSize(upload.size)}</span>
                    <span className="file-type">{upload.type}</span>
                  </div>
                </div>

                <div className="item-status">
                  {upload.status === 'uploading' && (
                    <div className="status-uploading">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                  
                  {upload.status === 'complete' && (
                    <div className="status-complete">
                      <CheckCircle size={16} />
                      <span>Complete</span>
                    </div>
                  )}
                  
                  {upload.status === 'error' && (
                    <div className="status-error">
                      <AlertCircle size={16} />
                      <span>{upload.error}</span>
                    </div>
                  )}
                </div>

                <div className="item-actions">
                  {upload.status === 'complete' && upload.publicUrl && (
                    <>
                      <button 
                        className="action-btn"
                        onClick={() => window.open(upload.publicUrl, '_blank')}
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => copyUrl(upload.publicUrl)}
                        title="Copy URL"
                      >
                        <Copy size={14} />
                      </button>
                    </>
                  )}
                  
                  {upload.status === 'error' && (
                    <button 
                      className="action-btn retry"
                      onClick={() => retryUpload(upload.id)}
                      title="Retry"
                    >
                      <Upload size={14} />
                    </button>
                  )}
                  
                  <button 
                    className="action-btn delete"
                    onClick={() => removeUpload(upload.id)}
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
