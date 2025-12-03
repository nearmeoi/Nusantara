import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, User, Clock, Share2, ChevronRight, 
  Home, TrendingUp, Grid, X, LogIn, Edit3, Trash2, 
  CheckCircle, PlusCircle, ArrowLeft, Sparkles, Volume2, 
  StopCircle, Loader2, MessageSquare, Send, Wand2,
  FileText, Activity, Save, Filter, AlertCircle, Eye,
  Layout, Image as ImageIcon, Calendar, ChevronLeft,
  Upload, Tv, Play, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from 'lucide-react';

/**
 * MOCK DATA
 */
const INITIAL_DATA = [
  {
    id: 1,
    title: "Presiden Resmikan Infrastruktur Digital di Kalimantan",
    slug: "presiden-resmikan-infrastruktur",
    category: "Nasional",
    status: "published",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
    author: "Budi Santoso",
    date: "2023-10-25T08:30:00",
    content: "Kalimantan kini memiliki pusat data nasional baru yang diresmikan langsung oleh Presiden pagi ini. Pembangunan ini diharapkan dapat mempercepat transformasi digital di seluruh pelosok negeri...",
    views: 1540
  },
  {
    id: 2,
    title: "Timnas Garuda Raih Kemenangan Dramatis di Menit Akhir",
    slug: "timnas-garuda-menang",
    category: "Olahraga",
    status: "published",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    author: "Dimas Anggara",
    date: "2023-10-24T20:15:00",
    content: "Pertandingan sengit terjadi di Stadion Utama Gelora Bung Karno tadi malam. Timnas Indonesia berhasil mencetak gol kemenangan di menit ke-93, membuat seisi stadion bergemuruh...",
    views: 8900
  },
  {
    id: 3,
    title: "IHSG Diprediksi Menguat, Cek Saham Pilihan Hari Ini",
    slug: "ihsg-menguat",
    category: "Ekonomi",
    status: "published",
    image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=800&auto=format&fit=crop",
    author: "Siti Aminah",
    date: "2023-10-25T09:00:00",
    content: "Indeks Harga Saham Gabungan (IHSG) dibuka di zona hijau pada perdagangan hari ini. Analis memperkirakan tren positif ini didorong oleh membaiknya neraca perdagangan...",
    views: 3200
  },
  {
    id: 4,
    title: "Inovasi Baterai EV Buatan Anak Bangsa Tembus Pasar Eropa",
    slug: "baterai-ev-lokal",
    category: "Teknologi",
    status: "published",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop",
    author: "Rian Hidayat",
    date: "2023-10-23T14:45:00",
    content: "Startup teknologi asal Bandung berhasil mengekspor komponen baterai kendaraan listrik ke Jerman. Ini membuktikan kualitas manufaktur Indonesia mampu bersaing di kancah global...",
    views: 5600
  },
  {
    id: 5,
    title: "Festival Kuliner Nusantara Kembali Digelar Akhir Pekan Ini",
    slug: "festival-kuliner",
    category: "Gaya Hidup",
    status: "published",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
    author: "Lina Marlina",
    date: "2023-10-22T11:20:00",
    content: "Bagi pecinta kuliner, jangan lewatkan festival tahunan yang menghadirkan lebih dari 200 jenis masakan tradisional dari Sabang sampai Merauke...",
    views: 2100
  }
];

const CATEGORIES = ["Terbaru", "Nasional", "Olahraga", "Ekonomi", "Teknologi", "Gaya Hidup", "Otomotif"];

/**
 * GEMINI API HELPERS
 */
const callGemini = async (prompt, systemInstruction = "") => {
  const apiKey = ""; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, gagal memproses permintaan.";
    } catch (error) {
      if (i === 4) return "Terjadi kesalahan koneksi ke AI.";
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

const callGeminiTTS = async (text) => {
  const apiKey = "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Aoede" } 
        }
      }
    }
  };

  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio) {
        const binaryString = window.atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let k = 0; k < binaryString.length; k++) {
          bytes[k] = binaryString.charCodeAt(k);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      if (i === 4) return null;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

/**
 * UTILITY FUNCTIONS
 */
const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  try {
    return new Date(dateString).toLocaleDateString('id-ID', options) + ' WIB';
  } catch (e) {
    return dateString;
  }
};

const formatTimeAgo = (dateString) => {
  const diff = new Date() - new Date(dateString);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 24) return formatDate(dateString);
  if (hours > 0) return `${hours} jam yang lalu`;
  return `${minutes} menit yang lalu`;
};

/**
 * SUB-COMPONENTS
 */

const Navbar = ({ isMenuOpen, setIsMenuOpen, setView, activeCategory, setActiveCategory, isAdmin }) => (
  <nav className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 text-white hover:bg-blue-600 rounded-lg transition-colors border-none bg-transparent outline-none focus:outline-none"
          >
            <Menu size={24} />
          </button>
          
          <div 
            className="text-2xl font-bold tracking-tighter cursor-pointer flex items-center gap-1"
            onClick={() => { setView('home'); setIsMenuOpen(false); }}
          >
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-black italic text-white">N</div>
            <span>USANTARA</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-6 text-sm font-medium"></div>

        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setView(isAdmin ? 'admin' : 'login')} 
            className="flex items-center gap-1 text-xs bg-blue-800 px-3 py-1 rounded-full hover:bg-blue-900 transition text-white border-none outline-none focus:outline-none"
          >
            {isAdmin ? <User size={14} /> : <LogIn size={14} />}
            {isAdmin ? "Redaksi" : "Masuk"}
          </button>
          <Search size={24} className="cursor-pointer" />
        </div>
      </div>
    </div>
    
    {isMenuOpen && (
      <div className="md:hidden bg-blue-800 border-t border-blue-600 absolute w-full left-0 shadow-xl z-50">
        <div className="flex flex-col p-4 space-y-2">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => { setActiveCategory(cat); setIsMenuOpen(false); setView('home'); }}
              className="w-full text-left py-3 px-4 text-blue-100 font-medium hover:bg-blue-700 rounded-lg transition border-none bg-transparent outline-none focus:outline-none"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    )}
  </nav>
);

const Ticker = ({ articles }) => {
  const trendingNews = articles
    ? articles
        .filter(a => a.status === 'published')
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(a => `${a.title.toUpperCase()} (${a.views.toLocaleString()} pembaca)`)
        .join("  •  ")
    : "Memuat berita terkini...";

  return (
    <div className="bg-gray-100 border-b border-gray-200 py-2 overflow-hidden relative">
      <div className="container mx-auto px-4 max-w-5xl flex items-center text-xs text-gray-700 font-medium overflow-hidden">
        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold mr-3 uppercase tracking-wider shrink-0 z-10 shadow-sm relative">Sekilas Info</span>
        
        <div className="flex-1 overflow-hidden relative h-5">
           <div className="animate-marquee-text absolute top-0 left-0 h-full flex items-center">
             {trendingNews} {trendingNews}
           </div>
        </div>
      </div>
    </div>
  );
};

const HomeView = ({ activeCategory, filteredArticles, articles, onArticleClick, setActiveCategory }) => {
  const showHeroAndLive = activeCategory === "Terbaru" || activeCategory === "Nasional";
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroArticles = articles.filter(a => a.status === 'published').slice(0, 5);

  useEffect(() => {
    if (heroArticles.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroArticles.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [heroArticles.length]);

  const activeArticle = heroArticles[currentSlide];

  return (
    <main className="container mx-auto px-4 py-4 max-w-5xl min-h-screen">
      
      {/* NAVIGATION MENU (Sticky) - Added outline-none */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur border-b border-gray-200 mb-6 -mx-4 px-4 md:-mx-0 md:px-0 shadow-sm transition-all">
         <div className="flex items-center gap-4 md:gap-8 overflow-x-auto py-3 hide-scrollbar max-w-5xl mx-auto">
           {CATEGORIES.map(cat => (
             <button 
               key={cat} 
               onClick={() => setActiveCategory(cat)}
               className={`text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors pb-0.5 border-b-2 outline-none focus:outline-none
                 ${activeCategory === cat 
                   ? 'text-blue-700 border-blue-700' 
                   : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
                 } bg-transparent border-none`}
             >
               {cat}
             </button>
           ))}
         </div>
      </div>

      {/* HERO CAROUSEL - SIZE REDUCED (h-56 mobile, h-96 desktop) */}
      {showHeroAndLive && activeArticle && (
        <div className="mb-8 relative group">
          <div className="relative h-56 md:h-96 rounded-2xl overflow-hidden shadow-xl cursor-pointer" onClick={() => onArticleClick(activeArticle)}>
            <div className="absolute inset-0">
               <img 
                 src={activeArticle.image} 
                 alt={activeArticle.title}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex flex-col justify-end h-full">
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-500" key={activeArticle.id}>
                <span className="inline-block bg-orange-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider shadow-sm">
                  {activeArticle.category}
                </span>
                <h1 className="text-white text-xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2 drop-shadow-md line-clamp-2">
                  {activeArticle.title}
                </h1>
                <div className="flex items-center text-gray-200 text-xs md:text-sm gap-4 font-medium">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {formatTimeAgo(activeArticle.date)}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full hidden md:block"></span>
                  <span className="flex items-center gap-1.5 hidden md:flex"><User size={14} /> {activeArticle.author}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {heroArticles.map((_, idx) => (
              <button 
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 border-none outline-none focus:outline-none ${currentSlide === idx ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* LIVE STREAMING */}
      {showHeroAndLive && (
        <div className="mb-12 w-full bg-zinc-900 rounded-xl overflow-hidden shadow-xl relative aspect-video md:aspect-[21/9] group cursor-pointer border border-zinc-800 ring-1 ring-white/10">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
             <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
             </div>
             <div className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-md border border-white/10">
                <span className="text-red-400">●</span> 12.5k Penonton
             </div>
          </div>

          <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black text-gray-500 relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Tv size={48} className="mb-4 opacity-40 text-gray-300 relative z-10" />
              </div>
              <h3 className="text-gray-200 font-bold text-lg mb-1 tracking-wide relative z-10">NUSANTARA TV</h3>
              <p className="text-xs text-gray-500 font-mono relative z-10">Menunggu Siaran Langsung Berikutnya...</p>
              
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                 <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Play size={32} className="text-white fill-white ml-1 opacity-90" />
                 </div>
              </div>
          </div>
        </div>
      )}

      {/* CONTENT GRID */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 border-b-2 border-orange-500 pb-2">
            <h2 className="text-xl font-bold text-gray-800 uppercase mr-4">{activeCategory}</h2>
          </div>
          
          <div className="space-y-6">
            {filteredArticles.filter(a => a.status === 'published').slice(showHeroAndLive ? 0 : 0).map(item => (
              <div 
                key={item.id} 
                onClick={() => onArticleClick(item)}
                className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-6 last:border-0 hover:bg-gray-50/50 transition-colors p-2 rounded-lg -mx-2"
              >
                <div className="w-24 md:w-48 h-24 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition duration-300" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm md:text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition line-clamp-2 md:line-clamp-3 mb-2">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-orange-600 text-[10px] md:text-xs font-bold uppercase tracking-wide">{item.category}</span>
                    <span className="text-gray-400 text-[10px] md:text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(item.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredArticles.filter(a => a.status === 'published').length === 0 && (
               <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">Belum ada berita di kategori ini.</div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-8">
           <div className="bg-gray-100 h-64 rounded-xl flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
            Iklan 300x250
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-5 border-b pb-3">
              <TrendingUp size={20} className="text-red-500" />
              TERPOPULER
            </h3>
            <div className="flex flex-col gap-5">
              {articles.filter(a => a.status === 'published').slice().sort((a,b) => b.views - a.views).slice(0, 5).map((item, idx) => (
                <div key={item.id} onClick={() => onArticleClick(item)} className="flex items-start gap-4 cursor-pointer group">
                  <span className="text-3xl font-black text-gray-200 leading-none -mt-1 font-serif italic w-6 text-center">{idx + 1}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs text-gray-400 mt-1.5 block flex items-center gap-1">
                      <Eye size={12} /> {item.views.toLocaleString()} pembaca
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// ... Rest of components (ArticleView, AdminList, AdminEditor, AdminPreview, AdminView, LoginView) remain unchanged from the previous robust version ...
// To ensure the file is complete for copy-pasting, I include them below.

const ArticleView = ({ article, onBack }) => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    setSummary(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setChatQuery("");
    setChatResponse(null);
  }, [article]);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    const prompt = `Buatkan ringkasan singkat (maksimal 3 poin) dari artikel ini dalam Bahasa Indonesia: \n\n${article.title}\n${article.content}`;
    const result = await callGemini(prompt);
    setSummary(result);
    setLoadingSummary(false);
  };

  const handleTTS = async () => {
    if (audioUrl) { audioRef.current.play(); setIsPlaying(true); return; }
    setLoadingAudio(true);
    const url = await callGeminiTTS(article.content.substring(0, 300));
    if (url) { setAudioUrl(url); setTimeout(() => audioRef.current?.play(), 100); setIsPlaying(true); }
    setLoadingAudio(false);
  };

  const handleAskAI = async (e) => {
      e.preventDefault();
      if(!chatQuery) return;
      setLoadingChat(true);
      const prompt = `Konteks Artikel: ${article.title}\n\nIsi: ${article.content}\n\nPertanyaan User: ${chatQuery}\n\nJawablah singkat padat berdasarkan artikel.`;
      const result = await callGemini(prompt);
      setChatResponse(result);
      setLoadingChat(false);
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl min-h-screen">
      <button onClick={onBack} className="mb-4 text-blue-600 text-sm font-medium flex items-center hover:underline bg-transparent border-none outline-none focus:outline-none">
        <ArrowLeft size={16} className="mr-1" /> Kembali
      </button>

      <article>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
           <span className="font-bold text-gray-900">{article.author}</span>
           <span>{formatDate(article.date)}</span>
           <div className="ml-auto flex gap-2">
             <button onClick={handleSummarize} disabled={loadingSummary} className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border-none outline-none focus:outline-none transition hover:bg-indigo-100">
               {loadingSummary ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />} Ringkas
             </button>
             <button onClick={handleTTS} disabled={loadingAudio} className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border-none outline-none focus:outline-none transition hover:bg-orange-100">
               {isPlaying ? <StopCircle size={14}/> : <Volume2 size={14}/>} Audio
             </button>
           </div>
        </div>

        <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-200 mb-8 shadow-sm">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {summary && <div className="bg-indigo-50 p-6 rounded-xl mb-8 text-sm text-indigo-900 leading-relaxed whitespace-pre-line border border-indigo-100 animate-in fade-in slide-in-from-top-4 shadow-sm">{summary}</div>}

        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-4">
          <p>{article.content}</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 my-12">
           <div className="flex items-center gap-2 mb-4 text-blue-800">
              <MessageSquare size={20} className="text-blue-600" />
              <h3 className="font-bold">Tanya AI</h3>
           </div>
           
           {chatResponse && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-gray-800 text-sm border border-blue-100 animate-in fade-in">
                 <strong className="block text-blue-700 mb-1">Jawaban:</strong>
                 {chatResponse}
              </div>
           )}

           <form onSubmit={handleAskAI} className="flex gap-2">
              <input 
                type="text" 
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Ada yang kurang jelas dari berita ini?"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit" 
                disabled={loadingChat || !chatQuery}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-300 border-none outline-none focus:outline-none transition"
              >
                {loadingChat ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
           </form>
        </div>

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
      </article>
    </main>
  );
};

const AdminList = ({ articles, onCreate, onEdit, onDelete, searchQuery, setSearchQuery, filterStatus, setFilterStatus }) => {
  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (filterStatus === 'all' || a.status === filterStatus)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Artikel</h2>
          <p className="text-gray-500 text-sm">Kelola semua konten berita Anda di sini.</p>
        </div>
        <button onClick={onCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 border-none transition shadow-sm outline-none focus:outline-none">
          <PlusCircle size={18} /> Buat Baru
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         <div className="flex-1 relative">
           <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
           <input type="text" placeholder="Cari judul..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"/>
         </div>
         <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 outline-none bg-white">
           <option value="all">Semua Status</option>
           <option value="published">Terbit</option>
           <option value="draft">Draft</option>
         </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Artikel</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase w-32">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase w-32">Kategori</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase w-32 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-gray-900 line-clamp-1">{a.title}</p>
                  <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString('id-ID')}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${a.status==='published'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>
                    {a.status === 'published' ? 'Terbit' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{a.category}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => onEdit(a, true)} className="p-1.5 text-gray-400 hover:text-blue-600 border-none bg-transparent outline-none focus:outline-none" title="Preview"><Eye size={18}/></button>
                  <button onClick={() => onEdit(a, false)} className="p-1.5 text-gray-400 hover:text-orange-600 border-none bg-transparent outline-none focus:outline-none" title="Edit"><Edit3 size={18}/></button>
                  <button onClick={() => onDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 border-none bg-transparent outline-none focus:outline-none" title="Hapus"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminEditor = ({ articleForm, setArticleForm, editingId, onSave, onBack, onPreview }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const generateTitle = async () => {
    setAiLoading(true);
    const res = await callGemini(`Buatkan 1 judul berita menarik untuk konten ini: ${articleForm.content}`);
    if(res) setArticleForm(prev => ({...prev, title: res.replace(/"/g, '')}));
    setAiLoading(false);
  };

  const polishContent = async () => {
    setAiLoading(true);
    const res = await callGemini(`Perbaiki tata bahasa teks ini agar gaya jurnalistik formal: ${articleForm.content}`);
    if(res) setArticleForm(prev => ({...prev, content: res}));
    setAiLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleForm(prev => ({...prev, image: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50 z-10 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 border-none bg-transparent outline-none focus:outline-none"><ChevronLeft/></button>
          <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={onPreview} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium border-none bg-transparent transition outline-none focus:outline-none">Preview</button>
          <button onClick={() => onSave('draft')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white bg-transparent transition outline-none focus:outline-none">Simpan Draft</button>
          <button onClick={() => onSave('published')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 border-none flex items-center gap-2 transition shadow-sm outline-none focus:outline-none">
            <Send size={16}/> Terbitkan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between mb-2">
               <label className="block text-sm font-bold text-gray-700">Judul Berita</label>
               <button onClick={generateTitle} disabled={!articleForm.content || aiLoading} className="text-xs flex items-center gap-1 text-indigo-600 hover:underline border-none bg-transparent font-medium outline-none focus:outline-none">
                 {aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} AI Title
               </button>
             </div>
             <input 
               type="text" 
               value={articleForm.title} 
               onChange={e => setArticleForm({...articleForm, title: e.target.value})}
               className="w-full text-xl font-bold p-2 border-b-2 border-gray-200 focus:border-blue-600 outline-none placeholder-gray-300 transition-colors" 
               placeholder="Ketik judul berita di sini..."
             />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[500px] flex flex-col">
             <div className="flex justify-between mb-2 border-b border-gray-100 pb-2">
               <div className="flex gap-2 text-gray-400">
                  <button className="hover:text-gray-600 border-none bg-transparent outline-none focus:outline-none"><b className="font-serif font-bold">B</b></button>
                  <button className="hover:text-gray-600 border-none bg-transparent outline-none focus:outline-none"><i className="font-serif italic">I</i></button>
               </div>
               <button onClick={polishContent} disabled={!articleForm.content || aiLoading} className="text-xs flex items-center gap-1 text-green-600 hover:underline border-none bg-transparent font-medium outline-none focus:outline-none">
                 {aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>} Perbaiki Tata Bahasa
               </button>
             </div>
             <textarea 
               value={articleForm.content}
               onChange={e => setArticleForm({...articleForm, content: e.target.value})}
               className="w-full h-full resize-none outline-none text-gray-700 leading-relaxed text-lg"
               placeholder="Mulai menulis konten berita..."
             ></textarea>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Layout size={18}/> Pengaturan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
                <select 
                  value={articleForm.category}
                  onChange={e => setArticleForm({...articleForm, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              {/* IMPROVED DATE PICKER UI */}
              <div className="relative group">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jadwal Publish</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
                  </div>
                  <input 
                    type="datetime-local" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 bg-white"
                    style={{colorScheme: 'light'}} // Force standard icons if supported
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock size={10} /> Kosongkan untuk publish sekarang
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><ImageIcon size={18}/> Gambar Utama</h3>
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1.5 rounded-md hover:bg-blue-100 flex items-center gap-1 border-none transition font-medium outline-none focus:outline-none"
                >
                  <Upload size={14} /> Upload
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
             </div>
             
             <div className="mb-3 aspect-video bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200 relative group hover:border-blue-300 transition-colors">
               {articleForm.image ? (
                 <>
                   <img src={articleForm.image} className="w-full h-full object-cover" />
                   <button 
                     onClick={() => setArticleForm({...articleForm, image: ''})}
                     className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-none shadow-md hover:bg-red-700 outline-none focus:outline-none"
                   >
                     <X size={14} />
                   </button>
                 </>
               ) : (
                 <div className="text-center p-4">
                    <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                    <span className="text-gray-400 text-xs">Preview Gambar<br/>(Pilih Upload atau Tempel URL)</span>
                 </div>
               )}
             </div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Gambar (Opsional)</label>
             <input 
               type="text" 
               value={articleForm.image}
               onChange={e => setArticleForm({...articleForm, image: e.target.value})}
               className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
               placeholder="https://..."
             />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPreview = ({ article, onBack }) => (
  <div className="bg-gray-100 min-h-screen pb-20">
    <div className="bg-gray-800 text-white p-3 text-center sticky top-0 z-50 flex justify-between items-center px-6 shadow-md">
      <span className="font-mono text-sm">MODE PREVIEW</span>
      <button onClick={onBack} className="bg-white text-gray-900 px-4 py-1 rounded text-sm font-bold border-none hover:bg-gray-200 outline-none focus:outline-none">
         Kembali Mengedit
      </button>
    </div>
    <ArticleView article={{...article, date: new Date().toISOString(), author: "Redaksi (Preview)"}} onBack={onBack} />
  </div>
);

const AdminView = ({ articles, setArticles, onLogout }) => {
  const [subView, setSubView] = useState("list"); 
  const [articleForm, setArticleForm] = useState({ title: '', category: 'Nasional', content: '', status: 'draft', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleCreate = () => {
    setEditingId(null);
    setArticleForm({title:'', category:'Nasional', content:'', status:'draft', image:''});
    setSubView('editor');
  };

  const handleEdit = (article, isPreview = false) => {
    setArticleForm({ ...article });
    setEditingId(article.id);
    setSubView(isPreview ? 'preview' : 'editor');
  };

  const handleDelete = (id) => {
    if(confirm("Hapus artikel ini?")) setArticles(articles.filter(a => a.id !== id));
  };

  const handleSave = (status) => {
    if(!articleForm.title || !articleForm.category) { alert("Judul dan Kategori wajib diisi"); return; }
    
    const newArticle = {
      ...articleForm,
      status: status,
      id: editingId || Date.now(),
      date: new Date().toISOString(),
      author: "Redaksi",
      slug: articleForm.title.toLowerCase().replace(/\s+/g, '-'),
      image: articleForm.image || "https://placehold.co/600x400?text=No+Image"
    };

    if (editingId) {
      setArticles(articles.map(a => a.id === editingId ? newArticle : a));
    } else {
      setArticles([newArticle, ...articles]);
    }
    setSubView("list");
    setEditingId(null);
    setArticleForm({ title: '', category: 'Nasional', content: '', status: 'draft', image: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {subView !== 'preview' && (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">A</div>
             <span className="font-bold text-gray-700">Panel Redaksi</span>
          </div>
          <button onClick={onLogout} className="text-sm text-red-500 font-medium hover:underline border-none bg-transparent outline-none focus:outline-none">Keluar</button>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {subView === 'list' && (
          <AdminList 
            articles={articles} 
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        )}
        {subView === 'editor' && (
          <AdminEditor 
            articleForm={articleForm}
            setArticleForm={setArticleForm}
            editingId={editingId}
            onSave={handleSave}
            onBack={() => setSubView('list')}
            onPreview={() => setSubView('preview')}
          />
        )}
      </div>
      {subView === 'preview' && (
        <AdminPreview 
          article={articleForm}
          onBack={() => setSubView('editor')}
        />
      )}
    </div>
  );
};

const LoginView = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-700 rounded mx-auto flex items-center justify-center text-white font-black italic text-xl mb-4">N</div>
          <h2 className="text-2xl font-bold text-gray-800">Login Redaksi</h2>
          <p className="text-gray-500 text-sm mt-1">Masuk untuk mengelola konten berita</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>
          <button className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition border-none outline-none focus:outline-none">
            Masuk
          </button>
          <button type="button" onClick={onBack} className="w-full py-3 text-gray-500 text-sm hover:text-gray-800 bg-transparent border-none outline-none focus:outline-none">
            Kembali ke Beranda
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  const [view, setView] = useState('home'); 
  const [articles, setArticles] = useState(INITIAL_DATA);
  const [activeCategory, setActiveCategory] = useState("Terbaru");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter published articles for Home View
  const filteredArticles = activeCategory === "Terbaru" 
    ? articles.filter(a => a.status === 'published')
    : articles.filter(a => a.category === activeCategory && a.status === 'published');

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo(0, 0);
  };

  const handleLogin = (username, password) => {
    if (username === 'admin' && password === 'admin') {
      setIsAdmin(true);
      setView('admin');
    } else {
      alert("Gunakan username: 'admin' dan password: 'admin'");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView('home');
  };

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
      {view !== 'login' && view !== 'admin' && (
        <>
          <Navbar 
            isMenuOpen={isMenuOpen} 
            setIsMenuOpen={setIsMenuOpen} 
            setView={setView} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
            isAdmin={isAdmin}
          />
          <Ticker articles={articles} />
        </>
      )}

      {view === 'home' && (
        <HomeView 
          activeCategory={activeCategory} 
          filteredArticles={filteredArticles} 
          articles={articles} // Passing all articles for global trending
          onArticleClick={handleArticleClick} 
          setActiveCategory={setActiveCategory}
        />
      )}

      {view === 'article' && (
        <ArticleView 
          article={selectedArticle} 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'login' && (
        <LoginView 
          onLogin={handleLogin} 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'admin' && (
        <AdminView 
          articles={articles} 
          setArticles={setArticles} 
          onLogout={handleLogout}
        />
      )}

      {view !== 'login' && view !== 'admin' && (
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="container mx-auto px-4 max-w-5xl text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="text-2xl font-bold italic mb-4 md:mb-0">NUSANTARA<span className="text-orange-500">NEWS</span></div>
              <div className="flex gap-4 text-sm text-gray-400">
                <a href="#" className="hover:text-white">Tentang Kami</a>
                <a href="#" className="hover:text-white">Redaksi</a>
                <a href="#" className="hover:text-white">Pedoman Media Siber</a>
                <a href="#" className="hover:text-white">Kontak</a>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
              &copy; 2023 Nusantara News Portal. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}