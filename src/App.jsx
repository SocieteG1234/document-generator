import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Train, Car, Plane, ArrowRight, House } from 'lucide-react';
import Login from './components/Login';
import TrainPage from './components/TrainPage';
import LocationPage from './components/LocationPage';
import AvionPage from './components/AvionPage';

// Card component pour chaque service
function ServiceCard({ title, description, icon: Icon, bgColor, iconColor, path }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className={`${bgColor} rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className={`${iconColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 text-lg mb-6">{description}</p>
        
        <div className="flex items-center text-gray-700 font-medium group-hover:translate-x-2 transition-transform duration-300">
          <span>Accéder au service</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </div>
      </div>
    </div>
  );
}

// Page d'accueil avec les 3 services en cartes
function HomePage() {
  const services = [
    {
      title: "génération Train",
      description: "générez vos billets de train rapidement et facilement",
      icon: Train,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "bg-blue-500",
      path: "/train"
    },
    {
      title: "Location de Maison",
      description: "générez vos contrats de Location en quelques clics",
      icon: House,
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconColor: "bg-green-500",
      path: "/location"
    },
    {
      title: "Vols Aériens",
      description: "générez vos billets d'avion en quelques clics",
      icon: Plane,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "bg-purple-500",
      path: "/avion"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">Services de Réservation</h1>
          <p className="text-gray-600 mt-2">Choisissez le service dont vous avez besoin</p>
        </div>
      </header>

      {/* Grid des services */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">© 2026 Services de Réservation. Tous droits réservés.</p>
        </div>
      </footer>
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