import React, { useState } from 'react';
import { Lock } from 'lucide-react';

// CODE DE SÉCURITÉ - MODIFIEZ ICI
const SECURITY_CODE = '12345678'; // Changez ce code à 8 chiffres

export default function Login({ onLogin }) {
  const [securityInput, setSecurityInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (securityInput === SECURITY_CODE) {
      localStorage.setItem('auth', 'true');
      onLogin();
      setError('');
    } else {
      setError('❌ Code incorrect. Veuillez réessayer.');
      setSecurityInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full mb-4">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Accès Sécurisé</h1>
          <p className="text-sm sm:text-base text-gray-600">Entrez le code de sécurité à 8 chiffres</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength="8"
              value={securityInput}
              onChange={(e) => setSecurityInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••••"
              className="w-full p-3 sm:p-4 text-center text-xl sm:text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
            <p className="text-xs text-gray-500 text-center mt-2">{securityInput.length}/8 chiffres</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={securityInput.length !== 8}
            className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Valider
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800 text-center">
            🔒 Vos données sont protégées par un code de sécurité
          </p>
        </div>
      </div>
    </div>
  );
}