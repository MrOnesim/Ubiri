import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function GenericPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const isPrivacy = type === 'privacy';

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <section className="bg-white dark:bg-gray-900 p-10 md:p-16 rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-white/5">
          <h1 className="text-4xl md:text-5xl font-black mb-8 text-black dark:text-white leading-tight">
            {isPrivacy ? 'Politique de Confidentialité' : 'Mentions Légales & Conditions'}
          </h1>
          
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-6">
            <p className="text-lg leading-relaxed">
              Ceci est une page générique dynamique de la plateforme Ubiri. Vous pouvez intégrer ici du contenu informatif, des articles de blog, ou des pages légales supplémentaires.
            </p>
            
            <h2 className="text-2xl font-bold text-black dark:text-white mt-12">Section d'Information</h2>
            <p className="leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/10 p-8 rounded-3xl border border-green-100 dark:border-green-800/20 my-10 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-green-800 dark:text-green-400 mb-2">Important</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Toutes les informations sur cette page sont soumises à nos conditions générales d'utilisation.
                </p>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
            </div>

            <p className="leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
