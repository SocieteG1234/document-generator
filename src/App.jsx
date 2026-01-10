import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TrainPage from './components/TrainPage';
import LocationPage from './components/LocationPage';
import AvionPage from './components/AvionPage';

// Page d'accueil avec les 3 applications affichées
function HomePage() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gridTemplateRows: '50vh 50vh', 
      height: '100vh', 
      margin: 0,
      padding: 0
    }}>
      
      {/* Application du haut - TrainPage */}
      <Link to="/train" style={{ gridColumn: '1 / 3', overflow: 'auto', textDecoration: 'none' }}>
        <TrainPage />
      </Link>

      {/* Application en bas à gauche - LocationPage */}
      <Link to="/location" style={{ overflow: 'auto', textDecoration: 'none' }}>
        <LocationPage />
      </Link>

      {/* Application en bas à droite - AvionPage */}
      <Link to="/avion" style={{ overflow: 'auto', textDecoration: 'none' }}>
        <AvionPage />
      </Link>

    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/train" element={<TrainPage />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/avion" element={<AvionPage />} />
      </Routes>
    </Router>
  );
}

export default App;