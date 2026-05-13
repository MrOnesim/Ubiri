import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Messages() {
  const { currentUser, getConversations } = useAuth();
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadConvs = async () => {
      const convs = await getConversations();
      setConversations(convs);
    };

    loadConvs();
    window.addEventListener('ubiri_new_message', loadConvs);
    return () => window.removeEventListener('ubiri_new_message', loadConvs);
  }, [currentUser, getConversations, navigate]);

  return (
    <div className="page-entry bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black mb-8">Messages</h1>

        {conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Link
                key={conv.user.id}
                to={`/chat/${conv.user.id}`}
                className="block bg-white dark:bg-gray-900 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center shrink-0 relative">
                    <span className="text-2xl font-black text-green-600">
                      {conv.user.name?.charAt(0).toUpperCase()}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 animate-bounce">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h2 className="font-black text-lg truncate">{conv.user.name}</h2>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(conv.lastMessage.date).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-black dark:text-white font-bold' : 'text-gray-500'}`}>
                      {conv.lastMessage.fromId === currentUser.id ? 'Vous : ' : ''}
                      {conv.lastMessage.image ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Photo
                        </span>
                      ) : conv.lastMessage.text}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 p-20 rounded-[3rem] text-center border border-neutral-100 dark:border-white/5 shadow-2xl">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-2">Aucune conversation</h2>
            <p className="text-gray-500">Contactez un artisan pour commencer à discuter.</p>
            <Link to="/services" className="inline-block mt-8 bg-green-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-green-500/20 hover:-translate-y-1 transition-all">
              Explorer les services
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
