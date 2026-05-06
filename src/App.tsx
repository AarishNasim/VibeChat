import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Search, MessageCircle, User, Heart, MessageSquare, Share2, Music2, Sparkles } from 'lucide-react';
import { AppView, Video, Conversation, Message } from './types.ts';

// Mock Data
const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-33431-large.mp4',
    user: { name: 'neon_vibes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon' },
    description: 'Neon nights ✨ #vibes #neon #nightlife',
    likes: 1240,
    comments: 45,
    shares: 12
  },
  {
    id: '2',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    user: { name: 'nature_lover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature' },
    description: 'Beautiful spring morning 🌸 #nature #spring #fresh',
    likes: 890,
    comments: 23,
    shares: 5
  },
  {
    id: '3',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-light-up-glasses-in-the-dark-33423-large.mp4',
    user: { name: 'techno_girl', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech' },
    description: 'Looking into the future 🕶️ #ai #cyberpunk #tech',
    likes: 3400,
    comments: 156,
    shares: 89
  }
];

const MOCK_CHATS: Conversation[] = [
  { id: 'global', user: { name: 'Global Vibe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=global' }, lastMessage: 'Welcome to the world!', unread: true },
  { id: '1', user: { name: 'Aarish', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aarish' }, lastMessage: 'Bhai video check kar!', unread: false },
  { id: '2', user: { name: 'Sky Walker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sky' }, lastMessage: 'Let\'s collaborate soon.', unread: false }
];

const FILTERS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'sepia', name: 'Vintage', class: 'sepia contrast-125' },
  { id: 'grayscale', name: 'Noir', class: 'grayscale brightness-110' },
  { id: 'invert', name: 'Cyber', class: 'invert hue-rotate-180' },
  { id: 'blue', name: 'Ocean', class: 'hue-rotate-90 saturate-150' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();
    
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="relative h-full w-full max-w-6xl mx-auto bg-bg-main text-white overflow-hidden flex flex-col font-sans p-4 md:p-8">
      {/* Header - Bento Style */}
      <header className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-vibe rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-vibe/20">V</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">Vibe<span className="text-indigo-vibe-light">Stream</span></h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Stable Release v1.02</span>
          </div>
        </div>
        <div className="hidden md:flex gap-4 items-center">
          <div className="px-4 py-2 bg-bg-alt border border-gray-800 rounded-full text-[10px] text-indigo-vibe-light font-bold tracking-widest uppercase">
            ts_node_v1.2.0
          </div>
          <div className="w-10 h-10 rounded-full border border-gray-800 bg-bg-card overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=me" className="w-full h-full" alt="" />
          </div>
        </div>
      </header>

      {/* Main Content Area - Responsive Grid */}
      <main className="flex-1 overflow-hidden relative grid grid-cols-1 md:grid-cols-12 gap-6">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="md:col-span-8 h-full bento-card relative shadow-2xl shadow-indigo-vibe/5"
            >
              <div className="h-full overflow-y-scroll snap-y-mandatory no-scrollbar">
                {MOCK_VIDEOS.map((video) => (
                  <VideoPlayer key={video.id} video={video} />
                ))}
              </div>
            </motion.div>
          )}

          {(currentView === 'home' || currentView === 'chat') && (
            <motion.div
              key="sidebar-chat"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className={`${currentView === 'chat' ? 'block' : 'hidden'} md:block md:col-span-4 h-full bento-card p-6 flex flex-col`}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                <span className="bg-indigo-vibe text-[10px] px-2 py-0.5 rounded-full font-black uppercase">4 New</span>
              </div>
              <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pb-4">
                {MOCK_CHATS.map((chat) => (
                  <motion.div 
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    key={chat.id} 
                    className="flex items-center gap-3 p-3 rounded-2xl bg-bg-alt border border-gray-800/50 hover:border-indigo-vibe/30 transition-all cursor-pointer"
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="relative">
                      <img src={chat.user.avatar} className="w-12 h-12 rounded-full bg-indigo-vibe/10 border-2 border-white/5" alt="" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-card rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm">{chat.user.name}</h3>
                      <p className="text-xs text-gray-500 truncate font-medium">{chat.lastMessage}</p>
                    </div>
                    {chat.unread && <div className="w-2 h-2 bg-indigo-vibe rounded-full shadow-lg shadow-indigo-vibe/50" />}
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Start chat..." 
                   className="w-full bg-bg-alt border border-gray-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-vibe transition-colors"
                 />
              </div>
            </motion.div>
          )}

          {currentView === 'discover' && (
            <div className="md:col-span-12 h-full">
              <DiscoverView />
            </div>
          )}

          {currentView === 'profile' && (
            <div className="md:col-span-12 h-full">
              <ProfileView />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChat && (
          <ChatWindow 
            conversationId={activeChat} 
            user={MOCK_CHATS.find(c => c.id === activeChat)?.user || MOCK_CHATS[0].user}
            onClose={() => setActiveChat(null)} 
            socket={socketRef.current!}
          />
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className="hidden md:flex h-16 bg-bg-card border border-gray-800 rounded-3xl items-center justify-around px-8 z-50 mb-4 mx-2 shadow-2xl shadow-black/50">
        <NavButton icon={Home} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavButton icon={Search} label="Explore" active={currentView === 'discover'} onClick={() => setCurrentView('discover')} />
        <NavButton icon={MessageCircle} label="Inbox" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
        <NavButton icon={User} label="Me" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
      </nav>

      <nav className="md:hidden h-20 bg-bg-card/90 backdrop-blur-xl border-t border-gray-800 flex items-center justify-around px-2 z-50 pb-4">
        <NavButton icon={Home} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavButton icon={Search} label="Explore" active={currentView === 'discover'} onClick={() => setCurrentView('discover')} />
        <NavButton icon={MessageCircle} label="Inbox" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
        <NavButton icon={User} label="Me" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
      </nav>

      {/* Footer - Bento Style */}
      <footer className="mt-4 pb-2 hidden md:flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-[0.2em] px-4 font-bold">
        <div>&copy; 2024 VIBESTREAM | STABLE RELEASE v1.02</div>
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Backend Active</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-vibe"></span> Typescript Engine</span>
        </div>
      </footer>
    </div>
  );
}

function DiscoverView() {
  const [activeFilter, setActiveFilter] = useState('none');
  
  return (
    <motion.div 
      key="discover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-0 flex flex-col h-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 h-full">
        {/* Search & Filters */}
        <div className="md:col-span-4 md:row-span-4 bento-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black tracking-tight">Discover</h1>
            <Sparkles className="text-indigo-vibe w-6 h-6" />
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Explore new vibes..." 
              className="w-full bg-bg-alt border border-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-vibe transition-all font-bold text-sm"
            />
          </div>

          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 ml-1">AI Filters</p>
            <div className="grid grid-cols-2 gap-3 pb-2">
              {FILTERS.map((f) => (
                <button 
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${activeFilter === f.id ? 'bg-indigo-vibe border-indigo-vibe text-white shadow-lg shadow-indigo-vibe/20' : 'bg-bg-alt text-gray-400 border-gray-800 hover:border-gray-700'}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="md:col-span-8 md:row-span-6 bento-card p-6 overflow-y-auto no-scrollbar">
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {MOCK_VIDEOS.map((v) => (
                 <motion.div 
                   key={v.id} 
                   whileHover={{ scale: 1.02 }}
                   className="aspect-[9/16] rounded-3xl bg-bg-alt overflow-hidden relative border border-gray-800 group"
                 >
                    <video 
                      src={v.url} 
                      className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 ${FILTERS.find(f => f.id === activeFilter)?.class}`} 
                      loop muted autoPlay playsInline 
                    />
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                      <span className="text-[10px] bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 font-bold uppercase tracking-wider">@{v.user.name}</span>
                      <Heart className="w-4 h-4 text-white/50" />
                    </div>
                 </motion.div>
              ))}
              {/* Placeholders for grid layout */}
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="aspect-[9/16] rounded-3xl bg-bg-alt/50 border border-gray-800/30 border-dashed" />
              ))}
           </div>
        </div>

        {/* Analytics Card */}
        <div className="hidden md:block md:col-span-4 md:row-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-indigo-500/10">
          <div className="flex flex-col h-full">
            <span className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Trending Vibe Score</span>
            <span className="text-4xl font-black mt-2 tracking-tighter">142.8k</span>
            <div className="mt-auto flex items-end gap-1 px-1">
              <div className="flex-grow h-4 bg-white/20 rounded-sm"></div>
              <div className="flex-grow h-8 bg-white/30 rounded-sm"></div>
              <div className="flex-grow h-6 bg-white/20 rounded-sm"></div>
              <div className="flex-grow h-12 bg-white/40 rounded-sm"></div>
              <div className="flex-grow h-7 bg-white/20 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileView() {
  return (
    <motion.div 
      key="profile"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.05, opacity: 0 }}
      className="h-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 h-full">
        {/* Profile Card */}
        <div className="md:col-span-4 md:row-span-6 bento-card p-8 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-40 h-40 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20">
              <div className="w-full h-full rounded-[2.2rem] border-[6px] border-bg-card overflow-hidden bg-bg-card">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=me" className="w-full h-full" alt="" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-xl ring-8 ring-bg-card">
              +
            </div>
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-2">Syed Aarish</h2>
          <p className="text-indigo-vibe font-black text-sm mb-10 tracking-widest uppercase">@aarish00786</p>
          
          <div className="w-full grid grid-cols-3 gap-4 mb-10 text-center">
            <div className="bg-bg-alt/50 p-4 rounded-3xl border border-gray-800">
              <p className="text-xl font-black leading-none">128</p>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-2">Following</p>
            </div>
            <div className="bg-bg-alt/50 p-4 rounded-3xl border border-gray-800">
              <p className="text-xl font-black leading-none">24.5K</p>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-2">Follower</p>
            </div>
            <div className="bg-bg-alt/50 p-4 rounded-3xl border border-gray-800">
              <p className="text-xl font-black leading-none">1.2M</p>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-2">Likes</p>
            </div>
          </div>

          <button className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-transform mb-6 shadow-xl shadow-white/5">
            Edit Profile
          </button>
          
          <div className="flex gap-4 w-full">
             <button className="flex-1 bg-bg-alt border border-gray-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Settings</button>
             <button className="flex-1 bg-bg-alt border border-gray-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Insights</button>
          </div>
        </div>

        {/* Content Feed Grid */}
        <div className="md:col-span-8 md:row-span-6 bento-card p-8 overflow-y-auto no-scrollbar">
           <div className="flex items-center gap-8 mb-8 pb-4 border-b border-gray-800/50 text-xs font-black uppercase tracking-[0.2em]">
              <span className="text-white border-b-2 border-indigo-vibe pb-4">My Vibes</span>
              <span className="text-gray-500 hover:text-white transition-colors cursor-pointer pb-4">Liked</span>
              <span className="text-gray-500 hover:text-white transition-colors cursor-pointer pb-4">Saved</span>
           </div>
           <div className="grid grid-cols-3 gap-2">
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} className="aspect-square bg-bg-alt rounded-2xl border border-gray-800 overflow-hidden relative group">
                 <div className="absolute inset-0 bg-indigo-vibe/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NavButton({ icon: Icon, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 transition-all ${active ? 'scale-110' : 'opacity-40 grayscale'}`}
    >
      <Icon className={`w-7 h-7 ${active ? 'text-white' : 'text-white'}`} />
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute -bottom-2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" 
        />
      )}
    </button>
  );
}

function VideoPlayer({ video }: { video: Video }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="h-full w-full snap-start relative bg-black">
      <video 
        src={video.url} 
        className="h-full w-full object-cover"
        loop
        playsInline
        autoPlay
        muted
      />
      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 w-full h-full" />
      
      {/* Interactions Sidebar - Bento Style */}
      <div className="absolute right-6 bottom-10 flex flex-col items-center gap-6 z-20">
        <div className="group flex flex-col items-center gap-1 cursor-pointer" onClick={() => setLiked(!liked)}>
          <motion.div 
            animate={{ scale: liked ? [1, 1.2, 1] : 1 }}
            className={`w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl flex items-center justify-center rounded-2xl border border-white/20 transition-all hover:bg-white/20 ${liked ? 'bg-red-500/20 border-red-500/40' : ''}`}
          >
            <Heart className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </motion.div>
          <span className="text-[10px] font-black tracking-widest mt-1 opacity-60 uppercase">{video.likes + (liked ? 1 : 0)}</span>
        </div>
        
        <div className="group flex flex-col items-center gap-1 cursor-pointer">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl flex items-center justify-center rounded-2xl border border-white/20 transition-all hover:bg-white/20 active:scale-90">
            <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <span className="text-[10px] font-black tracking-widest mt-1 opacity-60 uppercase">{video.comments}</span>
        </div>

        <div className="group flex flex-col items-center gap-1 cursor-pointer">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl flex items-center justify-center rounded-2xl border border-white/20 transition-all hover:bg-white/20 active:scale-90">
            <Share2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <span className="text-[10px] font-black tracking-widest mt-1 opacity-60 uppercase">Share</span>
        </div>

        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full p-2 bg-gradient-to-tr from-indigo-vibe to-purple-600 border border-white/30 shadow-lg shadow-indigo-vibe/20"
        >
           <Music2 className="w-full h-full text-white" />
        </motion.div>
      </div>

      {/* User Info Overlay */}
      <div className="absolute left-8 bottom-10 max-w-[70%] z-20">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group cursor-pointer">
            <img src={video.user.avatar} className="w-14 h-14 rounded-2xl border-2 border-white/20 p-0.5 bg-white/5" alt="" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-vibe rounded-lg flex items-center justify-center border-2 border-black text-white text-[10px] font-black transition-transform group-hover:scale-110">+</div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none mb-1 shadow-sm shadow-black">@{video.user.name}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-vibe-light">Suggestive Vibe</span>
          </div>
        </div>
        <p className="text-sm md:text-base font-bold leading-relaxed line-clamp-2 md:line-clamp-none mb-4 text-white/95">
          {video.description}
        </p>
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit border border-white/10">
          <Music2 className="w-4 h-4 text-indigo-vibe-light" />
          <div className="overflow-hidden w-40">
            <motion.div 
              animate={{ x: [160, -160] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="text-[10px] font-black whitespace-nowrap uppercase tracking-widest"
            >
              Trending Vibe - {video.user.name} - Official Content
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatWindow({ conversationId, user, onClose, socket }: { conversationId: string, user: any, onClose: () => void, socket: Socket }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit('join-room', conversationId);
    
    socket.on('new-message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('new-message');
    };
  }, [conversationId, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      room: conversationId,
      sender: 'me',
      text: inputText,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
    socket.emit('send-message', newMessage);
    setInputText('');
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-[4%] md:inset-[10%] z-[100] bento-card flex flex-col font-sans shadow-2xl shadow-indigo-vibe/20 border-indigo-vibe/20"
    >
      <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-bg-card/80 backdrop-blur-xl">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-alt border border-gray-800 active:scale-90 transition-transform">
          <span className="text-xl rotate-180">➜</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-black text-xl tracking-tighter leading-none">{user.name}</h2>
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Live Connection</span>
        </div>
        <div className="w-12 h-12 rounded-xl border border-gray-800 bg-bg-alt overflow-hidden">
           <img src={user.avatar} className="w-full h-full" alt="" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale scale-75">
            <MessageCircle className="w-24 h-24 mb-6" />
            <p className="font-black text-center uppercase tracking-[0.4em] text-xs">Vibe Encrypted</p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, x: msg.sender === 'me' ? 20 : -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-3xl ${msg.sender === 'me' ? 'bg-indigo-vibe rounded-br-none shadow-xl shadow-indigo-vibe/20' : 'bg-bg-alt rounded-bl-none border border-gray-800'}`}>
              <p className="text-[13px] font-bold leading-relaxed tracking-wide">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-bg-card border-t border-gray-800 flex gap-4">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Transmit a vibe..."
          className="flex-1 bg-bg-alt border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-vibe transition-all font-bold text-xs uppercase tracking-widest"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          className="bg-white text-black px-8 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-vibe hover:text-white"
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  );
}
