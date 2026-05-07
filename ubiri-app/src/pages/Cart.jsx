import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { getCart, removeFromCart, getCartTotal, placeMarketplaceOrder } = useAuth();
  const cart = getCart();
  const total = getCartTotal();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shipping, setShipping] = useState({ address: '', city: '', phone: '' });
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    try {
      const order = placeMarketplaceOrder(shipping);
      setOrderSuccess(order);
      window.scrollTo(0, 0);
    } catch (err) {
      alert(err.message);
    }
  };

  if (orderSuccess) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black mb-4">Commande Réussie !</h1>
          <p className="text-gray-500 mb-8 text-lg">Votre commande <span className="font-bold text-black dark:text-white">#{orderSuccess.id}</span> a été validée. Nous vous contacterons sous peu pour la livraison.</p>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-xl mb-12 text-left">
            <h3 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-gray-400">Détails de livraison</h3>
            <p className="font-bold">{shipping.address}</p>
            <p className="text-sm text-gray-500">{shipping.city} · {shipping.phone}</p>
          </div>
          <Link to="/dashboard/user" className="inline-block bg-green-600 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-green-500/20 hover:-translate-y-1 transition-all">
            Voir mes commandes
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Navbar />
      
      <main className="pt-36 pb-20 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black mb-12">Mon Panier</h1>

        {cart.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {!isCheckingOut ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black">Articles ({cart.length})</h2>
                    <button onClick={() => navigate('/marketplace')} className="text-sm text-green-600 font-bold hover:underline">Continuer les achats</button>
                  </div>
                  {cart.map((item) => (
                    <div key={item.cartId} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-xl flex items-center gap-6 group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                        <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg truncate">{item.name}</h3>
                        <p className="text-green-600 font-black">{item.price.toLocaleString()} FCFA</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-neutral-100 dark:border-white/5 shadow-2xl animate-in slide-in-from-left-4">
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setIsCheckingOut(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <h2 className="text-3xl font-black">Informations de livraison</h2>
                  </div>
                  <form onSubmit={handlePlaceOrder} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Adresse complète</label>
                        <input type="text" required value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} placeholder="Rue, quartier, immeuble..." className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Ville</label>
                        <input type="text" required value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} placeholder="Cotonou, Abidjan..." className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Numéro de téléphone</label>
                      <input type="tel" required value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} placeholder="+229 ..." className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="w-full bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-500/20 hover:-translate-y-1 transition-all">
                        Confirmer et payer {total.toLocaleString()} FCFA
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-neutral-100 dark:border-white/5 shadow-2xl h-fit sticky top-24">
              <h2 className="text-2xl font-black mb-8">Récapitulatif</h2>
              <div className="space-y-5 mb-8 text-sm font-bold">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Frais de livraison</span>
                  <span className="text-green-600">Offerts</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>TVA (18%)</span>
                  <span>Inclus</span>
                </div>
                <div className="h-px bg-neutral-100 dark:bg-white/5 my-6" />
                <div className="flex justify-between text-2xl font-black">
                  <span>Total</span>
                  <span className="text-green-600">{total.toLocaleString()} FCFA</span>
                </div>
              </div>
              {!isCheckingOut && (
                <button 
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-500/20 hover:-translate-y-1 transition-all"
                >
                  Passer la commande
                </button>
              )}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  Paiement 100% Sécurisé
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Livraison en 24h/48h
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 p-20 rounded-[3rem] text-center border border-neutral-100 dark:border-white/5 shadow-2xl">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-8">Il semble que vous n'ayez pas encore ajouté de produits.</p>
            <Link to="/marketplace" className="inline-block bg-green-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-green-500/20 hover:-translate-y-1 transition-all">
              Visiter le Marketplace
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
