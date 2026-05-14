import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export default function About() {
  const team = [
    { name: 'Kouassi A.', role: 'CEO & Fondateur', initials: 'KA', color: 'green' },
    { name: 'Fatima D.', role: 'CTO', initials: 'FD', color: 'blue' },
    { name: 'Omar S.', role: 'Head of Design', initials: 'OS', color: 'purple' },
  ];

  const values = [
    { 
      icon: (
        <svg className="w-12 h-12 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ), 
      title: 'Confiance', 
      desc: "Chaque artisan est vérifié avant d'intégrer la plateforme." 
    },
    { 
      icon: (
        <svg className="w-12 h-12 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ), 
      title: 'Rapidité', 
      desc: "Trouvez un expert en quelques minutes, disponible immédiatement." 
    },
    { 
      icon: (
        <svg className="w-12 h-12 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ), 
      title: 'Impact local', 
      desc: "Nous valorisons les talents locaux et dynamisent l'économie africaine." 
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-36">
        {/* Hero */}
        <section className="py-24 px-6 bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Notre mission : <span className="text-green-600">connecter</span> les talents africains
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Ubiri est né d'un constat simple : trouver un artisan de confiance en Afrique de l'Ouest est souvent difficile. Nous avons créé la solution.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">Notre histoire</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>Fondée en 2024 à Cotonou, Ubiri est une startup technologique dédiée à la mise en relation entre artisans qualifiés et particuliers à travers l'Afrique de l'Ouest.</p>
                <p>Notre équipe pluridisciplinaire croit fermement que la digitalisation des services peut transformer l'économie locale et offrir de nouvelles opportunités aux travailleurs qualifiés.</p>
                <p>En quelques mois, nous avons réuni plus de 500 artisans vérifiés et 2000 clients satisfaits sur notre plateforme.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Artisans vérifiés' },
                { value: '2000+', label: 'Clients satisfaits' },
                { value: '98%', label: 'Taux de satisfaction' },
                { value: '10min', label: 'Délai moyen de réponse' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 text-center border border-neutral-100 dark:border-white/5 shadow-lg">
                  <div className="text-3xl font-black text-green-600 mb-2">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 px-6 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Nos valeurs</h2>
              <p className="text-gray-500 text-lg">Ce qui nous guide au quotidien</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div key={i} className="text-center p-10 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5">
                  <div className="text-5xl mb-6">{v.icon}</div>
                  <h3 className="text-xl font-black mb-4">{v.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Notre équipe</h2>
              <p className="text-gray-500 text-lg">Des passionnés au service de l'innovation africaine</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 text-center border border-neutral-100 dark:border-white/5 shadow-lg hover:-translate-y-2 transition-transform">
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl mx-auto mb-6 flex items-center justify-center bg-${member.color}-100`}>
                    {member.avatar ? (
                      <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                    ) : (
                      <span className={`text-2xl font-black text-${member.color}-700`}>{member.initials}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-black mb-1">{member.name}</h3>
                  <p className="text-gray-500 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Rejoignez l'aventure Ubiri</h2>
            <p className="text-gray-500 text-xl mb-10">Que vous soyez client ou artisan, Ubiri est fait pour vous.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-green-600 hover:bg-green-700 text-white font-black px-10 py-5 rounded-2xl hover:-translate-y-1 transition-all shadow-xl shadow-green-500/20 text-lg">
                S'inscrire gratuitement
              </Link>
              <Link to="/contact" className="border-2 border-green-600 text-green-600 font-black px-10 py-5 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-lg">
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
