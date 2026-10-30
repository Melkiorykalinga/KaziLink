import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Receipt, Download } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        lang === 'sw'
          ? 'Kuwa na KaziLink kama App kwenye simu au kompyuta yako:\n• Kwenye Chrome (Simu/PC): Bonyeza menu (⋮) kisha chagua "Install App" au "Add to Home screen".\n• Kwenye iPhone (Safari): Bonyeza Share kisha "Add to Home Screen".'
          : 'To install KaziLink as an App on your phone or computer:\n• On Chrome (Phone/PC): Tap the menu (⋮) and choose "Install App" or "Add to Home screen".\n• On iPhone (Safari): Tap Share then "Add to Home Screen".'
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const LanguageSwitcher = () => (
    <div className="inline-flex items-center bg-primary-800 border border-primary-700 rounded-full p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLang('sw')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          lang === 'sw'
            ? 'bg-accent-500 text-white shadow-sm'
            : 'text-primary-200 hover:text-white'
        }`}
        title="Kiswahili"
      >
        <span>🇹🇿</span> SW
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          lang === 'en'
            ? 'bg-accent-500 text-white shadow-sm'
            : 'text-primary-200 hover:text-white'
        }`}
        title="English"
      >
        <span>🌍</span> EN
      </button>
    </div>
  );

  const renderNavLinks = (isMobile = false) => {
    if (!user) return null;

    const linkClass = isMobile 
      ? "block px-3 py-3 rounded-md text-base font-medium text-white hover:bg-primary-700 flex items-center" 
      : "text-primary-100 hover:text-white transition-colors duration-200 flex items-center";

    const DashboardLink = () => {
      let path = '/';
      if (user.role === 'EMPLOYER') path = '/employer/dashboard';
      if (user.role === 'WORKER') path = '/worker/dashboard';
      if (user.role === 'ADMIN') path = '/admin';

      return (
        <Link to={path} className={linkClass} onClick={() => isMobile && setIsOpen(false)}>
          <LayoutDashboard size={18} className="mr-2" /> {t('nav_dashboard')}
        </Link>
      );
    };

    const TransactionsLink = () => {
      if (user.role === 'ADMIN') return null;
      
      const path = user.role === 'EMPLOYER' ? '/employer/transactions' : '/worker/transactions';
      const label = user.role === 'EMPLOYER' ? t('nav_transactionsEmployer') : t('nav_transactionsWorker');
      return (
        <Link to={path} className={linkClass} onClick={() => isMobile && setIsOpen(false)}>
          <Receipt size={18} className="mr-2" /> {label}
        </Link>
      );
    };

    return (
      <>
        <DashboardLink />
        <TransactionsLink />
      </>
    );
  };

  return (
    <nav className="bg-primary-900 border-b border-primary-800 text-white fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-500 to-yellow-400">
              KaziLink
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {t('nav_freeBadge')}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isStandalone && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-800 hover:bg-primary-700 text-primary-100 border border-primary-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Download size={13} />
                {lang === 'sw' ? 'Pakua App' : 'Install App'}
              </button>
            )}
            <LanguageSwitcher />
            {!user ? (
              <>
                <Link to="/login" className="text-primary-100 hover:text-white transition-colors duration-200 font-medium">
                  {t('nav_login')}
                </Link>
                <Link to="/register" className="bg-accent-600 hover:bg-accent-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  {t('nav_signup')}
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-5">
                {renderNavLinks()}
                <div className="h-6 w-px bg-primary-700"></div>
                <span className="text-primary-100 flex items-center">
                  <UserIcon size={16} className="mr-2" /> 
                  {user.fullName}
                  <span className="ml-2 text-xs bg-primary-700 px-2 py-1 rounded-full text-primary-50">
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-300 hover:text-red-100 flex items-center transition-colors cursor-pointer"
                >
                  <LogOut size={18} className="mr-1" /> {t('nav_logout')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button + Language Switcher */}
          <div className="md:hidden flex items-center gap-2">
            {!isStandalone && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary-800 text-primary-100 border border-primary-700 px-2.5 py-1 rounded-full"
              >
                <Download size={12} /> App
              </button>
            )}
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary-100 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-800 shadow-xl border-t border-primary-700">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-white hover:bg-primary-700"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium bg-accent-600 text-white mt-2 text-center"
                >
                  {t('nav_signup')}
                </Link>
              </>
            ) : (
              <>
                <div className="px-3 py-3 border-b border-primary-700 flex flex-col">
                  <span className="text-white font-medium">{user.fullName}</span>
                  <span className="text-primary-200 text-sm mt-1">{user.role}</span>
                </div>
                {renderNavLinks(true)}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-300 hover:bg-primary-700 mt-2 flex items-center"
                >
                  <LogOut size={18} className="mr-2" /> {t('nav_logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
