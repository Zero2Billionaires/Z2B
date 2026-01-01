/**
 * Public Footer Component
 */

import './Footer.css';

const Footer = () => {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <p>&copy; 2025 Z2B Legacy Builders. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
