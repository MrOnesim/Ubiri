import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function CommunityFeed() {
  const { currentUser, toggleLikeIntervention } = useAuth();
  const [posts, setPosts] = useState([]);

  // Load posts from localStorage and refresh on auth change or post updates
  useEffect(() => {
    const loadPosts = () => {
      const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
      const allPosts = [];
      users.forEach(u => {
        if (u.interventions) {
          u.interventions.forEach(i => {
            allPosts.push({
              ...i,
              workerId: u.id,
              workerName: u.name,
              workerTrade: u.trade,
              workerAvatar: u.name.charAt(0)
            });
          });
        }
      });
      setPosts(allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    loadPosts();

    // Listen for post updates from other components
    const handlePostUpdate = () => loadPosts();
    window.addEventListener('ubiri_post_update', handlePostUpdate);

    return () => window.removeEventListener('ubiri_post_update', handlePostUpdate);
  }, []);

  const handleLike = (workerId, postId) => {
    if (!currentUser) return;
    toggleLikeIntervention(workerId, postId);
    // Refresh local state
    const updated = posts.map(p => {
      if (p.id === postId) {
        const likes = p.likes || [];
        const hasLiked = currentUser && likes.includes(currentUser.id);
        return {
          ...p,
          likes: hasLiked ? likes.filter(id => id !== currentUser.id) : [...likes, currentUser.id]
        };
      }
      return p;
    });
    setPosts(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-32 pb-20">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">Fil Communautaire</h1>
          <p className="text-gray-500 uppercase text-[10px] tracking-[0.3em] font-black">Découvrez les meilleures réalisations de nos artisans</p>
        </div>

        <div className="space-y-12">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10">
              <div className="text-4xl mb-4">📸</div>
              <p className="text-gray-400 font-bold">Aucune réalisation publiée pour le moment.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none border border-neutral-100 dark:border-white/5 transition-all hover:scale-[1.01]">
                {/* Post Header */}
                <div className="p-6 flex items-center justify-between">
                  <Link to={`/profil/${post.workerId}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                      {post.workerAvatar}
                    </div>
                    <div>
                      <h3 className="font-black text-sm group-hover:text-green-600 transition-colors">{post.workerName}</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{post.workerTrade}</p>
                    </div>
                  </Link>
                  <span className="text-[10px] font-black text-gray-300 uppercase">
                    {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Post Image */}
                <div className="relative aspect-video">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-8">
                    <p className="text-white text-sm font-medium leading-relaxed">{post.description}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(post.workerId, post.id)}
                        className={`flex items-center gap-2 group transition-all ${post.likes?.includes(currentUser?.id) ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${post.likes?.includes(currentUser?.id) ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                          <svg className={`w-6 h-6 ${post.likes?.includes(currentUser?.id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="font-black text-xs">{post.likes?.length || 0}</span>
                      </button>

                      <button className="flex items-center gap-2 text-gray-400 group">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="font-black text-xs">Commenter</span>
                      </button>
                    </div>

                    <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-green-600 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-lg leading-tight">{post.title}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">{post.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
