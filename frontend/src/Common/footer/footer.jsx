import React from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa'
import './footer.css'
import logo from '../../../src/assets/image/logo.png'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__container">
          <div className="footer__content">
            {/* Logo and Description */}
            <div className="footer__brand">
              <div className="footer__logo">
                <img src={logo} alt="" />
              </div>
              <p className="footer__description">
                Your trusted partner in PTE exam preparation and guidance.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer__links">
              <h3 className="footer__heading">Quick Links</h3>
              <ul className="footer__link-list">
                <li><Link to="/services">Our Services</Link></li>
                <li><Link to="/courses">Courses</Link></li>
                <li><Link to="/practice">Practice</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer__links">
              <h3 className="footer__heading">Resources</h3>
              <ul className="footer__link-list">
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/videos">Videos</Link></li>
                <li><Link to="/support">Support</Link></li>
              </ul>
            </div>
            {/* Contact */}
            <div className="footer__contact">
              <h3 className="footer__heading">Contact Us</h3>
              <ul className="footer__contact-list">
                <li>
                  <FaEnvelope className="footer__icon" />
                  <span>contact@ptesathi.com</span>
                </li>
                <li>
                  <FaPhone className="footer__icon" />
                  <span>+977 01-5970044</span>
                </li>
                <li>
                  <FaMapMarkerAlt className="footer__icon" />
                  <span>Kathmandu, Nepal</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="footer__divider"></div>

          {/* Bottom Section */}
          <div className="footer__bottom">
            <div className="footer__copyright">
              &copy; {new Date().getFullYear()} PTESathy. All rights reserved.
            </div>
            <div className="footer__social">
              <a href='https://www.facebook.com/share/1BawAvPXHz/?mibextid=wwXIfr' target='_blank' className="footer__social-link">
                <FaFacebookF />
              </a>
              <a href='https://x.com/ptesathi?s=21' target='_blank' className="footer__social-link">
                <FaTwitter />
              </a>
              <a href='https://www.linkedin.com/company/pte-sathi/' target='_blank' className="footer__social-link">
                <FaLinkedinIn />
              </a>
              <a href="#" className="footer__social-link">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer