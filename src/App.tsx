import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Search, MessageCircle, User, Heart, MessageSquare, Share2, Music2, Sparkles, Upload, Volume2, VolumeX, Play, Pause, Sun, Moon, Check, CheckCheck } from 'lucide-react';
import { AppView, Video, Conversation, Message, Profile, Comment } from './types.ts';
import { supabase } from './lib/supabase';

const GUEST_PROFILE: Profile = {
  name: 'KaaBI',
  handle: '@KaaBI',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
  bio: 'Login to reveal your personalized bio, story highlights, and creator stats.',
  posts: 0,
  followers: '0',
  following: 0,
  storyHighlights: ['Login', 'Profile', 'Stories']
};


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
  { id: 'global', user: { name: 'Faisal KaaBI', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=global' }, lastMessage: 'Welcome to the world!', unread: true },
  { id: '1', user: { name: 'Aarish', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aarish' }, lastMessage: 'Bhai video check kar!', unread: false },
  { id: '2', user: { name: 'Himanshu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sky' }, lastMessage: 'Let\'s collaborate soon.', unread: false }
];

const FILTERS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'sepia', name: 'Vintage', class: 'sepia contrast-125' },
  { id: 'grayscale', name: 'Noir', class: 'grayscale brightness-110' },
  { id: 'invert', name: 'Cyber', class: 'invert hue-rotate-180' },
  { id: 'blue', name: 'Ocean', class: 'hue-rotate-90 saturate-150' },
];function CommentModal({ 
  video, 
  onClose,
  profile,
  authenticated
}: { 
  video: Video; 
  onClose: () => void;
  profile: Profile;
  authenticated: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [video.id]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(username, avatar_url)')
      .eq('video_id', video.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setComments(data.map((c: any) => ({ ...c, user: c.users })) as any);
    } else if (error) {
      console.error("Comment fetch error:", error);
    }
    setLoading(false);
  };

  const postComment = async () => {
    if (!text.trim() || !authenticated) return;
    const { error } = await supabase.from('comments').insert({
      video_id: video.id,
      user_id: profile.id,
      text: text.trim()
    });
    if (!error) {
      setText('');
      fetchComments();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-bg-card border-t border-gray-800 rounded-t-3xl h-[70vh] flex flex-col shadow-2xl shadow-black"
      >
        <div className="flex justify-center p-3 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>
        <div className="text-center pb-4 border-b border-gray-800 font-black text-lg tracking-tight">
          Comments
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {loading ? (
            <div className="text-center text-gray-500 font-bold mt-10">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 font-bold mt-10">No comments yet. Be the first!</div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-3 animate-fade-in">
                <img src={c.user?.avatar_url || 'https://via.placeholder.com/40'} className="w-9 h-9 rounded-full bg-gray-800 object-cover" />
                <div className="flex-1">
                  <div className="text-xs text-gray-400 font-bold mb-0.5">@{c.user?.username}</div>
                  <div className="text-sm text-gray-200">{c.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {authenticated ? (
          <div className="p-4 border-t border-gray-800 bg-bg-card pb-safe">
            <div className="flex gap-4 mb-3 px-1 text-2xl justify-start">
              {['🔥', '❤️', '😂', '😍', '👏'].map(emoji => (
                <button key={emoji} onClick={() => setText(t => t + emoji)} className="hover:scale-110 active:scale-95 transition-transform">
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && postComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-bg-alt rounded-full px-5 py-3 text-sm border border-gray-800 focus:border-coral outline-none transition-colors"
              />
              <button 
                onClick={postComment} 
                disabled={!text.trim()} 
                className="text-black bg-white rounded-full px-6 font-black text-xs uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
              >
                Post
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-800 text-center bg-bg-card pb-safe flex flex-col items-center">
            <div className="text-gray-500 font-bold mb-3 text-sm">Please login to join the conversation.</div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SearchModal({ 
  profile, 
  onClose, 
  onSelectUser 
}: { 
  profile: Profile, 
  onClose: () => void, 
  onSelectUser: (user: any) => void 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.length > 1) {
      supabase.from('users')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', profile.id)
        .limit(10)
        .then(({ data }) => setResults(data || []));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-bg-card p-6 font-sans">
      <div className="flex gap-3 mb-6 items-center">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-alt border border-gray-800 rotate-180">➜</button>
        <input 
          autoFocus
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Search @username..." 
          className="flex-1 bg-bg-alt border border-gray-800 rounded-2xl px-4 py-3 outline-none focus:border-coral transition-colors" 
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
        {results.map(u => (
          <div key={u.id} onClick={() => onSelectUser(u)} className="flex items-center gap-4 p-4 bg-bg-alt rounded-2xl cursor-pointer hover:border-coral/50 border border-transparent transition-colors">
            <img src={u.avatar_url || 'https://via.placeholder.com/40'} className="w-12 h-12 rounded-full object-cover border border-gray-800" />
            <div className="font-bold text-lg">@{u.username}</div>
          </div>
        ))}
        {query.length > 1 && results.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No users found.</div>
        )}
      </div>
    </div>
  );
}

function ShareModal({ 
  video, 
  onClose,
  profile,
  conversations
}: { 
  video: Video; 
  onClose: () => void;
  profile: Profile;
  conversations: any[];
}) {
  const handleSend = async (user: any) => {
    const finalMessage = `Check out this Vibe! 🎥\n${video.url}`;
    
    // Save to DB
    await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: user.id,
      text: finalMessage
    });
    
    alert(`Sent to @${user.name || user.username}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        className="relative bg-bg-card border-t border-gray-800 rounded-t-3xl h-[60vh] flex flex-col shadow-2xl"
      >
        <div className="flex justify-center p-3 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>
        <div className="text-center pb-4 border-b border-gray-800 font-black text-lg tracking-tight">
          Send to...
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 font-bold mt-10">No friends found. Start a chat first!</div>
          ) : (
            conversations.map(c => (
              <div key={c.user.id} onClick={() => handleSend(c.user)} className="flex items-center justify-between p-3 bg-bg-alt rounded-2xl cursor-pointer hover:border-coral border border-transparent transition-colors">
                <div className="flex items-center gap-3">
                  <img src={c.user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-800" />
                  <div className="font-bold">@{c.user.name}</div>
                </div>
                <button className="bg-coral text-white font-bold text-xs px-4 py-2 rounded-full active:scale-95 transition-transform">Send</button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [activeChat, setActiveChat] = useState<{room: string, user: any} | null>(null);
  const [activeCommentVideo, setActiveCommentVideo] = useState<Video | null>(null);
  const [activeShareVideo, setActiveShareVideo] = useState<Video | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>(GUEST_PROFILE);
  const [scrollToVideoId, setScrollToVideoId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('vibechatTheme') === 'light';
  });

  useEffect(() => {
    localStorage.setItem('vibechatTheme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Load profile from localStorage as a fast default
    const savedProfile = localStorage.getItem('vibechatProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      if (parsed.handle !== GUEST_PROFILE.handle) {
        setAuthenticated(true);
      }
    }

    // Check active Supabase session for persistent database syncing
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch fresh profile row from the public.users database table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        let activeProfile = null;
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.id === session.user.id || parsed.handle === userData.username) {
            activeProfile = parsed;
          }
        }

        if (userData) {
          const mergedProfile = {
            id: session.user.id,
            name: activeProfile?.name || userData.username || session.user.email?.split('@')[0] || 'User',
            handle: userData.username || activeProfile?.handle || `@${session.user.email?.split('@')[0]}`,
            avatar: userData.avatar_url || activeProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
            bio: userData.bio || activeProfile?.bio || 'Welcome to my profile! Vibing high.',
            posts: activeProfile?.posts || 0,
            followers: activeProfile?.followers || '0',
            following: activeProfile?.following || 0,
            storyHighlights: activeProfile?.storyHighlights || ['Highlights']
          };
          setProfile(mergedProfile);
          setAuthenticated(true);
          localStorage.setItem('vibechatProfile', JSON.stringify(mergedProfile));
        }
      }
    }
    checkSession();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          users:user_id ( username, avatar_url )
        `)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formattedVideos = data.map((v: any) => ({
          id: v.id,
          url: v.url,
          user_id: v.user_id,
          user: { name: v.users?.username || 'user', avatar: v.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' },
          description: v.description || '',
          likes: v.likes || 0,
          comments: v.comments || 0,
          shares: v.shares || 0
        }));
        setVideos(formattedVideos);
      }
    }
    
    if (currentView === 'home') {
      fetchVideos();
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'home' && scrollToVideoId) {
      const element = document.getElementById(`video-${scrollToVideoId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto', block: 'start' });
          setScrollToVideoId(null);
        }, 150);
      }
    }
  }, [currentView, scrollToVideoId, videos]);

  useEffect(() => {
    if (authenticated && profile.id && currentView === 'chat') {
      // Fetch messages for inbox
      supabase.from('messages')
        .select('*, sender:users!sender_id(id, username, avatar_url), receiver:users!receiver_id(id, username, avatar_url)')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const deliveredIds = data.filter(m => m.receiver_id === profile.id && m.status === 'sent').map(m => m.id);
            if (deliveredIds.length > 0) {
              supabase.from('messages').update({ status: 'delivered' }).in('id', deliveredIds).then();
            }
            const convosMap = new Map();
            data.forEach(msg => {
              const otherUser = msg.sender_id === profile.id ? msg.receiver : msg.sender;
              if (!otherUser) return;
              if (!convosMap.has(otherUser.id)) {
                convosMap.set(otherUser.id, {
                  user: { id: otherUser.id, name: otherUser.username, avatar: otherUser.avatar_url || 'https://via.placeholder.com/40' },
                  lastMessage: msg.text,
                  room: [profile.id, otherUser.id].sort().join('-')
                });
              }
            });
            setConversations(Array.from(convosMap.values()));
          }
        });
    }
  }, [authenticated, profile.id, currentView]);

  return (
    <div className={`relative h-full w-full max-w-6xl mx-auto bg-bg-main text-white overflow-hidden flex flex-col font-sans px-4 pt-4 pb-20 md:px-8 md:pt-4 md:pb-20 ${isLightMode ? 'light' : ''}`}>
      {/* Header - Bento Style */}
      <header className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-4">
          <img src="/icon.png" alt="Vibechat" className="w-12 h-12 rounded-2xl shadow-lg shadow-coral/20 object-cover scale-110 mix-blend-screen" />
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">Vibe<span className="text-orange">Chat</span></h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Videos &bull; Chat &bull; Friends</span>
          </div>
        </div>
        <div className="flex gap-3 md:gap-4 items-center">
          {/* Day/Night Theme Toggle */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="w-10 h-10 rounded-full border border-gray-800 bg-bg-card flex items-center justify-center transition-all hover:ring-2 hover:ring-indigo-vibe/50 text-white cursor-pointer"
          >
            {isLightMode ? <Sun className="w-5 h-5 text-orange" /> : <Moon className="w-5 h-5 text-indigo-vibe-light" />}
          </button>

          <div className="hidden md:flex gap-4 items-center">
            {authenticated ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-4 py-2 coral-orange-gradient text-white rounded-full font-black uppercase tracking-[0.18em] text-[10px] shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
              >
                {profile.handle}
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 coral-orange-gradient text-white rounded-full font-black uppercase tracking-[0.18em] text-[10px] shadow-xl shadow-orange-500/20 transition-transform active:scale-95"
              >
                Login
              </button>
            )}
            <button
              onClick={() => {
                authenticated ? setIsProfileOpen(true) : setIsLoginOpen(true);
              }}
              className="w-10 h-10 rounded-full border border-gray-800 bg-bg-card overflow-hidden transition-all hover:ring-2 hover:ring-indigo-vibe/50"
            >
              <img src={authenticated ? profile.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'} className="w-full h-full" alt="Profile" />
            </button>
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
              className="md:col-span-12 h-full min-h-0 w-[calc(100%+2rem)] -mx-4 md:mx-auto md:w-full md:max-w-[420px] rounded-none md:rounded-3xl border-none md:border border-gray-800 overflow-hidden relative shadow-2xl shadow-indigo-vibe/5 bg-black"
            >
              <div className="h-full overflow-y-scroll snap-y-mandatory no-scrollbar">
                {videos.map((video) => (
                  <VideoPlayer key={video.id} video={video} onOpenComments={setActiveCommentVideo} onShare={setActiveShareVideo} />
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'chat' && (
            <motion.div
              key="sidebar-chat"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className={`md:block md:col-span-12 lg:col-span-6 lg:col-start-4 h-full min-h-0 bento-card p-6 flex flex-col relative overflow-hidden`}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                {authenticated && (
                  <button onClick={() => setIsSearchOpen(true)} className="bg-bg-alt border border-gray-800 w-8 h-8 flex items-center justify-center rounded-xl text-white font-bold hover:border-coral transition-colors active:scale-90">+</button>
                )}
              </div>
              
              {!authenticated ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-4">Login to chat with others.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pb-4">
                  {conversations.length === 0 && (
                    <div className="text-center text-gray-500 mt-10 text-sm font-bold">
                      No conversations yet.<br/>Click + to find users.
                    </div>
                  )}
                  {conversations.map((chat) => (
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      key={chat.room}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-bg-alt border border-gray-800/50 hover:border-coral/30 transition-all cursor-pointer"
                      onClick={() => setActiveChat({ room: chat.room, user: chat.user })}
                    >
                      <div className="relative">
                        <img src={chat.user.avatar} className="w-12 h-12 rounded-full object-cover bg-indigo-vibe/10 border-2 border-white/5" alt="" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-card rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm">@{chat.user.name}</h3>
                        <p className="text-xs text-gray-500 truncate font-medium">{chat.lastMessage}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {isSearchOpen && (
                  <SearchModal 
                    profile={profile} 
                    onClose={() => setIsSearchOpen(false)} 
                    onSelectUser={(u) => {
                      setIsSearchOpen(false);
                      const room = [profile.id, u.id].sort().join('-');
                      setActiveChat({ room, user: { id: u.id, name: u.username, avatar: u.avatar_url || 'https://via.placeholder.com/40' } });
                    }} 
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentView === 'discover' && (
            <div className="md:col-span-12 h-full min-h-0">
              <DiscoverView />
            </div>
          )}

          {currentView === 'upload' && (
            <div className="md:col-span-12 h-full min-h-0">
              {authenticated ? (
                <UploadView profile={profile} onUploadComplete={() => setCurrentView('home')} />
              ) : (
                <div className="h-full bento-card p-8 flex flex-col items-center justify-center text-center">
                  <h2 className="text-2xl font-black tracking-tight mb-4">Login Required</h2>
                  <p className="text-gray-400 mb-8">Please login to upload your vibe.</p>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="bg-indigo-vibe text-black rounded-3xl px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-vibe/20 active:scale-95 transition-transform"
                  >
                    Login Now
                  </button>
                </div>
              )}
            </div>
          )}

          {currentView === 'profile' && (
            <div className="md:col-span-12 h-full min-h-0">
              <ProfileView 
                profile={profile} 
                authenticated={authenticated} 
                videos={videos}
                onLogout={async () => {
                  await supabase.auth.signOut();
                  setAuthenticated(false);
                  setProfile(GUEST_PROFILE);
                  localStorage.removeItem('vibechatProfile');
                  setCurrentView('home');
                }} 
                onVideoClick={(videoId) => {
                  setScrollToVideoId(videoId);
                  setCurrentView('home');
                }}
                onEdit={() => {
                  setIsProfileOpen(true);
                  setIsEditingProfile(true);
                }}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChat && (
          <ChatWindow
            conversationId={activeChat.room}
            user={activeChat.user}
            profile={profile}
            onClose={() => setActiveChat(null)}
            socket={socketRef.current!}
          />
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {activeCommentVideo && (
          <CommentModal 
            video={activeCommentVideo}
            onClose={() => setActiveCommentVideo(null)}
            profile={profile}
            authenticated={authenticated}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {activeShareVideo && (
          <ShareModal 
            video={activeShareVideo}
            onClose={() => setActiveShareVideo(null)}
            profile={profile}
            conversations={conversations}
          />
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className="hidden md:flex fixed bottom-0 left-0 w-full h-20 bg-bg-card/80 backdrop-blur-2xl border-t border-gray-800 flex items-center justify-evenly z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <NavButton icon={Home} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavButton icon={Upload} label="Upload" active={currentView === 'upload'} onClick={() => setCurrentView('upload')} />
        <NavButton icon={MessageCircle} label="Inbox" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
        <NavButton icon={User} label="Me" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-bg-card/90 backdrop-blur-2xl border-t border-gray-800 flex items-center justify-evenly z-50 pb-safe">
        <NavButton icon={Home} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavButton icon={Upload} label="Upload" active={currentView === 'upload'} onClick={() => setCurrentView('upload')} />
        <NavButton icon={MessageCircle} label="Inbox" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
        <NavButton icon={User} label="Me" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
      </nav>


      <AnimatePresence>
        {isLoginOpen && (
          <LoginModal
            email={email}
            password={password}
            errorMessage={loginError}
            onClose={() => {
              setIsLoginOpen(false);
              setLoginError('');
            }}
            onEmailChange={(value) => {
              setEmail(value);
              setLoginError('');
            }}
            onPasswordChange={(value) => {
              setPassword(value);
              setLoginError('');
            }}
            onLogin={async (mode) => {
              if (!email.trim() || !password.trim()) {
                setLoginError('Please enter both email and password.');
                return;
              }

              let selectedProfile = {
                ...GUEST_PROFILE,
                name: email.split('@')[0],
                handle: '@' + email.split('@')[0].toLowerCase(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email.split('@')[0]}`
              };



              let user;
              if (mode === 'signin') {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                  setLoginError('Authentication failed: ' + error.message);
                  return;
                }
                user = data.user;
              } else {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) {
                  setLoginError('Sign up failed: ' + error.message);
                  return;
                }
                user = data.user;
              }

              if (user) {
                await supabase.from('users').upsert({
                  id: user.id,
                  username: selectedProfile.handle,
                  avatar_url: selectedProfile.avatar
                });
              }

              const finalProfile = { ...selectedProfile, id: user?.id || selectedProfile.id };

              setProfile(finalProfile);
              setAuthenticated(true);
              setIsLoginOpen(false);
              setEmail('');
              setPassword('');
              setLoginError('');
              localStorage.setItem('vibechatProfile', JSON.stringify(finalProfile));
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && (
          <ProfileModal
            profile={profile}
            authenticated={authenticated}
            isEditing={isEditingProfile}
            onClose={() => {
              setIsProfileOpen(false);
              setIsEditingProfile(false);
            }}
            onEdit={() => setIsEditingProfile(true)}
            onSave={async (newProfile) => {
              setProfile(newProfile);
              localStorage.setItem('vibechatProfile', JSON.stringify(newProfile));
              setIsEditingProfile(false);

              if (authenticated && newProfile.id) {
                const { error } = await supabase.from('users').upsert({
                  id: newProfile.id,
                  username: newProfile.handle,
                  avatar_url: newProfile.avatar,
                  bio: newProfile.bio
                });
                if (error) {
                  console.error('Error saving profile to database:', error);
                }
              }
            }}
            onLogin={() => {
              setIsProfileOpen(false);
              setIsLoginOpen(true);
            }}
            onLogout={() => {
              setAuthenticated(false);
              setProfile(GUEST_PROFILE);
              localStorage.removeItem('vibechatProfile');
              setIsProfileOpen(false);
              setIsEditingProfile(false);
            }}
          />
        )}
      </AnimatePresence>

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
            {Array.from({ length: 3 }).map((_, i) => (
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

function ProfileView({ profile, authenticated, videos, onLogout, onVideoClick, onEdit }: { profile: Profile; authenticated: boolean; videos: any[]; onLogout: () => void; onVideoClick: (id: string) => void; onEdit: () => void }) {
  if (!authenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <User className="w-20 h-20 text-gray-700 mb-6" />
        <h2 className="text-2xl font-black mb-2">Login Required</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Join the community to see your personalized vibes and stats.</p>
      </div>
    );
  }

  // Filter videos that belong to this logged-in user (match by user_id or username handle)
  const myVibes = videos.filter(
    (v) => v.user_id === profile.id || v.user?.name === profile.handle
  );

  const totalLikes = myVibes.reduce((sum, v) => sum + (v.likes || 0), 0);

  return (
    <motion.div
      key="profile"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.05, opacity: 0 }}
      className="h-full overflow-y-auto no-scrollbar"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-full pb-24">
        {/* Profile Card */}
        <div className="md:col-span-4 bento-card p-5 md:p-6 flex flex-col items-center h-fit">
          <div className="relative mb-5 md:mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/15">
              <div className="w-full h-full rounded-[1.8rem] md:rounded-[2.2rem] border-[4px] md:border-[6px] border-bg-card overflow-hidden bg-bg-card">
                <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg ring-4 md:ring-8 ring-bg-card cursor-pointer hover:scale-105 active:scale-95 transition-transform" onClick={onEdit}>
              +
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{profile.name}</h2>
          <p className="text-coral font-black text-xs md:text-sm mb-6 md:mb-8 tracking-widest uppercase">{profile.handle}</p>

          <div className="w-full grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 text-center">
            <div className="bg-bg-alt/50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-gray-800">
              <p className="text-lg md:text-xl font-black leading-none">{profile.following}</p>
              <p className="text-[7px] md:text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 md:mt-2">Following</p>
            </div>
            <div className="bg-bg-alt/50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-gray-800">
              <p className="text-lg md:text-xl font-black leading-none">{profile.followers}</p>
              <p className="text-[7px] md:text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 md:mt-2">Followers</p>
            </div>
            <div className="bg-bg-alt/50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-gray-800">
              <p className="text-lg md:text-xl font-black leading-none">{myVibes.length}</p>
              <p className="text-[7px] md:text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 md:mt-2">Posts</p>
            </div>
            <div className="bg-bg-alt/50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-coral/30">
              <p className="text-lg md:text-xl font-black leading-none text-coral">{totalLikes}</p>
              <p className="text-[7px] md:text-[8px] text-coral/80 font-bold uppercase tracking-widest mt-1.5 md:mt-2">Total Likes</p>
            </div>
          </div>

          <div className="w-full text-center mb-6 px-2">
            <p className="text-xs md:text-sm leading-relaxed text-gray-400 font-medium">{profile.bio || "No bio added yet."}</p>
          </div>

          <button onClick={onEdit} className="w-full bg-white text-black py-4 md:py-5 rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] active:scale-95 transition-transform mb-3 md:mb-4 shadow-xl shadow-white/5 cursor-pointer">
            Edit Profile
          </button>

          <button
            onClick={onLogout}
            className="w-full bg-bg-alt border border-red-500/30 text-red-400 py-3 md:py-4 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            Logout session
          </button>
        </div>

        {/* Content Feed Grid */}
        <div className="md:col-span-8 bento-card p-8 h-fit">
          <div className="flex items-center gap-8 mb-8 pb-4 border-b border-gray-800/50 text-xs font-black uppercase tracking-[0.2em]">
            <span className="text-white border-b-2 border-coral pb-4">My Vibes</span>
            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer pb-4">Liked</span>
            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer pb-4">Saved</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {myVibes.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px] border-2 border-dashed border-gray-800/50 rounded-3xl">
                No vibes uploaded yet.
              </div>
            ) : (
              myVibes.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onVideoClick(v.id)}
                  className="aspect-square bg-bg-alt rounded-2xl border border-gray-800 overflow-hidden relative group cursor-pointer"
                >
                  {v.url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
                    <img src={v.url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <video src={v.url} className="w-full h-full object-cover" muted loop playsInline />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-black">
                    <span className="flex items-center gap-1">❤️ {v.likes}</span>
                    <span className="flex items-center gap-1">💬 {v.comments}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UploadView({ profile, onUploadComplete }: { profile: Profile, onUploadComplete: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: profile.id,
          url: urlData.publicUrl,
          description: description || 'No description provided.',
          likes: 0,
          comments: 0,
          shares: 0
        });

      if (dbError) throw dbError;

      alert('Vibe uploaded successfully!');
      onUploadComplete();
    } catch (error: any) {
      alert('Error uploading: ' + error.message);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setDescription('');
    }
  };

  return (
    <motion.div
      key="upload"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.05, opacity: 0 }}
      className="h-full bento-card p-8 flex flex-col items-center justify-center relative overflow-y-auto no-scrollbar"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

      <div className="text-center relative z-10 my-auto py-8 w-full max-w-md">
        {!selectedFile ? (
          <>
            <div className="w-32 h-32 bg-bg-alt rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-gray-800 shadow-2xl group cursor-pointer hover:border-coral transition-all" onClick={() => fileInputRef.current?.click()}>
              <Upload className={`w-12 h-12 text-gray-500 group-hover:text-coral transition-colors`} />
            </div>

            <h2 className="text-4xl font-black tracking-tight mb-4">Upload Your Vibe</h2>
            <p className="text-gray-400 mb-12 mx-auto font-medium">Select a video or image from your gallery to share with the community. Every vibe counts.</p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*,image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`coral-orange-gradient text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-orange-500/30 active:scale-95 transition-all hover:scale-105`}
            >
              Choose Media
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-black tracking-tight mb-4 text-coral">File Selected</h2>
            <p className="text-sm text-gray-300 mb-6 font-medium break-all bg-bg-alt px-4 py-2 rounded-xl border border-gray-800">{selectedFile.name}</p>
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a catchy description..."
              className="w-full bg-bg-alt border border-gray-800 rounded-2xl px-5 py-4 text-sm outline-none focus:border-coral transition-colors resize-none mb-8"
              rows={3}
              disabled={isUploading}
            />

            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setDescription('');
                }}
                disabled={isUploading}
                className="flex-1 border border-gray-800 text-gray-300 px-6 py-4 rounded-[2rem] font-black uppercase tracking-[0.15em] text-[10px] active:scale-95 transition-all hover:border-coral disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-[2] coral-orange-gradient text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-[0.15em] text-[10px] shadow-2xl shadow-orange-500/30 active:scale-95 transition-all hover:scale-105 disabled:opacity-50 disabled:grayscale"
              >
                {isUploading ? 'Transmitting...' : 'Upload Now'}
              </button>
            </div>
          </div>
        )}
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
          className="absolute -bottom-2 w-1.5 h-1.5 bg-coral rounded-full shadow-lg shadow-coral/50"
        />
      )}
    </button>
  );
}

function VideoPlayer({ video, onOpenComments, onShare }: { video: Video; onOpenComments?: (video: Video) => void; onShare?: (video: Video) => void; key?: React.Key }) {
  const [liked, setLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteIndicator, setShowMuteIndicator] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState<'play' | 'pause' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      {
        threshold: 0.6, // Trigger play when 60% of the reel is in view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      setIsPaused(false); // Reset pause state when scrolling in
      videoRef.current?.play().catch(() => {});
      bgVideoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      bgVideoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
      if (bgVideoRef.current) bgVideoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setShowMuteIndicator(true);
    setTimeout(() => setShowMuteIndicator(false), 800);
  };

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      await supabase.rpc('update_likes', { p_video_id: video.id, p_increment: newLiked ? 1 : -1 });
    } catch (err) {
      console.error("Failed to update likes:", err);
    }
  };

  const togglePlayPause = () => {
    if (isImage) return;
    if (!videoRef.current) return;

    if (isPaused) {
      videoRef.current.play().catch(() => {});
      bgVideoRef.current?.play().catch(() => {});
      setIsPaused(false);
      setShowPlayPauseIndicator('play');
      setTimeout(() => setShowPlayPauseIndicator(null), 600);
    } else {
      videoRef.current.pause();
      bgVideoRef.current?.pause();
      setIsPaused(true);
      setShowPlayPauseIndicator('pause');
      setTimeout(() => setShowPlayPauseIndicator(null), 600);
    }
  };

  const isImage = video.url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);

  return (
    <div
      ref={containerRef}
      id={`video-${video.id}`}
      className="h-full w-full snap-start relative bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Blurred Background Layer for Option B (Landscape Support) */}
      {isImage ? (
        <img src={video.url} className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-40 scale-110" alt="" />
      ) : (
        <video
          ref={bgVideoRef}
          src={video.url}
          className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-40 scale-110"
          loop
          playsInline
          muted
        />
      )}

      {/* Foreground Content */}
      {isImage ? (
        <img src={video.url} className="relative z-0 h-full w-full object-contain" alt="Vibe" />
      ) : (
        <video
          ref={videoRef}
          src={video.url}
          className="relative z-0 h-full w-full object-contain cursor-pointer"
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlayPause}
        />
      )}
      
      {/* Floating Mute/Unmute Indicator */}
      <AnimatePresence>
        {showMuteIndicator && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute z-30 w-16 h-16 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-none"
          >
            {isMuted ? (
              <VolumeX className="w-8 h-8 text-white" />
            ) : (
              <Volume2 className="w-8 h-8 text-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Play/Pause Indicator (Instagram Reels Style) */}
      <AnimatePresence>
        {showPlayPauseIndicator && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute z-30 w-16 h-16 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-none"
          >
            {showPlayPauseIndicator === 'play' ? (
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            ) : (
              <Pause className="w-8 h-8 text-white fill-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Pause Overlay Icon */}
      {isPaused && !showPlayPauseIndicator && (
        <div className="absolute z-20 w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-none animate-pulse">
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
      )}
      
      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 w-full h-full pointer-events-none z-10" />

      {/* Interactions Sidebar - Sleek Instagram Style (Transparent, Drop Shadow, Smaller) */}
      <div className="absolute right-4 bottom-6 md:right-6 md:bottom-10 flex flex-col items-center gap-4.5 md:gap-6 z-20">
        <div className="group flex flex-col items-center gap-0.5 cursor-pointer" onClick={handleLike}>
          <motion.div
            animate={{ scale: liked ? [1, 1.2, 1] : 1 }}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all active:scale-90 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          >
            <Heart className={`w-6 h-6 md:w-7.5 md:h-7.5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </motion.div>
          <span className="text-[10px] md:text-[11px] font-black tracking-wider text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.7)] mt-0.5">{video.likes + (liked ? 1 : 0)}</span>
        </div>

        <div className="group flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => onOpenComments?.(video)}>
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all active:scale-90 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <MessageSquare className="w-6 h-6 md:w-7.5 md:h-7.5 text-white" />
          </div>
          <span className="text-[10px] md:text-[11px] font-black tracking-wider text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.7)] mt-0.5">{video.comments}</span>
        </div>

        {/* Volume/Audio Toggle Button (Only for Videos) */}
        {!isImage && (
          <div className="group flex flex-col items-center gap-0.5 cursor-pointer" onClick={toggleMute}>
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all active:scale-90 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {isMuted ? (
                <VolumeX className="w-6 h-6 md:w-7.5 md:h-7.5 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 md:w-7.5 md:h-7.5 text-white" />
              )}
            </div>
            <span className="text-[10px] md:text-[11px] font-black tracking-wider text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.7)] mt-0.5">
              {isMuted ? 'Mute' : 'Audio'}
            </span>
          </div>
        )}

        <div className="group flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => onShare?.(video)}>
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all active:scale-90 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <Share2 className="w-6 h-6 md:w-7.5 md:h-7.5 text-white" />
          </div>
          <span className="text-[10px] md:text-[11px] font-black tracking-wider text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.7)] mt-0.5">Share</span>
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="w-7.5 h-7.5 md:w-9 md:h-9 rounded-full p-1.5 bg-black/40 border border-white/20 shadow-lg shadow-black/50 overflow-hidden flex items-center justify-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] mt-1"
        >
          <Music2 className="w-full h-full text-white" />
        </motion.div>
      </div>

      {/* User Info Overlay */}
      <div className="absolute left-4 bottom-6 md:left-8 md:bottom-10 max-w-[75%] md:max-w-[70%] z-20">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="relative group cursor-pointer">
            <img src={video.user.avatar} className="w-11 h-11 md:w-14 md:h-14 rounded-2xl border-2 border-white/20 p-0.5 bg-white/5" alt="" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-vibe rounded-lg flex items-center justify-center border-2 border-black text-white text-[10px] font-black transition-transform group-hover:scale-110">+</div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg md:text-xl tracking-tighter leading-none mb-1 shadow-sm shadow-black">@{video.user.name}</span>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-orange">Suggestive Vibe</span>
          </div>
        </div>
        <p className="text-xs md:text-base font-bold leading-relaxed line-clamp-2 md:line-clamp-none mb-3 md:mb-4 text-white/95">
          {video.description}
        </p>
        <div className="flex items-center gap-2.5 md:gap-3 bg-white/5 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5 rounded-2xl w-fit border border-white/10">
          <Music2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange" />
          <div className="overflow-hidden w-36 md:w-40">
            <motion.div
              animate={{ x: [160, -160] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="text-[9px] md:text-[10px] font-black whitespace-nowrap uppercase tracking-widest"
            >
              Trending Vibe - {video.user.name} - Official Content
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatWindow({ conversationId, user, profile, onClose, socket }: { conversationId: string, user: any, profile: Profile, onClose: () => void, socket: Socket }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch historical messages from Supabase
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setMessages(data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_id === profile.id ? 'me' : user.name,
          text: m.text,
          timestamp: new Date(m.created_at).getTime(),
          status: m.status
        })));

        const unreadIds = data.filter((m: any) => m.receiver_id === profile.id && m.status !== 'seen').map((m: any) => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ status: 'seen' }).in('id', unreadIds);
          unreadIds.forEach((id: string) => {
            socket.emit('message-status-update', { room: conversationId, messageId: id, status: 'seen' });
          });
        }
      }
    };
    if (profile.id) fetchHistory();

    socket.emit('join-room', conversationId);

    socket.on('new-message', (data: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      if (data.senderId !== profile.id) {
        supabase.from('messages').update({ status: 'seen' }).eq('id', data.id).then();
        socket.emit('message-status-update', { room: conversationId, messageId: data.id, status: 'seen' });
      }
    });

    socket.on('message-status-updated', ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
    });

    return () => {
      socket.off('new-message');
      socket.off('message-status-updated');
    };
  }, [conversationId, socket, profile.id, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    
    // Optimistic UI update
    const tempId = Math.random().toString(36).substr(2, 9);
    const newMessage = {
      room: conversationId,
      senderId: profile.id,
      senderName: 'me',
      text,
      timestamp: Date.now(),
      id: tempId
    };
    setMessages(prev => [...prev, newMessage]);

    // Save to Supabase
    const { data, error } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: user.id,
      text: text
    }).select().single();

    if (!error && data) {
      // Emit via socket
      const finalMessage = {
        room: conversationId,
        senderId: profile.id,
        senderName: profile.handle,
        text,
        timestamp: new Date(data.created_at).getTime(),
        id: data.id,
        status: data.status || 'sent'
      };
      socket.emit('send-message', finalMessage);
      
      // Update local message ID to match DB
      setMessages(prev => prev.map(m => m.id === tempId ? finalMessage : m));
    }
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
          <h2 className="font-black text-xl tracking-tighter leading-none">{user.name || user.username}</h2>
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Live Connection</span>
        </div>
        <div className="w-12 h-12 rounded-xl border border-gray-800 bg-bg-alt overflow-hidden">
          <img src={user.avatar || user.avatar_url || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" alt="" />
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
            initial={{ scale: 0.9, opacity: 0, x: msg.senderId === profile.id ? 20 : -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            key={msg.id}
            className={`flex ${msg.senderId === profile.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-3xl ${msg.senderId === profile.id ? 'coral-orange-gradient text-white rounded-br-none shadow-xl shadow-orange-500/20' : 'bg-bg-alt rounded-bl-none border border-gray-800'}`}>
              <p className="text-[13px] font-bold leading-relaxed tracking-wide">{msg.text}</p>
              {msg.senderId === profile.id && (
                <div className="flex justify-end mt-0.5 gap-1 items-center">
                  <span className="text-[9px] opacity-70 font-bold">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {(!msg.status || msg.status === 'sent') && <Check className="w-3 h-3 text-white/70" />}
                  {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-white/70" />}
                  {msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-blue-200 drop-shadow-[0_0_2px_rgba(59,130,246,0.8)]" />}
                </div>
              )}
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
          className="flex-1 bg-bg-alt border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-coral transition-all font-bold text-xs uppercase tracking-widest"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-white/5 disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  );
}

function LoginModal({
  email,
  password,
  errorMessage,
  onClose,
  onEmailChange,
  onPasswordChange,
  onLogin,
}: {
  email: string;
  password: string;
  errorMessage: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: (mode: 'signin' | 'signup') => void;
}) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="w-full max-w-md bento-card border border-white/10 bg-bg-card p-8 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              {isSignUp ? 'Create Account' : 'Login'}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {isSignUp
                ? 'Register with your email and password.'
                : 'Enter your email and password to continue.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white text-xl leading-none">×</button>
        </div>

        {errorMessage && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm mb-4">
            {errorMessage}
          </div>
        )}
        
        <div className="space-y-5">
          <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-500">Email Address</label>
          <input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="w-full bg-bg-alt border border-gray-800 rounded-3xl px-5 py-4 text-white outline-none focus:border-coral transition-all"
          />
          
          <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-500 mt-4">Password</label>
          <input
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            type="password"
            placeholder="••••••••"
            className="w-full bg-bg-alt border border-gray-800 rounded-3xl px-5 py-4 text-white outline-none focus:border-coral transition-all"
          />

          <button
            onClick={() => onLogin(isSignUp ? 'signup' : 'signin')}
            className="w-full coral-orange-gradient text-white rounded-3xl py-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-500/20 active:scale-95 transition-transform mt-4"
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-coral hover:underline font-semibold"
            >
              {isSignUp
                ? 'Already have an account? Log In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileModal({
  profile,
  authenticated,
  isEditing,
  onClose,
  onEdit,
  onSave,
  onLogin,
  onLogout,
}: {
  profile: Profile;
  authenticated: boolean;
  isEditing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: (newProfile: Profile) => void;
  onLogin: () => void;
  onLogout: () => void;
}) {
  const [editBio, setEditBio] = useState(profile.bio);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const newProfile = { ...profile, bio: editBio, avatar: editAvatar };
    onSave(newProfile);
  };

  if (!authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="w-full max-w-md bento-card border border-white/10 bg-bg-card p-8 shadow-2xl shadow-black/40 text-center"
        >
          <h2 className="text-2xl font-black tracking-tight mb-4">Login Required</h2>
          <p className="text-gray-400 mb-8">Please login to access your profile and edit your information.</p>
          <button
            onClick={onLogin}
            className="w-full bg-indigo-vibe text-black rounded-3xl py-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-vibe/20 active:scale-95 transition-transform"
          >
            Login Now
          </button>
          <button
            onClick={onClose}
            className="w-full mt-4 border border-gray-800 rounded-3xl py-4 text-gray-300 uppercase tracking-[0.2em] text-[10px] hover:border-indigo-vibe"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="w-full max-w-lg bento-card border border-white/10 bg-bg-card p-8 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Profile</h2>
            <p className="text-sm text-gray-400 mt-2">{isEditing ? 'Edit your profile information' : 'View your profile details'}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white text-xl leading-none">×</button>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img src={editAvatar} className="w-24 h-24 rounded-full border-4 border-indigo-vibe/40" alt="Profile" />
                <label className="absolute bottom-0 right-0 bg-indigo-vibe text-black rounded-full p-2 cursor-pointer shadow-lg">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <span className="text-xs font-black">+</span>
                </label>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Click + to change profile picture</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-bg-alt border border-gray-800 rounded-3xl px-5 py-4 text-white outline-none focus:border-indigo-vibe transition-all resize-none"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-indigo-vibe text-black rounded-3xl py-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-vibe/20 active:scale-95 transition-transform"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditBio(profile.bio);
                  setEditAvatar(profile.avatar);
                  onClose(); // This will close the modal and reset editing
                }}
                className="flex-1 border border-gray-800 rounded-3xl py-4 text-gray-300 uppercase tracking-[0.2em] text-[10px] hover:border-indigo-vibe"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <img src={profile.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-vibe/40" alt="Profile" />
              <div className="text-center">
                <h3 className="text-xl font-black tracking-tight">{profile.name}</h3>
                <p className="text-sm uppercase tracking-[0.25em] text-gray-500">{profile.handle}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-3xl bg-bg-alt border border-gray-800 p-4">
                <p className="text-lg font-black">{profile.posts}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-1">Posts</p>
              </div>
              <div className="rounded-3xl bg-bg-alt border border-gray-800 p-4">
                <p className="text-lg font-black">{profile.followers}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-1">Followers</p>
              </div>
              <div className="rounded-3xl bg-bg-alt border border-gray-800 p-4">
                <p className="text-lg font-black">{profile.following}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-1">Following</p>
              </div>
            </div>

            <div>
              <p className="text-sm leading-relaxed text-gray-300">{profile.bio}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.storyHighlights.map((item) => (
                <span key={item} className="bg-white/5 text-[10px] uppercase tracking-[0.24em] px-3 py-2 rounded-full border border-white/10">{item}</span>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onEdit}
                className="w-full bg-white text-black rounded-3xl py-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-white/10 active:scale-95 transition-transform"
              >
                Edit Profile
              </button>
              <button
                onClick={onLogout}
                className="w-full border border-red-500 text-red-200 rounded-3xl py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
