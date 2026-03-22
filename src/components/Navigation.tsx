import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, IceCream2, Menu, X } from 'lucide-react';
import { Locale } from '../services/api';
import { localeOptions, translate } from '../lib/site';

interface NavigationProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  textLookup: Record<string, Record<string, string>>;
}

const Navigation: React.FC<NavigationProps> = ({ locale, onLocaleChange, textLookup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: translate(textLookup, locale, 'nav_opening_hours', 'Opening hours'), href: '#opening-hours' },
    { name: translate(textLookup, locale, 'nav_about', 'About'), href: '#about' },
    { name: translate(textLookup, locale, 'nav_flavours', 'Flavours'), href: '#flavours' },
    { name: translate(textLookup, locale, 'prices_title', 'Prices'), href: '#prices' },
    { name: translate(textLookup, locale, 'nav_services', 'Services'), href: '#services' },
    { name: translate(textLookup, locale, 'services_giftcard_title', 'Gift cards'), href: '#gift-cards' },
    { name: translate(textLookup, locale, 'nav_contact', 'Contact'), href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-stone-50/95 shadow-lg backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <button onClick={() => scrollToSection('#top')} className="flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg">
            <IceCream2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif text-lg font-bold text-stone-900">Ishuset</div>
            <div className="text-xs uppercase tracking-[0.3em] text-stone-500">Marselisborg</div>
          </div>
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-white hover:text-stone-900"
            >
              {item.name}
            </button>
          ))}
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-sm">
            <Globe className="h-4 w-4 text-stone-500" />
            {localeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onLocaleChange(option.value)}
                className={`rounded-full px-2 py-1 text-xs font-semibold ${option.value === locale ? 'bg-stone-900 text-white' : 'text-stone-500'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setIsOpen((open) => !open)} className="rounded-full bg-white/90 p-2 shadow-sm md:hidden" aria-label="Toggle navigation">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-stone-200 bg-stone-50 md:hidden">
            <div className="space-y-2 px-4 py-4">
              {navItems.map((item) => (
                <button key={item.href} onClick={() => scrollToSection(item.href)} className="block w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-stone-700 shadow-sm">
                  {item.name}
                </button>
              ))}
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-stone-500">Language</span>
                <div className="flex gap-2">
                  {localeOptions.map((option) => (
                    <button key={option.value} onClick={() => onLocaleChange(option.value)} className={`rounded-full px-3 py-1 text-xs font-semibold ${option.value === locale ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
