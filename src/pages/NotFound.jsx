import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
    <h1 className="text-9xl font-extrabold text-primary-900 opacity-10">404</h1>
    <h2 className="text-3xl font-bold text-gray-900 mt-4 text-center">Page Not Found</h2>
    <p className="text-gray-600 mt-2 text-center mb-8">The route you are looking for does not exist on KaziLink.</p>
    <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium shadow-md transition-all">
      Return Home
    </Link>
  </div>
);

export default NotFound;
