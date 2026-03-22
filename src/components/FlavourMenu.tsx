import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getFlavourCategoryLabel, getFlavourDescription, getFlavourName, translate } from '../lib/site';
import { Flavour, Locale } from '../services/api';

interface FlavourMenuProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
  flavours: Flavour[];
}

const palette = [
  'from-amber-100 to-orange-100',
  'from-stone-100 to-amber-100',
  'from-sky-100 to-cyan-100',
  'from-emerald-100 to-lime-100',
];

const FlavourMenu: React.FC<FlavourMenuProps> = ({ locale, textLookup, flavours }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'milk-based' | 'sorbet'>('all');

  const filtered = flavours.filter((flavour) => (activeFilter === 'all' ? true : flavour.category === activeFilter));

  return (
    <section id="flavours" className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            {translate(textLookup, locale, 'flavours_title', 'Our flavours')}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-stone-600">
            {translate(textLookup, locale, 'flavours_subtitle', 'The flavour list can be updated in the admin panel.')}
          </p>
        </motion.div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${activeFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600'}`}
          >
            {translate(textLookup, locale, 'flavours_filter_all', 'All flavours')}
          </button>
          <button
            onClick={() => setActiveFilter('milk-based')}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${activeFilter === 'milk-based' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600'}`}
          >
            {translate(textLookup, locale, 'flavours_filter_milk', 'Milk-based')}
          </button>
          <button
            onClick={() => setActiveFilter('sorbet')}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${activeFilter === 'sorbet' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600'}`}
          >
            {translate(textLookup, locale, 'flavours_filter_vegan', 'Sorbet')}
          </button>
        </div>

        <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filtered.map((flavour, index) => (
              <motion.article
                key={flavour.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-[2rem] bg-white shadow-lg"
              >
                <div className={`flex min-h-[13rem] items-end bg-gradient-to-br ${palette[index % palette.length]} p-6`}>
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                      {getFlavourCategoryLabel(flavour, locale, textLookup)}
                    </div>
                    <h3 className="font-serif text-3xl font-semibold text-stone-900">{getFlavourName(flavour, locale)}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-7 text-stone-600">{getFlavourDescription(flavour, locale)}</p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-12 text-center text-sm uppercase tracking-[0.3em] text-stone-500">
          {translate(textLookup, locale, 'flavours_cta', "Visit us and taste today's selection")}
        </div>
      </div>
    </section>
  );
};

export default FlavourMenu;
