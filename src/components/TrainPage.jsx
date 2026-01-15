import React, { useState, useEffect } from 'react';
import { Train, Download, User, Users, Save, FolderOpen, Edit2, Trash2, Globe } from 'lucide-react';

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

const TRANSLATIONS = {
  fr: {
    title: 'VOTRE E-BILLET',
    subtitle: 'Nominatif, incessible, a presenter lors du controle',
    departure: 'Depart',
    arrival: 'Arriv.',
    at: 'a',
    from: 'de',
    to: 'a',
    car: 'VOITURE',
    seat: 'PLACE ASSISE',
    berth: 'COUCHETTE',
    class: 'Classe',
    name: 'Nom / Prenom',
    file: 'Dossier',
    clientRef: 'References client',
    price: 'Prix',
    conditions: 'PRIX ET ECHANGE SS CONDITIONS VALABLE SUR CE TRAIN       OFFREMETRO',
    mandatory: 'Presence a quai obligatoire 2 mn avant depart',
    ticketNum: 'N° e-billet'
  },
  it: {
    title: 'IL TUO E-BIGLIETTO',
    subtitle: 'Nominativo, non cedibile, da presentare al controllo',
    departure: 'Partenza',
    arrival: 'Arrivo',
    at: 'alle',
    from: 'da',
    to: 'a',
    car: 'CARROZZA',
    seat: 'POSTO A SEDERE',
    berth: 'CUCCETTA',
    class: 'Classe',
    name: 'Nome / Cognome',
    file: 'Pratica',
    clientRef: 'Riferimenti cliente',
    price: 'Prezzo',
    conditions: 'PREZZO E CAMBIO SOTTO CONDIZIONI VALIDO SU QUESTO TRENO    OFFREMETRO',
    mandatory: 'Presenza obbligatoria al binario 2 min prima della partenza',
    ticketNum: 'N° e-biglietto'
  }
};

const PREDEFINED_USERS = [
  {
    id: 'user1',
    name: 'Betango Brunda',
    data: {
      trainOperator: 'SNCF',
      routeName: 'PARIS GARE LYON - MONTELIMAR SNCF',
      passengerName: 'OWNRWJ',
      departureDate: '19/05',
      departureTime: '07H41',
      departureStation: 'PARIS GARE LYON',
      arrivalTime: '10H35',
      arrivalStation: 'MONTELIMAR SNCF',
      trainNumber: 'TGV 6191',
      carNumber: '07',
      carType: 'BAS',
      seatNumber: '4',
      seatType: 'PLACE ASSISE',
      class: 'Classe 2',
      ticketType: '01ADULTE',
      price: '36.00',
      currency: 'EUR',
      bookingRef: '2909010990840',
      clientRef: 'VG2909010990840010',
      ticketNumber: '8646423',
      dossier: 'OWNRWJ',
      language: 'fr'
    }
  },
  {
    id: 'user2',
    name: 'Marco Rossi',
    data: {
      trainOperator: 'Trenitalia',
      routeName: 'ROMA TERMINI - MILANO CENTRALE',
      passengerName: 'ROSSI MARCO',
      departureDate: '15/01',
      departureTime: '09H30',
      departureStation: 'ROMA TERMINI',
      arrivalTime: '12H45',
      arrivalStation: 'MILANO CENTRALE',
      trainNumber: 'FR 9615',
      carNumber: '05',
      carType: 'STD',
      seatNumber: '12',
      seatType: 'POSTO A SEDERE',
      class: 'Classe 2',
      ticketType: '01ADULTO',
      price: '45.00',
      currency: 'EUR',
      bookingRef: '3001150145678',
      clientRef: 'IT3001150145678020',
      ticketNumber: '9876543',
      dossier: 'MROSSI',
      language: 'it'
    }
  },
];

export default function TrainTicketGenerator() {
  const [currentView, setCurrentView] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [language, setLanguage] = useState('fr');
  const [formData, setFormData] = useState({
    trainOperator: '',
    routeName: '',
    passengerName: '',
    departureDate: '',
    departureTime: '',
    departureStation: '',
    arrivalTime: '',
    arrivalStation: '',
    trainNumber: '',
    carNumber: '',
    carType: '',
    seatNumber: '',
    seatType: 'PLACE ASSISE',
    class: 'Classe 2',
    ticketType: '01ADULTE',
    price: '',
    currency: 'EUR',
    bookingRef: '',
    clientRef: '',
    ticketNumber: '',
    dossier: '',
  });

  const [savedTickets, setSavedTickets] = useState([]);

  useEffect(() => {
    loadSavedTickets();
  }, []);

  const loadSavedTickets = async () => {
    try {
      const result = await window.storage.list('train:');
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
    setLanguage(user.data.language || 'fr');
    setCurrentView('form');
  };

  const saveTicket = async () => {
    const ticketId = `train:${Date.now()}`;
    const ticketData = {
      id: ticketId,
      date: new Date().toISOString(),
      formData: { ...formData, language },
      name: `${formData.passengerName} - ${formData.departureStation} → ${formData.arrivalStation}`
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
    setLanguage(ticket.formData.language || 'fr');
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
      const t = TRANSLATIONS[language];
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [105, 210]
      });

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 105, 'F');
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.rect(5, 5, 200, 95);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(formData.trainOperator, 10, 15);

      doc.setFontSize(12);
      doc.text(t.title, 80, 15);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(t.subtitle, 115, 15);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 20, 150, 8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.routeName, 12, 26);

      doc.setFillColor(0, 0, 0);
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          if (Math.random() > 0.5) {
            doc.rect(12 + i * 2, 35 + j * 2, 2, 2, 'F');
          }
        }
      }

      let yPos = 35;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      const depText = t.departure + ' ' + formData.departureDate + ' ' + t.at + ' ' + formData.departureTime + ' ' + t.from + ' ' + formData.departureStation;
      doc.text(depText, 50, yPos);
      
      yPos += 6;
      const arrText = t.arrival + '              ' + t.at + ' ' + formData.arrivalTime + ' ' + t.to + ' ' + formData.arrivalStation;
      doc.text(arrText, 50, yPos);

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.trainNumber, 50, yPos);

      doc.setFont('helvetica', 'normal');
      doc.text(formData.class, 130, yPos);

      yPos += 8;
      doc.setFontSize(9);
      const seatTypeTranslated = formData.seatType === 'COUCHETTE' ? t.berth : t.seat;
      const carText = t.car + '  ' + formData.carNumber + '  ' + formData.carType;
      doc.text(carText, 50, yPos);
      
      const seatText = seatTypeTranslated + '  ' + formData.seatNumber;
      doc.text(seatText, 100, yPos);

      yPos += 6;
      doc.setFontSize(6);
      doc.text(t.conditions, 50, yPos);

      yPos += 6;
      doc.setFontSize(8);
      if (formData.departureDate && formData.departureTime && formData.departureStation) {
        doc.text(t.departure + '                ' + t.at + '         ' + t.from + ' ***', 50, yPos);
      }
      yPos += 5;
      if (formData.arrivalTime && formData.arrivalStation) {
        doc.text(t.arrival + '                 ' + t.at, 50, yPos);
      }

      yPos += 8;
      doc.setFontSize(9);
      doc.text(formData.class + '  *', 50, yPos);

      doc.setDrawColor(0, 0, 0);
      doc.line(165, 30, 165, 95);

      let yRight = 38;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(t.name, 170, yRight);
      
      yRight += 5;
      doc.setFontSize(9);
      if (formData.passengerName) {
        doc.text(formData.passengerName, 170, yRight);
      }
      
      yRight += 8;
      doc.setFontSize(8);
      if (formData.dossier) {
        doc.text(t.file + '  ' + formData.dossier, 170, yRight);
      }
      
      yRight += 6;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      if (formData.bookingRef || formData.clientRef) {
        doc.text(t.clientRef, 170, yRight);
        yRight += 4;
        if (formData.bookingRef) {
          doc.text(formData.bookingRef, 170, yRight);
        }
        yRight += 4;
        if (formData.clientRef) {
          doc.text(formData.clientRef, 170, yRight);
        }
      }

      yRight += 10;
      doc.setLineWidth(0.3);
      doc.line(168, yRight - 2, 200, yRight - 2);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      if (formData.ticketType) {
        doc.text(formData.ticketType, 170, yRight + 3);
      }
      if (formData.price) {
        doc.text(formData.price, 192, yRight + 3);
      }

      yRight += 8;
      doc.line(168, yRight - 2, 200, yRight - 2);
      if (formData.currency) {
        doc.text(t.price + '   ' + formData.currency, 170, yRight + 3);
      }
      if (formData.price) {
        doc.text('**' + formData.price, 186, yRight + 3);
      }

      doc.setFillColor(0, 0, 0);
      for (let i = 0; i < 80; i++) {
        const width = Math.random() > 0.5 ? 1.5 : 0.8;
        doc.rect(12 + (i * 2.3), 85, width, 8, 'F');
      }

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('KM0668', 10, 83);

      yPos = 98;
      doc.setFontSize(6);
      doc.text(t.mandatory, 10, yPos);
      if (formData.ticketNumber) {
        doc.text(t.ticketNum + '  ' + formData.ticketNumber, 150, yPos);
      }

      doc.setFontSize(7);
      doc.text('CV', 194, 80);

      const filename = formData.ticketNumber ? 'E-Billet-Train-' + formData.ticketNumber + '.pdf' : 'E-Billet-Train.pdf';
      doc.save(filename);
      
    } catch (error) {
      console.error('Erreur lors de la generation du PDF:', error);
      alert('❌ Erreur lors de la generation du PDF. Veuillez reessayer.');
    }
  };

  if (currentView === 'users') {
    return (
      <div className="bg-gray-50 p-2 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Utilisateurs</h1>
              </div>
              <button
                onClick={() => setCurrentView('tickets')}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                Billets ({savedTickets.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {PREDEFINED_USERS.map((user) => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">{user.name}</h3>
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {user.data.language === 'fr' ? '🇫🇷 FR' : '🇮🇹 IT'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>Opérateur:</strong> {user.data.trainOperator}</p>
                    <p><strong>Route:</strong> {user.data.departureStation} → {user.data.arrivalStation}</p>
                    <p><strong>Prix:</strong> {user.data.price} {user.data.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'tickets') {
    return (
      <div className="bg-gray-50 p-2 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <h2 className="text-lg sm:text-xl font-bold">Billets Sauvegardés</h2>
              <button
                onClick={() => setCurrentView('users')}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                ← Retour
              </button>
            </div>
            
            {savedTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">Aucun billet sauvegardé</p>
            ) : (
              <div className="space-y-2">
                {savedTickets.map((ticket) => (
                  <div key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="font-semibold text-sm break-words">{ticket.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.date).toLocaleDateString('fr-FR')} • {ticket.formData.language === 'fr' ? '🇫🇷 Français' : '🇮🇹 Italien'}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => loadTicket(ticket)}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        <Edit2 className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
    <div className="bg-gray-50 p-2 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Train className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">E-Billet Train</h1>
                {selectedUser && <p className="text-xs text-gray-600">Utilisateur: {selectedUser.name}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button
                onClick={() => setCurrentView('users')}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                ← Utilisateurs
              </button>
              <button
                onClick={() => setCurrentView('tickets')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Billets</span> ({savedTickets.length})
              </button>
              <button
                onClick={saveTicket}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Langue du billet</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('fr')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                language === 'fr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => setLanguage('it')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                language === 'it'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🇮🇹 Italiano
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-3 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Train className="w-4 h-4 text-gray-700" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Opérateur</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" name="trainOperator" placeholder="Nom de l'opérateur" value={formData.trainOperator} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              <input type="text" name="routeName" placeholder="Itinéraire" value={formData.routeName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-purple-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Passager</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" name="passengerName" placeholder="Nom / Prénom" value={formData.passengerName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
              <input type="text" name="dossier" placeholder="Dossier" value={formData.dossier} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Trajet</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input type="text" name="departureDate" placeholder="Date (JJ/MM)" value={formData.departureDate} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              <input type="text" name="departureTime" placeholder="Heure (HHhMM)" value={formData.departureTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              <input type="text" name="departureStation" placeholder="Gare de départ" value={formData.departureStation} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 col-span-2" />
              <input type="text" name="arrivalTime" placeholder="Heure (HHhMM)" value={formData.arrivalTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-2 sm:col-span-1 text-sm" />
              <input type="text" name="arrivalStation" placeholder="Gare d'arrivée" value={formData.arrivalStation} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-2 sm:col-span-3 text-sm" />
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Train & Place</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input type="text" name="trainNumber" placeholder="N° Train" value={formData.trainNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm" />
              <select name="class" value={formData.class} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm">
                <option value="Classe 1">Classe 1</option>
                <option value="Classe 2">Classe 2</option>
              </select>
              <input type="text" name="carNumber" placeholder="N° Voiture" value={formData.carNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm" />
              <input type="text" name="carType" placeholder="Type (BAS/HAU)" value={formData.carType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm" />
              <input type="text" name="seatNumber" placeholder="N° Place" value={formData.seatNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm col-span-2 sm:col-span-1" />
              <select name="seatType" value={formData.seatType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm col-span-2 sm:col-span-1">
                <option value="PLACE ASSISE">Place assise</option>
                <option value="COUCHETTE">Couchette</option>
              </select>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Tarif & Références</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" name="ticketType" placeholder="Type billet" value={formData.ticketType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
              <input type="text" name="price" placeholder="Prix" value={formData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
              <input type="text" name="bookingRef" placeholder="Référence réservation" value={formData.bookingRef} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
              <input type="text" name="clientRef" placeholder="Référence client" value={formData.clientRef} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
              <input type="text" name="ticketNumber" placeholder="N° e-billet" value={formData.ticketNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <button
            onClick={generatePDF}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-bold text-lg"
          >
            <Download className="w-6 h-6" />
            Générer le PDF
          </button>
        </div>
      </div>
    </div>
  );
}