import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, ExternalLink } from 'lucide-react';

const ContactMap: React.FC = () => {
  const contactInfo = [
    {
      icon: MapPin,
      label: "Adresse",
      value: "Marselisborg Havnevej 42, 8000 Aarhus",
      link: "https://maps.google.com/?q=Marselisborg+Havnevej+42,+8000+Aarhus",
      isLink: true
    },
    {
      icon: Phone,
      label: "Telefon",
      value: "+45 86 76 13 99",
      link: "tel:+4586761399",
      isLink: true
    },
    {
      icon: Mail,
      label: "Email",
      value: "mail@ishusetmarselisborghavn.dk",
      link: "mailto:mail@ishusetmarselisborghavn.dk",
      isLink: true
    },
    {
      icon: Clock,
      label: "Åbningstider",
      value: "Daglig 12:00-20:00",
      link: "",
      isLink: false
    }
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://www.facebook.com/ishusetmarselisborghavn/?locale=da_DK",
      color: "hover:bg-blue-600"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/ishuset/",
      color: "hover:bg-pink-600"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Find os
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kom forbi og besøg os i det smukke Marselisborg Havn
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Map placeholder - replace with actual map embed */}
              <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Interaktivt kort
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Marselisborg Havnevej 42, 8000 Aarhus
                  </p>
                  <motion.a
                    href="https://maps.google.com/?q=Marselisborg+Havnevej+42,+8000+Aarhus"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Åbn i Google Maps
                  </motion.a>
                </div>
              </div>
              
              {/* Map info overlay */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Marselisborg Havnevej 42
                </h3>
                <p className="text-gray-600 mb-4">
                  Vi ligger i hjertet af det smukke Marselisborg Havn, 
                  med udsigt over vandet og en fantastisk atmosfære.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Let tilgængelig med offentlig transport</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Contact details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Kontaktoplysninger
              </h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        {info.label}
                      </p>
                      {info.isLink ? (
                        <a
                          href={info.link}
                          className="text-gray-800 hover:text-pink-600 transition-colors font-medium"
                          target={info.link.startsWith('http') ? '_blank' : undefined}
                          rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-800 font-medium">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social media */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Følg os
              </h3>
              <p className="text-gray-600 mb-6">
                Følg med i vores dagligdag og få de seneste nyheder om nye smage og særlige tilbud.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 bg-gray-100 ${social.color} text-gray-700 rounded-full flex items-center justify-center transition-all`}
                  >
                    <social.icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Opening hours */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Åbningstider
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mandag - Søndag</span>
                  <span className="font-semibold text-gray-800">12:00 - 20:00</span>
                </div>
                <div className="border-t border-pink-200 pt-3">
                  <p className="text-sm text-gray-600">
                    Vi har åbent når solen skinner og vinden blæser! 
                    Besøg os for at få den bedste is i Østjylland.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactMap; 