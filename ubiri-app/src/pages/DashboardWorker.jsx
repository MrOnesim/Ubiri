import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VerificationBadge from '../components/VerificationBadge';
import VerificationForm from '../components/VerificationForm';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function DashboardWorker() {
  const { 
    currentUser, addProduct, getWorkerStats, logout, adminVerifyWorker, 
    addReviewReply, addIntervention, deleteIntervention 
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [replyText, setReplyText] = useState({}); // { reviewId: text }
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Portfolio local state
  const [isAddingInterv, setIsAddingInterv] = useState(false);
  const [intervForm, setIntervForm] = useState({ title: '', description: '', imageUrl: '', serviceId: '' });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'worker') navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'worker') return null;

  const stats = getWorkerStats();
  const products = currentUser.products || [];
  const interventions = currentUser.interventions || [];

  // Mock analytics data
  const viewsData = [
    { day: 'Lun', views: 12 },
    { day: 'Mar', views: 25 },
    { day: 'Mer', views: 18 },
    { day: 'Jeu', views: 35 },
    { day: 'Ven', views: 28 },
    { day: 'Sam', views: 42 },
    { day: 'Dim', views: 30 },
  ];

  const inquiriesData = [
    { name: 'Plomberie', count: 8, color: '#10b981' },
    { name: 'Réparation', count: 12, color: '#059669' },
    { name: 'Urgence', count: 5, color: '#047857' },
  ];

  const handleReplySubmit = (productId, reviewId) => {
    const text = replyText[reviewId];
    if (!text) return;
    try {
      addReviewReply(productId, reviewId, text);
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      setSuccess('Réponse publiée !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddIntervention = (e) => {
    e.preventDefault();
    try {
      addIntervention(intervForm);
      setSuccess('Réalisation publiée !');
      setIntervForm({ title: '', description: '', imageUrl: '', serviceId: '' });
      setIsAddingInterv(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    setError('');
    try {
      addProduct({ ...form, price: Number(form.price) });
      setSuccess('Service publié avec succès !');
      setForm({ name: '', description: '', price: '', imageUrl: '' });
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const verificationStatus = currentUser.verificationStatus || 'none';

  return (
    <div className="page-entry bg-gray-50 dark:bg-gray-950 min-h-screen font-sans">
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-[2rem] p-8 shadow-xl mb-8 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-black">
              {currentUser.name?.charAt(0)}
            </div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">{currentUser.name}</h1>
                <VerificationBadge status={verificationStatus} size="md" />
              </div>
              <p className="text-green-100 text-sm">{currentUser.trade} · {currentUser.city}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Ouvrier</span>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  verificationStatus === 'verified' ? 'bg-blue-500 text-white' :
                  verificationStatus === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                  'bg-white/10 text-white/70'
                }`}>
                  {verificationStatus === 'verified' ? 'Profil Vérifié' :
                   verificationStatus === 'pending' ? 'Vérification en cours' :
                   'Profil non vérifié'}
                </span>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="text-sm text-white/80 border border-white/30 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
              Déconnexion
            </button>

            {/* Simulated Admin Action for Demo */}
            {verificationStatus === 'pending' && (
              <button 
                onClick={() => adminVerifyWorker(currentUser.id, 'verified')}
                className="absolute bottom-2 right-2 text-[8px] bg-white/5 hover:bg-white/10 text-white/30 px-2 py-1 rounded uppercase font-black"
              >
                Admin : Approuver
              </button>
            )}
            {verificationStatus === 'none' && (
              <button 
                onClick={() => adminVerifyWorker(currentUser.id, 'verified')}
                className="absolute bottom-2 right-2 text-[8px] bg-white/5 hover:bg-white/10 text-white/30 px-2 py-1 rounded uppercase font-black"
              >
                Admin : Forcer Vérifié
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
          {[
              { label: 'Services publiés', value: products.length },
              { label: 'Vues totales', value: stats?.views || 0 },
              { label: 'Moy. vues/service', value: products.length > 0 ? Math.round((stats?.views || 0) / products.length) : 0 },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-center border border-neutral-100 dark:border-white/5 shadow-sm">
                <div className="text-2xl font-black text-green-600">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span>{success}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-3 mb-8 flex-wrap overflow-x-auto pb-2 custom-scrollbar">
            {[
              { id: 'analytics', label: 'Analyses', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
              { id: 'products', label: 'Mes services', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
              { id: 'portfolio', label: 'Portfolio', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
              { id: 'add', label: 'Publier', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
              { id: 'reviews', label: 'Avis', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
              { id: 'verification', label: 'Vérification', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
              { id: 'wallet', label: 'Portefeuille', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
            ].map((t) => (
              <button key={t.id} onClick={() => { 
                  if (t.id === 'wallet') navigate('/wallet'); 
                  else { 
                    setActiveTab(t.id === 'add' ? 'products' : t.id); 
                    if (t.id === 'add') setShowForm(true); else setShowForm(false); 
                    setIsAddingInterv(false);
                  } 
                }}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                  (activeTab === t.id || (t.id === 'add' && showForm)) ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-white dark:bg-gray-900 border border-neutral-200 dark:border-white/10 hover:border-green-300'
                }`}>
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg">Vues du profil</h3>
                    <span className="text-[10px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-full uppercase tracking-widest">7 derniers jours</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={viewsData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                          itemStyle={{color: '#10b981'}}
                        />
                        <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg">Demandes par service</h3>
                    <span className="text-[10px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-full uppercase tracking-widest">Global</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inquiriesData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} width={80} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                        <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                          {inquiriesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Conversion Stats */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 grid md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-2">Taux de conversion</p>
                    <div className="text-4xl font-black mb-1">14.2%</div>
                    <p className="text-green-200 text-[10px]">+2.4% par rapport au mois dernier</p>
                  </div>
                  <div>
                    <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-2">Temps de réponse moy.</p>
                    <div className="text-4xl font-black mb-1">24 min</div>
                    <p className="text-green-200 text-[10px]">Parmi les 10% les plus rapides</p>
                  </div>
                  <div>
                    <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-2">Score de confiance</p>
                    <div className="text-4xl font-black mb-1">98/100</div>
                    <p className="text-green-200 text-[10px]">Excellent · Profil Vérifié</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'verification' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {verificationStatus === 'verified' ? (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-[2.5rem] p-12 text-center border border-green-100 dark:border-green-500/10">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h2 className="text-3xl font-black mb-4">Votre profil est vérifié !</h2>
                  <p className="text-gray-500 max-w-lg mx-auto">Vous bénéficiez du badge de confiance bleu sur tous vos services et votre profil, augmentant vos chances de réservation de plus de 40%.</p>
                </div>
              ) : verificationStatus === 'pending' ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-[2.5rem] p-12 text-center border border-yellow-100 dark:border-yellow-500/10">
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h2 className="text-3xl font-black mb-4">Vérification en cours...</h2>
                  <p className="text-gray-500 max-w-lg mx-auto">Nous examinons vos documents. Nous vous enverrons une notification dès que votre badge sera actif.</p>
                </div>
              ) : (
                <VerificationForm />
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black mb-4">Avis sur vos services</h2>
              {products.flatMap(p => (p.reviews || []).map(r => ({ ...r, productId: p.id, productName: p.name }))).length > 0 ? (
                products.flatMap(p => (p.reviews || []).map(r => ({ ...r, productId: p.id, productName: p.name })))
                .sort((a, b) => b.id - a.id)
                .map((r) => (
                  <div key={r.id} className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-neutral-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{r.authorName}</span>
                          <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">{r.productName}</span>
                        </div>
                        <div className="text-yellow-400 text-xs mt-1">{'⭐'.repeat(r.rating)}</div>
                      </div>
                      <span className="text-[10px] text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">"{r.comment}"</p>
                    
                    {r.image && (
                      <img src={r.image} className="w-24 h-24 object-cover rounded-xl mb-4 border border-gray-100 dark:border-white/5" alt="Review proof" />
                    )}

                    {r.reply ? (
                      <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-4 border-l-4 border-green-500 mt-2">
                        <span className="text-[10px] font-black uppercase text-green-600 block mb-1">Votre réponse</span>
                        <p className="text-xs text-green-800 dark:text-green-300 italic">{r.reply.text}</p>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Répondre à ce client..."
                          value={replyText[r.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                          className="flex-1 bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/30"
                        />
                        <button 
                          onClick={() => handleReplySubmit(r.productId, r.id)}
                          className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-green-700 transition-all"
                        >
                          Répondre
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] opacity-50">
                  <p>Vous n'avez pas encore reçu d'avis.</p>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">Mes Réalisations</h2>
                {!isAddingInterv && (
                  <button 
                    onClick={() => setIsAddingInterv(true)}
                    className="bg-green-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-green-500/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                  >
                    <span>➕ Publier un chantier</span>
                  </button>
                )}
              </div>

              {isAddingInterv && (
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-neutral-100 dark:border-white/5 shadow-xl mb-12">
                  <h3 className="font-black text-lg mb-6">Nouvelle réalisation</h3>
                  <form onSubmit={handleAddIntervention} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Titre du projet</label>
                        <input type="text" required value={intervForm.title}
                          onChange={(e) => setIntervForm({ ...intervForm, title: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                          placeholder="Ex: Rénovation cuisine complète" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Service concerné</label>
                        <select 
                          required 
                          value={intervForm.serviceId}
                          onChange={(e) => setIntervForm({ ...intervForm, serviceId: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                        >
                          <option value="">-- Choisir un service --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description des travaux</label>
                      <textarea rows={3} required value={intervForm.description}
                        onChange={(e) => setIntervForm({ ...intervForm, description: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20 resize-none"
                        placeholder="Quels étaient les défis ? Quel matériel a été utilisé ?" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Photo de la réalisation (URL ou Base64)</label>
                      <input type="text" required value={intervForm.imageUrl}
                        onChange={(e) => setIntervForm({ ...intervForm, imageUrl: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                        placeholder="https://... ou collez une image" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20">
                        Publier sur mon profil
                      </button>
                      <button type="button" onClick={() => setIsAddingInterv(false)}
                        className="px-6 py-4 rounded-2xl border border-neutral-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {interventions.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-8">
                  {interventions.map((interv) => (
                    <div key={interv.id} className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                      <div className="aspect-video relative overflow-hidden">
                        <img src={interv.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={interv.title} />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => deleteIntervention(interv.id)}
                            className="bg-white/90 backdrop-blur text-red-500 p-2 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-green-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                            {products.find(p => p.id === Number(interv.serviceId))?.name || 'Service lié'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-black text-lg">{interv.title}</h4>
                          <div className="flex items-center gap-1.5 text-pink-500 font-bold text-sm">
                            <span>❤️</span>
                            <span>{interv.likes?.length || 0}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">{interv.description}</p>
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Publié le {new Date(interv.date).toLocaleDateString()}</span>
                          <span className="text-green-600 text-xs font-black">Vérifié</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-white/10">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-black mb-2">Aucune réalisation publiée</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-8">Partagez vos plus beaux chantiers pour convaincre vos futurs clients.</p>
                  <button 
                    onClick={() => setIsAddingInterv(true)}
                    className="bg-green-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-green-500/20 hover:-translate-y-1 transition-all"
                  >
                    Ajouter ma première étape
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Verification Tab ... (needs to stay correctly typed) */}
          {/* Note: I'll clean the duplicate verification tabs if any */}

          {/* Add Product Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-neutral-100 dark:border-white/5 shadow-xl mb-8">
              <h2 className="text-xl font-black mb-6">Publier un nouveau service</h2>
              {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
              <form onSubmit={handleAddProduct} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nom du service</label>
                    <input type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                      placeholder="Ex: Réparation plomberie" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Prix (FCFA)</label>
                    <input type="number" required value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                      placeholder="5000" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
                  <textarea rows={3} required value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20 resize-none"
                    placeholder="Décrivez votre service en détail..." />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">URL de l'image (optionnel)</label>
                  <input type="url" value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                    placeholder="https://..." />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20">
                    Publier le service
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-4 rounded-2xl border border-neutral-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          {activeTab === 'products' && (
            <div>
              {products.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-shadow">
                      {p.imageUrl && (
                        <div className="h-40 rounded-2xl overflow-hidden mb-4">
                          <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name}
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      )}
                      <h3 className="font-black mb-1">{p.name}</h3>
                      <p className="text-green-600 font-bold text-sm mb-2">{p.price} FCFA</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>👁 {p.views || 0} vues</span>
                        <span>⭐ {p.reviews?.length || 0} avis</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <h2 className="text-xl font-black mb-2">Aucun service publié</h2>
                  <p className="text-gray-500 mb-6">Publiez votre premier service pour attirer des clients.</p>
                  <button onClick={() => setShowForm(true)}
                    className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:-translate-y-1 transition-all shadow-lg shadow-green-500/20">
                    Publier un service
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
