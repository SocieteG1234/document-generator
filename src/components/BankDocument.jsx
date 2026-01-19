import { useState, useRef } from 'react';

export default function BankFeesDocument() {
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [language, setLanguage] = useState('fr');
  const canvasRef = useRef(null);
  const documentRef = useRef(null);


const [checkedDocs, setCheckedDocs] = useState({
  idCard: false,
  addressProof: false,
  photo: false,
  rib: false,
  noOpposition: false,
  certifiedRib: false,
  notaryAct: false,
  mandate: false,
  notaryAttestation: false,
  fundsProof: false,
  declaration: false,
  form: false
});
    // Informations du propriétaire
  const [ownerInfo, setOwnerInfo] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: ''
  });
   const translations = {
    fr: {
      downloadBtn: "📥 Télécharger en PDF",
      title: "PROCÉDURE DE DÉBLOCAGE DE COMPTE",
      subtitle: "Synthèse des Frais de Dossier et Procédure",
      warning: "DOCUMENT CONFIDENTIEL - À CONSERVER",
      ownerInfoTitle: "INFORMATIONS DU PROPRIÉTAIRE",
      firstName: "Prénom",
      lastName: "Nom",
      birthDate: "Date de naissance",
      nationality: "Nationalité",
      address: "Adresse",
      city: "Ville",
      postalCode: "Code postal",
      phone: "Téléphone",
      email: "Email",
      fillOwnerInfo: "Veuillez remplir vos informations personnelles",
      infoTitle: "INFORMATIONS DU DOSSIER",
      reference: "Référence dossier",
      date: "Date de création",
      advisor: "Conseiller référent",
      advisorValue: "Service Clientèle Déblocage",
      feesTitle: "FRAIS DE DOSSIER APPLICABLES",
      unlockFee: "Frais de déblocage de compte",
      processingFee: "Frais d'instruction du dossier",
      notaryFee: "Frais de vérification notariale",
      transferFee: "Frais de virement sécurisé",
      totalFees: "TOTAL DES FRAIS BANCAIRES",
      docsTitle: "DOCUMENTS À FOURNIR",
      identityDocs: "Documents d'identité",
      idCard: "Copie recto-verso de la carte d'identité ou passeport",
      addressProof: "Justificatif de domicile de moins de 3 mois",
      photo: "Photo d'identité récente",
      bankDocs: "Documents bancaires",
      rib: "RIB du compte bénéficiaire",
      noOpposition: "Attestation de non-opposition",
      certifiedRib: "Relevé d'identité bancaire certifié",
      notaryDocs: "Documents notariés",
      notaryAct: "Acte notarié authentifiant la demande",
      mandate: "Mandat de représentation (si applicable)",
      notaryAttestation: "Attestation d'identité du notaire",
      additionalDocs: "Documents complémentaires",
      fundsProof: "Justificatif de la provenance des fonds",
      declaration: "Déclaration sur l'honneur",
      form: "Formulaire de demande complété et signé",
      timelineTitle: "CALENDRIER DE TRAITEMENT",
      reception: "Réception du dossier complet",
      verification: "Vérification des documents",
      validation: "Validation par le service conformité",
      notaryProcessing: "Traitement par le notaire",
      unlock: "Déblocage des fonds (sous 48h)",
      pending: "En attente",
      upcoming: "À venir",
      scheduled: "Déblocage prévu dans les 48 heures",
      deadline: "Date limite de fourniture des documents : Sous 24 heures",
      processingTime: "Délai de traitement : 48 heures (2 jours ouvrables)",
      paymentTitle: "MODALITÉS DE PAIEMENT DES FRAIS",
      paymentIntro: "Les frais de dossier sont à régler sous 24h selon les modalités suivantes :",
      wireTransfer: "Virement bancaire sur le compte dédié",
      autoDebit: "Prélèvement automatique (sur autorisation)",
      directDeduction: "Déduction directe des fonds débloqués",
      bankDetails: "Coordonnées bancaires pour le règlement :",
      urgentPayment: "⚠️ Paiement urgent requis pour déblocage sous 48h",
      contactTitle: "CONTACT ET SUIVI",
      customerService: "Service clientèle",
      email: "Email",
      hours: "Horaires",
      hoursValue: "Lun-Ven, 8h30-17h30",
      contactNote: "Pour toute question concernant votre dossier, merci de mentionner votre numéro de référence.",
      urgentContact: "Service d'urgence disponible 24h/24",
      signatureTitle: "SIGNATURE",
      signatureInstruction: "Signez dans la zone ci-dessous pour valider :",
      clearSignature: "Effacer la signature",
      signatureSaved: "✓ Signature enregistrée",
      legalTitle: "MENTIONS LÉGALES",
      legalText: "Ce document est établi dans le cadre d'une procédure de déblocage de compte bancaire. Les frais mentionnés sont susceptibles de modifications selon l'évolution du dossier et les vérifications effectuées. Le délai de 48h est garanti sous réserve de la réception complète du dossier et du paiement des frais.",
      compliance: "Conformité :",
      complianceText: "Toutes les vérifications réglementaires seront effectuées conformément aux dispositions légales en vigueur et aux normes bancaires internationales.",
      generated: "Document généré le :",
      validity: "Validité : 48 heures à compter de la date d'émission",
      internalRef: "Référence interne :",
      trainingDoc: ""
    },
    it: {
      downloadBtn: "📥 Scarica in PDF",
      title: "PROCEDURA DI SBLOCCO CONTO",
      subtitle: "Sintesi delle Spese di Pratica e Procedura",
      warning: "DOCUMENTO RISERVATO - DA CONSERVARE",
      ownerInfoTitle: "INFORMAZIONI DEL PROPRIETARIO",
      firstName: "Nome",
      lastName: "Cognome",
      birthDate: "Data di nascita",
      nationality: "Nazionalità",
      address: "Indirizzo",
      city: "Città",
      postalCode: "Codice postale",
      phone: "Telefono",
      email: "Email",
      fillOwnerInfo: "Si prega di compilare le informazioni personali",
      infoTitle: "INFORMAZIONI DELLA PRATICA",
      reference: "Riferimento pratica",
      date: "Data di creazione",
      advisor: "Consulente di riferimento",
      advisorValue: "Servizio Clienti Sblocco",
      feesTitle: "SPESE DI PRATICA APPLICABILI",
      unlockFee: "Spese di sblocco conto",
      processingFee: "Spese di istruzione della pratica",
      notaryFee: "Spese di verifica notarile",
      transferFee: "Spese di bonifico sicuro",
      totalFees: "TOTALE SPESE BANCARIE",
      docsTitle: "DOCUMENTI DA FORNIRE",
      identityDocs: "Documenti di identità",
      idCard: "Copia fronte-retro della carta d'identità o passaporto",
      addressProof: "Prova di residenza inferiore a 3 mesi",
      photo: "Foto di identità recente",
      bankDocs: "Documenti bancari",
      rib: "IBAN del conto beneficiario",
      noOpposition: "Attestazione di non-opposizione",
      certifiedRib: "Estratto conto bancario certificato",
      notaryDocs: "Documenti notarili",
      notaryAct: "Atto notarile autenticante la richiesta",
      mandate: "Mandato di rappresentanza (se applicabile)",
      notaryAttestation: "Attestazione di identità del notaio",
      additionalDocs: "Documenti aggiuntivi",
      fundsProof: "Prova della provenienza dei fondi",
      declaration: "Dichiarazione sotto giuramento",
      form: "Modulo di richiesta compilato e firmato",
      timelineTitle: "CALENDARIO DI ELABORAZIONE",
      reception: "Ricezione pratica completa",
      verification: "Verifica dei documenti",
      validation: "Convalida dal servizio conformità",
      notaryProcessing: "Elaborazione dal notaio",
      unlock: "Sblocco dei fondi (entro 48 ore)",
      pending: "In attesa",
      upcoming: "A venire",
      scheduled: "Sblocco previsto entro 48 ore",
      deadline: "Scadenza per la fornitura dei documenti: Entro 24 ore",
      processingTime: "Tempo di elaborazione: 48 ore (2 giorni lavorativi)",
      paymentTitle: "MODALITÀ DI PAGAMENTO DELLE SPESE",
      paymentIntro: "Le spese di pratica devono essere pagate entro 24 ore secondo le seguenti modalità:",
      wireTransfer: "Bonifico bancario sul conto dedicato",
      autoDebit: "Addebito automatico (su autorizzazione)",
      directDeduction: "Deduzione diretta dai fondi sbloccati",
      bankDetails: "Coordinate bancarie per il pagamento:",
      urgentPayment: "⚠️ Pagamento urgente richiesto per sblocco entro 48 ore",
      contactTitle: "CONTATTI E MONITORAGGIO",
      customerService: "Servizio clienti",
      email: "Email",
      hours: "Orari",
      hoursValue: "Lun-Ven, 8h30-17h30",
      contactNote: "Per qualsiasi domanda relativa alla vostra pratica, si prega di menzionare il numero di riferimento.",
      urgentContact: "Servizio di emergenza disponibile 24 ore su 24",
      signatureTitle: "FIRMA",
      signatureInstruction: "Firmare nell'area sottostante per convalidare:",
      clearSignature: "Cancella la firma",
      signatureSaved: "✓ Firma registrata",
      legalTitle: "NOTE LEGALI",
      legalText: "Questo documento è redatto nell'ambito di una procedura di sblocco del conto bancario. Le spese menzionate sono soggette a modifiche in base all'evoluzione della pratica e alle verifiche effettuate. Il termine di 48 ore è garantito subordinatamente alla ricezione completa della pratica e al pagamento delle spese.",
      compliance: "Conformità:",
      complianceText: "Tutte le verifiche normative saranno effettuate in conformità alle disposizioni legali vigenti e agli standard bancari internazionali.",
      generated: "Documento generato il:",
      validity: "Validità: 48 ore dalla data di emissione",
      internalRef: "Riferimento interno:",
      trainingDoc: ""
    }
  };

  const t = translations[language];

  const getCoordinates = (e) => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  
  // Support tactile
  if (e.touches && e.touches[0]) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  
  // Support souris
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const downloadPDF = async () => {
  // AJOUTER cette fonction
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  document.head.appendChild(script);

  script.onload = async () => {  // AJOUTER async
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // AJOUTER le chargement du logo
    try {
      const logoBase64 = await loadImage('images/logo 1.jpeg');
      doc.addImage(logoBase64, 'JPEG', 10, 5, 20, 20);
    } catch (error) {
      console.log('Logo non chargé:', error);
    }
    
    let yPos = 20;
    // ... reste du code    
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text(t.title, 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(t.subtitle, 105, 28, { align: 'center' });
      
      doc.setFillColor(220, 38, 38);
      doc.rect(45, 32, 120, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(t.warning, 105, 36, { align: 'center' });
      
      yPos = 50;
      doc.setTextColor(0, 0, 0);
      
      // Informations du propriétaire
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(t.ownerInfoTitle, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${t.lastName}: ${ownerInfo.lastName || 'Non renseigné'}`, 20, yPos);
      doc.text(`${t.firstName}: ${ownerInfo.firstName || 'Non renseigné'}`, 105, yPos);
      yPos += 6;
      doc.text(`${t.birthDate}: ${ownerInfo.birthDate || 'Non renseigné'}`, 20, yPos);
      doc.text(`${t.nationality}: ${ownerInfo.nationality || 'Non renseigné'}`, 105, yPos);
      yPos += 6;
      doc.text(`${t.address}: ${ownerInfo.address || 'Non renseigné'}`, 20, yPos);
      yPos += 6;
      doc.text(`${t.city}: ${ownerInfo.city || 'Non renseigné'}`, 20, yPos);
      doc.text(`${t.postalCode}: ${ownerInfo.postalCode || 'Non renseigné'}`, 105, yPos);
      yPos += 6;
      doc.text(`${t.phone}: ${ownerInfo.phone || 'Non renseigné'}`, 20, yPos);
      doc.text(`${t.email}: ${ownerInfo.email || 'Non renseigné'}`, 105, yPos);
      yPos += 15;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(t.infoTitle, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${t.reference}: DBQ-2026-001234`, 20, yPos);
      doc.text(`${t.date}: ${new Date().toLocaleDateString()}`, 105, yPos);
      yPos += 15;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(t.feesTitle, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(t.unlockFee, 20, yPos);
      doc.text('550,00 €', 180, yPos);
      yPos += 6;
      doc.text(t.processingFee, 20, yPos);
      doc.text('350,00 €', 180, yPos);
      yPos += 6;
      doc.text(t.notaryFee, 20, yPos);
      doc.text('500,00 €', 180, yPos);
      yPos += 6;
      doc.text(t.transferFee, 20, yPos);
      doc.text('120,00 €', 180, yPos);
      yPos += 8;
      doc.setFont(undefined, 'bold');
      doc.text(t.totalFees, 20, yPos);
      doc.text('1520,00 € TTC', 180, yPos);
      yPos += 15;
      
      doc.setFontSize(14);
      doc.text(t.docsTitle, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`□ ${t.idCard}`, 20, yPos);
      yPos += 6;
      doc.text(`□ ${t.addressProof}`, 20, yPos);
      yPos += 6;
      doc.text(`□ ${t.rib}`, 20, yPos);
      yPos += 6;
      doc.text(`□ ${t.notaryAct}`, 20, yPos);
      yPos += 15;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(t.timelineTitle, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(t.processingTime, 20, yPos);
      yPos += 6;
      doc.text(t.deadline, 20, yPos);
      yPos += 15;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(t.contactTitle, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${t.customerService}: +33 6 44 67 61 30`, 20, yPos);
      doc.text(`${t.email}: creditagricole@banque.fr`, 105, yPos);
      yPos += 15;
      
      if (signature) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${t.signatureTitle}:`, 20, yPos);
        yPos += 5;
        doc.addImage(signature, 'PNG', 20, yPos, 50, 20);
        yPos += 25;
      }
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`${t.generated} ${new Date().toLocaleDateString()}`, 20, 280);
      doc.text(`${t.internalRef} DBQ-2026-001234`, 20, 285);
      
      doc.save('deblocage_compte_48h.pdf');
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header avec boutons */}
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLanguage('fr')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 text-sm sm:text-base ${
                language === 'fr' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900 border border-blue-900'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => setLanguage('it')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 text-sm sm:text-base ${
                language === 'it' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900 border border-blue-900'
              }`}
            >
              🇮🇹 Italiano
            </button>
          </div>
          <button
            onClick={downloadPDF}
            className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg shadow-lg transition duration-200 text-sm sm:text-base"
          >
            {t.downloadBtn}
          </button>
        </div>

        <div ref={documentRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header avec Logo */}
          <div className="bg-blue-900 text-white p-4 sm:p-8 text-center relative">
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white flex items-center justify-center rounded overflow-hidden">
              <img src="images/logo 1.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-blue-200">{t.subtitle}</p>
        <div className="mt-4 bg-red-600 text-white py-2 px-4 rounded inline-block">
          <p className="font-semibold">{t.warning}</p>
        </div>
      </div>

      {/* Informations du propriétaire */}
          <div className="p-4 sm:p-8 border-b bg-blue-50">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{t.ownerInfoTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{t.fillOwnerInfo}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.lastName} *</label>
                <input
                  type="text"
                  value={ownerInfo.lastName}
                  onChange={(e) => setOwnerInfo({...ownerInfo, lastName: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dupont"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.firstName} *</label>
                <input
                  type="text"
                  value={ownerInfo.firstName}
                  onChange={(e) => setOwnerInfo({...ownerInfo, firstName: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.birthDate} *</label>
                <input
                  type="date"
                  value={ownerInfo.birthDate}
                  onChange={(e) => setOwnerInfo({...ownerInfo, birthDate: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.nationality} *</label>
                <input
                  type="text"
                  value={ownerInfo.nationality}
                  onChange={(e) => setOwnerInfo({...ownerInfo, nationality: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Française"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.address} *</label>
                <input
                  type="text"
                  value={ownerInfo.address}
                  onChange={(e) => setOwnerInfo({...ownerInfo, address: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Rue de la République"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.city} *</label>
                <input
                  type="text"
                  value={ownerInfo.city}
                  onChange={(e) => setOwnerInfo({...ownerInfo, city: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paris"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.postalCode} *</label>
                <input
                  type="text"
                  value={ownerInfo.postalCode}
                  onChange={(e) => setOwnerInfo({...ownerInfo, postalCode: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="75001"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.phone} *</label>
                <input
                  type="tel"
                  value={ownerInfo.phone}
                  onChange={(e) => setOwnerInfo({...ownerInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.email} *</label>
                <input
                  type="email"
                  value={ownerInfo.email}
                  onChange={(e) => setOwnerInfo({...ownerInfo, email: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jean.dupont@email.com"
                />
              </div>
            </div>
            </div>


      {/* Info Section */}
      <div className="p-8 border-b">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.infoTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t.reference}</p>
            <p className="font-semibold">DBQ-2026-001234</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.date}</p>
            <p className="font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.advisor}</p>
            <p className="font-semibold">{t.advisorValue}</p>
          </div>
        </div>
      </div>

      {/* Frais Section */}
      <div className="p-8 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.feesTitle}</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <span className="text-gray-700">{t.unlockFee}</span>
            <span className="font-semibold">550,00 €</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <span className="text-gray-700">{t.processingFee}</span>
            <span className="font-semibold">350,00 €</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <span className="text-gray-700">{t.notaryFee}</span>
            <span className="font-semibold">500,00 €</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <span className="text-gray-700">{t.transferFee}</span>
            <span className="font-semibold">120,00 €</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-blue-900 text-white rounded-lg mt-4">
            <span className="text-lg font-bold">{t.totalFees}</span>
            <span className="text-xl font-bold">1520,00 € TTC</span>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="p-8 border-b">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.docsTitle}</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">1</span>
              {t.identityDocs}
            </h3>
            <div className="ml-8 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.idCard}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.addressProof}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.photo}</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">2</span>
              {t.bankDocs}
            </h3>
            <div className="ml-8 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.rib}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.noOpposition}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.certifiedRib}</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">3</span>
              {t.notaryDocs}
            </h3>
            <div className="ml-8 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.notaryAct}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.mandate}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.notaryAttestation}</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">4</span>
              {t.additionalDocs}
            </h3>
            <div className="ml-8 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.fundsProof}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.declaration}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">{t.form}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section - MODIFIÉ POUR 48H */}
      <div className="p-8 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.timelineTitle}</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-24 text-sm font-semibold text-gray-600">J+0</div>
            <div className="flex-1 bg-white p-4 rounded shadow-sm">
              <p className="font-semibold">{t.reception}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">{t.pending}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-24 text-sm font-semibold text-gray-600">J+0 à J+1</div>
            <div className="flex-1 bg-white p-4 rounded shadow-sm">
              <p className="font-semibold">{t.verification}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{t.upcoming}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-24 text-sm font-semibold text-gray-600">J+1</div>
            <div className="flex-1 bg-white p-4 rounded shadow-sm">
              <p className="font-semibold">{t.validation}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{t.upcoming}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-24 text-sm font-semibold text-gray-600">J+1 à J+2</div>
            <div className="flex-1 bg-white p-4 rounded shadow-sm">
              <p className="font-semibold">{t.notaryProcessing}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{t.upcoming}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-24 text-sm font-semibold text-gray-600">J+2</div>
            <div className="flex-1 bg-white p-4 rounded shadow-sm border-2 border-green-500">
              <p className="font-semibold">{t.unlock}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{t.scheduled}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-800">
            <strong>{t.deadline}</strong>
          </p>
          <p className="text-xs text-red-700 mt-1">{t.processingTime}</p>
        </div>
      </div>

      {/* Payment Section - MODIFIÉ POUR 48H */}
      <div className="p-8 border-b">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.paymentTitle}</h2>
        <p className="text-gray-600 mb-4">{t.paymentIntro}</p>
        <ul className="space-y-2 mb-4">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-gray-700">{t.wireTransfer}</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-gray-700">{t.autoDebit}</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-gray-700">{t.directDeduction}</span>
          </li>
        </ul>
        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">{t.bankDetails}</p>
          <p className="text-sm text-gray-600">IBAN : FR76 3000 4000 0120 0123 4557 890</p>
          <p className="text-sm text-gray-600">BIC : BNPAFRPPXXX</p>
        </div>
        <div className="bg-red-50 p-4 border-l-4 border-red-500 rounded">
          <p className="text-sm font-semibold text-red-800">{t.urgentPayment}</p>
        </div>
      </div>

      {/* Contact Section - MODIFIÉ POUR 48H */}
      <div className="p-8 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.contactTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-600 mb-1">{t.customerService}</p>
            <p className="font-semibold text-blue-900">+33 6 44 67 61 30</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-600 mb-1">{t.email}</p>
            <p className="font-semibold text-blue-900">creditagricole@banque.fr</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-600 mb-1">{t.hours}</p>
            <p className="font-semibold text-blue-900">{t.hoursValue}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          {t.contactNote}
        </p>
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-semibold text-blue-800">{t.urgentContact}</p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="p-8 border-b">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.signatureTitle}</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">{t.signatureInstruction}</p>
          <div className="border-2 border-blue-900 rounded-lg bg-white">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}     
              onTouchMove={draw}                 
              onTouchEnd={stopDrawing} 
            />
          </div>
          <button
            onClick={clearSignature}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            {t.clearSignature}
          </button>
          {signature && (
            <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm text-green-800">{t.signatureSaved}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer - MODIFIÉ POUR 48H */}
      <div className="p-8 bg-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-2">{t.legalTitle}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t.legalText}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <strong>{t.compliance}</strong> {t.complianceText}
        </p>
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-500">{t.generated} {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">{t.validity}</p>
          <p className="text-sm text-gray-500 mt-2">{t.internalRef} DBQ-2026-001234</p>
        </div>
      </div>
    </div>
    </div>
    </div>
    
        )
    }