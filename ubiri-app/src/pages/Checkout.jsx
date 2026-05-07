import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Checkout() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser, getGlobalProducts, createOrder } = useAuth();
  const [product, setProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    const products = getGlobalProducts();
    const found = products.find(p => String(p.id) === String(serviceId));
    if (!found) { navigate('/services'); return; }
    setProduct(found);
  }, [serviceId, currentUser, getGlobalProducts, navigate]);

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment delay
    setTimeout(() => {
      createOrder(product.workerId, product.id, product.price, product.name);
      setLoading(false);
      setSuccess(true);
      // Wait for success animation then navigate
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }, 2000);
  };

  if (!product) return null;

  const commission = product.price * 0.1;
  const total = product.price;

  if (success) {
    return (
      <div className="min-h-screen bg-green-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black mb-4">Paiement Réussi !</h1>
          <p className="text-gray-500 mb-8">Votre argent est en sécurité dans notre système de séquestre. L'ouvrier a été notifié.</p>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Redirection vers votre tableau de bord...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-white/5 shadow-xl">
              <h2 className="text-xl font-black mb-6">Résumé de la commande</h2>
              <div className="flex gap-4 mb-6 pb-6 border-b border-neutral-100 dark:border-white/5">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm md:text-base">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Proposé par {product.workerName}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-bold">{product.price} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frais de plateforme (incl.)</span>
                  <span className="text-green-600 font-bold">{commission} FCFA</span>
                </div>
                <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-white/5 flex justify-between items-center text-lg">
                  <span className="font-black">Total</span>
                  <span className="text-2xl font-black text-green-600">{total} FCFA</span>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-3">
                <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                  <strong>Paiement sécurisé :</strong> L'argent sera conservé par Ubiri jusqu'à ce que vous validiez la réalisation du travail.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl font-black mb-8">Paiement</h1>
            
            <div className="space-y-4 mb-8">
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                  paymentMethod === 'card' ? 'border-green-600 bg-green-50/50 dark:bg-green-900/10' : 'border-neutral-100 dark:border-white/5 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  </div>
                  <span className="font-black">Carte Bancaire / Visa</span>
                </div>
                {paymentMethod === 'card' && <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>}
              </button>

              <button 
                onClick={() => setPaymentMethod('mobile')}
                className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                  paymentMethod === 'mobile' ? 'border-green-600 bg-green-50/50 dark:bg-green-900/10' : 'border-neutral-100 dark:border-white/5 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-lg font-black text-orange-600">MW</div>
                  <span className="font-black">Mobile Money (MTN, Wave)</span>
                </div>
                {paymentMethod === 'mobile' && <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>}
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              {paymentMethod === 'card' ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Titulaire de la carte</label>
                      <input type="text" required placeholder="NOM COMPLET" className="w-full bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Numéro de carte</label>
                      <input type="text" required placeholder="0000 0000 0000 0000" className="w-full bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Date d'expiration</label>
                        <input type="text" required placeholder="MM/YY" className="w-full bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">CVC</label>
                        <input type="password" required placeholder="123" maxLength={3} className="w-full bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Numéro de téléphone Mobile Money</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">+229</span>
                        <input type="tel" required placeholder="00 00 00 00" className="w-full bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 rounded-2xl pl-20 pr-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 italic">Vous recevrez une notification sur votre téléphone pour confirmer la transaction après avoir cliqué sur Payer.</p>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-green-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    Payer {total} FCFA
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                🔒 Paiement 100% sécurisé via Ubiri Gateway
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
