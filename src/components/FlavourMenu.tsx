import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Leaf, Star } from 'lucide-react';

interface Flavour {
  id: number;
  name: string;
  description: string;
  category: 'classic' | 'vegan';
  isVegan: boolean;
  color: string;
  price: string;
}

const FlavourMenu: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'vegan'>('all');

  const flavours: Flavour[] = [
    {
      id: 1,
      name: "Vanilje",
      description: "Klassisk italiensk vanilje med ægte vaniljestænger",
      category: 'classic',
      isVegan: false,
      color: 'from-yellow-100 to-yellow-200',
      price: "25 kr"
    },
    {
      id: 2,
      name: "Chokolade",
      description: "Mørk belgisk chokolade med en smule salt",
      category: 'classic',
      isVegan: true,
      color: 'from-amber-100 to-amber-200',
      price: "25 kr"
    },
    {
      id: 3,
      name: "Jordbær",
      description: "Friske økologiske jordbær fra lokale gårde",
      category: 'vegan',
      isVegan: true,
      color: 'from-pink-100 to-pink-200',
      price: "28 kr"
    },
    {
      id: 4,
      name: "Mint & Chokolade",
      description: "Frisk mynte med mørk chokolade chips",
      category: 'classic',
      isVegan: false,
      color: 'from-green-100 to-green-200',
      price: "27 kr"
    },
    {
      id: 5,
      name: "Kokos & Mango",
      description: "Kremet kokos med sød mango",
      category: 'vegan',
      isVegan: true,
      color: 'from-orange-100 to-orange-200',
      price: "29 kr"
    },
    {
      id: 6,
      name: "Hindbær & Hvid chokolade",
      description: "Syrlige hindbær med hvid chokolade",
      category: 'classic',
      isVegan: false,
      color: 'from-red-100 to-red-200',
      price: "28 kr"
    },
    {
      id: 7,
      name: "Salted Caramel",
      description: "Kremet karamel med havsalt",
      category: 'classic',
      isVegan: false,
      color: 'from-amber-100 to-amber-200',
      price: "26 kr"
    },
    {
      id: 8,
      name: "Blåbær & Lavendel",
      description: "Vilde blåbær med en touch af lavendel",
      category: 'vegan',
      isVegan: true,
      color: 'from-purple-100 to-purple-200',
      price: "30 kr"
    }
  ];

  const filteredFlavours = flavours.filter(flavour => {
    if (activeFilter === 'vegan') return flavour.isVegan;
    return true;
  });

  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Vores Smage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Frisklavet is med økologiske ingredienser og italiensk inspiration
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { key: 'all', label: 'Alle smage', icon: Filter },
            { key: 'vegan', label: 'Veganske', icon: Leaf }
          ].map((filter) => (
            <motion.button
              key={filter.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeFilter === filter.key
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-pink-50 border-2 border-pink-200'
              }`}
            >
              <filter.icon className="w-5 h-5" />
              {filter.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Flavours grid */}
        <motion.div
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="wait">
            {filteredFlavours.map((flavour, index) => (
              <motion.div
                key={flavour.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Flavour image placeholder */}
                <div className={`h-48 bg-gradient-to-br ${flavour.color} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Star className="w-10 h-10 text-pink-600" />
                    </div>
                    <p className="text-gray-600 italic text-sm">
                      {flavour.name}
                    </p>
                  </div>
                </div>

                {/* Flavour info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {flavour.name}
                    </h3>
                    <span className="text-lg font-semibold text-pink-600">
                      {flavour.price}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {flavour.description}
                  </p>

                  {/* Tags */}
                  <div className="flex gap-2">
                    {flavour.isVegan && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        <Leaf className="w-4 h-4" />
                        Vegan
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Kom forbi og smag vores frisklavet is!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transition-colors"
          >
            Find os her
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FlavourMenu; 