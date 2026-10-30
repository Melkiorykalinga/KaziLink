import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTab, setSelectedTab] = useState('WORKER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        // Automatically route based on the user's true role in the database (including ADMIN silently)
        if (result.user.role === 'ADMIN') navigate('/admin');
        else if (result.user.role === 'EMPLOYER') navigate('/employer/dashboard');
        else if (result.user.role === 'WORKER') navigate('/worker/dashboard');
        else navigate('/');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {t('login_title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('login_or')}{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              {t('login_createAccount')}
            </Link>
          </p>
        </div>

        {/* Clean Role Switcher (Worker / Employer only — Admin logs in silently via credentials) */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedTab('WORKER')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              selectedTab === 'WORKER' ? 'bg-white text-primary-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('reg_wantWork')}
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('EMPLOYER')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              selectedTab === 'EMPLOYER' ? 'bg-white text-primary-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('reg_wantHire')}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-gray-50"
                placeholder={t('login_email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-gray-50"
                placeholder={t('login_password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                {t('login_forgot')}
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <Loader className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <>
                  {t('login_submit')} <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
