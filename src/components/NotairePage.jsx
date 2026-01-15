import React, { useState, useRef } from 'react';
import { FileText, Download, PenTool, X } from 'lucide-react';

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

export default function NotairePage() {
  const [language, setLanguage] = useState('fr');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signature, setSignature] = useState(null);
  const canvasRef = useRef(null);
  const [formData, setFormData] = useState({
    nomNotaire: 'Maître Jean DUBOIS',
    adresseEtude: '45 Avenue de la République, 75011 Paris',
    telephoneNotaire: '+33 1 42 43 44 45',
    emailNotaire: 'contact@etude-dubois.fr',
    nomClient: 'Pierre MARTIN',
    adresseClient: '12 Rue des Lilas, 75012 Paris',
    nomBanque: 'Banque Nationale de France',
    numeroCompte: 'FR76 3000 6000 0112 3456 7890 189',
    montantBloque: '50 000',
    deviseBloque: '€',
    dateDeblocage: '15/03/2026',
    raisonBlocage: 'Succession de Madame Marie MARTIN',
    montantHonoraires: '2 500',
    deviseHonoraires: '€',
    dateDocument: new Date().toLocaleDateString('fr-FR'),
    lieuSignature: 'Paris'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
    setShowSignatureModal(false);
  };

  const handleDownload = async () => {
    if (!signature) {
      alert(language === 'fr' ? 'Veuillez d\'abord signer le document !' : 'Si prega di firmare prima il documento!');
      return;
    }

    try {
      const { jsPDF } = await loadJsPDF();
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const t = translations[language];
      
      let y = 20;
      const leftMargin = 15;
      const rightMargin = 195;
      const lineHeight = 6;
      
      const addText = (text, fontSize = 10, isBold = false, align = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, rightMargin - leftMargin);
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          if (align === 'center') {
            const textWidth = doc.getTextWidth(line);
            doc.text(line, (210 - textWidth) / 2, y);
          } else {
            doc.text(line, leftMargin, y);
          }
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

      addText(t.title, 18, true, 'center');
      addText(t.subtitle, 14, false, 'center');
      addLine();
      addSpace(5);

      addText(t.notaryInfo, 12, true);
      addSpace(2);
      addText(`${t.name}: ${formData.nomNotaire}`);
      addText(`${t.address}: ${formData.adresseEtude}`);
      addText(`${t.phone}: ${formData.telephoneNotaire}`);
      addText(`${t.email}: ${formData.emailNotaire}`);
      addSpace(8);

      addText(`${t.body1} ${formData.nomNotaire}${t.body2}`);
      addSpace(5);

      addText(t.clientInfo, 11, true);
      addSpace(2);
      addText(`${t.beneficiary}: ${formData.nomClient}`);
      addText(`${t.address}: ${formData.adresseClient}`);
      addSpace(5);

      addText(t.bankInfo, 11, true);
      addSpace(2);
      addText(`${t.bank}: ${formData.nomBanque}`);
      addText(`${t.accountNumber}: ${formData.numeroCompte}`);
      addText(`${t.blockedAmount}: ${formData.montantBloque} ${formData.deviseBloque}`);
      addText(`${t.unlockDate}: ${formData.dateDeblocage}`);
      addText(`${t.reason}: ${formData.raisonBlocage}`);
      addSpace(8);

      addText(t.fees, 11, true);
      addSpace(2);
      addText(`${t.feesText} ${formData.montantHonoraires} ${formData.deviseHonoraires}`);
      addSpace(8);

      addText(t.certification, 11, true);
      addSpace(2);
      addText(t.certText);
      addSpace(10);

      addText(`${t.done} ${formData.lieuSignature}, ${t.date} ${formData.dateDocument}`);
      addSpace(10);

      addText(t.signature, 10, true, 'center');
      addSpace(5);
      
      if (signature) {
        const signatureX = (210 - 60) / 2;
        doc.addImage(signature, 'PNG', signatureX, y, 60, 30);
        y += 35;
      }
      
      addText(formData.nomNotaire, 10, true, 'center');
      addSpace(10);

      doc.setLineWidth(0.3);
      doc.line(leftMargin, y, rightMargin, y);
      y += 5;
      addText(t.legalMention, 8, false, 'center');
      addText(`${t.reference}: NOT-${Date.now()}`, 8, false, 'center');

      doc.save(`Acte-Notarie-${formData.nomClient || 'Document'}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert(language === 'fr' ? '❌ Erreur lors de la génération du PDF. Veuillez réessayer.' : '❌ Errore durante la generazione del PDF. Riprova.');
    }
  };

  const translations = {
    fr: {
      title: 'ACTE NOTARIÉ',
      subtitle: 'Déblocage de Compte Bancaire',
      notaryInfo: 'INFORMATIONS DU NOTAIRE',
      clientInfo: 'INFORMATIONS DU BÉNÉFICIAIRE',
      bankInfo: 'INFORMATIONS BANCAIRES',
      fees: 'HONORAIRES NOTARIAUX',
      body1: 'Je soussigné,',
      body2: ', Notaire inscrit au registre, certifie par la présente avoir reçu mandat pour procéder au déblocage du compte bancaire suivant :',
      accountNumber: 'Numéro de compte',
      blockedAmount: 'Montant bloqué',
      unlockDate: 'Date de déblocage prévue',
      reason: 'Raison du blocage',
      feesText: 'Les honoraires pour cette intervention notariale s\'élèvent à',
      certification: 'CERTIFICATION',
      certText: 'Le présent acte a été dressé en conformité avec les dispositions légales en vigueur. Toutes les vérifications nécessaires ont été effectuées concernant l\'identité du bénéficiaire et la légitimité de la demande de déblocage.',
      done: 'Fait à',
      date: 'Le',
      signature: 'Signature et cachet du Notaire',
      legalMention: 'Document officiel - Toute reproduction non autorisée est interdite',
      reference: 'Référence',
      name: 'Nom',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      bank: 'Banque',
      beneficiary: 'Bénéficiaire',
      signButton: 'Signer le document',
      downloadButton: 'Télécharger le document',
      signModal: 'Signature du document',
      signHere: 'Signez ici',
      clear: 'Effacer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      notaryName: 'Nom du Notaire',
      studyAddress: 'Adresse de l\'Étude',
      clientName: 'Nom du Client',
      clientAddress: 'Adresse du Client',
      notaryFees: 'Honoraires du Notaire',
      signaturePlace: 'Lieu de Signature',
      generatorTitle: 'Générateur de Documents Notariaux',
      signed: 'Signé'
    },
    it: {
      title: 'ATTO NOTARILE',
      subtitle: 'Sblocco del Conto Bancario',
      notaryInfo: 'INFORMAZIONI DEL NOTAIO',
      clientInfo: 'INFORMAZIONI DEL BENEFICIARIO',
      bankInfo: 'INFORMAZIONI BANCARIE',
      fees: 'ONORARI NOTARILI',
      body1: 'Il sottoscritto,',
      body2: ', Notaio iscritto all\'albo, con la presente certifico di aver ricevuto mandato per procedere allo sblocco del seguente conto bancario:',
      accountNumber: 'Numero di conto',
      blockedAmount: 'Importo bloccato',
      unlockDate: 'Data di sblocco prevista',
      reason: 'Motivo del blocco',
      feesText: 'Gli onorari per questo intervento notarile ammontano a',
      certification: 'CERTIFICAZIONE',
      certText: 'Il presente atto è stato redatto in conformità con le disposizioni legali vigenti. Tutte le verifiche necessarie sono state effettuate riguardo all\'identità del beneficiario e alla legittimità della richiesta di sblocco.',
      done: 'Fatto a',
      date: 'Il',
      signature: 'Firma e timbro del Notaio',
      legalMention: 'Documento ufficiale - Qualsiasi riproduzione non autorizzata è vietata',
      reference: 'Riferimento',
      name: 'Nome',
      address: 'Indirizzo',
      phone: 'Telefono',
      email: 'Email',
      bank: 'Banca',
      beneficiary: 'Beneficiario',
      signButton: 'Firmare il documento',
      downloadButton: 'Scaricare il documento',
      signModal: 'Firma del documento',
      signHere: 'Firma qui',
      clear: 'Cancella',
      save: 'Salva',
      cancel: 'Annulla',
      notaryName: 'Nome del Notaio',
      studyAddress: 'Indirizzo dello Studio',
      clientName: 'Nome del Cliente',
      clientAddress: 'Indirizzo del Cliente',
      notaryFees: 'Onorari del Notaio',
      signaturePlace: 'Luogo di Firma',
      generatorTitle: 'Generatore di Documenti Notarili',
      signed: 'Firmato'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-amber-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                {t.generatorTitle}
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  language === 'fr' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => setLanguage('it')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  language === 'it' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🇮🇹 Italiano
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.notaryName}</label>
              <input
                type="text"
                name="nomNotaire"
                value={formData.nomNotaire}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.studyAddress}</label>
              <input
                type="text"
                name="adresseEtude"
                value={formData.adresseEtude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
              <input
                type="text"
                name="telephoneNotaire"
                value={formData.telephoneNotaire}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input
                type="text"
                name="emailNotaire"
                value={formData.emailNotaire}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.clientName}</label>
              <input
                type="text"
                name="nomClient"
                value={formData.nomClient}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.clientAddress}</label>
              <input
                type="text"
                name="adresseClient"
                value={formData.adresseClient}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.bank}</label>
              <input
                type="text"
                name="nomBanque"
                value={formData.nomBanque}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.accountNumber}</label>
              <input
                type="text"
                name="numeroCompte"
                value={formData.numeroCompte}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.blockedAmount}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="montantBloque"
                  value={formData.montantBloque}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="deviseBloque"
                  value={formData.deviseBloque}
                  onChange={handleChange}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.unlockDate}</label>
              <input
                type="text"
                name="dateDeblocage"
                value={formData.dateDeblocage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.reason}</label>
              <input
                type="text"
                name="raisonBlocage"
                value={formData.raisonBlocage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.notaryFees}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="montantHonoraires"
                  value={formData.montantHonoraires}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="deviseHonoraires"
                  value={formData.deviseHonoraires}
                  onChange={handleChange}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.signaturePlace}</label>
              <input
                type="text"
                name="lieuSignature"
                value={formData.lieuSignature}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setShowSignatureModal(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <PenTool className="w-5 h-5" />
              {signature ? `✓ ${t.signed}` : t.signButton}
            </button>
            <button
              onClick={handleDownload}
              className={`flex-1 ${signature ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all`}
              disabled={!signature}
            >
              <Download className="w-5 h-5" />
              {t.downloadButton}
            </button>
          </div>
        </div>
      </div>

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{t.signModal}</h2>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">{t.signHere}</p>
            
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full bg-white"
              style={{ touchAction: 'none' }}
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={clearSignature}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                {t.clear}
              </button>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white shadow-2xl" id="document">
        <div className="p-12">
          <div className="border-b-4 border-amber-600 pb-6 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-600">
                <FileText className="w-12 h-12 text-amber-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
              <p className="text-xl text-amber-700 font-semibold">{t.subtitle}</p>
            </div>
          </div>

          <div className="mb-8 bg-amber-50 p-6 rounded-lg border-l-4 border-amber-600">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase">{t.notaryInfo}</h2>
            <div className="space-y-2 text-gray-800">
              <p><span className="font-semibold">{t.name}:</span> {formData.nomNotaire}</p>
              <p><span className="font-semibold">{t.address}:</span> {formData.adresseEtude}</p>
              <p><span className="font-semibold">{t.phone}:</span> {formData.telephoneNotaire}</p>
              <p><span className="font-semibold">{t.email}:</span> {formData.emailNotaire}</p>
            </div>
          </div>

          <div className="mb-8 text-gray-800 leading-relaxed space-y-4">
            <p className="text-justify">
              {t.body1} <span className="font-bold">{formData.nomNotaire}</span>{t.body2}
            </p>

            <div className="bg-gray-50 p-6 rounded-lg my-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t.clientInfo}</h3>
              <p><span className="font-semibold">{t.beneficiary}:</span> {formData.nomClient}</p>
              <p><span className="font-semibold">{t.address}:</span> {formData.adresseClient}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-6 border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t.bankInfo}</h3>
              <p><span className="font-semibold">{t.bank}:</span> {formData.nomBanque}</p>
              <p><span className="font-semibold">{t.accountNumber}:</span> {formData.numeroCompte}</p>
              <p><span className="font-semibold">{t.blockedAmount}:</span> {formData.montantBloque} {formData.deviseBloque}</p>
              <p><span className="font-semibold">{t.unlockDate}:</span> {formData.dateDeblocage}</p>
              <p><span className="font-semibold">{t.reason}:</span> {formData.raisonBlocage}</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg my-6 border-l-4 border-green-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t.fees}</h3>
              <p className="text-lg">
                {t.feesText} <span className="font-bold text-green-700">{formData.montantHonoraires} {formData.deviseHonoraires}</span>
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg my-6 border-l-4 border-green-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t.fees}</h3>
              <p className="text-lg">
                {t.feesText} <span className="font-bold text-green-700">{formData.montantHonoraires} {formData.deviseHonoraires}</span>
              </p>
            </div>

            <div className="bg-amber-50 p-6 rounded-lg my-6 border-2 border-amber-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase">{t.certification}</h3>
              <p className="text-justify italic">{t.certText}</p>
            </div>
          </div>

          <div className="mt-12 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-800"><span className="font-semibold">{t.done}</span> {formData.lieuSignature}</p>
                <p className="text-gray-800"><span className="font-semibold">{t.date}</span> {formData.dateDocument}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="text-center">
                <div className="w-64 h-40 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-2 bg-white">
                  {signature ? (
                    <img src={signature} alt="Signature" className="max-w-full max-h-full" />
                  ) : (
                    <p className="text-gray-400 font-medium">{t.signature}</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-700">{formData.nomNotaire}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t-2 border-gray-300">
            <p className="text-xs text-gray-600 text-center italic">{t.legalMention}</p>
            <p className="text-xs text-gray-500 text-center mt-2">{t.reference}: NOT-{Date.now()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}