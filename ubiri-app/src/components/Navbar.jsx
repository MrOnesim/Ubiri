import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import Logo from './Logo';
import { useTheme } from '../hooks/useTheme';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { currentUser, logout, getCart } = useAuth();
  const cart = getCart();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setHidden(scrollTop > lastScrollTop.current && scrollTop > 100);
      lastScrollTop.current = scrollTop;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`floating-nav fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-transform duration-300 ${hidden ? '-translate-y-[200%]' : 'translate-y-0'}`}>
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-white/20 rounded-full px-4 md:px-6 py-2 md:py-3 shadow-lg backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 px-2 group">
          <Logo className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500" />
          <span className="font-black text-xl text-green-600 dark:text-green-400 font-poppins mt-0.5 tracking-tight">biri</span>
        </Link>

        {/* Nav Links - Desktop */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          <NavLink to="/" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />} label="Accueil" />
          <NavLink to="/services" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />} label="Services" />
          <NavLink to="/marketplace" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />} label="Boutique" />
          <NavLink to="/community" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />} label="Communauté" />
          <NavLink to="/about" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} label="À propos" />
        </div>

        {/* Auth + Theme + Cart */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={toggle} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">
            {isDark ? (
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>

          {currentUser && <NotificationCenter />}

          <Link to="/cart" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors relative">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-1 md:gap-2">
              <Link to={currentUser.role === 'worker' ? '/dashboard/worker' : '/dashboard/user'} className="flex items-center gap-1.5 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20">
                <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md shadow-green-500/20">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </span>
                <span className="hidden xl:block text-xs font-bold text-gray-700 dark:text-gray-200">{currentUser.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="hidden sm:block p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/login" className="hidden sm:block text-xs font-bold px-3 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">Log In</Link>
              <Link to="/signup" className="bg-green-600 text-white font-black text-[10px] md:text-xs px-3 md:px-4 py-2 rounded-full shadow-lg shadow-green-500/20 whitespace-nowrap">S'inscrire</Link>
            </div>
          )}

          <button className="lg:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mt-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-white/10 rounded-[2.5rem] p-4 shadow-2xl animate-fade-in-up">
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/', label: 'Accueil' },
              { to: '/services', label: 'Services' },
              { to: '/marketplace', label: 'Boutique' },
              { to: '/community', label: 'Communauté' },
              { to: '/about', label: 'À propos' },
              { to: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-black hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all">
                {item.label}
              </Link>
            ))}
          </div>
          {currentUser && (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 font-black text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Déconnexion
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 text-neutral-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all px-3 py-2 rounded-full hover:bg-neutral-50 dark:hover:bg-gray-700/50 group">
      <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
      <span className="font-bold text-xs whitespace-nowrap">{label}</span>
    </Link>
  );
}
