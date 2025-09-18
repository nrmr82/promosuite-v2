import React, { useState, useRef } from 'react';
import {
  Download,
  Share2,
  FileImage,
  FileText,
  Mail,
  Twitter,
  Instagram,
  Linkedin,
  Link2,
  Printer,
  Settings,
  X,
  Check,
  Copy,
  Loader
} from 'lucide-react';
import './ExportModal.css';

const ExportModal = ({
  isOpen,
  onClose,
  elements = [],
  propertyData = {},
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedQuality, setSelectedQuality] = useState('high');
  const [selectedSize, setSelectedSize] = useState('letter');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [shareableLink, setShareableLink] = useState('');
  const [activeTab, setActiveTab] = useState('export');

  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Perfect for printing and professional sharing',
      icon: <FileText className="w-5 h-5" />,
      sizes: ['letter', 'a4', 'legal', 'custom'],
      qualities: ['standard', 'high', 'print'],
      recommended: true
    },
    {
      id: 'png',
      name: 'PNG',
      description: 'High quality image with transparent background',
      icon: <FileImage className="w-5 h-5" />,
      sizes: ['web', 'social', 'print', 'custom'],
      qualities: ['standard', 'high', 'ultra']
    },
    {
      id: 'jpg',
      name: 'JPEG',
      description: 'Compressed image, smaller file size',
      icon: <FileImage className="w-5 h-5" />,
      sizes: ['web', 'social', 'print', 'custom'],
      qualities: ['standard', 'high', 'ultra']
    }
  ];

  const paperSizes = {
    letter: { name: '8.5" × 11"', width: 2550, height: 3300 },
    a4: { name: 'A4 (8.3" × 11.7")', width: 2480, height: 3508 },
    legal: { name: '8.5" × 14"', width: 2550, height: 4200 },
    web: { name: '1200 × 1600', width: 1200, height: 1600 },
    social: { name: '1080 × 1080', width: 1080, height: 1080 },
    print: { name: '3000 × 4000', width: 3000, height: 4000 },
    custom: { name: 'Custom Size', width: 0, height: 0 }
  };

  const qualitySettings = {
    standard: { name: 'Standard (72 DPI)', dpi: 72, quality: 0.8 },
    high: { name: 'High (150 DPI)', dpi: 150, quality: 0.9 },
    ultra: { name: 'Ultra (300 DPI)', dpi: 300, quality: 1.0 },
    print: { name: 'Print Ready (300 DPI)', dpi: 300, quality: 1.0 }
  };

  const socialPlatforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: '#E4405F',
      sizes: ['1080x1080', '1080x1350']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: '#1DA1F2',
      sizes: ['1200x675', '1080x1080']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: '#0A66C2',
      sizes: ['1200x627', '1080x1080']
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the export function
      const exportData = {
        format: selectedFormat,
        quality: qualitySettings[selectedQuality],
        size: paperSizes[selectedSize],
        elements,
        propertyData
      };

      await onExport?.(exportData);

      // Complete progress
      setExportProgress(100);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleShareToPlatform = (platform) => {
    // Generate shareable content based on platform
    const shareText = `Check out this amazing property: ${propertyData.title || 'Beautiful Property'}`;
    const shareUrl = shareableLink || window.location.href;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleGenerateShareLink = async () => {
    // Simulate generating a shareable link
    const mockLink = `https://flyerpro.com/flyer/${Date.now()}`;
    setShareableLink(mockLink);
  };

  const handleCopyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
    }
  };

  const currentFormat = exportFormats.find(f => f.id === selectedFormat);

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="modal-header">
          <h2>Export & Share</h2>
          <button className="close-btn" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            className={`tab ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'export' && (
            <div className="export-tab">
              {/* Format Selection */}
              <div className="section">
                <h3>Choose Format</h3>
                <div className="format-grid">
                  {exportFormats.map((format) => (
                    <div
                      key={format.id}
                      className={`format-card ${selectedFormat === format.id ? 'selected' : ''}`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <div className="format-icon">
                        {format.icon}
                      </div>
                      <div className="format-info">
                        <h4>{format.name}</h4>
                        <p>{format.description}</p>
                        {format.recommended && (
                          <span className="recommended-badge">Recommended</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="section">
                <h3>Size</h3>
                <div className="size-grid">
                  {currentFormat?.sizes.map((sizeKey) => (
                    <button
                      key={sizeKey}
                      className={`size-btn ${selectedSize === sizeKey ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(sizeKey)}
                    >
                      <span className="size-name">{paperSizes[sizeKey].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div className="section">
                <h3>Quality</h3>
                <div className="quality-grid">
                  {currentFormat?.qualities.map((qualityKey) => (
                    <button
                      key={qualityKey}
                      className={`quality-btn ${selectedQuality === qualityKey ? 'selected' : ''}`}
                      onClick={() => setSelectedQuality(qualityKey)}
                    >
                      <span className="quality-name">{qualitySettings[qualityKey].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Preview */}
              <div className="section">
                <h3>Preview</h3>
                <div className="export-preview">
                  <div className="preview-info">
                    <div className="preview-item">
                      <span className="label">Format:</span>
                      <span className="value">{currentFormat?.name}</span>
                    </div>
                    <div className="preview-item">
                      <span className="label">Size:</span>
                      <span className="value">{paperSizes[selectedSize].name}</span>
                    </div>
                    <div className="preview-item">
                      <span className="label">Quality:</span>
                      <span className="value">{qualitySettings[selectedQuality].name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="export-actions">
                <button
                  className="btn-primary export-btn"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Exporting... {exportProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Export {currentFormat?.name}
                    </>
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              {isExporting && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <span className="progress-text">{exportProgress}%</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'share' && (
            <div className="share-tab">
              {/* Generate Shareable Link */}
              <div className="section">
                <h3>Shareable Link</h3>
                <div className="share-link-section">
                  {!shareableLink ? (
                    <button className="btn-primary" onClick={handleGenerateShareLink}>
                      <Link2 className="w-5 h-5" />
                      Generate Shareable Link
                    </button>
                  ) : (
                    <div className="share-link-container">
                      <input
                        type="text"
                        value={shareableLink}
                        readOnly
                        className="share-link-input"
                      />
                      <button className="copy-btn" onClick={handleCopyLink}>
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="share-help">
                    Generate a link to share your flyer with clients or colleagues
                  </p>
                </div>
              </div>

              {/* Social Media Sharing */}
              <div className="section">
                <h3>Share to Social Media</h3>
                <div className="social-platforms">
                  {socialPlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      className="social-btn"
                      style={{ borderColor: platform.color }}
                      onClick={() => handleShareToPlatform(platform.id)}
                    >
                      <span
                        className="social-icon"
                        style={{ color: platform.color }}
                      >
                        {platform.icon}
                      </span>
                      <span>Share to {platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Sharing */}
              <div className="section">
                <h3>Email Sharing</h3>
                <div className="email-section">
                  <button
                    className="btn-secondary email-btn"
                    onClick={() => {
                      const subject = encodeURIComponent(`Property Flyer: ${propertyData.title || 'Property'}`);
                      const body = encodeURIComponent(`Check out this property flyer: ${shareableLink || window.location.href}`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                  >
                    <Mail className="w-5 h-5" />
                    Send via Email
                  </button>
                  <p className="email-help">
                    Opens your default email client with the flyer link
                  </p>
                </div>
              </div>

              {/* Print Option */}
              <div className="section">
                <h3>Print</h3>
                <div className="print-section">
                  <button
                    className="btn-secondary print-btn"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-5 h-5" />
                    Print Flyer
                  </button>
                  <p className="print-help">
                    Print directly from your browser
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
