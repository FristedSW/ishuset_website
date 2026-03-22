import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import OpeningHours from './components/OpeningHours';
import OurStory from './components/OurStory';
import FlavourMenu from './components/FlavourMenu';
import Gallery from './components/Gallery';
import SpecialServices from './components/SpecialServices';
import ContactMap from './components/ContactMap';
import SocialMediaUpdates from './components/SocialMediaUpdates';
import AdminDashboard from './components/AdminDashboard';

function MainWebsite() {
  return (
    <div className="App">
      <Navigation />
      <HeroSection />
      <OpeningHours />
      <OurStory />
      <FlavourMenu />
      <Gallery />
      <SpecialServices />
      <ContactMap />
      <SocialMediaUpdates />
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
