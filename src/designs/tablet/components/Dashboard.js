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
import './DashboardSpecific.css';

const Dashboard = ({ user, onNavigateToTool }) => {
  const [hoveredTool, setHoveredTool] = useState(null);
  const [showCollections, setShowCollections] = useState(false);

  // Custom hook for count-up animation - creates smooth number transitions
  // Respects prefers-reduced-motion for accessibility
  const useCountUp = (end, duration = 800, isActive = false) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isActive) {
        setCount(0);
        return;
      }

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setCount(end);
        return;
      }

      let start = 0;
      const increment = end / (duration / 16); // 60 FPS
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

  // Count-up values for SocialSpark stats - animate only when card is hovered
  const followersCount = useCountUp(2400, 600, hoveredTool === 'socialspark');
  const engagementCount = useCountUp(856, 650, hoveredTool === 'socialspark');

  const platforms = [
    { name: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "#E4405F" },
    { name: "Twitter", icon: <Twitter className="w-4 h-4" />, color: "#1DA1F2" },
    { name: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, color: "#0A66C2" },
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
    <div className="dashboard">
      {/* Welcome Header */}
      <section className="dashboard-header">
        <div className="container">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="welcome-title">
                Welcome back, {user.name || user.profile?.full_name || (user.email ? user.email.split('@')[0] : 'User')}!
              </h1>
              <p className="welcome-subtitle">
                Ready to create amazing marketing content? Choose your tool to get started.
              </p>
            </div>
            <div className="user-status">
              <div className="status-badge">
                {user.subscription ? (
                  <span className="status-pro">
                    <FaCheckCircle />
                    Pro Member
                  </span>
                ) : (
                  <span className="status-trial">
                    <FaRocket />
                    Free Account
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="dashboard-tools">
        <div className="container">
          <div className="dashboard-tools-grid">
            {/* FlyerPro Tool */}
            <div 
              className={`dashboard-tool-card flyerpro ${hoveredTool === 'flyerpro' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredTool('flyerpro')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => handleToolClick('flyerpro')}
            >
              <div className="dashboard-tool-preview">
                <div className="flyer-preview-stack">
                  <div className="preview-card card-1">
                    <div className="preview-header">
                      <div className="preview-logo">🏠</div>
                      <div className="preview-agent">{user.name || user.profile?.full_name || 'Your Name'}</div>
                    </div>
                    <div className="preview-image">📸</div>
                    <div className="preview-details">
                      <div className="preview-price">$850,000</div>
                      <div className="preview-address">123 Luxury Lane</div>
                    </div>
                  </div>
                  
                  <div className="preview-card card-2">
                    <div className="preview-header">
                      <div className="preview-logo">🏡</div>
                      <div className="preview-agent">{user.name || user.profile?.full_name || 'Your Name'}</div>
                    </div>
                    <div className="preview-image">📷</div>
                    <div className="preview-details">
                      <div className="preview-price">$650,000</div>
                      <div className="preview-address">456 Family St</div>
                    </div>
                  </div>
                  
                  <div className="preview-card card-3">
                    <div className="preview-header">
                      <div className="preview-logo">🏢</div>
                      <div className="preview-agent">{user.name || user.profile?.full_name || 'Your Name'}</div>
                    </div>
                    <div className="preview-image">🏙️</div>
                    <div className="preview-details">
                      <div className="preview-price">$1,200,000</div>
                      <div className="preview-address">789 Urban Ave</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-tool-content">
                <div className="dashboard-tool-header">
                  <div className="dashboard-tool-icon flyerpro-icon">
                    <FaPalette />
                  </div>
                  <h3 className="dashboard-tool-title">FlyerPro</h3>
                </div>
                <p className="dashboard-tool-description">Create stunning real estate flyers in minutes</p>
                <ul className="dashboard-tool-features">
                  {tools[0].features.map((feature, index) => (
                    <li key={index}>
                      <FaCheckCircle className="dashboard-feature-check" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="dashboard-tool-cta">
                  Start Creating
                  <FaArrowRight />
                </button>
              </div>
            </div>

            {/* SocialSpark Tool */}
            <div 
              className={`dashboard-tool-card socialspark sspark-card ${hoveredTool === 'socialspark' ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredTool('socialspark')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => handleToolClick('socialspark')}
            >
              <div className="dashboard-tool-preview">
                <div className="social-dashboard-mini sspark-preview">
                  <div className="dashboard-header-mini">
                    <h4>Social Dashboard</h4>
                    <div className="dashboard-stats-mini">
                      <div className="stat-mini sspark-stat" data-count="2400">
                        <span className="stat-value">
                          {followersCount < 1000 ? followersCount : `${(followersCount / 1000).toFixed(1)}K`}
                        </span>
                        <span className="stat-label">Followers</span>
                        <span className="stat-change positive">+12%</span>
                        <div className="sspark-progress">
                          <div className="sspark-progress-bar" style={{'--pct': '75%'}}></div>
                        </div>
                      </div>
                      <div className="stat-mini sspark-stat" data-count="856">
                        <span className="stat-value">{engagementCount}</span>
                        <span className="stat-label">Engagement</span>
                        <span className="stat-change positive">+24%</span>
                        <div className="sspark-progress">
                          <div className="sspark-progress-bar" style={{'--pct': '60%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="platforms-row-mini sspark-platforms">
                    {platforms.map((platform, index) => (
                      <div 
                        key={index} 
                        className="platform-item-mini sspark-platform-icon" 
                        style={{ 
                          '--platform-color': platform.color,
                          '--stagger-delay': `${index * 100}ms`
                        }}
                      >
                        {platform.icon}
                        <span>{platform.name}</span>
                        <CheckCircle className="w-3 h-3 platform-connected" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="scheduled-posts-mini">
                    <h5>Upcoming Posts</h5>
                    <div className="post-preview-mini sspark-scheduled">
                      <div className="post-thumbnail-mini">🏠</div>
                      <div className="post-details-mini">
                        <p>New listing in Downtown!</p>
                        <span className="post-time-mini">Today at 2:00 PM</span>
                      </div>
                      <div className="post-platforms-mini">
                        <Instagram className="w-3 h-3" />
                        <Facebook className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-tool-content">
                <div className="dashboard-tool-header">
                  <div className="dashboard-tool-icon socialspark-icon">
                    <FaVideo />
                  </div>
                  <h3 className="dashboard-tool-title">SocialSpark</h3>
                </div>
                <p className="dashboard-tool-description">Automate your social media marketing</p>
                <ul className="dashboard-tool-features">
                  {tools[1].features.map((feature, index) => (
                    <li key={index}>
                      <FaCheckCircle className="dashboard-feature-check" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="dashboard-tool-cta">
                  Start Automating
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Collections */}
      <section className="dashboard-collections">
        <div className="container">
          <div className="collections-content">
            <div className="collections-header">
              <div className="collections-header-left">
                <h2 className="collections-title">
                  <FolderOpen className="title-icon" />
                  My Collections
                </h2>
                <p className="collections-subtitle">
                  Manage your AI-generated templates and flyers
                </p>
              </div>
              <button 
                className="collections-cta"
                onClick={() => setShowCollections(true)}
              >
                <Sparkles className="cta-icon" />
                Browse Collections
                <FaArrowRight />
              </button>
            </div>
            
            <div className="collections-preview">
              <div className="preview-card">
                <div className="preview-icon">
                  <FaPalette />
                </div>
                <div className="preview-content">
                  <h4>AI Templates</h4>
                  <p>Custom generated templates</p>
                  <span className="preview-count">View all →</span>
                </div>
              </div>
              
              <div className="preview-card">
                <div className="preview-icon flyer">
                  <FaVideo />
                </div>
                <div className="preview-content">
                  <h4>AI Flyers</h4>
                  <p>Property marketing materials</p>
                  <span className="preview-count">View all →</span>
                </div>
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
            // Could navigate to template editor
          }}
          onEditFlyer={(flyer) => {
            console.log('Edit flyer:', flyer);
            // Could navigate to flyer editor
          }}
          onClose={() => setShowCollections(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
