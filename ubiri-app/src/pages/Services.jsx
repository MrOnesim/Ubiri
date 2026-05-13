import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MapExplorer from '../components/MapExplorer';

const CATEGORIES = [
  { value: 'all', label: 'Tous' },
  { value: 'plomberie', label: 'Plomberie' },
  { value: 'electricite', label: 'Électricité' },
  { value: 'mecanique', label: 'Mécanique' },
  { value: 'maconnerie', label: 'Maçonnerie' },
  { value: 'menuiserie', label: 'Menuiserie' },
  { value: 'informatique', label: 'Informatique' },
  { value: 'beaute', label: 'Beauté' },
  { value: 'transport', label: 'Transport' },
];

const COMMON_TRADES = [
  "Plombier",
  "Électricien",
  "Mécanicien",
  "Maçon",
  "Menuisier",
  "Charpentier",
  "Peintre",
  "Carreleur",
  "Vitrier",
  "Frigoriste",
  "Jardinier",
  "Soudeur",
  "Tailleur",
  "Coiffeur",
  "Ferronnier",
  "Tapissier",
  "Cordonnier",
  "Informaticien",
  "Installateur Solaire",
  "Technicien Antenne",
  "Agent d'entretien",
  "Coursier",
  "Bobineur",
  "Esthéticienne",
  "Photographe",
  "Vidéaste",
  "Infographiste",
];

export default function Services() {
  const { getGlobalProducts } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      const p = await getGlobalProducts(category, search);
      setProducts(p);
    };
    fetchProducts();
  }, [category, search, getGlobalProducts]);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = COMMON_TRADES.filter(t => 
      t.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [search]);

  // Extraire les ouvriers uniques pour la carte
  const workersOnMap = useMemo(() => Array.from(new Map(products.map(p => [p.workerId, {
    id: p.workerId,
    name: p.workerName,
    trade: p.workerTrade,
    lat: p.lat || 6.3654,
    lng: p.lng || 2.4183,
    rating: 4.8
  }])).values()), [products]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-36 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4">Trouvez un expert</h1>
            <p className="text-gray-500 text-lg">Des artisans vérifiés près de chez vous</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 md:p-6 shadow-xl border border-neutral-100 dark:border-white/5 mb-10 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <input type="text" value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Rechercher un métier, ouvrier..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/20 transition-all"
                autoComplete="off" />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearch(s);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-3 border-b border-neutral-50 dark:border-white/5 last:border-0"
                    >
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="font-bold">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-between w-full md:w-auto">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    category === cat.value
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 hover:text-green-600'
                  }`}>
                  {cat.label}
                </button>
              ))}
              <div className="md:ml-4 border-l border-neutral-100 dark:border-white/10 pl-4 flex gap-1">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                </button>
                <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {products.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                  {products.length} résultat{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
                </p>
                {viewMode === 'map' && <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">Mode Carte Actif</span>}
              </div>

              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <MapExplorer workers={workersOnMap} />
              )}
            </>
          ) : (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 opacity-30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h2 className="text-2xl font-black mb-4">Aucun résultat</h2>
              <p className="text-gray-500 mb-8">Aucun ouvrier ne correspond à votre recherche pour l'instant.</p>
              <button onClick={() => { setSearch(''); setCategory('all'); }}
                className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:-translate-y-1 transition-all shadow-lg shadow-green-500/20">
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
