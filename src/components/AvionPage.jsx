import React, { useState, useRef, useEffect } from 'react';
import { Plane, Download, User, Users, Save, FolderOpen, Edit2, Trash2 } from 'lucide-react';

const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const PREDEFINED_USERS = [
  {
    id: 'user1',
    name: 'Betango Brunda',
    data: {
      airline: 'Air France',
      passengerName: 'LE VOYAGE DANS TOUS',
      flightClass: 'FIRST CLASS / PREMIÈRE CLASSE',
      flightDate: '06 November 2018',
      gate: 'A12',
      seat: '26B',
      seatClass: 'A',
      boardingTime: '22:30',
      departureCity: 'PARIS',
      arrivalCity: 'HONG KONG',
      airlineUse: '0081A',
      recordLocator: 'AAC27670',
    }
  },
];

export default function FlightTicketGenerator() {
  const [currentView, setCurrentView] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    airline: '',
    passengerName: '',
    flightClass: 'ECONOMY CLASS / CLASSE ÉCONOMIQUE',
    flightDate: '',
    gate: '',
    seat: '',
    seatClass: 'A',
    boardingTime: '',
    departureCity: '',
    arrivalCity: '',
    airlineUse: '',
    recordLocator: '',
  });

  const [savedTickets, setSavedTickets] = useState([]);

  useEffect(() => {
    loadSavedTickets();
  }, []);

  const loadSavedTickets = async () => {
    try {
      const result = await window.storage.list('flight:');
      if (result && result.keys) {
        const tickets = [];
        for (const key of result.keys) {
          const data = await window.storage.get(key);
          if (data) {
            tickets.push(JSON.parse(data.value));
          }
        }
        setSavedTickets(tickets);
      }
    } catch (error) {
      console.log('Chargement des billets...');
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setFormData(user.data);
    setCurrentView('form');
  };

  const saveTicket = async () => {
    const ticketId = `flight:${Date.now()}`;
    const ticketData = {
      id: ticketId,
      date: new Date().toISOString(),
      formData,
      name: `${formData.passengerName} - ${formData.departureCity} → ${formData.arrivalCity}`
    };

    try {
      await window.storage.set(ticketId, JSON.stringify(ticketData));
      await loadSavedTickets();
      alert('✅ Billet sauvegardé avec succès !');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const loadTicket = (ticket) => {
    setFormData(ticket.formData);
    setCurrentView('form');
  };

  const deleteTicket = async (ticketId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce billet ?')) {
      try {
        await window.storage.delete(ticketId);
        await loadSavedTickets();
        alert('✅ Billet supprimé');
      } catch (error) {
        alert('❌ Erreur lors de la suppression');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await loadJsPDF();
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [105, 210]
      });

      // Fond rose clair
      doc.setFillColor(245, 225, 225);
      doc.rect(0, 0, 210, 105, 'F');

      // Logo compagnie aérienne (en haut à droite)
      doc.setTextColor(180, 50, 50);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.airline.toUpperCase() || 'AIRLINE', 160, 15);

      // Ligne de séparation verticale au milieu
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(105, 0, 105, 105);

      // ==================== PARTIE GAUCHE ====================
      
      // Class
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Class | Classe', 10, 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.flightClass || 'ECONOMY CLASS', 10, 16);

      // Flight & Date, Gate, Seat sur la même ligne
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Flight & Date | Vol et date', 10, 25);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.flightDate || '06 November 2018', 10, 31);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Gate | Porte', 60, 25);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.gate || 'A12', 60, 31);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Seat | Place', 78, 25);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.seat || '26B', 78, 31);

      // Icônes interdiction (simulées avec texte)
      doc.setFontSize(10);
      doc.text('⊘', 88, 30);
      doc.text('🚭', 94, 30);

      // Boarding time
      doc.setFontSize(8);
      doc.setTextColor(180, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.text('Boarding time', 10, 42);
      doc.text('Heure d\'embarquement', 10, 46);
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(formData.boardingTime || '22:30', 50, 46);

      // From
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('From | De', 10, 56);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.departureCity || 'PARIS', 10, 63);

      // To
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('To | Destination', 55, 56);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.arrivalCity || 'HONG KONG', 55, 63);

      // Name
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Name | Nom', 10, 73);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const maxNameWidth = 40;
      const nameSplit = doc.splitTextToSize(formData.passengerName || 'PASSENGER NAME', maxNameWidth);
      doc.text(nameSplit[0], 10, 79);

      // Airline use
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Airline use | À usage interne', 55, 73);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.airlineUse || '0081A', 55, 79);
      doc.text(formData.recordLocator || 'AAC27670', 72, 79);

      // Boarding Pass text en bas
      doc.setFontSize(9);
      doc.setTextColor(180, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.text('Boarding Pass | Carte d\'accès à bord', 10, 95);

      // IATA logo
      doc.setFontSize(8);
      doc.text('IATA', 85, 95);
      doc.circle(87, 93, 3);

      // ==================== PARTIE DROITE (Talon) ====================
      
      // Name | Nom (en haut)
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Name | Nom', 112, 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const maxNameWidthRight = 35;
      const nameSplitRight = doc.splitTextToSize(formData.passengerName || 'PASSENGER NAME ...', maxNameWidthRight);
      doc.text(nameSplitRight[0], 112, 16);

      // Code-barres vertical (simulé)
      doc.setFillColor(0, 0, 0);
      for (let i = 0; i < 45; i++) {
        const width = Math.random() > 0.5 ? 1.5 : 0.8;
        doc.rect(130 + (i * 1.3), 25, width, 55, 'F');
      }

      // Seat & Class (en bas à droite)
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Seat & Class | Place et classe', 112, 85);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.seat || '26B', 112, 92);
      doc.text(formData.seatClass || 'A', 140, 92);

      // To | Destination (en bas)
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('To | Destination', 170, 85);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.arrivalCity || 'HONG KONG', 170, 92);

      // Remarks (cadre vide)
      doc.setDrawColor(150, 150, 150);
      doc.rect(170, 25, 30, 50);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text('Remarks | Observations', 171, 23);

      doc.save(`Boarding-Pass-${formData.recordLocator || 'Document'}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('❌ Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  if (currentView === 'users') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-3 sm:p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sélectionnez un Utilisateur</h1>
              </div>
              <button
                onClick={() => setCurrentView('tickets')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
              >
                <FolderOpen className="w-4 h-4" />
                Billets ({savedTickets.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {PREDEFINED_USERS.map((user) => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">{user.name}</h3>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <p><strong>Compagnie:</strong> {user.data.airline}</p>
                    <p><strong>Route:</strong> {user.data.departureCity} → {user.data.arrivalCity}</p>
                    <p><strong>Date:</strong> {user.data.flightDate}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                💡 <strong>Astuce:</strong> Pour ajouter des utilisateurs, éditez le tableau <code>PREDEFINED_USERS</code> dans le code source.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'tickets') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-3 sm:p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Billets Sauvegardés</h2>
              <button
                onClick={() => setCurrentView('users')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
              >
                ← Retour
              </button>
            </div>
            
            {savedTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">Aucun billet sauvegardé</p>
            ) : (
              <div className="space-y-3">
                {savedTickets.map((ticket) => (
                  <div key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="font-semibold text-sm sm:text-base break-words">{ticket.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(ticket.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => loadTicket(ticket)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        <Edit2 className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Carte d'Embarquement</h1>
                {selectedUser && <p className="text-xs sm:text-sm text-gray-600">Utilisateur: {selectedUser.name}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
              <button
                onClick={() => setCurrentView('users')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                ← Utilisateurs
              </button>
              <button
                onClick={() => setCurrentView('tickets')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Billets</span> ({savedTickets.length})
              </button>
              <button
                onClick={saveTicket}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Compagnie Aérienne</h2>
            </div>
            <input
              type="text"
              name="airline"
              placeholder="Nom de la compagnie (ex: Air France, Emirates, Lufthansa)"
              value={formData.airline}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Informations du Passager</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="passengerName"
                placeholder="Nom complet du passager"
                value={formData.passengerName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              />
              <select
                name="flightClass"
                value={formData.flightClass}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              >
                <option value="ECONOMY CLASS / CLASSE ÉCONOMIQUE">Classe Économique</option>
                <option value="BUSINESS CLASS / CLASSE AFFAIRES">Classe Affaires</option>
                <option value="FIRST CLASS / PREMIÈRE CLASSE">Première Classe</option>
              </select>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Détails du Vol</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                name="flightDate"
                placeholder="Date (ex: 06 November 2018)"
                value={formData.flightDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <input
                type="text"
                name="gate"
                placeholder="Porte (ex: A12)"
                value={formData.gate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <input
                type="text"
                name="boardingTime"
                placeholder="Heure d'embarquement (ex: 22:30)"
                value={formData.boardingTime}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Itinéraire</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="departureCity"
                placeholder="Ville de départ (ex: PARIS)"
                value={formData.departureCity}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
              <input
                type="text"
                name="arrivalCity"
                placeholder="Ville d'arrivée (ex: HONG KONG)"
                value={formData.arrivalCity}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Siège et Codes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <input
                type="text"
                name="seat"
                placeholder="Siège (ex: 26B)"
                value={formData.seat}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
              />
              <input
                type="text"
                name="seatClass"
                placeholder="Classe siège (ex: A)"
                value={formData.seatClass}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
              />
              <input
                type="text"
                name="airlineUse"
                placeholder="Usage interne (ex: 0081A)"
                value={formData.airlineUse}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
              />
              <input
                type="text"
                name="recordLocator"
                placeholder="Localisateur (ex: AAC27670)"
                value={formData.recordLocator}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        <button
          onClick={generatePDF}
          className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg text-sm sm:text-base"
        >
          <Download className="w-5 h-5" />
          Télécharger la Carte d'Embarquement
        </button>
      </div>
    </div>
  );
}