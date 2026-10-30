import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Landing = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-900 text-white pt-16 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0e4a6e] opacity-40 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-32 -right-24 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center mt-8">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm font-semibold mb-6 shadow-sm">
            {t('hero_badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            {t('hero_title1')} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-yellow-300">
              {t('hero_titleHighlight')}
            </span>
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-primary-100 max-w-3xl mb-10 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/register?role=EMPLOYER"
              className="px-8 py-4 bg-accent-600 hover:bg-accent-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center"
            >
              {t('hero_btnHire')}
            </Link>
            <Link
              to="/register?role=WORKER"
              className="px-8 py-4 bg-white text-primary-900 hover:bg-primary-50 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-transparent"
            >
              {t('hero_btnWork')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="relative z-20 max-w-5xl mx-auto -mt-16 px-4 w-full">
        <div className="bg-white rounded-2xl shadow-xl grid grid-cols-2 md:grid-cols-4 items-center p-6 md:p-8 border border-gray-100 gap-6">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-emerald-600">0%</p>
            <p className="text-gray-500 mt-1 uppercase font-semibold text-xs md:text-sm tracking-wider">
              {t('stats_commission')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary-800">100%</p>
            <p className="text-gray-500 mt-1 uppercase font-semibold text-xs md:text-sm tracking-wider">
              Direct P2P Pay
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary-800">24/7</p>
            <p className="text-gray-500 mt-1 uppercase font-semibold text-xs md:text-sm tracking-wider">
              {t('stats_activeWorkers')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary-800">4.9</p>
            <p className="text-gray-500 mt-1 uppercase font-semibold text-xs md:text-sm tracking-wider flex items-center justify-center">
              <Star className="w-4 h-4 text-accent-500 mr-1 inline" /> {t('stats_avgRating')}
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-primary-900">{t('how_title')}</h2>
            <p className="mt-4 text-xl text-gray-600">{t('how_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <MapPin className="w-10 h-10 text-white" />,
                title: t('how_step1Title'),
                desc: t('how_step1Desc'),
              },
              {
                icon: <Clock className="w-10 h-10 text-white" />,
                title: t('how_step2Title'),
                desc: t('how_step2Desc'),
              },
              {
                icon: <ShieldCheck className="w-10 h-10 text-white" />,
                title: t('how_step3Title'),
                desc: t('how_step3Desc'),
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-gray-100"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                <div className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md transform group-hover:rotate-6 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Direct Payment & Trust Banner */}
          <div className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-200 font-semibold text-sm uppercase tracking-wider mb-2">
                <CheckCircle size={18} /> 0% Commission · Direct Mobile Money & Cash
              </div>
              <h3 className="text-2xl font-extrabold mb-2">{t('trust_title')}</h3>
              <p className="text-emerald-50 max-w-2xl">{t('trust_desc')}</p>
            </div>
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              {t('nav_signup')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-950 py-10 text-center text-primary-200 mt-auto">
        <p className="font-semibold text-white mb-1">KaziLink</p>
        <p className="text-sm">&copy; {new Date().getFullYear()} KaziLink. {t('footer_rights')}</p>
      </footer>
    </div>
  );
};

export default Landing;
