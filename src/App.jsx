import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './pages/admin/DashboardLayout';
import ManageCompanies from './pages/admin/ManageCompanies';
import CreateCompany from './pages/admin/CreateCompany';
import CompanyDetails from './pages/admin/CompanyDetails';
import CompanyPage from './pages/public/CompanyPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Domain mapping for specific companies
const domainMap = {
  'links.preconstructurals.com': 'precon-structurals',
  'links.ctechengineering.in': 'c-tech-engineering',
};

function App() {
  const { currentUser } = useAuth();
  
  // A small wrapper to redirect already logged in users away from the login page
  const LoginRedirect = () => {
    if (currentUser) return <Navigate to="/admin" replace />;
    return <Login />;
  };

  // component to handle the root path based on domain
  const Home = () => {
    const currentHostname = window.location.hostname;
    const defaultCompany = domainMap[currentHostname];
    
    if (defaultCompany) {
      return <CompanyPage companySlug={defaultCompany} />;
    }
    
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginRedirect />} />
      
      {/* Admin Protected Routes */}
      <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ManageCompanies />} />
        <Route path="create" element={<CreateCompany />} />
        <Route path="company/:id" element={<CompanyDetails />} />
      </Route>

      {/* Public Routes */}
      <Route path="/:company_name" element={<CompanyPage />} />
      
      {/* Default Fallback */}
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
