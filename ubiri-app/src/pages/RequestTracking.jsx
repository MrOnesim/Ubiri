import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function RequestTracking() {
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const pending = localStorage.getItem('pending_request');
    if (!pending) { navigate('/'); return; }
    setRequest(JSON.parse(pending));
  }, [navigate]);

  if (!request) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-lg w-full">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-neutral-100 dark:border-white/5 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            <div className="badge-verified mx-auto mb-4 w-fit">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Demande envoyée
            </div>

            <h1 className="text-2xl font-black mb-3">Votre demande est en cours</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Les ouvriers à proximité ont été notifiés et vous contacteront très prochainement.
            </p>

            {/* Request Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-left mb-8 space-y-3">
              <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Détails de la demande</h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Catégorie</span>
                <span className="font-bold capitalize">{request.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lieu</span>
                <span className="font-bold">{request.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Statut</span>
                <span className="font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-0.5 rounded-full text-xs">En attente</span>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-white/10">
                <p className="text-xs text-gray-500 font-medium">Description</p>
                <p className="text-sm mt-1">{request.description}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="text-left mb-8 space-y-4">
              {[
                { label: 'Demande publiée', done: true },
                { label: 'Notification envoyée aux ouvriers', done: true },
                { label: 'En attente de réponse', done: false, active: true },
                { label: 'Ouvrier sélectionné', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-green-600 text-white' : step.active ? 'bg-yellow-400 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {step.done && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    {step.active && <span className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`text-sm ${step.done ? 'font-bold' : step.active ? 'font-bold text-yellow-600' : 'text-gray-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link to="/" className="flex-1 text-center border-2 border-green-600 text-green-600 font-bold py-3 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-sm">
                Retour à l'accueil
              </Link>
              <Link to="/services" className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition-all text-sm shadow-lg shadow-green-500/20">
                Voir les ouvriers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
