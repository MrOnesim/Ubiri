import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'worker') navigate('/dashboard/worker');
      else navigate('/dashboard/user');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-green-600">Ubiri</Link>
          <h1 className="text-2xl font-black mt-4 mb-2">Bon retour !</h1>
          <p className="text-gray-500">Connectez-vous à votre compte Ubiri</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-neutral-100 dark:border-white/5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20 transition-all"
                placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Mot de passe</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-neutral-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-500/20 transition-all"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-500/20 hover:-translate-y-0.5 transform">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-black"><span className="bg-white dark:bg-gray-900 px-4 text-gray-400">Ou continuer avec</span></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => alert('Simulation: Connexion Google...')} className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-neutral-100 dark:border-white/5 group">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.224 1.224-3.136 2.552-6.712 2.552-5.44 0-9.768-4.408-9.768-9.856s4.328-9.856 9.768-9.856c2.936 0 5.144 1.152 6.672 2.584l2.304-2.304C18.592 1.392 15.824 0 12.48 0 5.68 0 0 5.68 0 12.48s5.68 12.48 12.48 12.48c3.672 0 6.44-1.208 8.632-3.48 2.24-2.24 2.952-5.408 2.952-7.856 0-.752-.064-1.472-.184-2.128h-11.4v.416z"/></svg>
              </button>
              <button onClick={() => alert('Simulation: Connexion Apple...')} className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-neutral-100 dark:border-white/5 group">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.96.95-2.06 1.72-3.23 1.72-1.14 0-1.53-.71-2.92-.71-1.38 0-1.81.7-2.91.7-1.15 0-2.32-.82-3.32-1.83-2.03-2.07-3.1-5.88-3.1-8.58 0-4.3 2.76-6.57 5.4-6.57 1.38 0 2.58.53 3.42.53.82 0 2.26-.64 3.86-.64 1.38 0 3.32.55 4.54 2.11-4.01 2.37-3.36 8.35.66 10.27M13.62 3.65c.82-1.01 1.38-2.42 1.38-3.83-1.2.05-2.65.81-3.52 1.83-.78.91-1.46 2.35-1.46 3.73 1.34.1 2.64-.67 3.6-1.73z"/></svg>
              </button>
              <button onClick={() => alert('Simulation: Connexion Facebook...')} className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-neutral-100 dark:border-white/5 group">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.791-4.667 4.532-4.667 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-green-600 font-bold hover:underline">S'inscrire</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
