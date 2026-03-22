import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Image } from 'lucide-react';

const Gallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const galleryItems = [
    {
      id: 1,
      type: 'image',
      title: 'Vores ismaskine',
      description: 'Hvor magien sker - vores professionelle ismaskine',
      placeholder: 'Billede af ismaskine'
    },
    {
      id: 2,
      type: 'image',
      title: 'Friske ingredienser',
      description: 'Økologiske og friske råvarer hver dag',
      placeholder: 'Billede af friske ingredienser'
    },
    {
      id: 3,
      type: 'image',
      title: 'Vores smage',
      description: 'En del af vores fantastiske smagsudvalg',
      placeholder: 'Billede af iskugler'
    },
    {
      id: 4,
      type: 'image',
      title: 'Marselisborg Havn',
      description: 'Vores smukke placering ved havnen',
      placeholder: 'Billede af havnen'
    },
    {
      id: 5,
      type: 'video',
      title: 'Bag kulisserne',
      description: 'Se hvordan vi laver vores is',
      placeholder: 'Video af isproduktion'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Galleri
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tag et kig bag kulisserne og se vores passion for is
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-yellow-100">
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
                  <div className="w-32 h-32 bg-white/50 rounded-full mx-auto mb-6 flex items-center justify-center">
                    {galleryItems[currentIndex].type === 'video' ? (
                      <Play className="w-16 h-16 text-pink-600" />
                    ) : (
                      <Image className="w-16 h-16 text-pink-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {galleryItems[currentIndex].title}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {galleryItems[currentIndex].description}
                  </p>
                  <p className="text-sm text-gray-500 mt-4 italic">
                    {galleryItems[currentIndex].placeholder}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {galleryItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Thumbnail navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 flex justify-center gap-4 overflow-x-auto pb-4"
        >
          {galleryItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-4 ring-pink-500'
                  : 'ring-2 ring-gray-200 hover:ring-pink-300'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-yellow-100 flex items-center justify-center">
                {item.type === 'video' ? (
                  <Play className="w-6 h-6 text-pink-600" />
                ) : (
                  <Image className="w-6 h-6 text-pink-600" />
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-600 mb-6">
            Kom forbi og oplev det selv!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transition-colors"
          >
            Besøg os
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery; 