import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, UserCheck, Star, ShieldCheck, MapPin, Clock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-900 text-white pt-20 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0e4a6e] opacity-40 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-32 -right-24 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center mt-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Hire workers as easy as <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-yellow-300">
               ordering a ride.
            </span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-primary-100 max-w-3xl mb-10">
            KaziLink connects employers with nearby temporary workers instantly. No waiting, no hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/register?role=EMPLOYER" className="px-8 py-4 bg-accent-600 hover:bg-accent-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center">
              I Want to Hire
            </Link>
            <Link to="/register?role=WORKER" className="px-8 py-4 bg-white text-primary-900 hover:bg-primary-50 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-transparent">
              I Want to Work
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row pseudo */}
      <div className="relative z-20 max-w-5xl mx-auto -mt-16 px-4 w-full">
         <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row justify-around items-center p-8 border border-gray-100 gap-8 md:gap-0">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-800">10k+</p>
              <p className="text-gray-500 mt-1 uppercase font-semibold text-sm tracking-wider">Jobs Completed</p>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-800">5k+</p>
              <p className="text-gray-500 mt-1 uppercase font-semibold text-sm tracking-wider">Active Workers</p>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-800">4.8</p>
              <p className="text-gray-500 mt-1 uppercase font-semibold text-sm tracking-wider flex items-center justify-center">
                <Star className="w-4 h-4 text-accent-500 mr-1 inline" /> Avg Rating
              </p>
            </div>
         </div>
      </div>

      {/* How it works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-primary-900">How KaziLink Works</h2>
            <p className="mt-4 text-xl text-gray-600">Bridging the gap between employers and gig workers in three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <MapPin className="w-10 h-10 text-white" />, 
                title: '1. Post a Job', 
                desc: 'Describe what you need, where you need it, and how much you are paying.' 
              },
              { 
                icon: <Clock className="w-10 h-10 text-white" />, 
                title: '2. Instant Match', 
                desc: 'Nearby workers are notified instantly and apply within seconds.' 
              },
              { 
                icon: <ShieldCheck className="w-10 h-10 text-white" />, 
                title: '3. Get it Done', 
                desc: 'Review applicants, select the best fit, and we handle the trust and payments.' 
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                <div className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md transform group-hover:rotate-6 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary-950 py-12 text-center text-primary-200 mt-auto">
        <p>&copy; {new Date().getFullYear()} KaziLink. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
