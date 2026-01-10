import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TrainPage from './components/TrainPage';
import LocationPage from './components/LocationPage';
import AvionPage from './components/AvionPage';

// Page d'accueil avec les 3 applications alignées verticalement
function HomePage() {
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      gap: '16px',
      background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9, #e2e8f0)'
    }}>
      {/* Section Train */}
      <div style={{
        background: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        margin: '4px',
        transition: 'all 0.3s ease'
      }}>
        <TrainPage />
      </div>

      {/* Section Location */}
      <div style={{
        background: 'linear-gradient(to bottom right, #dcfce7, #bbf7d0)',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        margin: '4px',
        transition: 'all 0.3s ease'
      }}>
        <LocationPage />
      </div>

      {/* Section Avion */}
      <div style={{
        background: 'linear-gradient(to bottom right, #f3e8ff, #e9d5ff)',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        margin: '4px',
        transition: 'all 0.3s ease'
      }}>
        <AvionPage />
      </div>
    </div>
  );
}

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    setIsAuthenticated(auth === 'true');
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/" /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/train" 
          element={
            <ProtectedRoute>
              <TrainPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/location" 
          element={
            <ProtectedRoute>
              <LocationPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/avion" 
          element={
            <ProtectedRoute>
              <AvionPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;