import React from 'react';
import { motion } from 'framer-motion';
import { Clock3 } from 'lucide-react';
import { dayLabels, translate } from '../lib/site';
import { Locale, OpeningHours as OpeningHoursType } from '../services/api';

interface OpeningHoursProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
  hours: OpeningHoursType[];
}

function getWeekDateLabel(dayIndex: number, locale: Locale) {
  const today = new Date();
  const jsDay = today.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayIndex);
  return target.toLocaleDateString(locale === 'da' ? 'da-DK' : locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

const OpeningHours: React.FC<OpeningHoursProps> = ({ locale, textLookup, hours }) => {
  const todayJs = new Date().getDay();
  const todayIndex = todayJs === 0 ? 6 : todayJs - 1;

  return (
    <section id="opening-hours" className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <Clock3 className="h-6 w-6 text-amber-600" />
            <h2 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
              {translate(textLookup, locale, 'opening_title', 'Opening hours')}
            </h2>
          </div>
          <p className="mx-auto max-w-3xl text-lg text-stone-600">
            {translate(textLookup, locale, 'opening_subtitle', "Here you can find the shop's regular opening hours.")}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-stone-500">
            {locale === 'da'
              ? 'Åbningstiderne er estimerede. Vi kan godt have åbent længere, men vi lukker ikke før tidspunktet vist her.'
              : locale === 'de'
                ? 'Die Öffnungszeiten sind als Richtwert gedacht. Wir können länger offen haben, schließen aber nicht vor der hier angegebenen Zeit.'
                : 'Opening hours are estimated. We may stay open longer, but we will not close before the time shown here.'}
          </p>
        </motion.div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
          {hours.map((entry, index) => (
            <div
              key={entry.id}
              className={`grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 transition-colors ${
                index === todayIndex ? 'bg-sky-50/70' : ''
              } ${
                index !== hours.length - 1 ? 'border-b border-stone-100' : ''
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`text-lg font-semibold ${index === todayIndex ? 'text-sky-900' : 'text-stone-900'}`}>
                    {dayLabels[locale][entry.day] || entry.day}
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    index === todayIndex ? 'bg-sky-100 text-sky-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {getWeekDateLabel(index, locale)}
                  </div>
                  {index === todayIndex && (
                    <div className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                      {locale === 'da' ? 'I dag' : locale === 'de' ? 'Heute' : 'Today'}
                    </div>
                  )}
                </div>
                {entry.special_message && <div className="mt-1 text-sm text-stone-500">{entry.special_message}</div>}
              </div>
              <div className="text-right">
                <div className="text-base font-semibold text-stone-900">
                  {entry.is_unknown
                    ? locale === 'da'
                      ? 'Ukendt endnu'
                      : locale === 'de'
                        ? 'Noch unbekannt'
                        : 'Unknown yet'
                    : entry.is_open
                      ? `${entry.open_time} - ${entry.close_time}`
                      : '-'}
                </div>
                <div className={`text-sm ${entry.is_open ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {entry.is_unknown
                    ? locale === 'da'
                      ? 'Afventer'
                      : locale === 'de'
                        ? 'Ausstehend'
                        : 'Pending'
                    : entry.is_open
                      ? translate(textLookup, locale, 'opening_open', 'Open')
                      : translate(textLookup, locale, 'opening_closed', 'Closed')}
                </div>
                {!entry.is_unknown && entry.is_estimated !== false && (
                  <div className="mt-1 text-xs text-stone-400">
                    {locale === 'da' ? 'Estimeret' : locale === 'de' ? 'Geschätzt' : 'Estimated'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpeningHours;
