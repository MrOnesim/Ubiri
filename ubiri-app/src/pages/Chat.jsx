import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getMessages, sendMessage, markAsRead, addReaction, getUserById, uploadFile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [interlocutor, setInterlocutor] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
   const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const user = getUserById(id);
    if (!user) {
      navigate('/messages');
      return;
    }
    setInterlocutor(user);

    const loadMessages = async () => {
      try {
        const msgs = await getMessages(id);
        setMessages(msgs);
        markAsRead(id);
        
        // Simulate typing when messages change (if not from current user)
        const lastMsg = [...msgs].pop();
        if (lastMsg && lastMsg.fromId !== currentUser.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
    window.addEventListener('ubiri_new_message', loadMessages);
    return () => window.removeEventListener('ubiri_new_message', loadMessages);
  }, [id, currentUser, getMessages, markAsRead, getUserById, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !mediaFile) return;
    
    let uploadedUrl = null;
    if (mediaFile) {
      const { url } = await uploadFile(mediaFile);
      uploadedUrl = url;
    }

    await sendMessage(id, inputText, uploadedUrl);
    setInputText('');
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const shareLocation = async () => {
    const mockLat = 6.3654;
    const mockLng = 2.4183;
    const mapLink = `📍 Ma position : https://www.google.com/maps?q=${mockLat},${mockLng}`;
    await sendMessage(id, mapLink);
  };

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], "voice_msg.webm", { type: 'audio/webm' });
        try {
          const { url } = await uploadFile(file);
          await sendMessage(id, '', null, url);
        } catch (err) {
          console.error('Failed to upload voice message:', err);
          alert('Échec de l\'envoi du message vocal');
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  };

  if (!interlocutor) return null;

  return (
    <div className="bg-white dark:bg-gray-950 h-screen flex flex-col">
      <Navbar />
      
      {/* Chat Header */}
      <div className="pt-24 pb-4 px-6 border-b border-neutral-100 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/messages" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black">
            {interlocutor.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-black text-sm md:text-base">{interlocutor.name}</h1>
            <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold">En ligne</p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, idx) => {
          const showDate = idx === 0 || new Date(messages[idx-1].date).toDateString() !== new Date(m.date).toDateString();
          return (
            <div key={m.id}>
              {showDate && (
                <div className="flex justify-center my-6">
                  <span className="bg-gray-100 dark:bg-gray-800 text-[10px] uppercase tracking-widest font-bold text-gray-500 px-4 py-1 rounded-full">
                    {new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}
              <div className={`flex ${m.fromId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative max-w-[80%] p-4 rounded-3xl shadow-sm ${
                  m.fromId === currentUser.id 
                    ? 'bg-green-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white rounded-tl-none'
                }`}>
                  {/* Reactions Popover (Desktop) */}
                  <div className={`absolute -top-8 ${m.fromId === currentUser.id ? 'right-0' : 'left-0'} hidden group-hover:flex bg-white dark:bg-gray-800 shadow-xl border border-neutral-100 dark:border-white/10 rounded-full p-1 gap-1 z-10`}>
                    {['👍', '❤️', '😂', '😮', '🙏'].map(emoji => (
                      <button key={emoji} onClick={() => handleReaction(m.id, emoji)} className="hover:scale-125 transition-transform p-1">{emoji}</button>
                    ))}
                  </div>

                  {m.image && (
                    <img src={m.image} alt="Envoi" className="rounded-2xl mb-2 max-w-full h-auto border border-white/20" />
                  )}
                  {m.voice && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                      </div>
                      <audio src={m.voice} controls className="h-8 w-40 accent-white" />
                    </div>
                  )}
                  {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                  
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <p className="text-[9px] opacity-60 font-bold uppercase tracking-tighter">
                      {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {m.fromId === currentUser.id && (
                      <span className={m.read ? "text-blue-300" : "text-white/40"}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.319 6.69a.999.999 0 00-1.41 0l-12.23 12.23-5.25-5.25a.999.999 0 10-1.41 1.41l5.96 5.96a.997.997 0 001.41 0L22.319 8.1a.999.999 0 000-1.41z"/>
                          <path d="M15.569 6.69a.999.999 0 00-1.41 0l-5.48 5.48a.999.999 0 101.41 1.41l5.48-5.48a.999.999 0 000-1.41z"/>
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className="absolute -bottom-3 flex -space-x-1">
                      {Array.from(new Set(m.reactions.map(r => r.emoji))).map(emoji => (
                        <div key={emoji} className="bg-white dark:bg-gray-800 border border-neutral-100 dark:border-white/10 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm">
                          {emoji} {m.reactions.filter(r => r.emoji === emoji).length > 1 && m.reactions.filter(r => r.emoji === emoji).length}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-3xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white dark:bg-gray-950 border-t border-neutral-100 dark:border-white/10">
        {mediaPreview && (
          <div className="mb-4 relative w-32 h-32 group">
            <img src={mediaPreview} className="w-full h-full object-cover rounded-2xl border-2 border-green-500" alt="Prévisualisation" />
            <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          
          <div className="flex gap-1">
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-green-600 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
            <button type="button" onClick={shareLocation} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-blue-600 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>

          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..." 
              className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
            />
            
            {inputText.trim() || mediaFile ? (
              <button type="submit" className="p-3 bg-green-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            ) : (
              <button 
                type="button" 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
