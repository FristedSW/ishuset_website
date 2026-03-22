import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { galleryAPI, GalleryItem as GalleryItemType, Locale } from '../services/api';
import { translate } from '../lib/site';

interface GalleryProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
}

export default function Gallery({ locale, textLookup }: GalleryProps) {
  const [items, setItems] = useState<GalleryItemType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    galleryAPI
      .getAll()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  const hasGallery = items.length > 0;

  useEffect(() => {
    if (currentIndex > items.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, items.length]);

  const copy = useMemo(
    () => ({
      title: translate(textLookup, locale, 'gallery_title', 'Galleri'),
      subtitle: translate(
        textLookup,
        locale,
        'gallery_subtitle',
        'Et kig pa stemningen, iskiosken og billederne fra Ishuset.'
      ),
    }),
    [locale, textLookup]
  );

  if (!hasGallery) {
    return null;
  }

  const currentItem = items[currentIndex];
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <section id="gallery" className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 font-serif text-4xl font-bold text-stone-900 md:text-5xl">{copy.title}</h2>
          <p className="mx-auto max-w-3xl text-xl text-stone-600">{copy.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative h-96 overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 to-cyan-50 md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img
                  src={currentItem.image_url}
                  alt={currentItem.alt_text || currentItem.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent p-6 text-white">
                  <h3 className="text-2xl font-bold">{currentItem.title}</h3>
                  {currentItem.description && <p className="mt-2 max-w-2xl text-sm text-white/85">{currentItem.description}</p>}
                </div>
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6 text-stone-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6 text-stone-700" />
                </button>
              </>
            )}

            {items.length > 1 && (
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-3 w-3 rounded-full transition-all ${
                      index === currentIndex ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {items.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-8 flex justify-center gap-4 overflow-x-auto pb-4"
          >
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl transition-all ${
                  index === currentIndex ? 'ring-4 ring-sky-500' : 'ring-2 ring-stone-200 hover:ring-sky-300'
                }`}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.alt_text || item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 to-cyan-50">
                    <ImageIcon className="h-6 w-6 text-stone-900" />
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
