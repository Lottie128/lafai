import { Link } from 'react-router-dom'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'
import { useStore } from '../context/StoreContext.jsx'

export default function Footer() {
  const { settings, content } = useStore()
  const { footer } = content

  return (
    <footer className="bg-surface border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to="/"
              className="font-display text-3xl font-light italic text-[#f5f0f2] block mb-4"
            >
              {settings.storeName}
            </Link>
            <p className="text-[#f5f0f2]/50 text-sm leading-relaxed max-w-xs">
              {footer?.tagline}
            </p>
            <p className="text-[#f5f0f2]/30 text-xs mt-4 uppercase tracking-widest">
              {footer?.disclaimer}
            </p>

            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f5f0f2]/40 hover:text-accent transition-colors"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f5f0f2]/40 hover:text-accent transition-colors"
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings.socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.socialLinks.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f5f0f2]/40 hover:text-accent transition-colors"
                >
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#f5f0f2]/40 mb-6">
              Navigate
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Shop All', href: '/products' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#f5f0f2]/50 hover:text-[#f5f0f2] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#f5f0f2]/40 mb-6">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-sm text-[#f5f0f2]/50 hover:text-accent transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </li>
              <li className="text-sm text-[#f5f0f2]/30">
                {content.contact?.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#f5f0f2]/25">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <p className="text-xs text-[#f5f0f2]/25">
            Discreet packaging · Secure payment · Private delivery
          </p>
        </div>
      </div>
    </footer>
  )
}
