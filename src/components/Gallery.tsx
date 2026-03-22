import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image, Play } from 'lucide-react';

const Gallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const galleryItems = [
    {
      id: 1,
      type: 'image',
      title: 'Vores ismaskine',
      description: 'Hvor magien sker, når dagens is bliver lavet.',
      placeholder: 'Billede af ismaskine',
    },
    {
      id: 2,
      type: 'image',
      title: 'Friske ingredienser',
      description: 'Økologiske og friske råvarer hver dag.',
      placeholder: 'Billede af friske ingredienser',
    },
    {
      id: 3,
      type: 'image',
      title: 'Vores smage',
      description: 'Et kig på noget af det udvalg, der møder gæsterne.',
      placeholder: 'Billede af iskugler',
    },
    {
      id: 4,
      type: 'image',
      title: 'Marselisborg Havn',
      description: 'Vores smukke placering ved havnen.',
      placeholder: 'Billede af havnen',
    },
    {
      id: 5,
      type: 'video',
      title: 'Bag kulisserne',
      description: 'Et lille indblik i hverdagen hos Ishuset.',
      placeholder: 'Video af isproduktion',
    },
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

  return (
    <section className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mb-16 text-center">
          <h2 className="mb-6 font-serif text-4xl font-bold text-stone-900 md:text-5xl">Galleri</h2>
          <p className="mx-auto max-w-3xl text-xl text-stone-600">Tag et kig bag kulisserne og se stemningen omkring Ishuset.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="relative">
          <div className="relative h-96 overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-100 to-amber-100 md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white/60">
                    {galleryItems[currentIndex].type === 'video' ? (
                      <Play className="h-16 w-16 text-stone-900" />
                    ) : (
                      <Image className="h-16 w-16 text-stone-900" />
                    )}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-stone-900">{galleryItems[currentIndex].title}</h3>
                  <p className="mx-auto max-w-md text-stone-600">{galleryItems[currentIndex].description}</p>
                  <p className="mt-4 text-sm italic text-stone-500">{galleryItems[currentIndex].placeholder}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <button onClick={prevSlide} className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all hover:bg-white">
              <ChevronLeft className="h-6 w-6 text-stone-700" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all hover:bg-white">
              <ChevronRight className="h-6 w-6 text-stone-700" />
            </button>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {galleryItems.map((_, index) => (
                <button key={index} onClick={() => setCurrentIndex(index)} className={`h-3 w-3 rounded-full transition-all ${index === currentIndex ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/75'}`} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }} className="mt-8 flex justify-center gap-4 overflow-x-auto pb-4">
          {galleryItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg transition-all ${index === currentIndex ? 'ring-4 ring-stone-900' : 'ring-2 ring-stone-200 hover:ring-stone-400'}`}
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-amber-100">
                {item.type === 'video' ? <Play className="h-6 w-6 text-stone-900" /> : <Image className="h-6 w-6 text-stone-900" />}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery;
