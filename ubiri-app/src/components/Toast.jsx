import { useState, useEffect } from 'react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotification = (e) => {
      const { type, message } = e.detail;
      const id = Date.now();
      setToasts(prev => [...prev, { id, type, message }]);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    window.addEventListener('ubiri_notification', handleNotification);
    return () => window.removeEventListener('ubiri_notification', handleNotification);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'order': return '💰';
      case 'verification': return '🛡️';
      case 'wallet': return '🏦';
      case 'review': return '⭐';
      default: return '🔔';
    }
  };

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none items-end">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className="bg-white dark:bg-gray-900 border border-neutral-100 dark:border-white/5 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-right-full fade-in duration-300 pointer-events-auto min-w-[280px]"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-xl shrink-0">
            {getIcon(t.type)}
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-0.5">Nouveau</h4>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.message}</p>
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
            className="ml-auto p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
