import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, User, Home, Euro, Trash2, Save, FolderOpen, Edit2, Users } from 'lucide-react';

// Charger jsPDF depuis CDN
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

// ============================================
// UTILISATEURS PRÉ-REMPLIS - MODIFIEZ ICI
// ============================================
const PREDEFINED_USERS = [
  {
    id: 'user1',
    name: 'Betango Brunda',
    country: 'france',
    data: {
      baillerNom: 'Najjar',
      baillerPrenom: 'Mickael',
      baillerAdresse: '15 Rue de la République, 59000 Lille',
      locataireNom: 'Betango',
      locatairePrenom: 'Brunda',
      adresseLogement: '25 Avenue des Champs, 59000 Lille',
      typeLogement: 'appartement',
      surface: '65',
      nbPieces: '3',
      etage: '4',
      loyer: '850',
      charges: '275',
      caution: '1700',
      dateDebut: '2024-02-01',
      duree: '3',
    }
  },
];

export default function BailGenerator() {
  const [currentView, setCurrentView] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [country, setCountry] = useState('france');
  const [formData, setFormData] = useState({
    baillerNom: '',
    baillerPrenom: '',
    baillerAdresse: '',
    locataireNom: '',
    locatairePrenom: '',
    adresseLogement: '',
    typeLogement: 'appartement',
    surface: '',
    nbPieces: '',
    etage: '',
    loyer: '',
    charges: '',
    caution: '',
    dateDebut: '',
    duree: '3',
  });

  const [savedContracts, setSavedContracts] = useState([]);
  const [signatureBailleur, setSignatureBailleur] = useState('');
  const [signatureLocataire, setSignatureLocataire] = useState('');
  const [isDrawingBailleur, setIsDrawingBailleur] = useState(false);
  const [isDrawingLocataire, setIsDrawingLocataire] = useState(false);

  const canvasBailleurRef = useRef(null);
  const canvasLocataireRef = useRef(null);

  useEffect(() => {
    loadSavedContracts();
  }, []);

  const loadSavedContracts = async () => {
    try {
      const result = await window.storage.list('contract:');
      if (result && result.keys) {
        const contracts = [];
        for (const key of result.keys) {
          const data = await window.storage.get(key);
          if (data) {
            contracts.push(JSON.parse(data.value));
          }
        }
        setSavedContracts(contracts);
      }
    } catch (error) {
      console.log('Chargement des contrats...');
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setFormData(user.data);
    setCountry(user.country);
    setCurrentView('form');
  };

  const saveContract = async () => {
    const contractId = `contract:${Date.now()}`;
    const contractData = {
      id: contractId,
      date: new Date().toISOString(),
      country,
      formData,
      signatureBailleur,
      signatureLocataire,
      name: `${formData.locataireNom} - ${formData.adresseLogement}`
    };

    try {
      await window.storage.set(contractId, JSON.stringify(contractData));
      await loadSavedContracts();
      alert('✅ Contrat sauvegardé avec succès !');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const loadContract = (contract) => {
    setCountry(contract.country);
    setFormData(contract.formData);
    setSignatureBailleur(contract.signatureBailleur || '');
    setSignatureLocataire(contract.signatureLocataire || '');
    setCurrentView('form');
  };

  const deleteContract = async (contractId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      try {
        await window.storage.delete(contractId);
        await loadSavedContracts();
        alert('✅ Contrat supprimé');
      } catch (error) {
        alert('❌ Erreur lors de la suppression');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startDrawing = (canvas, setter) => {
    setter(true);
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  };

  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const draw = (e, canvas, isDrawing) => {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e, canvas);

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = (canvas, setter, signatureSetter) => {
    setter(false);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    signatureSetter(canvas.toDataURL());
  };

  const clearSignature = (canvasRef, signatureSetter) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureSetter('');
  };

  const generateSignature = (name, canvasRef, signatureSetter, color = '#1e40af') => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2 + Math.random();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const random = (min, max) => Math.random() * (max - min) + min;
    
    const signatureStyles = [
      () => {
        ctx.beginPath();
        const startX = 50;
        const startY = centerY;
        ctx.moveTo(startX, startY);
        
        ctx.bezierCurveTo(
          startX + 30, startY - 50,
          startX + 60, startY - 60,
          startX + 80, startY - 20
        );
        
        for (let i = 0; i < 4; i++) {
          ctx.bezierCurveTo(
            startX + 80 + i * 40, startY + random(-30, 30),
            startX + 100 + i * 40, startY + random(-20, 20),
            startX + 120 + i * 40, startY + random(-10, 10)
          );
        }
        
        ctx.bezierCurveTo(
          startX + 240, startY - 30,
          startX + 220, startY + 40,
          startX + 200, startY + 10
        );
        
        ctx.stroke();
      },
      
      () => {
        ctx.beginPath();
        const startX = 40;
        const startY = centerY + random(-10, 10);
        ctx.moveTo(startX, startY);
        
        for (let i = 0; i < 8; i++) {
          const x = startX + i * 35;
          const y = i % 2 === 0 ? startY - random(20, 40) : startY + random(10, 30);
          ctx.lineTo(x, y);
        }
        
        ctx.quadraticCurveTo(
          canvas.width - 50, centerY + 20,
          canvas.width - 70, centerY - 10
        );
        
        ctx.stroke();
      },
      
      () => {
        ctx.beginPath();
        const startX = 60;
        const startY = centerY;
        ctx.moveTo(startX, startY);
        
        ctx.bezierCurveTo(
          startX + 20, startY - 40,
          startX + 40, startY - 50,
          startX + 70, startY - 30
        );
        
        ctx.bezierCurveTo(
          startX + 100, startY - 10,
          startX + 120, startY + 30,
          startX + 150, startY + 20
        );
        
        ctx.bezierCurveTo(
          startX + 180, startY + 10,
          startX + 200, startY - 20,
          startX + 220, startY
        );
        
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(startX, startY + 25);
        ctx.lineTo(startX + 200, startY + 25);
        ctx.stroke();
      },
      
      () => {
        ctx.beginPath();
        const startX = 80;
        const startY = centerY;
        ctx.moveTo(startX, startY);
        
        for (let i = 0; i < 5; i++) {
          ctx.bezierCurveTo(
            startX + i * 30, startY + random(-20, 20),
            startX + 15 + i * 30, startY + random(-25, 25),
            startX + 30 + i * 30, startY + random(-15, 15)
          );
        }
        
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(startX + 170, startY - 20, 3, 0, Math.PI * 2);
        ctx.fill();
      },
    ];
    
    const randomStyle = signatureStyles[Math.floor(Math.random() * signatureStyles.length)];
    randomStyle();
    
    signatureSetter(canvas.toDataURL());
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await loadJsPDF();
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const config = getCountryConfig();
      const loyerTotal = parseFloat(formData.loyer || 0) + parseFloat(formData.charges || 0);
      
      let y = 20;
      const leftMargin = 15;
      const rightMargin = 195;
      const lineHeight = 6;
      
      const addText = (text, fontSize = 10, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, rightMargin - leftMargin);
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, leftMargin, y);
          y += lineHeight;
        });
      };
      
      const addSpace = (space = 5) => {
        y += space;
      };
      
      const addLine = () => {
        doc.setLineWidth(0.5);
        doc.line(leftMargin, y, rightMargin, y);
        y += 5;
      };
      
      addText(config.title, 16, true);
      addLine();
      addSpace(3);
      
      addText(`Fait à __________, le ${formData.dateDebut || '__/__/____'}`, 10);
      addSpace(8);
      
      addText('ENTRE LES SOUSSIGNÉS :', 12, true);
      addSpace(3);
      addText('LE BAILLEUR :', 11, true);
      addText(`Nom : ${formData.baillerNom || '_________'}`);
      addText(`Prénom : ${formData.baillerPrenom || '_________'}`);
      addText(`Adresse : ${formData.baillerAdresse || '_________'}`);
      addSpace(2);
      addText('Ci-après dénommé "le Bailleur"', 10, true);
      addSpace(3);
      addText('D\'UNE PART,', 10, true);
      addSpace(5);
      
      addText('ET :', 12, true);
      addSpace(3);
      addText('LA LOCATAIRE :', 11, true);
      addText(`Nom : ${formData.locataireNom || '_________'}`);
      addText(`Prénom : ${formData.locatairePrenom || '_________'}`);
      addSpace(2);
      addText('Ci-après dénommée "la Locataire"', 10, true);
      addSpace(3);
      addText('D\'AUTRE PART,', 10, true);
      addSpace(8);
      
      addText('IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :', 11, true);
      addSpace(8);
      
      addLine();
      addText('ARTICLE 1 - OBJET ET DÉSIGNATION DU BIEN', 11, true);
      addLine();
      addSpace(3);
      addText('Le Bailleur donne en location à la Locataire qui accepte, un logement à usage d\'habitation principale situé :');
      addSpace(3);
      addText(`Adresse : ${formData.adresseLogement || '__________'}`);
      addText(`Type de bien : ${formData.typeLogement === 'appartement' ? 'Appartement' : formData.typeLogement === 'maison' ? 'Maison individuelle' : 'Studio'}`);
      addText(`Surface habitable : ${formData.surface || '_'} m²`);
      addText(`Nombre de pièces principales : ${formData.nbPieces || '_'}`);
      addText(`Étage : ${formData.etage || '_'}`);
      addSpace(8);
      
      addLine();
      addText('ARTICLE 2 - DURÉE DU BAIL', 11, true);
      addLine();
      addSpace(3);
      addText(`Date de prise d'effet : ${formData.dateDebut || '__/__/____'}`);
      addText(`Durée : ${formData.duree || '_'} ${country === 'canada' ? 'mois' : 'ans'}`);
      addSpace(2);
      addText('Le bail se renouvellera tacitement par reconduction aux mêmes conditions, sauf congé donné dans les formes et délais légaux.');
      addSpace(8);
      
      addLine();
      addText('ARTICLE 3 - LOYER ET MODALITÉS DE PAIEMENT', 11, true);
      addLine();
      addSpace(3);
      addText(`Loyer mensuel (hors charges) : ${formData.loyer || '_'} ${config.currency}`);
      addText(`Provision pour charges : ${formData.charges || '_'} ${config.currency}`);
      addText(`TOTAL À PAYER : ${loyerTotal.toFixed(2)} ${config.currency}`, 10, true);
      addSpace(2);
      addText('Le loyer est payable mensuellement à terme échu, le premier jour de chaque mois, par virement bancaire.');
      addSpace(8);
      
      addLine();
      addText('ARTICLE 4 - DÉPÔT DE GARANTIE', 11, true);
      addLine();
      addSpace(3);
      addText(`La Locataire verse ce jour, à titre de dépôt de garantie, la somme de ${formData.caution || '_'} ${config.currency}.`);
      addSpace(2);
      addText('Cette somme sera restituée dans un délai de deux mois après la remise des clés, déduction faite des sommes dues et réparations.');
      addSpace(8);
      
      addLine();
      addText('ARTICLE 5 - OBLIGATIONS DE LA LOCATAIRE', 11, true);
      addLine();
      addSpace(3);
      addText('La Locataire s\'engage à :');
      addText('• User paisiblement des lieux loués en bon père de famille');
      addText('• Entretenir le logement et effectuer les réparations locatives');
      addText('• Souscrire une assurance multirisque habitation');
      addText('• Payer le loyer et les charges aux échéances convenues');
      addText('• Ne pas troubler le voisinage');
      addText('• Laisser exécuter les travaux nécessaires');
      addText('• Restituer les lieux en bon état en fin de bail');
      addSpace(8);
      
      addLine();
      addText('ARTICLE 6 - OBLIGATIONS DU BAILLEUR', 11, true);
      addLine();
      addSpace(3);
      addText('Le Bailleur s\'engage à :');
      addText('• Délivrer un logement décent en bon état d\'usage');
      addText('• Assurer la jouissance paisible du logement');
      addText('• Effectuer les réparations autres que locatives');
      addText('• Maintenir les équipements en état de fonctionnement');
      addText('• Communiquer les informations relatives aux charges');
      addSpace(8);
      
      addLine();
      addText('ARTICLE 7 - CLAUSE RÉSOLUTOIRE', 11, true);
      addLine();
      addSpace(3);
      addText('En cas de non-paiement du loyer ou des charges, ou de non-souscription d\'assurance, le présent bail sera résilié de plein droit un mois après un commandement de payer demeuré infructueux.');
      addSpace(8);
      
      addLine();
      addText('ARTICLE 8 - ÉTAT DES LIEUX', 11, true);
      addLine();
      addSpace(3);
      addText('Un état des lieux contradictoire sera établi lors de la remise et de la restitution des clés, conformément à la réglementation.');
      addSpace(10);
      
      addLine();
      addText('SIGNATURES', 12, true);
      addLine();
      addSpace(3);
      addText('Fait en deux exemplaires originaux, dont un remis à chaque partie.');
      addSpace(8);
      
      const signatureY = y;
      
      doc.text('Le Bailleur', leftMargin + 20, signatureY);
      doc.text('"Lu et approuvé"', leftMargin + 15, signatureY + 5);
      
      if (signatureBailleur) {
        doc.addImage(signatureBailleur, 'PNG', leftMargin, signatureY + 10, 60, 30);
      } else {
        doc.line(leftMargin, signatureY + 30, leftMargin + 50, signatureY + 30);
      }
      
      doc.text('La Locataire', rightMargin - 35, signatureY);
      doc.text('"Lu et approuvé"', rightMargin - 40, signatureY + 5);
      
      if (signatureLocataire) {
        doc.addImage(signatureLocataire, 'PNG', rightMargin - 60, signatureY + 10, 60, 30);
      } else {
        doc.line(rightMargin - 50, signatureY + 30, rightMargin, signatureY + 30);
      }
      
      doc.save(`Contrat-Location-${formData.locataireNom || 'Document'}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('❌ Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const getCountryConfig = () => {
    const configs = {
      france: {
        title: 'CONTRAT DE LOCATION (Bail d\'habitation)',
        currency: '€',
        durationOptions: [
          { value: '1', label: '1 an (meublé)' },
          { value: '3', label: '3 ans (vide)' },
          { value: '6', label: '6 ans (personne morale)' }
        ]
      },
      belgique: {
        title: 'CONTRAT DE BAIL (Belgique)',
        currency: '€',
        durationOptions: [
          { value: '3', label: '3 ans (courte durée)' },
          { value: '9', label: '9 ans (longue durée)' }
        ]
      },
      suisse: {
        title: 'CONTRAT DE BAIL À LOYER (Suisse)',
        currency: 'CHF',
        durationOptions: [
          { value: 'indeterminee', label: 'Durée indéterminée' },
          { value: '1', label: '1 an' },
          { value: '3', label: '3 ans' }
        ]
      },
      canada: {
        title: 'BAIL DE LOGEMENT (Canada/Québec)',
        currency: 'CAD',
        durationOptions: [
          { value: '12', label: '12 mois' },
          { value: 'indeterminee', label: 'Durée indéterminée' }
        ]
      }
    };
    return configs[country] || configs.france;
  };

  const config = getCountryConfig();

  if (currentView === 'users') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-8 sm:w-10 h-8 sm:h-10 text-indigo-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sélectionnez un Utilisateur</h1>
              </div>
              <button
                onClick={() => setCurrentView('contracts')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
              >
                <FolderOpen className="w-4 h-4" />
                Contrats ({savedContracts.length})
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {PREDEFINED_USERS.map((user) => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <User className="w-6 sm:w-8 h-6 sm:h-8 text-indigo-600 flex-shrink-0" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{user.name}</h3>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <p><strong>Pays:</strong> {user.country === 'france' ? '🇫🇷 France' : user.country === 'belgique' ? '🇧🇪 Belgique' : user.country === 'suisse' ? '🇨🇭 Suisse' : '🇨🇦 Canada'}</p>
                    <p className="truncate"><strong>Adresse:</strong> {user.data.adresseLogement}</p>
                    <p><strong>Loyer:</strong> {user.data.loyer} {user.country === 'suisse' ? 'CHF' : user.country === 'canada' ? 'CAD' : '€'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                💡 <strong>Astuce:</strong> Pour ajouter ou modifier des utilisateurs, éditez le tableau <code className="bg-blue-100 px-1 rounded">PREDEFINED_USERS</code> dans le code source.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'contracts') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Contrats Sauvegardés</h2>
              <button
                onClick={() => setCurrentView('users')}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
              >
                ← Retour
              </button>
            </div>
            
            {savedContracts.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">Aucun contrat sauvegardé</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {savedContracts.map((contract) => (
                  <div key={contract.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">{contract.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(contract.date).toLocaleDateString()} - {contract.country.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => loadContract(contract)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="sm:hidden">Modifier</span>
                      </button>
                      <button
                        onClick={() => deleteContract(contract.id)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sm:hidden">Supprimer</span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-indigo-600" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Contrat de Location</h1>
                {selectedUser && <p className="text-xs sm:text-sm text-gray-600">Utilisateur: {selectedUser.name}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setCurrentView('users')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                ← Utilisateurs
              </button>
              <button
                onClick={() => setCurrentView('contracts')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Contrats </span>({savedContracts.length})
              </button>
              <button
                onClick={saveContract}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Informations du Bailleur</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="baillerNom"
                placeholder="Nom"
                value={formData.baillerNom}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="baillerPrenom"
                placeholder="Prénom"
                value={formData.baillerPrenom}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="baillerAdresse"
                placeholder="Adresse complète"
                value={formData.baillerAdresse}
                onChange={handleChange}
                className="w-full sm:col-span-2 p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Informations de la Locataire</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="locataireNom"
                placeholder="Nom"
                value={formData.locataireNom}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="locatairePrenom"
                placeholder="Prénom"
                value={formData.locatairePrenom}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Description du Logement</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="adresseLogement"
                placeholder="Adresse du logement"
                value={formData.adresseLogement}
                onChange={handleChange}
                className="w-full sm:col-span-2 p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <select
                name="typeLogement"
                value={formData.typeLogement}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="studio">Studio</option>
              </select>
              <input
                type="number"
                name="surface"
                placeholder="Surface (m²)"
                value={formData.surface}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                name="nbPieces"
                placeholder="Nombre de pièces"
                value={formData.nbPieces}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                name="etage"
                placeholder="Étage"
                value={formData.etage}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Euro className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Conditions Financières ({config.currency})</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <input
                type="number"
                name="loyer"
                placeholder={`Loyer (${config.currency})`}
                value={formData.loyer}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                name="charges"
                placeholder={`Charges (${config.currency})`}
                value={formData.charges}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                name="caution"
                placeholder={`Dépôt de garantie (${config.currency})`}
                value={formData.caution}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Durée du Bail</h2>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <select
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {config.durationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Signatures</h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Signature du Bailleur</label>
                <canvas
                  ref={canvasBailleurRef}
                  width={300}
                  height={150}
                  className="border-2 border-indigo-300 rounded-lg cursor-crosshair w-full bg-white touch-none"
                  onMouseDown={(e) => startDrawing(canvasBailleurRef.current, setIsDrawingBailleur)}
                  onMouseMove={(e) => draw(e, canvasBailleurRef.current, isDrawingBailleur)}
                  onMouseUp={() => stopDrawing(canvasBailleurRef.current, setIsDrawingBailleur, setSignatureBailleur)}
                  onMouseLeave={() => stopDrawing(canvasBailleurRef.current, setIsDrawingBailleur, setSignatureBailleur)}
                  onTouchStart={(e) => startDrawing(canvasBailleurRef.current, setIsDrawingBailleur)}
                  onTouchMove={(e) => draw(e, canvasBailleurRef.current, isDrawingBailleur)}
                  onTouchEnd={() => stopDrawing(canvasBailleurRef.current, setIsDrawingBailleur, setSignatureBailleur)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => generateSignature(`${formData.baillerPrenom} ${formData.baillerNom}`, canvasBailleurRef, setSignatureBailleur, '#1e40af')}
                    className="flex-1 px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition"
                  >
                    ✍️ Générer
                  </button>
                  <button
                    onClick={() => clearSignature(canvasBailleurRef, setSignatureBailleur)}
                    className="px-2 sm:px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600"
                  >
                    Effacer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Signature de la Locataire</label>
                <canvas
                  ref={canvasLocataireRef}
                  width={300}
                  height={150}
                  className="border-2 border-blue-300 rounded-lg cursor-crosshair w-full bg-white touch-none"
                  onMouseDown={(e) => startDrawing(canvasLocataireRef.current, setIsDrawingLocataire)}
                  onMouseMove={(e) => draw(e, canvasLocataireRef.current, isDrawingLocataire)}
                  onMouseUp={() => stopDrawing(canvasLocataireRef.current, setIsDrawingLocataire, setSignatureLocataire)}
                  onMouseLeave={() => stopDrawing(canvasLocataireRef.current, setIsDrawingLocataire, setSignatureLocataire)}
                  onTouchStart={(e) => startDrawing(canvasLocataireRef.current, setIsDrawingLocataire)}
                  onTouchMove={(e) => draw(e, canvasLocataireRef.current, isDrawingLocataire)}
                  onTouchEnd={() => stopDrawing(canvasLocataireRef.current, setIsDrawingLocataire, setSignatureLocataire)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => generateSignature(`${formData.locatairePrenom} ${formData.locataireNom}`, canvasLocataireRef, setSignatureLocataire, '#1e40af')}
                    className="flex-1 px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition"
                  >
                    ✍️ Générer
                  </button>
                  <button
                    onClick={() => clearSignature(canvasLocataireRef, setSignatureLocataire)}
                    className="px-2 sm:px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600"
                  >
                    Effacer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={generatePDF}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
        >
          <Download className="w-4 sm:w-5 h-4 sm:h-5" />
          Télécharger le PDF
        </button>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs sm:text-sm text-amber-800">
            ⚠️ <strong>Important :</strong> Ce document est un modèle de base adapté à {country === 'france' ? 'la France' : country === 'belgique' ? 'la Belgique' : country === 'suisse' ? 'la Suisse' : 'le Canada'}. Consultez un professionnel du droit pour vous assurer de sa conformité légale.
          </p>
        </div>
      </div>
    </div>
  )
}