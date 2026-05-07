import { useState, useEffect, useMemo } from 'react';
import Logo from './Logo';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const [status, setStatus] = useState('initializing');

  const binaryGrid = useMemo(() => 
    Array.from({ length: 144 }).map((_, i) => ({
      id: i,
      value: i > 72 ? '01' : '10'
    })), []
  );

  const floatingSymbols = useMemo(() => 
    ['⚡', '🛠️', '⚙️', '📱', '🔧'].map((sym, i) => ({
      id: i,
      symbol: sym,
      left: 10 + (i * 18) % 80,
      top: 10 + (i * 25) % 80,
      delay: i * 1
    })), []
  );

  useEffect(() => {
    // Stage 1: Initializing
    const scanTimer = setTimeout(() => setStatus('scanning'), 800);
    
    // Stage 2: Glitch effect mid-way
    const glitchTimer = setTimeout(() => setGlitch(true), 1500);
    const glitchEndTimer = setTimeout(() => setGlitch(false), 1700);

    // Stage 3: Success
    const successTimer = setTimeout(() => setStatus('success'), 2200);

    // Stage 4: Finish
    const endTimer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(scanTimer);
      clearTimeout(glitchTimer);
      clearTimeout(glitchEndTimer);
      clearTimeout(successTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 transition-opacity duration-1000 ${status === 'success' ? 'bg-black' : ''}`}>
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 text-[8px] font-mono text-green-500">
          {status === 'success' && binaryGrid.map(item => (
            <div key={item.id} className="animate-pulse" style={{ animationDelay: `${item.id * 50}ms` }}>
              {item.value}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Tech Symbols */}
      {status === 'success' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingSymbols.map(item => (
            <div key={item.id} className="absolute text-2xl opacity-20 animate-float-slow"
              style={{ 
                left: `${item.left}%`, 
                top: `${item.top}%`,
                animationDelay: `${item.delay}s`
              }}>
              {item.symbol}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative flex flex-col items-center">
        {/* Scanner Effect */}
        {status === 'scanning' && (
          <div className="absolute -inset-10 border-t-2 border-green-500 shadow-[0_-15px_30px_rgba(16,185,129,0.5)] animate-scanner z-10" />
        )}

        {/* Logo Container */}
        <div className={`relative transition-all duration-1000 transform ${status === 'success' ? 'scale-125' : ''}`}>
          <div className={`p-8 rounded-[3rem] bg-gray-800/50 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group`}>
             <Logo className={`w-24 h-24 transition-all duration-700 ${status === 'success' ? 'rotate-0' : 'rotate-12'} ${glitch ? 'animate-glitch' : ''}`} />
          </div>

          {/* Glowing Ring */}
          <div className={`absolute inset-0 rounded-[3rem] border-2 transition-all duration-1000 ${status === 'success' ? 'border-green-500 scale-110 opacity-100 blur-md' : 'border-white/5 opacity-0'}`} />
        </div>

        {/* Text Section */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center">
            <h1 className={`text-6xl font-black tracking-tighter transition-all duration-700 ${status === 'success' ? 'text-green-500' : 'text-white'} ${glitch ? 'animate-glitch' : ''}`}>
              UBIRI
            </h1>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-white/40 font-black animate-fade-in-up">
            {status === 'scanning' ? 'Scanning systems...' : status === 'success' ? 'System ready' : 'Initializing core...'}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-16 w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 shadow-[0_0_15px_#10b981] animate-progress-fast" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanner {
          0%, 100% { top: -40px; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 160px; opacity: 0; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-40px) rotate(10deg); opacity: 0.8; }
        }
        @keyframes glitch {
          0% { transform: translate(0); text-shadow: -2px 2px #ff00c1, 2px -2px #00fff9; }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
          100% { transform: translate(0); text-shadow: none; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-fast {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-scanner { animation: scanner 1.5s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-glitch { animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease forwards; }
        .animate-progress-fast { animation: progress-fast 2.5s linear forwards; }
      `}} />
    </div>
  );
}
