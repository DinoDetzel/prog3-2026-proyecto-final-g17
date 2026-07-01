import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Navbar from './components/layout/Navbar';
import authService from './services/authService';

function App() {
  const [user, setUser] = useState(authService.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Navbar user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/perfil" element={
          <PrivateRoute>
            <Perfil onLogout={handleLogout} />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;