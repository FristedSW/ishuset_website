import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getFlavourCategoryLabel, getFlavourDescription, getFlavourName, translate } from '../lib/site';
import { Flavour, Locale, resolveMediaUrl } from '../services/api';

interface FlavourMenuProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
  flavours: Flavour[];
}

const fallbackGradients: Record<'milk-based' | 'sorbet', string> = {
  'milk-based': 'from-amber-100 via-orange-100 to-rose-100',
  sorbet: 'from-sky-100 via-cyan-100 to-emerald-100',
};

function getInitialVisibleCount() {
  if (typeof window === 'undefined') return 6;
  return window.innerWidth >= 1024 ? 6 : 3;
}

function FlavourCard({
  flavour,
  locale,
  textLookup,
}: {
  flavour: Flavour;
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = resolveMediaUrl(flavour.image_url);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const description = getFlavourDescription(flavour, locale);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-[2rem] bg-white shadow-lg"
    >
      {showImage ? (
        <div className="relative h-56 overflow-hidden bg-stone-100">
          <img
            src={imageUrl}
            alt={getFlavourName(flavour, locale)}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/75 via-stone-950/30 to-transparent p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
              {getFlavourCategoryLabel(flavour, locale, textLookup)}
            </div>
            <h3 className="font-serif text-3xl font-semibold text-white">{getFlavourName(flavour, locale)}</h3>
          </div>
        </div>
      ) : (
        <div className={`flex min-h-[13rem] items-end bg-gradient-to-br ${fallbackGradients[flavour.category]} p-6`}>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              {getFlavourCategoryLabel(flavour, locale, textLookup)}
            </div>
            <h3 className="font-serif text-3xl font-semibold text-stone-900">{getFlavourName(flavour, locale)}</h3>
          </div>
        </div>
      )}
      <div className="p-6">
        {description ? <p className="text-sm leading-7 text-stone-600">{description}</p> : null}
      </div>
    </motion.article>
  );
}

const FlavourMenu: React.FC<FlavourMenuProps> = ({ locale, textLookup, flavours }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'milk-based' | 'sorbet'>('all');
  const [showAll, setShowAll] = useState(false);
  const [initialVisibleCount, setInitialVisibleCount] = useState(getInitialVisibleCount);

  const filtered = flavours.filter((flavour) => (activeFilter === 'all' ? true : flavour.category === activeFilter));
  const visibleFlavours = showAll ? filtered : filtered.slice(0, initialVisibleCount);

  const toggleCopy =
    locale === 'da'
      ? { more: 'Se flere smage', less: 'Vis færre smage' }
      : locale === 'de'
        ? { more: 'Mehr Sorten anzeigen', less: 'Weniger Sorten anzeigen' }
        : { more: 'See more flavours', less: 'Show fewer flavours' };

  useEffect(() => {
    const handleResize = () => setInitialVisibleCount(getInitialVisibleCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowAll(false);
  }, [activeFilter]);

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
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-stone-500">
            {locale === 'da'
              ? 'Sådan starter dagen som regel, men vi kan skifte smage i løbet af dagen, så hjemmesiden er ikke altid opdateret i realtid.'
              : locale === 'de'
                ? 'So starten wir normalerweise in den Tag, aber die Sorten können sich im Laufe des Tages ändern, daher ist die Website nicht immer in Echtzeit aktualisiert.'
                : 'This is how we usually start the day, but flavours may change during the day, so the website is not always updated in real time.'}
          </p>
        </motion.div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${activeFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600'}`}
          >
            {translate(textLookup, locale, 'flavours_filter_all', 'All flavours')}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('milk-based')}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${activeFilter === 'milk-based' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600'}`}
          >
            {translate(textLookup, locale, 'flavours_filter_milk', 'Milk-based')}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('sorbet')}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${activeFilter === 'sorbet' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600'}`}
          >
            {translate(textLookup, locale, 'flavours_filter_vegan', 'Sorbet')}
          </button>
        </div>

        <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {visibleFlavours.map((flavour) => (
              <FlavourCard key={`${flavour.id}-${flavour.image_url || 'fallback'}`} flavour={flavour} locale={locale} textLookup={textLookup} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length > initialVisibleCount && (
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

        <div className="mt-12 text-center text-sm uppercase tracking-[0.3em] text-stone-500">
          {translate(textLookup, locale, 'flavours_cta', "Visit us and taste today's selection")}
        </div>
      </div>
    </section>
  );
};

export default FlavourMenu;
