import React from 'react';
import { 
  Rocket, 
  Mail, 
  Twitter, 
  Linkedin, 
  Instagram,
  Shield,
  FileText,
  HelpCircle,
  Users,
  Palette,
  Video
  // ExternalLink // Unused
} from 'lucide-react';
import './Footer.css';

const Footer = ({ onOpenPrivacy, onOpenTerms, onOpenGDPR }) => {
  const currentYear = new Date().getFullYear();

  // Products section removed

  const companyLinks = [
    { name: 'About Us', icon: <Users className="w-4 h-4" />, href: '#about' },
    { name: 'Careers', icon: <Rocket className="w-4 h-4" />, href: '#careers' },
    { name: 'Blog', icon: <FileText className="w-4 h-4" />, href: '#blog' }
  ];

  const supportLinks = [
    { name: 'Help Center', icon: <HelpCircle className="w-4 h-4" />, href: '#help' },
    { name: 'Contact Support', icon: <Mail className="w-4 h-4" />, href: '#contact' },
    { name: 'Getting Started', icon: <Rocket className="w-4 h-4" />, href: '#getting-started' }
  ];

  const legalLinks = [
    { 
      name: 'Privacy Policy', 
      icon: <Shield className="w-4 h-4" />, 
      action: onOpenPrivacy
    },
    { 
      name: 'Terms of Service', 
      icon: <FileText className="w-4 h-4" />, 
      action: onOpenTerms
    },
    { name: 'GDPR Compliance', icon: <Shield className="w-4 h-4" />, action: onOpenGDPR }
  ];

  const socialLinks = [
    { 
      name: 'Twitter', 
      icon: <Twitter className="w-5 h-5" />, 
      href: 'https://twitter.com/promosuite',
      color: '#1DA1F2'
    },
    { 
      name: 'LinkedIn', 
      icon: <Linkedin className="w-5 h-5" />, 
      href: 'https://linkedin.com/company/promosuite',
      color: '#0077B5'
    },
    { 
      name: 'Instagram', 
      icon: <Instagram className="w-5 h-5" />, 
      href: 'https://instagram.com/promosuite',
      color: '#E4405F'
    }
  ];

  const handleLinkClick = (href, external = false) => {
    if (href.startsWith('http') || external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (href.startsWith('/')) {
      window.location.href = href;
    } else if (href.startsWith('#')) {
      // Handle internal navigation or scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      // Here you would typically send to your newsletter service
      alert('Thank you for subscribing to our newsletter!');
      e.target.email.value = '';
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">

          {/* Products Section Removed */}

          {/* Company Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Company</h4>
            <ul className="footer-links">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    className="footer-link"
                    onClick={() => handleLinkClick(link.href)}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Support</h4>
            <ul className="footer-links">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    className="footer-link"
                    onClick={() => handleLinkClick(link.href)}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Legal</h4>
            <ul className="footer-links">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    className="footer-link"
                    onClick={link.action}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <div className="newsletter-header">
              <Mail className="w-6 h-6" />
              <div>
                <h4>Stay Updated with PromoSuite</h4>
                <p>Get the latest real estate marketing tips, feature updates, and exclusive resources delivered to your inbox.</p>
              </div>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email address"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-button">
                Subscribe
                <Mail className="w-4 h-4 ml-2" />
              </button>
            </form>
            <p className="newsletter-disclaimer">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="footer-copyright">
              © {currentYear} PromoSuite, Inc. All rights reserved. 
            </p>
            <p className="footer-tagline">
              Real Estate Marketing Made Simple.
            </p>
          </div>
          
          <div className="footer-social">
            <span className="social-label">Follow us:</span>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <button
                  key={index}
                  className="social-link"
                  onClick={() => handleLinkClick(social.href, true)}
                  title={`Follow us on ${social.name}`}
                  style={{ '--social-color': social.color }}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="footer-trust">
          <div className="trust-badges">
            <div className="trust-badge">
              <Shield className="w-5 h-5" />
              <span>SSL Secured</span>
            </div>
            <div className="trust-badge">
              <Users className="w-5 h-5" />
              <span>10,000+ Users</span>
            </div>
            <div className="trust-badge">
              <Rocket className="w-5 h-5" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
