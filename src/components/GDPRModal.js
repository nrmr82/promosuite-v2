import React from 'react';
import { X, Shield, CheckCircle, Info, Users, Database, Eye, Lock, UserCheck, Download, Trash2 } from 'lucide-react';
import './ui/DashboardModal.css';

const GDPRModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gdpr-modal dashboard-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <Shield className="w-6 h-6 text-primary-600" />
            <h2 className="modal-title">GDPR Compliance</h2>
            <p className="modal-subtitle">Your Data Rights and Our Commitment</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <div className="gdpr-content">
            
            {/* Introduction */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <Info className="w-5 h-5 text-blue-500" />
                <h3>Our GDPR Commitment</h3>
              </div>
              <p>
                PromoSuite is fully committed to compliance with the General Data Protection Regulation (GDPR). 
                We respect your privacy rights and provide transparent control over your personal data.
              </p>
            </section>

            {/* Your Rights */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <UserCheck className="w-5 h-5 text-green-500" />
                <h3>Your Data Rights</h3>
              </div>
              <div className="gdpr-rights-grid">
                <div className="gdpr-right-item">
                  <Eye className="w-4 h-4" />
                  <div>
                    <h4>Right to Access</h4>
                    <p>Request a copy of all personal data we hold about you.</p>
                  </div>
                </div>
                <div className="gdpr-right-item">
                  <Database className="w-4 h-4" />
                  <div>
                    <h4>Right to Rectification</h4>
                    <p>Correct any inaccurate or incomplete personal data.</p>
                  </div>
                </div>
                <div className="gdpr-right-item">
                  <Trash2 className="w-4 h-4" />
                  <div>
                    <h4>Right to Erasure</h4>
                    <p>Request deletion of your personal data ("right to be forgotten").</p>
                  </div>
                </div>
                <div className="gdpr-right-item">
                  <Download className="w-4 h-4" />
                  <div>
                    <h4>Right to Portability</h4>
                    <p>Receive your data in a structured, machine-readable format.</p>
                  </div>
                </div>
                <div className="gdpr-right-item">
                  <Lock className="w-4 h-4" />
                  <div>
                    <h4>Right to Restrict Processing</h4>
                    <p>Limit how we process your personal data.</p>
                  </div>
                </div>
                <div className="gdpr-right-item">
                  <CheckCircle className="w-4 h-4" />
                  <div>
                    <h4>Right to Object</h4>
                    <p>Object to processing based on legitimate interests.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data We Collect */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <Database className="w-5 h-5 text-purple-500" />
                <h3>What Data We Collect</h3>
              </div>
              <div className="gdpr-data-types">
                <div className="data-type">
                  <h4>Account Information</h4>
                  <ul>
                    <li>Name and email address</li>
                    <li>Professional details (license, brokerage)</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>
                <div className="data-type">
                  <h4>Usage Data</h4>
                  <ul>
                    <li>Content created (flyers, social posts)</li>
                    <li>Feature usage and interactions</li>
                    <li>Performance and analytics data</li>
                  </ul>
                </div>
                <div className="data-type">
                  <h4>Technical Data</h4>
                  <ul>
                    <li>IP address and device information</li>
                    <li>Browser and system details</li>
                    <li>Cookies and tracking data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Legal Basis */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3>Legal Basis for Processing</h3>
              </div>
              <div className="legal-basis-list">
                <div className="basis-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <strong>Contract Performance:</strong> Processing necessary to provide our services
                  </div>
                </div>
                <div className="basis-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <strong>Legitimate Interest:</strong> Service improvement and fraud prevention
                  </div>
                </div>
                <div className="basis-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <strong>Consent:</strong> Marketing communications and optional features
                  </div>
                </div>
                <div className="basis-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <strong>Legal Obligation:</strong> Compliance with applicable laws
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection Measures */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <Lock className="w-5 h-5 text-red-500" />
                <h3>How We Protect Your Data</h3>
              </div>
              <div className="protection-measures">
                <div className="measure-item">
                  <Shield className="w-4 h-4" />
                  <span>End-to-end encryption for all data transmission</span>
                </div>
                <div className="measure-item">
                  <Database className="w-4 h-4" />
                  <span>Secure cloud storage with enterprise-grade protection</span>
                </div>
                <div className="measure-item">
                  <Users className="w-4 h-4" />
                  <span>Regular staff training on data protection</span>
                </div>
                <div className="measure-item">
                  <Eye className="w-4 h-4" />
                  <span>Regular security audits and vulnerability assessments</span>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <Database className="w-5 h-5 text-orange-500" />
                <h3>Data Retention Policy</h3>
              </div>
              <div className="retention-policy">
                <p>
                  We retain your personal data only as long as necessary for the purposes outlined in our Privacy Policy:
                </p>
                <ul>
                  <li><strong>Account Data:</strong> While your account remains active</li>
                  <li><strong>Created Content:</strong> Until you delete it or close your account</li>
                  <li><strong>Usage Analytics:</strong> Up to 24 months for service improvement</li>
                  <li><strong>Legal Requirements:</strong> As mandated by applicable laws</li>
                </ul>
              </div>
            </section>

            {/* Exercise Your Rights */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <UserCheck className="w-5 h-5 text-green-600" />
                <h3>How to Exercise Your Rights</h3>
              </div>
              <div className="rights-exercise">
                <p>
                  To exercise any of your GDPR rights, you can:
                </p>
                <div className="exercise-options">
                  <div className="exercise-option">
                    <div className="option-icon">📧</div>
                    <div>
                      <h4>Email Us</h4>
                      <p>Send a request to <strong>gdpr@promosuite.com</strong></p>
                    </div>
                  </div>
                  <div className="exercise-option">
                    <div className="option-icon">⚙️</div>
                    <div>
                      <h4>Account Settings</h4>
                      <p>Manage your data directly in your account settings</p>
                    </div>
                  </div>
                  <div className="exercise-option">
                    <div className="option-icon">💬</div>
                    <div>
                      <h4>Contact Support</h4>
                      <p>Reach out through our support channels</p>
                    </div>
                  </div>
                </div>
                <div className="response-time">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>We will respond to your request within 30 days as required by GDPR.</span>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="gdpr-section gdpr-contact">
              <div className="gdpr-section-header">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3>Data Protection Contact</h3>
              </div>
              <div className="contact-details">
                <p><strong>Data Protection Officer:</strong></p>
                <p>Email: gdpr@promosuite.com</p>
                <p>Phone: 1-800-PROMOSUITE</p>
                <p>Address: PromoSuite GDPR Team, 123 Marketing Street, Suite 100, Real Estate City, RE 12345</p>
              </div>
            </section>

            {/* Supervisory Authority */}
            <section className="gdpr-section">
              <div className="gdpr-section-header">
                <Users className="w-5 h-5 text-gray-600" />
                <h3>Supervisory Authority</h3>
              </div>
              <p>
                If you believe we have not handled your personal data in accordance with GDPR, 
                you have the right to lodge a complaint with your local supervisory authority.
              </p>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="gdpr-footer-content">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p>
              We are committed to protecting your privacy and ensuring GDPR compliance. 
              For questions about this policy, please contact our Data Protection Officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRModal;
