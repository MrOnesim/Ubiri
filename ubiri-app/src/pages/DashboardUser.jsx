import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function DashboardUser() {
  const { currentUser, getFavorites, getOrders, confirmOrderCompletion, getMarketplaceOrders, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites');
  const [serviceOrders, setServiceOrders] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'client') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (activeTab !== 'orders' || !currentUser) return;
    setOrdersLoading(true);
    const load = async () => {
      try {
        const allOrders = await getOrders();
        setServiceOrders((allOrders || []).filter(o => String(o.id).startsWith('ORD-')));
        const allShop = getMarketplaceOrders ? getMarketplaceOrders() : [];
        setShopOrders(allShop.filter(o => o.userId === currentUser.id));
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    load();
  }, [activeTab, currentUser]);

  if (!currentUser || currentUser.role !== 'client') return null;

  const favorites = getFavorites ? getFavorites() : [];
  const requests = JSON.parse(localStorage.getItem('ubiri_requests') || '[]')
    .filter((r) => r.clientId === currentUser.id);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-neutral-100 dark:border-white/5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white text-2xl font-black">
              {currentUser.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black">{currentUser.name}</h1>
              <p className="text-gray-500 text-sm">{currentUser.email}</p>
              <span className="inline-block mt-2 text-xs font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">Client</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="text-sm text-red-600 font-bold border border-red-200 dark:border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Déconnexion
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-8 flex-wrap">
            {[
              { id: 'favorites', label: '❤️ Favoris' },
              { id: 'requests', label: '📋 Demandes' },
              { id: 'orders', label: '💰 Commandes' },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === t.id ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-white dark:bg-gray-900 border border-neutral-200 dark:border-white/10 hover:border-green-300'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Favorites */}
          {activeTab === 'favorites' && (
            <div>
              {favorites.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {favorites.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">❤️</div>
                  <h2 className="text-xl font-black mb-2">Aucun favori</h2>
                  <p className="text-gray-500 mb-6">Explorez nos services et sauvegardez vos ouvriers préférés.</p>
                  <Link to="/services" className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:-translate-y-1 transition-all shadow-lg shadow-green-500/20">
                    Découvrir les services
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Requests */}
          {activeTab === 'requests' && (
            <div>
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-neutral-100 dark:border-white/5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold">{r.description?.slice(0, 60)}...</h3>
                          <p className="text-sm text-gray-500 mt-1">{r.category} · {r.location}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(r.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {r.status === 'pending' ? 'En attente' : 'Traité'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">📋</div>
                  <h2 className="text-xl font-black mb-2">Aucune demande</h2>
                  <p className="text-gray-500 mb-6">Publiez votre première demande de service.</p>
                  <Link to="/" className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:-translate-y-1 transition-all shadow-lg shadow-green-500/20">
                    Publier une demande
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : serviceOrders.length === 0 && shopOrders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
                  <div className="text-5xl mb-4">💰</div>
                  <h2 className="text-xl font-black mb-2">Aucune commande</h2>
                  <p className="text-gray-500">Vous n'avez pas encore effectué d'achat sur Ubiri.</p>
                </div>
              ) : (
                <div className="space-y-12">
                    {/* Prestations Section */}
                    {serviceOrders.length > 0 && (
                      <section>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                          <span className="w-2 h-8 bg-green-600 rounded-full" />
                          Prestations de services
                        </h3>
                        <div className="space-y-4">
                          {serviceOrders.map((o) => (
                            <div key={o.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-neutral-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 uppercase">{o.id}</span>
                                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                    o.status === 'escrow' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                    {o.status === 'escrow' ? 'En Séquestre' : 'Terminé'}
                                  </span>
                                </div>
                                <h3 className="text-xl font-black">{o.serviceName}</h3>
                                <p className="text-sm text-gray-500 mt-1">Payé le {new Date(o.date).toLocaleDateString()} · {o.amount} FCFA</p>
                              </div>
                              <div className="shrink-0 flex items-center">
                                {o.status === 'escrow' ? (
                                  <button 
                                    onClick={() => {
                                      if (window.confirm('Confirmez-vous que le travail est terminé ? L\'argent sera versé à l\'artisan.')) {
                                        confirmOrderCompletion(o.id);
                                        window.location.reload();
                                      }
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    Confirmer la réalisation
                                  </button>
                                ) : (
                                  <div className="text-green-600 font-bold flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                    Travail validé
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Shop Orders Section */}
                    {shopOrders.length > 0 && (
                      <section>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                          <span className="w-2 h-8 bg-blue-600 rounded-full" />
                          Achats Boutique (Marketplace)
                        </h3>
                        <div className="space-y-4">
                          {shopOrders.map((o) => (
                            <div key={o.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-neutral-100 dark:border-white/5 shadow-sm">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">{o.id}</span>
                                  <p className="text-xs text-gray-500 mt-2 font-bold">{new Date(o.date).toLocaleString('fr-FR')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-xl text-blue-600">{o.total.toLocaleString()} FCFA</p>
                                  <p className="text-[10px] font-black text-gray-400 uppercase">Payé</p>
                                </div>
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {o.items.map((item, idx) => (
                                  <div key={idx} className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-neutral-100 dark:border-white/5 shadow-sm" title={item.name}>
                                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                                  </div>
                                ))}
                                {o.items.length > 5 && (
                                  <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-400">
                                    +{o.items.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
