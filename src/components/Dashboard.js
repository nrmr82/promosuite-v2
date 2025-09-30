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
  FolderOpen
} from 'lucide-react';
import UserCollections from './UserCollections';
import './Dashboard.css';
import './DashboardSpecific.css';

const Dashboard = ({ user, onNavigateToTool }) => {
  const [hoveredTool, setHoveredTool] = useState(null);

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
                <div className="flyerpro-feature-preview">
                  <div className="flyer-creation-demo">
                    <div className="template-selection">
                      <div className="template template-1 active">
                        <div className="template-thumb">■</div>
                        <span>Modern</span>
                      </div>
                      <div className="template template-2">
                        <div className="template-thumb">▲</div>
                        <span>Classic</span>
                      </div>
                      <div className="template template-3">
                        <div className="template-thumb">◆</div>
                        <span>Luxury</span>
                      </div>
                    </div>
                    
                    <div className="flyer-preview">
                      <div className="property-image">■</div>
                      <div className="property-details">
                        <div className="price-animate">$850,000</div>
                        <div className="address-animate">123 Dream Home Ln</div>
                        <div className="features-animate">
                          <span>• 3 bed</span>
                          <span>• 2 bath</span>
                          <span>• 2000 sqft</span>
                        </div>
                      </div>
                      <div className="agent-branding">
                        <div className="agent-name">{user.name || 'Your Name'}</div>
                        <div className="contact-info">• (555) 123-4567</div>
                      </div>
                    </div>
                    
                    <div className="creation-steps">
                      <div className="step step-1 active">
                        <div className="step-icon">1</div>
                        <span>Template</span>
                      </div>
                      <div className="step step-2">
                        <div className="step-icon">2</div>
                        <span>Customize</span>
                      </div>
                      <div className="step step-3">
                        <div className="step-icon">3</div>
                        <span>Export</span>
                      </div>
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
                <div className="socialspark-feature-preview">
                  <div className="social-automation-demo">
                    <div className="content-creation">
                      <div className="post-composer">
                        <div className="post-text">
                          <div className="typing-indicator">New listing alert! ■</div>
                          <div className="hashtags">#RealEstate #NewListing #DreamHome</div>
                        </div>
                      </div>
                      
                      <div className="schedule-panel">
                        <div className="schedule-time">
                          <div className="time-slot active">• 9:00 AM</div>
                          <div className="time-slot">• 1:00 PM</div>
                          <div className="time-slot">• 6:00 PM</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="platform-distribution">
                      <div className="platform-row">
                        <div className="platform-item instagram">
                          <div className="platform-icon">■</div>
                          <div className="platform-name">IG</div>
                          <div className="publish-status publishing">•</div>
                        </div>
                        <div className="platform-item twitter">
                          <div className="platform-icon">▶</div>
                          <div className="platform-name">TW</div>
                          <div className="publish-status scheduled">⏳</div>
                        </div>
                        <div className="platform-item linkedin">
                          <div className="platform-icon">◆</div>
                          <div className="platform-name">LI</div>
                          <div className="publish-status published">✓</div>
                        </div>
                        <div className="platform-item facebook">
                          <div className="platform-icon">●</div>
                          <div className="platform-name">FB</div>
                          <div className="publish-status scheduled">⏳</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="analytics-mini">
                      <div className="metric">
                        <span className="metric-number">{followersCount < 1000 ? followersCount : `${Math.floor(followersCount/1000)}K`}</span>
                        <span className="metric-label">Reach</span>
                        <div className="metric-trend up">↑ +12%</div>
                      </div>
                      <div className="metric">
                        <span className="metric-number">{Math.floor(engagementCount/10)}</span>
                        <span className="metric-label">Leads</span>
                        <div className="metric-trend up">↑ +24%</div>
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
                View and manage your AI-generated templates and flyers
              </p>
            </div>
          </div>
          
          <UserCollections 
            mode="dashboard"
            onEditTemplate={(template) => {
              console.log('Edit template:', template);
              // Navigate to template editor if needed
            }}
            onEditFlyer={(flyer) => {
              console.log('Edit flyer:', flyer);
              // Navigate to flyer editor if needed
            }}
          />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
