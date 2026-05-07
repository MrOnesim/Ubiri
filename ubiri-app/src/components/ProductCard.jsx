import { Link } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';

export default function ProductCard({ product }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden border border-neutral-100 dark:border-white/5 hover:shadow-xl transition-all group relative">
      {/* Badge Vérifié */}
      <div className="absolute top-4 left-4 z-10">
        <VerificationBadge status={product.verificationStatus || 'none'} size="md" />
      </div>

      {/* Image */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={product.name}
            onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=Produit'; }}
          />
        ) : (
          <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-black dark:text-white">{product.name}</h3>
          <span className="text-green-600 font-bold text-sm">{product.price} FCFA</span>
        </div>
        <div className="flex items-center gap-1 mb-4">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-bold ml-1">(5.0)</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.description}</p>
        <Link
          to={`/services/${product.id}`}
          className="block text-center bg-white dark:bg-gray-700 text-black dark:text-white border border-neutral-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-600 font-bold py-3 rounded-xl transition-all text-sm"
        >
          Voir Profil &amp; Offre
        </Link>
      </div>
    </div>
  );
}
