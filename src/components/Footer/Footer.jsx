import { Shield, ExternalLink, MessageCircle, Briefcase, Mail, Heart } from 'lucide-react'
import './Footer.css'

const footerLinks = {
  Product: ['Features', 'Pricing', 'How It Works', 'API', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Status'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}

const socialLinks = [
  { icon: ExternalLink, href: '#', label: 'GitHub' },
  { icon: MessageCircle, href: '#', label: 'Twitter' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#" className="footer__logo">
              <div className="footer__logo-icon">
                <Shield size={20} />
              </div>
              <span className="footer__logo-text">
                Warranty<span className="footer__logo-accent">Wala</span>
              </span>
            </a>
            <p className="footer__tagline">
              AI-powered receipt & warranty management.
              <br />
              Your money deserves a bodyguard. 🛡️
            </p>
            <div className="footer__socials">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="footer__social"
                  aria-label={social.label}
                  id={`footer-social-${social.label.toLowerCase()}`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer__links">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="footer__link-group">
                <h4 className="footer__link-title">{category}</h4>
                <ul className="footer__link-list">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="footer__link">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2026 WarrantyWala. Made with <Heart size={14} fill="#fd79a8" color="#fd79a8" className="footer__heart" /> in India
          </p>
          <p className="footer__credit">
            Built by <a href="#" className="footer__credit-link">Anurag Kodge</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
