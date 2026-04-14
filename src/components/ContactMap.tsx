import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { dayLabels, getTodayHours, isCurrentlyOpen, translate } from '../lib/site';
import { Locale, OpeningHours } from '../services/api';

interface ContactMapProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
  hours: OpeningHours[];
}

const ContactMap: React.FC<ContactMapProps> = ({ locale, textLookup, hours }) => {
  const today = getTodayHours(hours);
  const isOpenNow = isCurrentlyOpen(hours);

  return (
    <section id="contact" className="bg-amber-50 px-4 py-20">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 to-amber-50 shadow-xl"
        >
          <div className="flex min-h-[26rem] flex-col justify-between p-8">
            <div>
              <h2 className="font-serif text-4xl font-bold text-stone-900">
                {translate(textLookup, locale, 'contact_title', 'Find us')}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-stone-600">
                {translate(
                  textLookup,
                  locale,
                  'contact_subtitle',
                  'Visit us at Marselisborg Harbour or reach out directly.'
                )}
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Marselisborg+Havnevej+42,+8000+Aarhus"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Google Maps
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <div className="rounded-[2rem] bg-stone-900 p-8 text-white shadow-xl">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-amber-300" />
                <div>
                  <div className="font-semibold">Marselisborg Havnevej 42</div>
                  <div className="text-sm text-stone-300">8000 Aarhus</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 text-amber-300" />
                <a href="tel:+4586761399" className="text-sm text-stone-200 hover:text-white">
                  +45 86 76 13 99
                </a>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 text-amber-300" />
                <a href="mailto:mail@ishusetmarselisborghavn.dk" className="text-sm text-stone-200 hover:text-white">
                  mail@ishusetmarselisborghavn.dk
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-amber-50 p-8 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-stone-500">Today</div>
            <div className="mt-3 text-2xl font-semibold text-stone-900">
              {today?.is_open && !today?.is_unknown
                ? `${today.open_time} - ${today.close_time}`
                : translate(textLookup, locale, 'opening_closed', 'Closed')}
            </div>
            <div className="mt-2 text-sm text-stone-500">
              {today ? dayLabels[locale][today.day] || today.day : ''}
            </div>
            <div className={`mt-2 text-sm font-semibold ${isOpenNow ? 'text-emerald-600' : 'text-rose-500'}`}>
              {isOpenNow
                ? translate(textLookup, locale, 'hero_status_open', 'Open now')
                : translate(textLookup, locale, 'hero_status_closed', 'Closed right now')}
            </div>
            {today?.special_message && (
              <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-stone-600">{today.special_message}</div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactMap;
