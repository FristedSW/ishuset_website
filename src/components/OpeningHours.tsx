import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sun, Wind, Calendar } from 'lucide-react';

const OpeningHours: React.FC = () => {
  const openingHours = [
    { day: 'Mandag', hours: '12:00 - 20:00', status: 'Åbent' },
    { day: 'Tirsdag', hours: '12:00 - 20:00', status: 'Åbent' },
    { day: 'Onsdag', hours: '12:00 - 20:00', status: 'Åbent' },
    { day: 'Torsdag', hours: '12:00 - 20:00', status: 'Åbent' },
    { day: 'Fredag', hours: '12:00 - 20:00', status: 'Åbent' },
    { day: 'Lørdag', hours: '12:00 - 20:00', status: 'Åbent' },
    { day: 'Søndag', hours: '12:00 - 20:00', status: 'Åbent' }
  ];

  return (
    <section id="opening-hours" className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-orange-600" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
              Åbningstider
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vi har åbent når solen skinner og vinden blæser
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Opening hours table */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Daglige åbningstider
            </h3>
            <div className="space-y-4">
              {openingHours.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-800">{day.day}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-800">{day.hours}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-600 font-medium">{day.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weather-based opening info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Sun className="w-8 h-8 text-orange-600" />
                <h3 className="text-2xl font-bold text-gray-800">
                  Vejrbaseret åbning
                </h3>
              </div>
              <p className="text-gray-700 mb-4">
                Vi følger naturens rytme og har åbent når vejret er godt. 
                Perfekt til en is på en solrig dag ved havnen!
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700">Solen skinner</span>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Vinden blæser</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Særlige åbningstider
              </h3>
              <div className="space-y-3 text-gray-600">
                <p>• Lukket i dårligt vejr</p>
                <p>• Lukket om vinteren (november-marts)</p>
                <p>• Sæsonbaseret åbning</p>
                <p>• Følg os på Facebook for live updates</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-6 text-center"
            >
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                I tvivl om vi har åbent?
              </h4>
              <p className="text-gray-600 mb-4">
                Ring til os for at høre om vi har åbent
              </p>
              <motion.a
                href="tel:+4586761399"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Ring til os
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OpeningHours; 