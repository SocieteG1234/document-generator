import React, { useState, useEffect } from 'react';
import { Train, Download, User, Users, Save, FolderOpen, Edit2, Trash2 } from 'lucide-react';

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
    }
  },
];

export default function TrainTicketGenerator() {
  const [currentView, setCurrentView] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
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
    setCurrentView('form');
  };

  const saveTicket = async () => {
    const ticketId = `train:${Date.now()}`;
    const ticketData = {
      id: ticketId,
      date: new Date().toISOString(),
      formData,
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

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 105, 'F');
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.rect(5, 5, 200, 95);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(formData.trainOperator || 'SNCF', 10, 15);

      doc.setFontSize(12);
      doc.text('VOTRE E-BILLET', 80, 15);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Nominatif, incessible, à présenter lors du contrôle', 115, 15);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 20, 150, 8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.routeName || 'PARIS GARE LYON - MONTELIMAR SNCF', 12, 26);

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
      doc.text(`Départ ${formData.departureDate || '19/05'}à${formData.departureTime || '07H41'}de ${formData.departureStation || 'PARIS GARE LYON'}`, 50, yPos);
      
      yPos += 6;
      doc.text(`Arriv.              à${formData.arrivalTime || '10H35'}à ${formData.arrivalStation || 'MONTELIMAR SNCF'}`, 50, yPos);

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${formData.trainNumber || 'TGV 6191'}`, 50, yPos);

      doc.setFont('helvetica', 'normal');
      doc.text(`${formData.class || 'Classe 2'}`, 130, yPos);

      yPos += 8;
      doc.setFontSize(9);
      doc.text(`VOITURE  ${formData.carNumber || '07'}  ${formData.carType || 'BAS'}`, 50, yPos);
      doc.text(`${formData.seatType || 'PLACE ASSISE'}  ${formData.seatNumber || '4'}`, 100, yPos);

      yPos += 6;
      doc.setFontSize(6);
      doc.text('PRIX ET ECHANGE SS CONDITIONS VALABLE SUR CE TRAIN       OFFREMETRO', 50, yPos);

      yPos += 6;
      doc.setFontSize(8);
      doc.text('Départ                à         de ***', 50, yPos);
      yPos += 5;
      doc.text('Arriv.                 à', 50, yPos);

      yPos += 8;
      doc.setFontSize(9);
      doc.text(`${formData.class || 'Classe 2'}  *`, 50, yPos);

      doc.setDrawColor(0, 0, 0);
      doc.line(165, 30, 165, 95);

      let yRight = 38;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Nom / Prénom', 170, yRight);
      
      yRight += 10;
      doc.setFontSize(9);
      doc.text(`Dossier  ${formData.dossier || 'OWNRWJ'}`, 170, yRight);
      
      yRight += 6;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Références client', 170, yRight);
      yRight += 4;
      doc.text(formData.bookingRef || '2909010990840', 170, yRight);
      yRight += 4;
      doc.text(formData.clientRef || 'VG2909010990840010', 170, yRight);

      yRight += 10;
      doc.setLineWidth(0.3);
      doc.line(168, yRight - 2, 200, yRight - 2);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.ticketType || '01ADULTE', 170, yRight + 3);
      doc.text(formData.price || '36.00', 192, yRight + 3);

      yRight += 8;
      doc.line(168, yRight - 2, 200, yRight - 2);
      doc.text(`Prix   ${formData.currency || 'EUR'}`, 170, yRight + 3);
      doc.text(`**${formData.price || '36.00'}`, 186, yRight + 3);

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
      doc.text('Présence à quai obligatoire 2 mn avant départ', 10, yPos);
      doc.text(`N° e-billet  ${formData.ticketNumber || '8646423'}`, 150, yPos);

      doc.setFontSize(7);
      doc.text('CV', 194, 80);

      doc.save(`E-Billet-Train-${formData.ticketNumber || 'Document'}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('❌ Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  if (currentView === 'users') {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {PREDEFINED_USERS.map((user) => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-300 hover:border-gray-500 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">{user.name}</h3>
                  </div>
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p><strong>Opérateur:</strong> {user.data.trainOperator}</p>
                    <p><strong>Route:</strong> {user.data.departureStation} → {user.data.arrivalStation}</p>
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
      <div className="min-h-screen bg-gray-50 p-2 sm:p-3">
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
                        {new Date(ticket.date).toLocaleDateString()}
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Train className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />
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

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-3 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Train className="w-4 h-4 text-gray-700" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Opérateur</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" name="trainOperator" placeholder="Nom de l'opérateur" value={formData.trainOperator} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm" />
              <input type="text" name="routeName" placeholder="Itinéraire" value={formData.routeName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm" />
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
              <input type="text" name="departureDate" placeholder="Date" value={formData.departureDate} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              <input type="text" name="departureTime" placeholder="Heure" value={formData.departureTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              <input type="text" name="departureStation" placeholder="Départ" value={formData.departureStation} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 col-span-2" />
              <input type="text" name="arrivalTime" placeholder="Heure arrivée" value={formData.arrivalTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-2 sm:col-span-1 text-sm" />
              <input type="text" name="arrivalStation" placeholder="Arrivée" value={formData.arrivalStation} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-2 sm:col-span-3 text-sm" />
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Train & Place</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input type="text" name="trainNumber" placeholder="Train" value={formData.trainNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm" />
              <select name="class" value={formData.class} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm">
                <option value="Classe 1">Classe 1</option>
                <option value="Classe 2">Classe 2</option>
              </select>
              <input type="text" name="carNumber" placeholder="Voiture" value={formData.carNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm" />
              <input type="text" name="carType" placeholder="Type" value={formData.carType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm" />
              <select name="seatType" value={formData.seatType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 col-span-2 text-sm">
                <option value="PLACE ASSISE">Place Assise</option>
                <option value="COUCHETTE">Couchette</option>
              </select>
              <input type="text" name="seatNumber" placeholder="N° place" value={formData.seatNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 col-span-2 text-sm" />
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Tarif</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select name="ticketType" value={formData.ticketType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm">
                <option value="01ADULTE">01 Adulte</option>
                <option value="01ENFANT">01 Enfant</option>
                <option value="01SENIOR">01 Senior</option>
              </select>
              <input type="number" name="price" placeholder="Prix" value={formData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CHF">CHF</option>
              </select>
              <input type="text" name="bookingRef" placeholder="Référence" value={formData.bookingRef} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              <input type="text" name="clientRef" placeholder="Réf. client" value={formData.clientRef} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:col-span-2 text-sm" />
              <input type="text" name="ticketNumber" placeholder="N° e-billet" value={formData.ticketNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
        </div>

        <button onClick={generatePDF} className="w-full bg-gray-700 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg text-sm">
          <Download className="w-4 h-4" />
          Télécharger l'E-Billet
        </button>
      </div>
    </div>
  );
}