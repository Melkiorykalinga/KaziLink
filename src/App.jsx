import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Placeholder Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerTransactions from './pages/employer/EmployerTransactions';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTransactions from './pages/worker/WorkerTransactions';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on actual role
    if (user.role === 'EMPLOYER') return <Navigate to="/employer/dashboard" replace />;
    if (user.role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  return (
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

              {/* Employer Routes */}
              <Route path="/employer/*" element={
                <ProtectedRoute allowedRoles={['EMPLOYER']}>
                  <Routes>
                    <Route path="dashboard" element={<EmployerDashboard />} />
                    <Route path="transactions" element={<EmployerTransactions />} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Worker Routes */}
              <Route path="/worker/*" element={
                <ProtectedRoute allowedRoles={['WORKER']}>
                  <Routes>
                    <Route path="dashboard" element={<WorkerDashboard />} />
                    <Route path="transactions" element={<WorkerTransactions />} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Routes>
                    <Route path="" element={<AdminDashboard />} />
                  </Routes>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
