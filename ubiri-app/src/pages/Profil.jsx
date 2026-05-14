import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MapExplorer from '../components/MapExplorer';
import VerificationBadge from '../components/VerificationBadge';

const WORKER_DATA = {
  name: 'Kofi Amavi',
  trade: 'Plombier',
  city: 'Cotonou, Bénin',
  rating: 4.8,
  reviewsCount: 24,
  interventionsCount: 47,
  years: 6,
  interventions: [],
  successRate: 98,
  responseTime: '~30min',
  bio: "Artisan plombier avec plus de 6 ans d'expérience à Cotonou et ses environs. Spécialisé dans la réparation de fuites, l'installation sanitaire et la plomberie industrielle. Je réponds rapidement et travaille proprement, avec des matériaux de qualité.",
  skills: ['Réparation de fuites', 'Installation sanitaire', 'Plomberie industrielle', 'Chauffe-eau', 'Tuyauterie', 'Urgences 24h/24'],
  rate: '3 000 – 8 000 FCFA/h',
  availability: [
    { day: 'Lun – Ven', available: true },
    { day: 'Samedi', available: true },
    { day: 'Dimanche', available: false, note: 'Urgences seulement' },
  ],
  satisfactionBars: [
    { label: 'Qualité du travail', percent: 96 },
    { label: 'Ponctualité', percent: 92 },
    { label: 'Communication', percent: 98 },
    { label: 'Rapport qualité/prix', percent: 90 },
  ],
  interventionHistory: [
    { title: 'Réparation fuite cuisine', date: '15 Jan 2025', location: 'Akpakpa', status: 'completed', urgent: false },
    { title: "Fuite d'eau sous pression", date: '12 Jan 2025', location: 'Cotonou Centre', status: 'completed', urgent: true },
    { title: 'Installation chauffe-eau', date: '8 Jan 2025', location: 'Cadjehoun', status: 'completed', urgent: false },
    { title: 'Réparation WC bouché', date: '3 Jan 2025', location: 'Fidjrossè', status: 'completed', urgent: true },
  ],
  reviews: [
    { author: 'Moussa S.', rating: 5, comment: 'Excellent travail, très rapide et propre.', date: '16 Jan 2025' },
    { author: 'Fatou K.', rating: 5, comment: 'Je recommande vivement ! Prix honnête.', date: '13 Jan 2025' },
    { author: 'Ibrahima B.', rating: 4, comment: 'Bon professionnel, légèrement en retard mais travail parfait.', date: '9 Jan 2025' },
  ],
};

function Stars({ rating, size = 'sm' }) {
  const full = Math.floor(rating);
  return (
    <div className={`flex gap-0.5`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${i < full ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Profil() {
  const { id } = useParams();
  const { currentUser, getUserById, isFavorite, toggleLikeIntervention } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [showToastMsg, setShowToastMsg] = useState('');
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const w = getUserById(Number(id)) || { ...WORKER_DATA, id: Number(id) };
    setWorker(w);
    setSaved(isFavorite(Number(id)));
  }, [id, getUserById, isFavorite]);

  const showToast = (msg) => {
    setShowToastMsg(msg);
    setTimeout(() => setShowToastMsg(''), 3000);
  };

  const handleStartChat = () => {
    if (!currentUser) { navigate('/login'); return; }
    navigate(`/chat/${worker?.id}`);
  };

  const handleLike = (e, intervId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toggleLikeIntervention(worker.id, intervId);
      const updatedWorker = getUserById(worker.id) || { ...WORKER_DATA, id: Number(id) };
      setWorker(updatedWorker);
    } catch (err) {
      showToast(err.message);
    }
  };

  if (!worker) return null;

  const initials = worker.name.split(' ').map((n) => n[0]).join('');
  const interventions = worker.interventions || [];

  return (
    <>
      <div className="bg-gray-50 dark:bg-[#0a0f0d] text-gray-900 dark:text-gray-100 min-h-screen">
        {showToastMsg && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full z-50 font-bold shadow-2xl animate-in slide-in-from-bottom-5">
            {showToastMsg}
          </div>
        )}
        <Link to="/" className="fixed top-5 left-5 z-50 bg-white/80 dark:bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/30 hover:scale-110 transition-transform" aria-label="Retour">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>

        {/* HERO BANNER */}
        <div className="hero-banner relative pt-24 pb-10 px-6">
          <div className="hero-glow absolute w-[500px] h-[500px] rounded-full top-[-100px] right-[-100px] pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)' }} />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Avatar */}
              <div className="avatar-ring shrink-0 fade-up">
                <div className="avatar-inner">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-5xl sm:text-6xl font-bold text-white select-none">
                    {initials}
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="text-center sm:text-left text-white fade-up delay-1 flex-1">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
                  <VerificationBadge status={worker.verificationStatus || 'none'} size="md" />
                  <span className="text-xs text-green-300 bg-white/10 px-3 py-1 rounded-full">{worker.trade || WORKER_DATA.trade}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">{worker.name}</h1>
                <p className="text-green-300 text-sm mb-3">
                  <svg className="w-4 h-4 inline -mt-0.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {worker.city || WORKER_DATA.city}
                </p>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <Stars rating={worker.rating || WORKER_DATA.rating} />
                  <span className="text-white font-bold text-lg">{worker.rating || WORKER_DATA.rating}</span>
                  <span className="text-green-300 text-sm">({worker.reviewsCount || WORKER_DATA.reviewsCount} avis)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 fade-up delay-2 pb-1">
                <button className="btn-contact" onClick={handleStartChat}>
                  <svg className="w-4 h-4 inline -mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Envoyer un message
                </button>
                <button className="btn-outline" onClick={() => { setSaved(!saved); showToast(saved ? 'Profil retiré des favoris' : 'Profil sauvegardé !'); }}>
                  <svg className="w-4 h-4 inline -mt-0.5 mr-1" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {saved ? 'Sauvegardé' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 fade-up delay-3">
              {[
                { value: WORKER_DATA.interventions, label: 'Interventions' },
                { value: WORKER_DATA.years, label: "Ans d'expérience" },
                { value: `${WORKER_DATA.successRate}%`, label: 'Taux de succès' },
                { value: WORKER_DATA.responseTime, label: 'Temps de réponse' },
              ].map((s, i) => (
                <div key={i} className="stat-card p-4 text-center text-white">
                  <div className="text-2xl font-bold text-green-400">{s.value}</div>
                  <div className="text-xs text-green-200 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Tabs */}
          <div className="tabs-scroll mb-8 fade-up">
            <div className="flex gap-2 bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 w-fit">
              {[
                { id: 'overview', label: "Vue d'ensemble" },
                { id: 'interventions', label: 'Interventions' },
                { id: 'reviews', label: 'Avis clients' },
                { id: 'infos', label: 'Informations' },
              ].map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6 fade-up delay-1">
              <div className="md:col-span-2 space-y-6">
                {/* Bio */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                  <h2 className="text-lg font-bold mb-3">À propos</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{WORKER_DATA.bio}</p>
                </div>
                {/* Skills */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                  <h2 className="text-lg font-bold mb-4">Compétences</h2>
                  <div className="flex flex-wrap gap-2">
                    {WORKER_DATA.skills.map((skill) => (
                      <span key={skill} className="skill-pill">{skill}</span>
                    ))}
                  </div>
                </div>
                {/* Recent Interventions */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold">Dernières interventions</h2>
                    <button className="text-green-600 text-sm font-semibold hover:underline" onClick={() => setActiveTab('interventions')}>Voir tout →</button>
                  </div>
                  <div className="space-y-4">
                    {WORKER_DATA.interventionHistory.slice(0, 3).map((item, i) => (
                      <div key={i} className="intervention-card bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.location} · {item.date}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {item.urgent && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Urgent</span>}
                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Terminé</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Availability */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Disponibilité</h3>
                  <div className="space-y-2">
                    {WORKER_DATA.availability.map((a, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{a.day}</span>
                        {a.available
                          ? <span className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">{a.note || 'Disponible'}</span>
                          : <span className="text-xs text-gray-400 font-bold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{a.note || 'Indisponible'}</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
                {/* Satisfaction */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Satisfaction client</h3>
                  <div className="space-y-3">
                    {WORKER_DATA.satisfactionBars.map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{bar.label}</span>
                          <span className="font-bold text-green-600">{bar.percent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="progress-fill" style={{ width: `${bar.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rate */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-2xl p-5 border border-green-100 dark:border-green-800/30">
                  <h3 className="font-bold mb-1 text-green-800 dark:text-green-400 text-sm uppercase tracking-wider">Tarif indicatif</h3>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">{WORKER_DATA.rate}</div>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">Devis gratuit sur demande</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Realizations (Portfolio) */}
          {activeTab === 'interventions' && (
            <div className="fade-up">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black mb-1">Portfolio & Réalisations</h2>
                  <p className="text-gray-500 text-sm">Découvrez les projets récents de cet artisan</p>
                </div>
                <span className="text-xs font-black bg-green-50 text-green-600 px-4 py-2 rounded-full uppercase tracking-widest border border-green-100">
                  {interventions.length} photos
                </span>
              </div>
              
              {interventions.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-8">
                  {interventions.map((interv) => (
                    <div key={interv.id} className="group bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={interv.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={interv.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Status Tag */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur text-black dark:text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                            {interv.title || 'Réalisation'}
                          </span>
                        </div>

                        {/* Like Button */}
                        <button 
                          onClick={(e) => handleLike(e, interv.id)}
                          className={`absolute top-4 right-4 p-3 rounded-2xl shadow-xl transition-all duration-300 ${
                            interv.likes?.includes(currentUser?.id) 
                            ? 'bg-pink-500 text-white scale-110' 
                            : 'bg-white/90 backdrop-blur text-gray-400 hover:text-pink-500 hover:scale-105'
                          }`}
                        >
                          <svg className="w-5 h-5" fill={interv.likes?.includes(currentUser?.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-black text-xl leading-tight text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                            {interv.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-pink-500 font-black text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.557 0 3.046.727 4.02 1.832L12 5.4l.48-.568C13.454 3.727 14.943 3 16.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                            <span>{interv.likes?.length || 0}</span>
                          </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                          {interv.description}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Projet Vérifié</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            {new Date(interv.date).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/10">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black mb-2 opacity-50">Aucune réalisation publiée</h3>
                  <p className="text-gray-400 max-w-xs mx-auto">Revenez bientôt pour découvrir les derniers travaux de {worker.name}.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Reviews */}
          {activeTab === 'reviews' && (
            <div className="fade-up">
              <div className="flex items-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-5xl font-black text-green-600">{WORKER_DATA.rating}</div>
                  <Stars rating={WORKER_DATA.rating} size="lg" />
                  <p className="text-sm text-gray-500 mt-1">{WORKER_DATA.reviewsCount} avis</p>
                </div>
              </div>
              <div className="space-y-4">
                {WORKER_DATA.reviews.map((review, i) => (
                  <div key={i} className="review-card bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-green-700 dark:text-green-400 text-sm">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{review.author}</p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Infos */}
          {activeTab === 'infos' && (
            <div className="fade-up grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                <h2 className="text-lg font-bold mb-4">Coordonnées</h2>
                <p className="text-sm text-gray-500 mb-4">Contactez Kofi directement via la plateforme Ubiri.</p>
                <button onClick={handleStartChat} className="btn-contact w-full text-center">Envoyer un message</button>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                <h2 className="text-lg font-bold mb-4">Zone d'intervention</h2>
                <div className="rounded-xl overflow-hidden h-48 mb-4 border border-gray-100 dark:border-white/10">
                  <MapExplorer workers={[worker]} center={[worker.lat || 6.3654, worker.lng || 2.4183]} zoom={14} />
                </div>
                <p className="text-sm text-gray-500">Rayon d'action : 20km autour de {worker.city || WORKER_DATA.city}.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
