import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Merci ! ${email} a été ajouté à notre newsletter.`);
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 border-t border-white/5 dark:bg-black text-white pt-20 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-2 lg:col-span-2">
            <h2 className="text-3xl font-black mb-6 text-green-400">Ubiri</h2>
            <p className="text-gray-400 leading-relaxed max-w-sm mb-4 text-sm md:text-base">
              La plateforme de confiance qui connecte les artisans qualifiés avec les clients à travers l'Afrique de l'Ouest. Nous simplifions la recherche de talents locaux.
            </p>
            <p className="text-green-400 font-bold text-sm mb-8">ubiri.africa@gmail.com</p>
            <div className="flex gap-4">
              {[
                { name: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { name: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { name: 'Instagram', path: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01' },
                { name: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z' },
              ].map((social) => (
                <a key={social.name} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-green-600 transition-all group" aria-label={social.name}>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {social.name === 'Instagram' ? (
                      <>
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d={social.path}></path>
                      </>
                    ) : social.name === 'LinkedIn' ? (
                      <>
                        <path d={social.path}></path>
                        <circle cx="4" cy="4" r="2"></circle>
                      </>
                    ) : (
                      <path d={social.path}></path>
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-6">Plateforme</h3>
            <ul className="space-y-4">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/services', label: 'Services' },
                { to: '/marketplace', label: 'Boutique' },
                { to: '/about', label: 'À propos' },
                { to: '/contact', label: 'Contact' },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-gray-400 hover:text-green-400 transition-colors text-sm font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-6">Compte</h3>
            <ul className="space-y-4">
              {[
                { to: '/login', label: 'Connexion' },
                { to: '/signup', label: "S'inscrire" },
                { to: '/dashboard/user', label: 'Tableau de bord' },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-gray-400 hover:text-green-400 transition-colors text-sm font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-6">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Recevez nos dernières offres et actualités.</p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              />
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20">
                S'abonner
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
              © {new Date().getFullYear()} Ubiri — Tous droits réservés
            </p>
            <div className="flex gap-6">
              <Link to="/page?type=privacy" className="text-[10px] text-gray-600 uppercase tracking-widest hover:text-green-500 font-bold">Confidentialité</Link>
              <Link to="/page?type=terms" className="text-[10px] text-gray-600 uppercase tracking-widest hover:text-green-500 font-bold">Conditions</Link>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-black flex items-center gap-2">
            Fait avec <svg className="w-3 h-3 text-red-500 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.557 0 3.046.727 4.02 1.832L12 5.4l.48-.568C13.454 3.727 14.943 3 16.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg> pour l'Afrique
          </p>
        </div>
      </div>
    </footer>
  );
}
