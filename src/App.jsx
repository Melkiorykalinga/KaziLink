import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerTransactions from './pages/employer/EmployerTransactions';
import PostJob from './pages/employer/PostJob';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTransactions from './pages/worker/WorkerTransactions';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerProfile from './pages/WorkerProfile';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'EMPLOYER') return <Navigate to="/employer/dashboard" replace />;
    if (user.role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Employer Protected Routes */}
                <Route path="/employer/dashboard" element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/employer/transactions" element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerTransactions />
                  </ProtectedRoute>
                } />
                <Route path="/employer/post-job" element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <PostJob />
                  </ProtectedRoute>
                } />

                {/* Worker Protected Routes (placed before /worker/:id so 'dashboard' & 'transactions' are never treated as :id) */}
                <Route path="/worker/dashboard" element={
                  <ProtectedRoute allowedRoles={['WORKER']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/worker/transactions" element={
                  <ProtectedRoute allowedRoles={['WORKER']}>
                    <WorkerTransactions />
                  </ProtectedRoute>
                } />

                {/* Public Worker Profile Route */}
                <Route path="/worker/:id" element={<WorkerProfile />} />

                {/* Hidden Admin Route (accessible only when logged in as ADMIN) */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
