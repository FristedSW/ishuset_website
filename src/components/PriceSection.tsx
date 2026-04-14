import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getPriceLabel, translate } from '../lib/site';
import { Locale, PriceItem } from '../services/api';

interface PriceSectionProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
  prices: PriceItem[];
}

const PriceSection: React.FC<PriceSectionProps> = ({ locale, textLookup, prices }) => {
  const [showAll, setShowAll] = useState(false);
  if (!prices.length) return null;

  const visiblePrices = showAll ? prices : prices.slice(0, 3);
  const toggleCopy =
    locale === 'da'
      ? { more: 'Se flere priser', less: 'Vis færre priser' }
      : locale === 'de'
        ? { more: 'Mehr Preise anzeigen', less: 'Weniger Preise anzeigen' }
        : { more: 'See more prices', less: 'Show fewer prices' };

  return (
    <section id="prices" className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            {translate(textLookup, locale, 'prices_title', 'Prices')}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-stone-600">
            {translate(textLookup, locale, 'prices_subtitle', 'Each scoop has the same base price regardless of flavour.')}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-stone-500">
            {locale === 'da'
              ? 'Vi har også kaffe, kolde drikke og lidt ekstra i disken, men her viser vi kun de vigtigste ispriser.'
              : locale === 'de'
                ? 'Wir haben auch Kaffee, kalte Getränke und ein paar Extras, aber hier zeigen wir nur die wichtigsten Eispreise.'
                : 'We also have coffee, cold drinks, and a few extras, but this section only shows the main ice cream prices.'}
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {visiblePrices.map((item) => (
            <div key={item.id} className="rounded-[2rem] bg-white px-6 py-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.25em] text-stone-400">{item.key.replace('_', ' ')}</div>
              <div className="mt-3 text-2xl font-semibold text-stone-900">{getPriceLabel(item, locale)}</div>
              <div className="mt-2 text-3xl font-bold text-stone-900">{item.price}</div>
              {item.description && <p className="mt-3 text-sm leading-7 text-stone-500">{item.description}</p>}
            </div>
          ))}
        </div>

        {prices.length > 3 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm"
            >
              {showAll ? toggleCopy.less : toggleCopy.more}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PriceSection;
