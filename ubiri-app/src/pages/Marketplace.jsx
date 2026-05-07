import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  const { 
    getMarketplaceProducts, addToCart, isAdmin, addMarketplaceProduct, 
    deleteMarketplaceProduct, toggleWishlist, isWishlisted 
  } = useAuth();
  
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: 'Outillage', imageUrl: '' });

  const categories = ['Tous', 'Outillage', 'Soudure', 'Électricité', 'Plomberie', 'Autre'];
  
  const products = getMarketplaceProducts().filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                       p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Tous' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    addMarketplaceProduct({ ...form, price: Number(form.price) });
    setForm({ name: '', price: '', description: '', category: 'Outillage', imageUrl: '' });
    setShowAdminForm(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Navbar />
      
      <main className="pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black mb-4">Marketplace</h1>
            <p className="text-gray-500 text-lg">Équipements et outils professionnels pour vos travaux.</p>
          </div>
          
          <div className="flex gap-4">
            <Link to="/cart" className="bg-white dark:bg-gray-900 border border-neutral-200 dark:border-white/10 p-4 rounded-2xl shadow-xl hover:scale-105 transition-all relative group">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Panier</span>
            </Link>
            {isAdmin() && (
              <button 
                onClick={() => setShowAdminForm(!showAdminForm)}
                className="bg-green-600 text-white font-black px-6 py-4 rounded-2xl shadow-xl shadow-green-500/20 hover:-translate-y-1 transition-all"
              >
                {showAdminForm ? 'Fermer' : 'Ajouter Produit'}
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="flex-1 relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Rechercher un outil, un matériel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-4 focus:ring-green-500/10 shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' 
                  : 'bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 hover:border-green-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {showAdminForm && isAdmin() && (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-2xl mb-12 animate-in slide-in-from-top-4">
            <h2 className="text-2xl font-black mb-6">Ajouter au Marketplace</h2>
            <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-6">
              <input type="text" placeholder="Nom du produit" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" />
              <input type="number" placeholder="Prix (FCFA)" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500">
                <option>Outillage</option>
                <option>Soudure</option>
                <option>Électricité</option>
                <option>Plomberie</option>
                <option>Autre</option>
              </select>
              <input type="url" placeholder="URL de l'image" required value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" />
              <textarea placeholder="Description" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="md:col-span-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 h-32" />
              <button type="submit" className="md:col-span-2 bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg">Publier sur le Marketplace</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((p) => (
              <div key={p.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all relative">
                <div className="aspect-square relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur dark:bg-gray-800/90 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-green-600">
                      {p.category}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button 
                    onClick={() => toggleWishlist(p.id)}
                    className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur shadow-lg transition-all ${
                      isWishlisted(p.id) ? 'bg-pink-500 text-white' : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-pink-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={isWishlisted(p.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {isAdmin() && (
                    <button 
                      onClick={() => deleteMarketplaceProduct(p.id)} 
                      className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-black text-lg mb-1 truncate">{p.name}</h3>
                  <p className="text-green-600 font-black text-xl mb-3">{p.price.toLocaleString()} FCFA</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-6 h-8 leading-relaxed">{p.description}</p>
                  
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 text-black dark:text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black mb-2">Aucun produit trouvé</h2>
              <p className="text-gray-500">Essayez d'ajuster vos filtres ou votre recherche.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
