import React from 'react';
import { motion } from 'framer-motion';
import { getPriceLabel, translate } from '../lib/site';
import { Locale, PriceItem } from '../services/api';

interface PriceSectionProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
  prices: PriceItem[];
}

const PriceSection: React.FC<PriceSectionProps> = ({ locale, textLookup, prices }) => {
  if (!prices.length) return null;

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
              ? 'Vi har også kaffe og kolde drikke.'
              : locale === 'de'
                ? 'Wir haben auch Kaffee und kalte Getränke.'
                : 'We also have coffee and cold drinks.'}
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {prices.map((item) => (
            <div key={item.id} className="rounded-[2rem] bg-white px-6 py-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.25em] text-stone-400">{item.key.replace('_', ' ')}</div>
              <div className="mt-3 text-2xl font-semibold text-stone-900">{getPriceLabel(item, locale)}</div>
              <div className="mt-2 text-3xl font-bold text-stone-900">{item.price}</div>
              {item.description && <p className="mt-3 text-sm leading-7 text-stone-500">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PriceSection;
