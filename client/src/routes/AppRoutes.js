import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import { isAuthenticated } from '../utils/auth';
import UserDashboard from '../pages/UserDashboard';
import ProviderDashboard from '../pages/ProviderDashboard';
import MySlotsPage from '../pages/MySlotsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated() ? <Navigate to="/login" /> : <Navigate to="/login" />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/my-slots" element={<MySlotsPage />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      <Route
        path="/dashboard"
        element={
          isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
