import React from 'react';
import { ArrowLeft, Shield, Eye, Database, UserCheck, Mail, Phone } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="legal-document-container">
      <div className="legal-document">
        {/* Header */}
        <div className="legal-header">
          {onClose && (
            <button className="back-button" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <div className="legal-title-section">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1>Privacy Policy</h1>
            <p className="legal-subtitle">PromoSuite Real Estate Marketing Platform</p>
            <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to PromoSuite ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our real estate marketing platform, including our FlyerPro 
              and SocialSpark tools (the "Service").
            </p>
            <p>
              By using our Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2><Database className="w-5 h-5 inline mr-2" />2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>When you create an account or use our Service, we may collect:</p>
            <ul>
              <li>Name and contact information (email address, phone number)</li>
              <li>Professional information (real estate license, brokerage affiliation)</li>
              <li>Account credentials and authentication information</li>
              <li>Billing and payment information</li>
              <li>Profile information and preferences</li>
            </ul>

            <h3>2.2 Content and Usage Data</h3>
            <p>We collect information about how you use our Service:</p>
            <ul>
              <li>Property listings and marketing materials you create</li>
              <li>Images, logos, and other media you upload</li>
              <li>Templates and designs you use or customize</li>
              <li>Social media posts and scheduling data</li>
              <li>Usage analytics and feature interactions</li>
            </ul>

            <h3>2.3 Technical Information</h3>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system and platform details</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log files and error reports</li>
            </ul>

            <h3>2.4 Third-Party Authentication</h3>
            <p>When you sign in using third-party services (Google, Facebook, Twitter, LinkedIn), we receive:</p>
            <ul>
              <li>Basic profile information (name, email, profile picture)</li>
              <li>Authentication tokens for secure access</li>
              <li>Permissions you explicitly grant</li>
            </ul>
          </section>

          <section>
            <h2><Eye className="w-5 h-5 inline mr-2" />3. How We Use Your Information</h2>
            <p>We use the collected information for:</p>
            
            <h3>3.1 Service Provision</h3>
            <ul>
              <li>Creating and managing your account</li>
              <li>Providing access to FlyerPro and SocialSpark tools</li>
              <li>Processing payments and managing subscriptions</li>
              <li>Generating marketing materials and social media content</li>
              <li>Storing and organizing your created content</li>
            </ul>

            <h3>3.2 Communication</h3>
            <ul>
              <li>Sending service-related notifications</li>
              <li>Providing customer support</li>
              <li>Sharing product updates and new features</li>
              <li>Marketing communications (with your consent)</li>
            </ul>

            <h3>3.3 Improvement and Analytics</h3>
            <ul>
              <li>Analyzing usage patterns to improve our Service</li>
              <li>Developing new features and tools</li>
              <li>Ensuring security and preventing fraud</li>
              <li>Conducting research and analytics</li>
            </ul>
          </section>

          <section>
            <h2><UserCheck className="w-5 h-5 inline mr-2" />4. Information Sharing and Disclosure</h2>
            
            <h3>4.1 We DO NOT sell your personal information</h3>
            <p>PromoSuite does not sell, trade, or rent your personal information to third parties.</p>

            <h3>4.2 Limited Sharing Scenarios</h3>
            <p>We may share your information only in these specific circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our Service (hosting, payment processing, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
              <li><strong>Safety and Security:</strong> To protect our users, prevent fraud, or address security issues</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>

            <h3>4.3 Social Media Integration</h3>
            <p>When you connect social media accounts or publish content through our Service:</p>
            <ul>
              <li>Content you choose to publish becomes subject to those platforms' terms</li>
              <li>We only access information you explicitly authorize</li>
              <li>You can revoke social media permissions at any time</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We implement comprehensive security measures to protect your information:</p>
            <ul>
              <li>End-to-end encryption for data transmission</li>
              <li>Secure cloud storage with enterprise-grade protection</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data protection</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure. We strive to protect your 
              information but cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>6. Your Rights and Choices</h2>
            
            <h3>6.1 Account Management</h3>
            <ul>
              <li>Access and update your profile information</li>
              <li>Download your data and created content</li>
              <li>Delete your account and associated data</li>
              <li>Manage email preferences and notifications</li>
            </ul>

            <h3>6.2 Data Rights (where applicable)</h3>
            <p>Depending on your location, you may have additional rights:</p>
            <ul>
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to delete your personal information</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>

            <h3>6.3 Cookies and Tracking</h3>
            <p>You can control cookies through your browser settings:</p>
            <ul>
              <li>Block or delete cookies</li>
              <li>Opt out of analytics tracking</li>
              <li>Manage advertising preferences</li>
            </ul>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>We retain your information only as long as necessary:</p>
            <ul>
              <li><strong>Account Data:</strong> While your account remains active</li>
              <li><strong>Created Content:</strong> Until you delete it or close your account</li>
              <li><strong>Usage Data:</strong> Up to 2 years for analytics purposes</li>
              <li><strong>Legal Requirements:</strong> As required by applicable laws</li>
            </ul>
            <p>
              When you delete your account, we will delete or anonymize your personal information within 30 days, 
              except where we're required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2>8. Third-Party Services</h2>
            <p>Our Service integrates with third-party platforms:</p>
            <ul>
              <li><strong>Authentication:</strong> Google, Facebook, Twitter, LinkedIn</li>
              <li><strong>Social Media:</strong> Various platforms for content publishing</li>
              <li><strong>Payment Processing:</strong> Stripe and other payment processors</li>
              <li><strong>Analytics:</strong> Usage analytics and performance monitoring</li>
            </ul>
            <p>
              These services have their own privacy policies. We encourage you to review their policies 
              before connecting your accounts.
            </p>
          </section>

          <section>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information in accordance 
              with this Privacy Policy and applicable laws.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe 
              your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>Providing notice through our Service</li>
            </ul>
            <p>
              Changes become effective when posted. Your continued use of the Service after changes 
              are posted constitutes acceptance of the new Privacy Policy.
            </p>
          </section>

          <section>
            <h2><Mail className="w-5 h-5 inline mr-2" />12. Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <Mail className="w-4 h-4" />
                <span>Email: privacy@promosuite.com</span>
              </div>
              <div className="contact-item">
                <Phone className="w-4 h-4" />
                <span>Phone: 1-800-PROMOSUITE</span>
              </div>
              <div className="contact-item">
                <div className="w-4 h-4" />
                <span>Address: PromoSuite Privacy Team<br />
                      123 Marketing Street<br />
                      Suite 100<br />
                      Real Estate City, RE 12345</span>
              </div>
            </div>
          </section>

          <section>
            <h2>13. Effective Date</h2>
            <p>
              This Privacy Policy is effective as of {new Date().toLocaleDateString()} and replaces any 
              previous Privacy Policy.
            </p>
          </section>

          <div className="policy-footer">
            <p>
              <strong>PromoSuite</strong> - Real Estate Marketing Made Simple
            </p>
            <p>
              Thank you for trusting PromoSuite with your real estate marketing needs. 
              We are committed to protecting your privacy and providing transparent information 
              about our data practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
