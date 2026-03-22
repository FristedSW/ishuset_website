import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, Coffee, Star } from 'lucide-react';

const OurStory: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: "Frisklavet is",
      description: "Hver dag laver vi vores is fra bunden med kærlighed og omhu"
    },
    {
      icon: Leaf,
      title: "Økologiske ingredienser",
      description: "Vi bruger kun de bedste økologiske og friske råvarer"
    },
    {
      icon: Coffee,
      title: "Italiensk inspiration",
      description: "Autentiske italienske opskrifter med dansk twist"
    },
    {
      icon: Star,
      title: "Bedste is i Østjylland",
      description: "Vores gæster siger det - og vi er stolte af det!"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Vores Historie
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fra en lille drøm om at skabe den perfekte is til en virkelighed 
            der bringer glæde til Marselisborg Havn
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Story text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              Hjemmelavet med kærlighed
            </h3>
            <div className="space-y-4 text-lg text-gray-600">
              <p>
                Hos Ishuset Marselisborg Havn starter hver dag med en ny chance 
                for at skabe noget helt særligt. Vi bruger kun de fineste 
                økologiske ingredienser og følger traditionelle italienske 
                metoder for at sikre den perfekte smag og konsistens.
              </p>
              <p>
                Vores is er ikke bare dessert - det er en oplevelse. Fra 
                den første bid til den sidste, arbejder vi hårdt for at 
                give dig noget at huske. Det er derfor vi kalder os 
                "Bedste is i Østjylland".
              </p>
              <p>
                Kom forbi og smag forskellen. Vi har åbent når solen skinner 
                og vinden blæser - præcis som det skal være.
              </p>
            </div>
          </motion.div>

          {/* Decorative image placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-pink-100 to-yellow-100 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-pink-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Coffee className="w-12 h-12 text-pink-600" />
                </div>
                <p className="text-gray-600 italic">
                  "Billede af vores ismaskine og friske ingredienser"
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-pink-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory; 