import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Receipt } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          <LayoutDashboard size={18} className="mr-2" /> Dashboard
        </Link>
      );
    };

    const TransactionsLink = () => {
      if (user.role === 'ADMIN') return null; // Admin handles verifications in their dashboard
      
      const path = user.role === 'EMPLOYER' ? '/employer/transactions' : '/worker/transactions';
      return (
        <Link to={path} className={linkClass} onClick={() => isMobile && setIsOpen(false)}>
          <Receipt size={18} className="mr-2" /> Transactions
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
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-500 to-yellow-400">
              KaziLink
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/login" className="text-primary-100 hover:text-white transition-colors duration-200">
                  Log In
                </Link>
                <Link to="/register" className="bg-accent-600 hover:bg-accent-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-6">
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
                  className="text-red-300 hover:text-red-100 flex items-center transition-colors"
                >
                  <LogOut size={18} className="mr-1" /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
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
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium bg-accent-600 text-white mt-2"
                >
                  Sign Up
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
                  <LogOut size={18} className="mr-2" /> Logout
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
