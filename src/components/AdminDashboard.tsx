import React, { useEffect, useState } from 'react';
import { AdminUser, authAPI } from '../services/api';
import AdminMediaManager from './AdminMediaManager';
import AdminContactCenter from './AdminContactCenter';
import AdminOpeningHours from './AdminOpeningHours';
import AdminTextContent from './AdminTextContent';
import AdminFlavourManager from './AdminFlavourManager';
import AdminPriceManager from './AdminPriceManager';
import AdminGiftCards from './AdminGiftCards';
import AdminMediaLibrary from './AdminMediaLibrary';
import AdminGalleryManager from './AdminGalleryManager';
import AdminUsers from './AdminUsers';

type TabType =
  | 'media-library'
  | 'gallery'
  | 'media'
  | 'contact'
  | 'opening-hours'
  | 'text-content'
  | 'flavours'
  | 'prices'
  | 'gift-cards'
  | 'users';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('flavours');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(authAPI.isAuthenticated());
    setCurrentUser(authAPI.getCurrentUser());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'staff' && activeTab !== 'gift-cards' && activeTab !== 'opening-hours') {
      setActiveTab('gift-cards');
    }
  }, [activeTab, currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const response = await authAPI.login(loginForm);
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      setActiveTab(response.user.role === 'staff' ? 'gift-cards' : 'flavours');
    } catch (error: any) {
      setLoginError(error.message);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-100">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="text-xs uppercase tracking-[0.3em] text-stone-500">Ishuset</div>
          <h1 className="mt-3 font-serif text-3xl font-bold text-stone-900">Admin login</h1>
          <p className="mt-2 text-sm text-stone-500">Default credentials are seeded in the backend for local testing.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                required
              />
            </label>
            {loginError && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{loginError}</div>}
            <button type="submit" className="w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-white">
              Log in
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  const tabs: { id: TabType; label: string }[] = isAdmin
    ? [
        { id: 'media-library', label: 'Media library' },
        { id: 'gallery', label: 'Gallery' },
        { id: 'flavours', label: 'Flavours' },
        { id: 'prices', label: 'Prices' },
        { id: 'gift-cards', label: 'Gift cards' },
        { id: 'opening-hours', label: 'Opening hours' },
        { id: 'text-content', label: 'Translations' },
        { id: 'contact', label: 'Freezer bookings' },
        { id: 'media', label: 'News' },
        { id: 'users', label: 'Users' },
      ]
    : [
        { id: 'gift-cards', label: 'Gift cards' },
        { id: 'opening-hours', label: 'Opening hours' },
      ];

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-stone-500">Protected</div>
            <h1 className="font-serif text-3xl font-bold text-stone-900">Ishuset Admin</h1>
            {currentUser && <p className="mt-1 text-sm text-stone-500">{currentUser.email} | {currentUser.role}</p>}
          </div>
          <button onClick={handleLogout} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700">
            Log out
          </button>
        </div>
      </header>

      <nav className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === tab.id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {activeTab === 'media-library' && <AdminMediaLibrary />}
        {activeTab === 'gallery' && <AdminGalleryManager />}
        {activeTab === 'flavours' && <AdminFlavourManager />}
        {activeTab === 'prices' && <AdminPriceManager />}
        {activeTab === 'gift-cards' && <AdminGiftCards />}
        {activeTab === 'media' && <AdminMediaManager />}
        {activeTab === 'contact' && <AdminContactCenter />}
        {activeTab === 'opening-hours' && <AdminOpeningHours />}
        {activeTab === 'text-content' && <AdminTextContent />}
        {activeTab === 'users' && <AdminUsers />}
      </main>
    </div>
  );
}
