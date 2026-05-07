import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Wallet() {
  const { currentUser, getWallet, getOrders } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'worker') {
      navigate('/login');
      return;
    }
    setWallet(getWallet());
    setOrders(getOrders().filter(o => o.status === 'escrow'));
  }, [currentUser, getWallet, getOrders, navigate]);

  const pendingAmount = orders.reduce((sum, o) => sum + o.netAmount, 0);

  return (
    <div className="page-entry bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black mb-8">Mon Portefeuille</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Main Balance */}
          <div className="md:col-span-2 bg-gradient-to-br from-green-600 to-emerald-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">Solde disponible</span>
              <div className="text-5xl md:text-6xl font-black mt-2 mb-8">{wallet.balance.toLocaleString()} <span className="text-2xl">FCFA</span></div>
              <button className="bg-white text-green-700 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all">
                Retirer les fonds
              </button>
            </div>
            {/* Design elements */}
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20px] left-[20%] w-32 h-32 bg-green-400/20 rounded-full blur-2xl" />
          </div>

          {/* Pending Balance */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-neutral-100 dark:border-white/5 shadow-xl flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">En attente (Séquestre)</span>
            <div className="text-3xl font-black text-yellow-600">{pendingAmount.toLocaleString()} FCFA</div>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
              Ces fonds seront libérés dès que les clients confirmeront la fin des travaux.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* History */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black mb-6">Historique des transactions</h2>
            {wallet.transactions.length > 0 ? (
              <div className="space-y-3">
                {wallet.transactions.reverse().map((t) => (
                  <div key={t.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.type === 'income' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-sm md:text-base">{t.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`font-black text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} 
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 p-20 rounded-[3rem] text-center border border-neutral-100 dark:border-white/5">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-30">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-gray-500 font-medium">Aucune transaction pour le moment.</p>
              </div>
            )}
          </div>

          {/* Pending Orders detail */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black mb-6">Missions en séquestre</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-yellow-100 text-yellow-700 text-[8px] font-black uppercase tracking-widest rounded-bl-xl">
                      En attente
                    </div>
                    <h3 className="font-black text-sm mb-1">{o.serviceName}</h3>
                    <p className="text-xs text-gray-500 mb-4">Client : {o.clientName}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-neutral-50 dark:border-white/5">
                      <span className="text-[10px] font-bold text-gray-400">NET À RECEVOIR</span>
                      <span className="font-black text-green-600">{o.netAmount.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Aucune mission en attente de libération.</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
