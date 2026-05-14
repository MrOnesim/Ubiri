import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VerificationBadge from '../components/VerificationBadge';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGlobalProducts, addProductReview, incrementProductView, trackInquiry, isFavorite, toggleFavorite, currentUser, canReviewProduct } = useAuth();
  const [product, setProduct] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ author: '', rating: 5, comment: '', image: null });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const products = await getGlobalProducts();
      const found = products.find((p) => String(p.id) === String(id));
      if (!found) { navigate('/services'); return; }
      setProduct(found);
      setSaved(isFavorite(found.id));
      incrementProductView(found.id);
    };
    load();
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setError('');
    try {
      addProductReview(product.id, { ...review, image: review.image || null });
      setShowReviewForm(false);
      setReview({ author: '', rating: 5, comment: '', image: null });
      // Reload product
      const products = await getGlobalProducts();
      setProduct(products.find((p) => String(p.id) === String(id)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReviewImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReview({ ...review, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleFavorite = () => {
    if (!currentUser) { navigate('/login'); return; }
    toggleFavorite(product.id);
    setSaved(!saved);
    trackInquiry(product.id);
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : '5.0';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/services" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 mb-8 transition-colors font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour aux services
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main */}
            <div className="md:col-span-2 space-y-6">
              {/* Image */}
              <div className="h-64 md:h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name}
                    onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=Service'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-neutral-100 dark:border-white/5 shadow-lg">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-black">{product.name}</h1>
                  <span className="text-2xl font-black text-green-600 whitespace-nowrap">{product.price} FCFA</span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-sm">{avgRating}</span>
                  <span className="text-gray-400 text-sm">({product.reviews?.length || 0} avis)</span>
                  <span className="ml-auto text-xs text-gray-400">{product.views || 0} vues</span>
                </div>
                <div className="flex gap-2 mb-6">
                  <VerificationBadge status={product.verificationStatus || 'none'} size="md" />
                  {product.workerTrade && <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">{product.workerTrade}</span>}
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-neutral-100 dark:border-white/5 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black">Avis vérifiés</h2>
                  {canReviewProduct(product.id) && (
                    <button onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:-translate-y-0.5 transition-all">
                      Laisser un avis
                    </button>
                  )}
                </div>

                {!canReviewProduct(product.id) && currentUser?.role !== 'worker' && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl mb-6 text-xs text-gray-500 flex items-start gap-2 border border-gray-100 dark:border-white/5">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Seuls les clients ayant terminé une prestation avec cet artisan peuvent laisser un avis.
                  </div>
                )}

                {showReviewForm && (
                  <form onSubmit={handleReview} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6 space-y-4 border-2 border-green-500/20">
                    {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Votre nom" required value={review.author}
                        onChange={(e) => setReview({ ...review, author: e.target.value })}
                        className="w-full bg-white dark:bg-gray-700 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/30" />
                      <select value={review.rating} onChange={(e) => setReview({ ...review, rating: +e.target.value })}
                        className="w-full bg-white dark:bg-gray-700 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none">
                        {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} étoile{r > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                    <textarea placeholder="Décrivez votre expérience..." required value={review.comment} rows={3}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      className="w-full bg-white dark:bg-gray-700 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/30 resize-none" />

                    <div className="flex items-center gap-4">
                      <label className="flex-1 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-green-400 transition-all">
                        <input type="file" accept="image/*" className="hidden" onChange={handleReviewImage} />
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{review.image ? 'Image ajoutée ✓' : 'Ajouter une photo du travail'}</span>
                      </label>
                      <button type="submit" className="bg-green-600 text-white font-black px-8 py-3 rounded-xl hover:shadow-lg shadow-green-500/20 transition-all text-sm">Publier</button>
                    </div>
                  </form>
                )}

                {product.reviews?.length > 0 ? [...product.reviews].reverse().map((r) => (
                  <div key={r.id} className="border-b border-neutral-100 dark:border-white/5 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm">{r.authorName || r.author}</span>
                          {r.isVerifiedPurchase && (
                            <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter shadow-sm">Achat Vérifié</span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-[10px] text-gray-400 ml-1">{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{r.comment}</p>

                    {r.image && (
                      <div className="w-32 h-32 rounded-xl overflow-hidden mb-4 border border-gray-100 dark:border-white/5 shadow-sm group cursor-zoom-in">
                        <img src={r.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preuve du travail" />
                      </div>
                    )}

                    {/* Artisan Reply */}
                    {r.reply && (
                      <div className="ml-6 bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border-l-4 border-green-500">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase text-green-600 tracking-wider">Réponse de l'artisan</span>
                          <span className="text-[9px] text-gray-400">{new Date(r.reply.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{r.reply.text}"</p>
                      </div>
                    )}
                  </div>
                )) : <p className="text-gray-400 text-sm text-center py-10 opacity-50 font-medium">Aucun avis vérifié pour le moment.</p>}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-neutral-100 dark:border-white/5 shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-lg">{product.workerName}</h3>
                  <VerificationBadge status={product.verificationStatus || 'none'} size="sm" />
                </div>
                <p className="text-gray-500 text-sm mb-6">{product.workerTrade}</p>
                <button
                  onClick={() => {
                    if (!currentUser) { navigate('/login'); return; }
                    navigate(`/checkout/${product.id}`);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-green-500/30 transition-all mb-3 flex items-center justify-center gap-3 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Réserver et Payer
                </button>
                <div className="flex gap-2 mb-3">
                  <button onClick={handleFavorite}
                    className={`flex-1 font-bold py-3 rounded-2xl transition-all border-2 flex items-center justify-center gap-2 ${saved ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-neutral-100 text-gray-500'
                      }`}>
                    <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <span>Favori</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) { navigate('/login'); return; }
                      navigate(`/chat/${product.workerId}`);
                    }}
                    className="flex-1 bg-white border-2 border-neutral-100 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    <span>Message</span>
                  </button>
                </div>
                <Link to={`/profil/${product.workerId}`}
                  className="block w-full text-center text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-green-600 transition-colors py-2">
                  Voir le profil complet de l'artisan
                </Link>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-[2rem] p-6 border border-green-100 dark:border-green-800/30">
                <h3 className="font-bold text-green-800 dark:text-green-400 text-[10px] uppercase tracking-wider mb-2">Garantie Ubiri</h3>
                <p className="text-[11px] text-green-700 dark:text-green-500 leading-relaxed font-medium">
                  Votre paiement est mis en séquestre. L'artisan n'est payé que lorsque vous confirmez la fin des travaux.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
