import React from 'react';
import { X, FileText, Shield, AlertCircle, Users, CreditCard, Mail, Phone } from 'lucide-react';
import './ui/DashboardModal.css';

const TermsOfServiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container terms-modal dashboard-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="modal-title">Terms of Service</h2>
            <p className="modal-subtitle">PromoSuite Real Estate Marketing Platform</p>
            <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <div className="terms-content">
            
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using PromoSuite ("the Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you disagree with any part of these Terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            <section>
              <h2><Users className="w-5 h-5 inline mr-2" />2. Description of Service</h2>
              <p>
                PromoSuite is a comprehensive real estate marketing platform that includes:
              </p>
              <ul>
                <li><strong>FlyerPro:</strong> Real estate flyer creation and design tools</li>
                <li><strong>SocialSpark:</strong> Social media content creation and scheduling</li>
                <li><strong>Template Library:</strong> Professional marketing templates</li>
                <li><strong>Brand Management:</strong> Agent and brokerage branding tools</li>
                <li><strong>Analytics:</strong> Performance tracking and insights</li>
              </ul>
            </section>

            <section>
              <h2>3. User Accounts</h2>
              
              <h3>3.1 Account Creation</h3>
              <ul>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person or entity may not maintain more than one free account</li>
              </ul>

              <h3>3.2 Account Responsibilities</h3>
              <ul>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must not share your account credentials with third parties</li>
                <li>You must keep your contact information up to date</li>
              </ul>
            </section>

            <section>
              <h2>4. Acceptable Use Policy</h2>
              
              <h3>4.1 Permitted Uses</h3>
              <p>You may use our Service to:</p>
              <ul>
                <li>Create marketing materials for legitimate real estate activities</li>
                <li>Generate social media content for property promotion</li>
                <li>Manage your real estate brand and marketing campaigns</li>
                <li>Access templates and design resources for professional use</li>
              </ul>

              <h3>4.2 Prohibited Uses</h3>
              <p>You may not use our Service to:</p>
              <ul>
                <li>Create content that violates any applicable laws or regulations</li>
                <li>Generate materials containing false or misleading information</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload malicious software or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Resell or redistribute our Service without permission</li>
                <li>Create content that is discriminatory, offensive, or harassing</li>
              </ul>
            </section>

            <section>
              <h2><CreditCard className="w-5 h-5 inline mr-2" />5. Subscription and Payment Terms</h2>
              
              <h3>5.1 Subscription Plans</h3>
              <ul>
                <li>We offer various subscription plans with different features and limitations</li>
                <li>Plan details, pricing, and features are described on our website</li>
                <li>Free trial periods may be offered at our discretion</li>
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              </ul>

              <h3>5.2 Payment Processing</h3>
              <ul>
                <li>Payments are processed securely through third-party payment processors</li>
                <li>You authorize us to charge your payment method for applicable fees</li>
                <li>Failed payments may result in service suspension or termination</li>
                <li>You are responsible for keeping payment information current</li>
              </ul>

              <h3>5.3 Refunds and Cancellations</h3>
              <ul>
                <li>Monthly subscriptions can be cancelled at any time</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>Annual subscriptions may be eligible for prorated refunds</li>
                <li>Free trial cancellations do not result in charges</li>
              </ul>
            </section>

            <section>
              <h2>6. Intellectual Property Rights</h2>
              
              <h3>6.1 Our Content</h3>
              <ul>
                <li>PromoSuite owns all rights to the Service, templates, and design assets</li>
                <li>You receive a limited license to use our content for your marketing purposes</li>
                <li>You may not redistribute, resell, or claim ownership of our templates</li>
                <li>Our branding and trademarks remain our exclusive property</li>
              </ul>

              <h3>6.2 Your Content</h3>
              <ul>
                <li>You retain ownership of content you create using our Service</li>
                <li>You grant us a license to store, process, and display your content</li>
                <li>You represent that you have rights to all content you upload</li>
                <li>You are responsible for ensuring your content doesn't infringe on others' rights</li>
              </ul>

              <h3>6.3 Copyright and DMCA</h3>
              <ul>
                <li>We respect intellectual property rights and comply with DMCA requirements</li>
                <li>If you believe your copyrighted work has been infringed, please contact us</li>
                <li>We will investigate and take appropriate action for valid DMCA claims</li>
                <li>Repeat copyright infringers may have their accounts terminated</li>
              </ul>
            </section>

            <section>
              <h2><Shield className="w-5 h-5 inline mr-2" />7. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
                and protect your information. By using our Service, you agree to our Privacy Policy.
              </p>
              <ul>
                <li>We implement industry-standard security measures</li>
                <li>We do not sell your personal information to third parties</li>
                <li>You have rights regarding your personal data</li>
                <li>We comply with applicable data protection regulations</li>
              </ul>
            </section>

            <section>
              <h2>8. Service Availability and Modifications</h2>
              
              <h3>8.1 Service Availability</h3>
              <ul>
                <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance will be announced in advance when possible</li>
                <li>Emergency maintenance may occur without prior notice</li>
                <li>We are not liable for service interruptions beyond our control</li>
              </ul>

              <h3>8.2 Service Modifications</h3>
              <ul>
                <li>We may modify, update, or discontinue features at any time</li>
                <li>Significant changes will be communicated to users in advance</li>
                <li>We may add new features or services to existing plans</li>
                <li>Deprecated features will have reasonable transition periods</li>
              </ul>
            </section>

            <section>
              <h2><AlertCircle className="w-5 h-5 inline mr-2" />9. Disclaimers and Limitations</h2>
              
              <h3>9.1 Service Disclaimers</h3>
              <ul>
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee that the Service will meet your specific requirements</li>
                <li>We are not responsible for the accuracy of user-generated content</li>
                <li>You use the Service at your own risk and discretion</li>
              </ul>

              <h3>9.2 Limitation of Liability</h3>
              <ul>
                <li>Our liability is limited to the amount you paid for the Service in the past 12 months</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>We are not responsible for third-party integrations or services</li>
                <li>Some jurisdictions may not allow liability limitations</li>
              </ul>
            </section>

            <section>
              <h2>10. Termination</h2>
              
              <h3>10.1 Termination by You</h3>
              <ul>
                <li>You may terminate your account at any time through account settings</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>You remain responsible for all charges incurred before termination</li>
                <li>You may request deletion of your account and data</li>
              </ul>

              <h3>10.2 Termination by Us</h3>
              <ul>
                <li>We may terminate accounts that violate these Terms</li>
                <li>We may suspend service for non-payment</li>
                <li>We will provide reasonable notice before termination when possible</li>
                <li>We may terminate the Service entirely with 30 days' notice</li>
              </ul>
            </section>

            <section>
              <h2>11. Dispute Resolution</h2>
              
              <h3>11.1 Governing Law</h3>
              <p>
                These Terms are governed by the laws of [State/Country], without regard to 
                conflict of law principles.
              </p>

              <h3>11.2 Dispute Process</h3>
              <ul>
                <li>We encourage resolving disputes through direct communication first</li>
                <li>Formal disputes may be subject to binding arbitration</li>
                <li>Class action lawsuits are waived where legally permissible</li>
                <li>Some disputes may be resolved in small claims court</li>
              </ul>
            </section>

            <section>
              <h2>12. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify users of material changes through:
              </p>
              <ul>
                <li>Email notifications to registered users</li>
                <li>Announcements on our website or within the Service</li>
                <li>Updated "Last Modified" date at the top of these Terms</li>
              </ul>
              <p>
                Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2>13. Miscellaneous</h2>
              
              <h3>13.1 Entire Agreement</h3>
              <p>
                These Terms, along with our Privacy Policy, constitute the entire agreement 
                between you and PromoSuite regarding the Service.
              </p>

              <h3>13.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining 
                provisions will continue in full force and effect.
              </p>

              <h3>13.3 Assignment</h3>
              <p>
                You may not assign or transfer your rights under these Terms without our consent. 
                We may assign our rights and obligations without restriction.
              </p>
            </section>

            <section>
              <h2><Mail className="w-5 h-5 inline mr-2" />14. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail className="w-4 h-4" />
                  <span>Email: legal@promosuite.com</span>
                </div>
                <div className="contact-item">
                  <Phone className="w-4 h-4" />
                  <span>Phone: 1-800-PROMOSUITE</span>
                </div>
                <div className="contact-item">
                  <div className="w-4 h-4" />
                  <span>Address: PromoSuite Legal Team<br />
                        123 Marketing Street<br />
                        Suite 100<br />
                        Real Estate City, RE 12345</span>
                </div>
              </div>
            </section>

            <section>
              <h2>15. Effective Date</h2>
              <p>
                These Terms of Service are effective as of {new Date().toLocaleDateString()} and 
                replace any previous Terms of Service.
              </p>
            </section>

            <div className="policy-footer">
              <p>
                <strong>PromoSuite</strong> - Real Estate Marketing Made Simple
              </p>
              <p>
                Thank you for using PromoSuite. These Terms help ensure a positive experience 
                for all users while protecting the rights of both users and PromoSuite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;
