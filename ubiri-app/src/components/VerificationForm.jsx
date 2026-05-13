import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VerificationForm() {
  const { submitKYC, uploadFile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({ identity: null, diploma: null });
  const [previews, setPreviews] = useState({ identity: null, diploma: null });
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload files first
      const { url: frontUrl } = await uploadFile(files.identity);
      const { url: backUrl } = await uploadFile(files.diploma);

      await submitKYC({
        idType: 'CNI',
        idFrontUrl: frontUrl,
        idBackUrl: backUrl
      });
      
      setSuccess(true);
    } catch (err) {
      alert("Erreur lors de l'envoi : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 text-center border border-neutral-100 dark:border-white/5 shadow-xl animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="text-2xl font-black mb-2">Documents envoyés !</h2>
        <p className="text-gray-500 mb-0">Nos administrateurs examinent votre profil. Vous recevrez une notification d'ici 24h à 48h.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 border border-neutral-100 dark:border-white/5 shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black">Vérification du profil</h2>
          <p className="text-gray-500 text-sm">Obtenez le badge de confiance Ubiri</p>
        </div>
        <div className="flex gap-1">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="font-bold mb-2">Étape 1 : Pièce d'identité</h3>
              <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                Téléchargez une photo claire de votre CNI, Passeport ou permis de conduire pour prouver votre identité.
              </p>
              
              <label className={`block border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all ${
                files.identity ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-200 dark:border-white/10 hover:border-blue-400'
              }`}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'identity')} />
                {previews.identity ? (
                  <div className="flex flex-col items-center">
                    <img src={previews.identity} className="h-20 w-32 object-cover rounded-xl mb-3 shadow-lg" alt="CNI Preview" />
                    <span className="text-xs font-black text-blue-600 uppercase">Document chargé ✓</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Cliquez pour choisir un fichier</span>
                  </div>
                )}
              </label>
            </div>
            
            <button 
              type="button"
              disabled={!files.identity}
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
            >
              Étape suivante
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="font-bold mb-2">Étape 2 : Épreuves de qualification</h3>
              <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                Diplômes, certificats techniques ou photos de vos réalisations précédentes pour valider vos compétences.
              </p>
              
              <label className={`block border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all ${
                files.diploma ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-200 dark:border-white/10 hover:border-blue-400'
              }`}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'diploma')} />
                {previews.diploma ? (
                  <div className="flex flex-col items-center">
                    <img src={previews.diploma} className="h-20 w-32 object-cover rounded-xl mb-3 shadow-lg" alt="Diploma Preview" />
                    <span className="text-xs font-black text-blue-600 uppercase">Document chargé ✓</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Cliquez pour choisir un diplôme</span>
                  </div>
                )}
              </label>
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl"
              >
                Retour
              </button>
              <button 
                type="submit"
                disabled={!files.diploma || loading}
                className="flex-[2] bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Soumettre le dossier"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
