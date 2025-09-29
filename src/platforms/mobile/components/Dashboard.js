import React, { useState, useEffect } from 'react';
import { 
  FaPalette, 
  FaVideo, 
  FaArrowRight, 
  FaRocket,
  FaCheckCircle
} from 'react-icons/fa';
import { 
  Instagram,
  Twitter,
  Linkedin,
  CheckCircle,
  Facebook,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import UserCollections from '../../../components/UserCollections';
import './Dashboard.css';

const Dashboard = ({ user, onNavigateToTool }) => {
  const [hoveredTool, setHoveredTool] = useState(null);
  const [showCollections, setShowCollections] = useState(false);

  // Custom hook for count-up animation - mobile optimized
  const useCountUp = (end, duration = 600, isActive = false) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isActive) {
        setCount(0);
        return;
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setCount(end);
        return;
      }

      let start = 0;
      const increment = end / (duration / 16);
      let animationId;

      const animate = () => {
        start += increment;
        if (start < end) {
          setCount(Math.floor(start));
          animationId = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, [end, duration, isActive]);

    return count;
  };

  const followersCount = useCountUp(2400, 600, hoveredTool === 'socialspark');
  const engagementCount = useCountUp(856, 650, hoveredTool === 'socialspark');

  const platforms = [
    { name: "Instagram", icon: <Instagram className="w-3 h-3" />, color: "#E4405F" },
    { name: "Twitter", icon: <Twitter className="w-3 h-3" />, color: "#1DA1F2" },
    { name: "LinkedIn", icon: <Linkedin className="w-3 h-3" />, color: "#0A66C2" },
  ];

  const tools = [
    {
      id: 'flyerpro',
      name: 'FlyerPro',
      icon: <FaPalette />,
      description: 'Create stunning real estate flyers in minutes',
      color: 'primary',
      features: [
        '200+ Professional Templates',
        'Drag & Drop Editor',
        'Brand Customization',
        'High-Resolution Export'
      ]
    },
    {
      id: 'socialspark',
      name: 'SocialSpark',
      icon: <FaVideo />,
      description: 'Automate your social media marketing',
      color: 'secondary',
      features: [
        'Multi-Platform Scheduling',
        'Content Templates',
        'Analytics & Insights',
        'Hashtag Optimization'
      ]
    }
  ];

  const handleToolClick = (toolId) => {
    onNavigateToTool(toolId);
  };

  return (
    <div className="mobile-dashboard">
      {/* Welcome Header */}
      <section className="mobile-dashboard-header">
        <div className="mobile-welcome-content">
          <div className="mobile-welcome-text">
            <h1 className="mobile-welcome-title">
              Welcome back, {user.name || user.profile?.full_name || (user.email ? user.email.split('@')[0] : 'User')}!
            </h1>
            <p className="mobile-welcome-subtitle">
              Ready to create amazing marketing content? Choose your tool to get started.
            </p>
          </div>
          <div className="mobile-user-status">
            <div className="mobile-status-badge">
              {user.subscription ? (
                <span className="mobile-status-pro">
                  <FaCheckCircle />
                  Pro Member
                </span>
              ) : (
                <span className="mobile-status-trial">
                  <FaRocket />
                  Free Account
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="mobile-dashboard-tools">
        <div className="mobile-tools-grid">
          {/* FlyerPro Tool */}
          <div 
            className={`mobile-tool-card mobile-flyerpro ${hoveredTool === 'flyerpro' ? 'hovered' : ''}`}
            onTouchStart={() => setHoveredTool('flyerpro')}
            onTouchEnd={() => setHoveredTool(null)}
            onClick={() => handleToolClick('flyerpro')}
          >
            <div className="mobile-tool-preview">
              <div className="mobile-flyer-preview-stack">
                <div className="mobile-preview-card card-1">
                  <div className="mobile-preview-header">
                    <div className="mobile-preview-logo">🏠</div>
                    <div className="mobile-preview-agent">{user.name || user.profile?.full_name || 'Your Name'}</div>
                  </div>
                  <div className="mobile-preview-image">📸</div>
                  <div className="mobile-preview-details">
                    <div className="mobile-preview-price">$850,000</div>
                    <div className="mobile-preview-address">123 Luxury Lane</div>
                  </div>
                </div>
                
                <div className="mobile-preview-card card-2">
                  <div className="mobile-preview-header">
                    <div className="mobile-preview-logo">🏡</div>
                    <div className="mobile-preview-agent">{user.name || user.profile?.full_name || 'Your Name'}</div>
                  </div>
                  <div className="mobile-preview-image">📷</div>
                  <div className="mobile-preview-details">
                    <div className="mobile-preview-price">$650,000</div>
                    <div className="mobile-preview-address">456 Family St</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mobile-tool-content">
              <div className="mobile-tool-header">
                <div className="mobile-tool-icon mobile-flyerpro-icon">
                  <FaPalette />
                </div>
                <h3 className="mobile-tool-title">FlyerPro</h3>
              </div>
              <p className="mobile-tool-description">Create stunning real estate flyers in minutes</p>
              <ul className="mobile-tool-features">
                {tools[0].features.slice(0, 2).map((feature, index) => (
                  <li key={index}>
                    <FaCheckCircle className="mobile-feature-check" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mobile-tool-cta">
                Start Creating
                <FaArrowRight />
              </button>
            </div>
          </div>

          {/* SocialSpark Tool */}
          <div 
            className={`mobile-tool-card mobile-socialspark ${hoveredTool === 'socialspark' ? 'hovered' : ''}`}
            onTouchStart={() => setHoveredTool('socialspark')}
            onTouchEnd={() => setHoveredTool(null)}
            onClick={() => handleToolClick('socialspark')}
          >
            <div className="mobile-tool-preview">
              <div className="mobile-social-dashboard-mini">
                <div className="mobile-dashboard-header-mini">
                  <h4>Social Dashboard</h4>
                  <div className="mobile-dashboard-stats-mini">
                    <div className="mobile-stat-mini">
                      <span className="mobile-stat-value">
                        {followersCount < 1000 ? followersCount : `${(followersCount / 1000).toFixed(1)}K`}
                      </span>
                      <span className="mobile-stat-label">Followers</span>
                      <span className="mobile-stat-change positive">+12%</span>
                    </div>
                    <div className="mobile-stat-mini">
                      <span className="mobile-stat-value">{engagementCount}</span>
                      <span className="mobile-stat-label">Engagement</span>
                      <span className="mobile-stat-change positive">+24%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mobile-platforms-row-mini">
                  {platforms.map((platform, index) => (
                    <div 
                      key={index} 
                      className="mobile-platform-item-mini" 
                      style={{ '--platform-color': platform.color }}
                    >
                      {platform.icon}
                      <span>{platform.name.slice(0, 4)}</span>
                      <CheckCircle className="w-2 h-2 platform-connected" />
                    </div>
                  ))}
                </div>
                
                <div className="mobile-scheduled-posts-mini">
                  <h5>Upcoming Posts</h5>
                  <div className="mobile-post-preview-mini">
                    <div className="mobile-post-thumbnail-mini">🏠</div>
                    <div className="mobile-post-details-mini">
                      <p>New listing in Downtown!</p>
                      <span className="mobile-post-time-mini">Today at 2:00 PM</span>
                    </div>
                    <div className="mobile-post-platforms-mini">
                      <Instagram className="w-2 h-2" />
                      <Facebook className="w-2 h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mobile-tool-content">
              <div className="mobile-tool-header">
                <div className="mobile-tool-icon mobile-socialspark-icon">
                  <FaVideo />
                </div>
                <h3 className="mobile-tool-title">SocialSpark</h3>
              </div>
              <p className="mobile-tool-description">Automate your social media marketing</p>
              <ul className="mobile-tool-features">
                {tools[1].features.slice(0, 2).map((feature, index) => (
                  <li key={index}>
                    <FaCheckCircle className="mobile-feature-check" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mobile-tool-cta">
                Start Automating
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* My Collections */}
      <section className="mobile-dashboard-collections">
        <div className="mobile-collections-content">
          <div className="mobile-collections-header">
            <div className="mobile-collections-header-left">
              <h2 className="mobile-collections-title">
                <FolderOpen className="title-icon" />
                My Collections
              </h2>
              <p className="mobile-collections-subtitle">
                Manage your AI-generated templates and flyers
              </p>
            </div>
            <button 
              className="mobile-collections-cta"
              onClick={() => setShowCollections(true)}
            >
              <Sparkles className="cta-icon" />
              Browse
              <FaArrowRight />
            </button>
          </div>
          
          <div className="mobile-collections-preview">
            <div className="mobile-preview-card">
              <div className="mobile-preview-icon">
                <FaPalette />
              </div>
              <div className="mobile-preview-content">
                <h4>AI Templates</h4>
                <p>Custom generated templates</p>
                <span className="mobile-preview-count">View all →</span>
              </div>
            </div>
            
            <div className="mobile-preview-card">
              <div className="mobile-preview-icon flyer">
                <FaVideo />
              </div>
              <div className="mobile-preview-content">
                <h4>AI Flyers</h4>
                <p>Property marketing materials</p>
                <span className="mobile-preview-count">View all →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Modal */}
      {showCollections && (
        <UserCollections 
          onEditTemplate={(template) => {
            console.log('Edit template:', template);
          }}
          onEditFlyer={(flyer) => {
            console.log('Edit flyer:', flyer);
          }}
          onClose={() => setShowCollections(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;