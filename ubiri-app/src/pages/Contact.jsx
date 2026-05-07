import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-36 pb-20">
        {/* Hero */}
        <section className="py-16 px-6 bg-white dark:bg-gray-950 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4">Contactez-nous</h1>
          <p className="text-gray-500 text-xl max-w-xl mx-auto">Une question, une suggestion ? Notre équipe est là pour vous répondre.</p>
        </section>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start py-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black mb-6">Nos coordonnées</h2>
              {[
                { 
                  icon: (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ), 
                  title: 'Adresse', 
                  desc: 'Cotonou, Bénin — Afrique de l\'Ouest' 
                },
                { 
                  icon: (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ), 
                  title: 'Email', 
                  desc: 'ubiri.africa@gmail.com' 
                },
                { 
                  icon: (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ), 
                  title: 'Téléphone', 
                  desc: '+229 00 00 00 00' 
                },
                { 
                  icon: (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ), 
                  title: 'Heures d\'ouverture', 
                  desc: 'Lun–Ven : 8h–18h · Sam : 9h–14h' 
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-1">{item.title}</p>
                    <p className="font-medium text-black dark:text-white uppercase text-xs tracking-widest leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-[2rem] p-8 text-white">
              <h3 className="text-xl font-black mb-3">Rejoignez notre communauté</h3>
              <p className="text-green-100 text-sm leading-relaxed">Suivez-nous sur les réseaux sociaux pour rester informé des dernières actualités d'Ubiri.</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-neutral-100 dark:border-white/5">
            {sent ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-black mb-2">Message envoyé !</h2>
                <p className="text-gray-500 mb-6">Nous vous répondrons dans les 24 heures.</p>
                <button onClick={() => setSent(false)} className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:-translate-y-1 transition-all">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black mb-6">Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nom</label>
                      <input type="text" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                        placeholder="Votre nom" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
                      <input type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                        placeholder="votre@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Sujet</label>
                    <input type="text" required value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20"
                      placeholder="Sujet de votre message" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Message</label>
                    <textarea rows={5} required value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20 resize-none"
                      placeholder="Votre message..." />
                  </div>
                  <button type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-500/20 hover:-translate-y-0.5 transform">
                    Envoyer le message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
