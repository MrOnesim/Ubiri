import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../components/SplashScreen";
import heroArtisan from "../assets/hero-artisan.png";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import mechanicImg from "../assets/images/mechanic.png";
import electricianImg from "../assets/images/electrician.png";
import plumberImg from "../assets/images/plumber.png";
import carpenterImg from "../assets/images/carpenter.png";

function useCounter(target, duration = 2000) {
    const [count, setCount] = useState(0);
    const started = useRef(false);

    const start = () => {
        if (started.current) return;
        started.current = true;
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
        };
        requestAnimationFrame(step);
    };
    return { count, start };
}

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

export default function Home() {
    const { publishServiceRequest, getGlobalProducts } = useAuth();
    const navigate = useNavigate();
    const [splashDone, setSplashDone] = useState(false);
    const [latestProducts, setLatestProducts] = useState([]);
    const [heroSearch, setHeroSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);

    const c1 = useCounter(500);
    const c2 = useCounter(2000);
    const c3 = useCounter(98);

    useEffect(() => {
        const fetchLatest = async () => {
            const products = await getGlobalProducts();
            setLatestProducts(products.sort((a, b) => b.id - a.id).slice(0, 3));
        };
        fetchLatest();
    }, [getGlobalProducts]);

    // Stats intersection observer - wait for splash to be done
    const statsRef = useRef(null);
    useEffect(() => {
        if (!statsRef.current || !splashDone) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    c1.start();
                    c2.start();
                    c3.start();
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        
        observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, [splashDone]);

    const handleBroadcast = (e) => {
        e.preventDefault();
        const desc = e.target.querySelector("#b-desc").value;
        const category = e.target.querySelector("#b-category").value;
        const location = e.target.querySelector("#b-location").value;
        try {
            const result = publishServiceRequest({
                description: desc,
                category,
                location,
            });
            localStorage.setItem("pending_request", JSON.stringify(result));
            navigate("/tracking");
        } catch (err) {
            alert(err.message);
            if (
                err.message.includes("seuls les clients") ||
                err.message.includes("Seuls les clients")
            ) {
                navigate("/login");
            }
        }
    };

    useEffect(() => {
        if (!heroSearch.trim()) {
            setSuggestions([]);
            return;
        }
        const filtered = COMMON_TRADES.filter((t) =>
            t.toLowerCase().includes(heroSearch.toLowerCase()),
        ).slice(0, 5);
        setSuggestions(filtered);
    }, [heroSearch]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleHeroSearch = (e) => {
        e.preventDefault();
        const trade = heroSearch.trim();
        navigate(
            trade
                ? `/services?search=${encodeURIComponent(trade)}`
                : "/services",
        );
    };

    const handleSuggestionClick = (trade) => {
        setHeroSearch(trade);
        setShowSuggestions(false);
        navigate(`/services?search=${encodeURIComponent(trade)}`);
    };

    const words = ["Trouvez", "un", "ouvrier", "près", "de", "chez", "vous"];

    return (
        <>
            {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

            <div
                className={`transition-all duration-1000 ${splashDone ? "page-entry opacity-100 scale-100" : "opacity-0 scale-105"}`}
            >
                <Navbar />

                {/* HERO SECTION */}
                <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                        <img
                            src="/jeriden.jpg"
                            className="w-full h-full object-cover"
                            alt="Hero background"
                        />
                    </div>

                    <div className="relative z-10 w-full px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white space-y-6 md:space-y-8">
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                                {words.map((word, i) => (
                                    <span
                                        key={i}
                                        className="reveal-word"
                                        style={{
                                            animationDelay: `${0.1 + i * 0.1}s`,
                                        }}
                                    >
                                        {i === 2 ? (
                                            <span
                                                className="text-green-500 neon-text"
                                                style={{
                                                    animation:
                                                        "pulse 3s infinite",
                                                }}
                                            >
                                                {word}
                                            </span>
                                        ) : (
                                            word
                                        )}{" "}
                                    </span>
                                ))}
                            </h1>
                            <p
                                className="text-lg md:text-xl text-gray-300 max-w-lg"
                                style={{
                                    animation:
                                        "slideUp 1s ease-out 1s forwards",
                                    opacity: 0,
                                }}
                            >
                                La plateforme de confiance pour tous vos besoins
                                en électricité, plomberie, mécanique et
                                artisanat.
                            </p>

                            {/* Search Box */}
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-4 md:p-6 shadow-2xl">
                                <form
                                    onSubmit={handleHeroSearch}
                                    className="flex flex-col md:flex-row gap-4 w-full"
                                >
                                    <div className="flex-1 text-black dark:text-white relative" ref={suggestionRef}>
                                        <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1 ml-4">
                                            Métier
                                        </label>
                                        <input
                                            id="hero-trade"
                                            type="text"
                                            value={heroSearch}
                                            onChange={(e) => {
                                                setHeroSearch(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder="Ex: Plombier..."
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-6 py-4 text-black dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none"
                                            autoComplete="off"
                                        />

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                                {suggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => handleSuggestionClick(s)}
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
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-green-500/20 transform hover:-translate-y-1 transition-all"
                                    >
                                        Rechercher
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* POST YOUR PROBLEM */}
                <section className="py-24 px-6 bg-white dark:bg-gray-950 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="bg-gray-50 dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-neutral-200 dark:border-white/5 shadow-2xl relative">
                                <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                                <h2 className="text-3xl font-black mb-2">
                                    Publiez votre problème
                                </h2>
                                <p className="text-gray-500 mb-8">
                                    Décrivez votre besoin et recevez des
                                    propositions instantanément.
                                </p>
                                <form
                                    onSubmit={handleBroadcast}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                            Décrivez votre besoin
                                        </label>
                                        <textarea
                                            id="b-desc"
                                            rows={3}
                                            required
                                            className="w-full bg-white dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/20 transition-all resize-none"
                                            placeholder="J'ai un problème de plomberie à la maison..."
                                        />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                                Catégorie
                                            </label>
                                            <select
                                                id="b-category"
                                                className="w-full bg-white dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/20 transition-all font-bold"
                                            >
                                                <option value="plomberie">
                                                    Plomberie
                                                </option>
                                                <option value="electricite">
                                                    Électricité
                                                </option>
                                                <option value="mecanique">
                                                    Mécanique
                                                </option>
                                                <option value="maconnerie">
                                                    Maçonnerie
                                                </option>
                                                <option value="menuiserie">
                                                    Menuiserie
                                                </option>
                                                <option value="informatique">
                                                    Informatique
                                                </option>
                                                <option value="beaute">
                                                    Beauté
                                                </option>
                                                <option value="transport">
                                                    Transport
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                                Lieu
                                            </label>
                                            <input
                                                type="text"
                                                id="b-location"
                                                required
                                                className="w-full bg-white dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/20 transition-all font-bold"
                                                placeholder="Ville ou Quartier"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-500/30 transform hover:-translate-y-1 transition-all"
                                    >
                                        Publier la demande
                                    </button>
                                    <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-black">
                                        Les ouvriers à proximité seront prévenus
                                        instantanément
                                    </p>
                                </form>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                Gagnez du temps avec les alertes ouvriers
                            </h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400">
                                Dès que vous publiez votre problème, nos
                                artisans reçoivent une notification sur leur
                                mobile.
                            </p>
                            <div className="relative w-full max-w-sm mx-auto lg:mx-0">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-neutral-200 dark:border-white/10 shadow-2xl transform rotate-3 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                                            <svg
                                                className="w-6 h-6 text-green-600 dark:text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                                Nouvelle alerte
                                            </p>
                                            <p className="font-bold">
                                                Dépannage plomberie à 2km
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-10 -left-10 w-full h-full bg-green-600/5 rounded-[3rem] -rotate-6" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <section
                    ref={statsRef}
                    className="py-12 px-6 bg-white dark:bg-gray-950 border-y border-neutral-100 dark:border-white/5"
                >
                    <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-around gap-x-12 gap-y-8 text-center uppercase tracking-widest font-black">
                        {[
                            {
                                count: c1.count,
                                suffix: "+",
                                label: "Experts Vérifiés",
                            },
                            {
                                count: c2.count,
                                suffix: "+",
                                label: "Clients Heureux",
                            },
                            {
                                count: c3.count,
                                suffix: "%",
                                label: "Satisfaction",
                            },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center min-w-[120px]"
                            >
                                <span className="text-3xl md:text-4xl text-green-600 mb-1">
                                    {s.count}
                                    {s.suffix}
                                </span>
                                <span className="text-[9px] md:text-[10px] text-gray-400">
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">
                                Comment ça marche ?
                            </h2>
                            <p className="text-gray-500 text-lg">
                                Trouvez la solution à votre problème en 3 étapes
                                simples.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connector line for desktop */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-200 to-transparent -translate-y-12 z-0" />
                            
                            {[
                                {
                                    icon: (
                                        <svg
                                            className="w-8 h-8 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    ),
                                    title: "1. Recherchez",
                                    desc: "Utilisez notre recherche ou publiez votre besoin directement.",
                                },
                                {
                                    icon: (
                                        <svg
                                            className="w-8 h-8 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                    ),
                                    title: "2. Contactez",
                                    desc: "Échangez avec les artisans et choisissez celui qui vous convient.",
                                },
                                {
                                    icon: (
                                        <svg
                                            className="w-8 h-8 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    ),
                                    title: "3. Profitez",
                                    desc: "Votre problème est résolu ! Laissez un avis pour la communauté.",
                                },
                            ].map((step, i) => (
                                <div key={i} className="text-center group relative z-10">
                                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-8 border border-neutral-100 dark:border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative">
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-black text-xs">
                                            {i + 1}
                                        </div>
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-black mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-500 px-4">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* OUR IMPACT SECTION */}
                <section className="py-24 px-6 bg-white dark:bg-gray-950">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-green-500/10 rounded-[3rem] blur-2xl" />
                                <img 
                                    src={heroArtisan} 
                                    className="relative rounded-[3rem] shadow-2xl z-10 w-full h-[500px] object-cover" 
                                    alt="Artisan Ubiri en plein travail" 
                                />
                                <div className="absolute bottom-8 right-8 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl z-20 max-w-xs transform hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600 dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <p className="font-black text-sm uppercase tracking-widest text-gray-400">Impact Local</p>
                                    </div>
                                    <p className="text-sm font-bold leading-relaxed">
                                        "Grâce à Ubiri, j'ai pu digitaliser mon activité et tripler mes revenus mensuels."
                                    </p>
                                    <p className="text-xs text-green-600 font-black mt-2">— Mamadou D., Électricien</p>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-6xl font-black leading-tight">
                                    Plus qu'une plateforme, une <span className="text-green-600">communauté</span>.
                                </h2>
                                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Nous croyons au potentiel des talents locaux. Ubiri n'est pas seulement une application, c'est un tremplin pour l'économie informelle en Afrique.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { title: "Indépendance", desc: "Donner aux artisans le contrôle total de leur emploi du temps et de leurs tarifs." },
                                        { title: "Sécurité", desc: "Un système de paiement sécurisé qui garantit que chaque travail est payé à sa juste valeur." },
                                        { title: "Visibilité", desc: "Une vitrine numérique pour des métiers souvent restés dans l'ombre." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg">{item.title}</h4>
                                                <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BENEFITS */}
                <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">
                                Pourquoi Ubiri ?
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl">
                                Nous connectons les talents locaux avec ceux qui
                                en ont besoin, simplement et en toute sécurité.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                {
                                    color: "green",
                                    icon: (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    ),
                                    title: "Rapide",
                                    desc: "Publiez votre besoin et recevez des réponses en quelques minutes seulement.",
                                },
                                {
                                    color: "blue",
                                    icon: (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    ),
                                    title: "Confiance",
                                    desc: "Tous nos ouvriers sont vérifiés et notés par la communauté Ubiri.",
                                },
                                {
                                    color: "purple",
                                    icon: (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                                        />
                                    ),
                                    title: "Direct",
                                    desc: "Échangez sans intermédiaire avec l'artisan de votre choix.",
                                },
                            ].map((b, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border border-neutral-100 dark:border-white/5 hover:-translate-y-2 transition-transform"
                                >
                                    <div
                                        className={`w-16 h-16 bg-${b.color}-100 dark:bg-${b.color}-600 rounded-2xl flex items-center justify-center mb-8`}
                                    >
                                        <svg
                                            className={`w-8 h-8 text-${b.color}-600 dark:text-white`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            {b.icon}
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4">
                                        {b.title}
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        {b.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* POPULAR JOBS */}
                <section className="py-24 px-6 bg-white dark:bg-gray-950">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black mb-4">
                                    Métiers Populaires
                                </h2>
                                <p className="text-gray-500 text-lg">
                                    Les experts les plus sollicités sur la
                                    plateforme.
                                </p>
                            </div>
                            <Link
                                to="/services"
                                className="text-green-600 font-black uppercase tracking-widest text-sm hover:underline"
                            >
                                Voir tout →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-black dark:text-white">
                            {[
                                {
                                    image: mechanicImg,
                                    label: "Mécanique",
                                    search: "Mécanicien",
                                },
                                {
                                    image: electricianImg,
                                    label: "Électricité",
                                    search: "Électricien",
                                },
                                {
                                    image: plumberImg,
                                    label: "Plomberie",
                                    search: "Plombier",
                                },
                                {
                                    image: carpenterImg,
                                    label: "Menuiserie",
                                    search: "Menuisier",
                                },
                            ].map((job) => (
                                <Link
                                    key={job.search}
                                    to={`/services?search=${job.search}`}
                                    className="group bg-gray-50 dark:bg-gray-900 p-8 rounded-[2rem] text-center hover:bg-green-600 transition-all"
                                >
                                    <div className="relative h-40 mb-6 overflow-hidden rounded-2xl group-hover:scale-105 transition-all duration-500">
                                        <img src={job.image} className="w-full h-full object-cover" alt={job.label} />
                                        <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="font-bold group-hover:text-white transition-colors">
                                        {job.label}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* LATEST PRODUCTS */}
                <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <h2 className="text-3xl font-black">
                                Dernières Offres
                            </h2>
                            <Link
                                to="/services"
                                className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors"
                            >
                                Tout voir
                            </Link>
                        </div>
                        {latestProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {latestProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-lg font-bold mb-2">
                                    Aucune offre pour l'instant
                                </p>
                                <p className="text-sm">
                                    Inscrivez-vous comme ouvrier pour publier
                                    vos services !
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* WORKER CTA */}
                <section className="py-24 px-6 bg-white dark:bg-gray-950">
                    <div className="max-w-5xl mx-auto bg-gray-900 dark:bg-green-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                            Vous êtes un ouvrier qualifié ?
                        </h2>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                            Rejoignez des milliers d'artisans et développez
                            votre activité dès aujourd'hui sur Ubiri.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/signup"
                                className="bg-green-600 dark:bg-white dark:text-green-600 text-white font-bold px-12 py-5 rounded-2xl hover:scale-105 transition-all text-lg shadow-xl shadow-green-500/20"
                            >
                                S'inscrire comme ouvrier
                            </Link>
                            <Link
                                to="/about"
                                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-12 py-5 rounded-2xl hover:bg-white/20 transition-all text-lg"
                            >
                                En savoir plus
                            </Link>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900 border-t border-neutral-100 dark:border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-black mb-16 text-center">
                            Ils font confiance à Ubiri
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    stars: 5,
                                    text: '"J\'ai trouvé un électricien en moins de 10 minutes pour une urgence le dimanche. Service impeccable !"',
                                    initials: "MS",
                                    name: "Moussa S.",
                                    role: "Client - Dakar",
                                    color: "green",
                                },
                                {
                                    stars: 5,
                                    text: '"En tant que plombier, Ubiri m\'a permis de doubler ma clientèle en quelques mois."',
                                    initials: "FK",
                                    name: "Fatou K.",
                                    role: "Ouvrier - Saint-Louis",
                                    color: "blue",
                                },
                                {
                                    stars: 5,
                                    text: "\"Interface très intuitive et sécurisée. C'est enfin la plateforme qu'il nous manquait.\"",
                                    initials: "IB",
                                    name: "Ibrahima B.",
                                    role: "Entrepreneur",
                                    color: "purple",
                                },
                            ].map((t, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-neutral-50 dark:border-white/5"
                                >
                                    <div className="flex gap-1 text-yellow-400 mb-4">
                                        {"⭐".repeat(t.stars)}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 italic mb-6">
                                        {t.text}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full bg-${t.color}-100 flex items-center justify-center font-bold text-${t.color}-700 text-xs`}
                                        >
                                            {t.initials}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-black dark:text-white">
                                                {t.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">
                                                {t.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* NEWSLETTER SECTION */}
                <section className="py-24 px-6 bg-green-600 dark:bg-green-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Restez connecté à l'excellence
                        </h2>
                        <p className="text-green-50/80 text-xl mb-12 max-w-2xl mx-auto">
                            Rejoignez plus de 5000 abonnés et recevez les
                            meilleurs conseils et offres exclusifs directement
                            dans votre boîte mail.
                        </p>

                        <form
                            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                required
                                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-5 text-white placeholder-white/50 outline-none focus:ring-4 focus:ring-white/20 transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-white text-green-600 font-black px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                            >
                                S'inscrire gratuitement
                            </button>
                        </form>
                        <p className="mt-6 text-green-50/60 text-xs font-bold uppercase tracking-widest">
                            Garanti sans spam · Désinscription en un clic
                        </p>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
