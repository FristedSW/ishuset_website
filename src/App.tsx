import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import OpeningHours from './components/OpeningHours';
import OurStory from './components/OurStory';
import FlavourMenu from './components/FlavourMenu';
import Gallery from './components/Gallery';
import SpecialServices from './components/SpecialServices';
import ContactMap from './components/ContactMap';
import AdminDashboard from './components/AdminDashboard';
import PriceSection from './components/PriceSection';
import SocialMediaUpdates from './components/SocialMediaUpdates';
import GiftCardSection from './components/GiftCardSection';
import {
  flavourAPI,
  Flavour,
  Locale,
  openingHoursAPI,
  OpeningHours as OpeningHoursType,
  priceAPI,
  PriceItem,
  textContentAPI,
  TextContent,
} from './services/api';
import { buildTextLookup } from './lib/site';

function MainWebsite() {
  const [locale, setLocale] = useState<Locale>('da');
  const [texts, setTexts] = useState<TextContent[]>([]);
  const [hours, setHours] = useState<OpeningHoursType[]>([]);
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [prices, setPrices] = useState<PriceItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const [textData, hourData, flavourData, priceData] = await Promise.all([
        textContentAPI.getAll(),
        openingHoursAPI.getAll(),
        flavourAPI.getAll(),
        priceAPI.getAll(),
      ]);
      setTexts(Array.isArray(textData) ? textData : []);
      setHours(Array.isArray(hourData) ? hourData : []);
      setFlavours(Array.isArray(flavourData) ? flavourData : []);
      setPrices(Array.isArray(priceData) ? priceData : []);
    };

    load().catch((error) => {
      console.error('Failed to load website content', error);
    });
  }, []);

  const textLookup = useMemo(() => buildTextLookup(texts), [texts]);

  return (
    <div className="App bg-amber-50 text-stone-900">
      <Navigation locale={locale} onLocaleChange={setLocale} textLookup={textLookup} />
      <HeroSection locale={locale} textLookup={textLookup} hours={hours} />
      <OpeningHours locale={locale} textLookup={textLookup} hours={hours} />
      <OurStory locale={locale} textLookup={textLookup} />
      <FlavourMenu locale={locale} textLookup={textLookup} flavours={flavours} />
      <PriceSection locale={locale} textLookup={textLookup} prices={prices} />
      <Gallery locale={locale} textLookup={textLookup} />
      <SocialMediaUpdates locale={locale} textLookup={textLookup} />
      <SpecialServices locale={locale} textLookup={textLookup} />
      <GiftCardSection locale={locale} textLookup={textLookup} />
      <ContactMap locale={locale} textLookup={textLookup} hours={hours} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainWebsite />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
