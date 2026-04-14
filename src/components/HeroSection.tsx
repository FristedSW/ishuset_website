import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, MapPin, Phone } from 'lucide-react';
import { getTodayHours, isCurrentlyOpen, translate } from '../lib/site';
import { Locale, OpeningHours } from '../services/api';

interface HeroSectionProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
  hours: OpeningHours[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ locale, textLookup, hours }) => {
  const today = getTodayHours(hours);
  const isOpen = isCurrentlyOpen(hours);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="top" className="bg-amber-50 px-4 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {isOpen
                ? translate(textLookup, locale, 'hero_status_open', 'Open now')
                : translate(textLookup, locale, 'hero_status_closed', 'Closed right now')}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-5xl font-bold tracking-tight text-stone-900 md:text-7xl">
                {translate(textLookup, locale, 'hero_title', 'Ishuset Marselisborg Havn')}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600 md:text-2xl">
                {translate(textLookup, locale, 'hero_subtitle', 'Fresh ice cream by the harbour with a simple overview of flavours and prices.')}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button onClick={() => scrollTo('#flavours')} className="rounded-full bg-stone-900 px-7 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700">
                {translate(textLookup, locale, 'hero_cta_menu', 'See flavours')}
              </button>
              <button onClick={() => scrollTo('#services')} className="rounded-full border border-stone-300 bg-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-stone-700 transition hover:border-stone-400">
                {translate(textLookup, locale, 'hero_cta_contact', 'Rent a freezer')}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <MapPin className="mb-3 h-5 w-5 text-stone-900" />
              <div className="text-sm font-semibold text-stone-900">Marselisborg Havnevej 42</div>
              <div className="text-sm text-stone-500">8000 Aarhus</div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <Phone className="mb-3 h-5 w-5 text-stone-900" />
              <div className="text-sm font-semibold text-stone-900">+45 86 76 13 99</div>
              <div className="text-sm text-stone-500">mail@ishusetmarselisborghavn.dk</div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <Clock3 className="mb-3 h-5 w-5 text-stone-900" />
              <div className="text-sm font-semibold text-stone-900">
                {today?.is_open && !today?.is_unknown ? `${today.open_time} - ${today.close_time}` : '-'}
              </div>
              <div className="text-sm text-stone-500">{today?.special_message || ''}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
