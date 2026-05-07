import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Article() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Navbar />
      
      {/* Contenu Principal */}
      <div className="relative w-full pt-20">
        <div className="relative grid h-[40rem] w-full grid-cols-1 rounded-md border border-neutral-200 bg-white dark:border-white/[0.2] dark:bg-black overflow-hidden">
          {/* Texte centré */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center px-6">
              <h1 className="text-4xl md:text-6xl font-black text-neutral-800 dark:text-white mb-6">
                Design & Innovation
              </h1>
              <p className="text-xl text-neutral-500 dark:text-gray-400 max-w-2xl mx-auto">
                Explorez le futur de l'artisanat avec Ubiri. Une interface pensée pour l'excellence et la rapidité.
              </p>
            </div>
          </div>

          {/* Background Grid */}
          <div className="absolute inset-0 bg-grid-black/[0.1] dark:bg-grid-white/[0.05] pointer-events-none"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900 pointer-events-none"></div>
        </div>
      </div>

      <main className="py-24 px-6 max-w-4xl mx-auto">
        <article className="prose dark:prose-invert max-w-none">
          <h2 className="text-3xl font-black mb-8">L'Art de Connecter les Talents</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            Chez Ubiri, nous croyons que chaque artisan mérite d'être mis en lumière et que chaque client mérite une service de qualité. Notre plateforme n'est pas seulement un outil de mise en relation, c'est un écosystème de confiance.
          </p>
          <div className="grid md:grid-cols-2 gap-8 my-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-xl">
              <h3 className="font-bold text-xl mb-4 text-green-600">Vision</h3>
              <p className="text-sm text-gray-500">Digitaliser le secteur informel pour une économie plus forte.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-xl">
              <h3 className="font-bold text-xl mb-4 text-green-600">Mission</h3>
              <p className="text-sm text-gray-500">Connecter 1 million d'artisans qualifiés d'ici 2030.</p>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
