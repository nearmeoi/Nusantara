import fs from 'fs';
import path from 'path';

const appCode = `import React, { useState, useRef } from 'react';
import { 
  Menu, Search, User, Clock, Share2, ChevronRight, ChevronLeft,
  Home, TrendingUp, Grid, X, LogIn, Edit3, Trash2, 
  CheckCircle, PlusCircle, Sparkles, Volume2, StopCircle, Loader2, 
  MessageSquare, Send, Wand2, BarChart3, Settings, LogOut, AlertCircle, 
  CheckCircle2, Info, Eye, FileText, Bookmark
} from 'lucide-react';

// ==================== DATA ====================

const INITIAL_DATA = [
  { id: 1, title: "Presiden Resmikan Infrastruktur Digital di Kalimantan", slug: "presiden-resmikan-infrastruktur", category: "Nasional", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop", author: "Budi Santoso", published: "2023-10-25T08:30:00", content: "Kalimantan kini memiliki pusat data nasional baru yang diresmikan langsung oleh Presiden pagi ini...", views: 1540, status: "published" },
  { id: 2, title: "Timnas Garuda Raih Kemenangan Dramatis", slug: "timnas-garuda-menang", category: "Olahraga", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop", author: "Dimas Anggara", published: "2023-10-24T20:15:00", content: "Pertandingan sengit terjadi di Stadion Utama Gelora Bung Karno tadi malam...", views: 8900, status: "published" },
  { id: 3, title: "IHSG Diprediksi Menguat", slug: "ihsg-menguat", category: "Ekonomi", image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=800&auto=format&fit=crop", author: "Siti Aminah", published: "2023-10-25T09:00:00", content: "Indeks Harga Saham Gabungan (IHSG) dibuka di zona hijau...", views: 3200, status: "published" }
];

const CATEGORIES = ["Terbaru", "Nasional", "Olahraga", "Ekonomi", "Teknologi", "Gaya Hidup"];

// ==================== HELPERS ====================

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

const validateArticle = (article) => {
  const errors = {};
  if (!article.title?.trim()) errors.title = 'Judul wajib diisi';
  if (article.title?.length > 150) errors.title = 'Judul maksimal 150 karakter';
  if (!article.category) errors.category = 'Kategori wajib dipilih';
  if (!article.content?.trim()) errors.content = 'Konten wajib diisi';
  if (article.content?.length < 100) errors.content = 'Konten minimal 100 karakter';
  if (article.content?.length > 5000) errors.content = 'Konten maksimal 5000 karakter';
  return errors;
};

// ==================== TOAST ====================

const Toast = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
    {toasts.map(toast => {
      const bgColor = toast.type === 'success' ? 'bg-green-50 border-green-200' : toast.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
      const Icon = toast.type === 'success' ? CheckCircle2 : AlertCircle;
      return (
        <div key={toast.id} className={\`\${bgColor} border pointer-events-auto rounded-lg p-4 flex items-start gap-3 shadow-lg max-w-sm\`}>
          <Icon size={20} className="text-gray-600" />
          <div className="flex-1"><p className="text-gray-800 font-medium text-sm">{toast.message}</p></div>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      );
    })}
  </div>
);

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, addToast, removeToast };
};

// ==================== COMPONENTS ====================

const Navbar = ({ isMenuOpen, setIsMenuOpen, isAdmin, setView }) => (
  <nav className="bg-white shadow-sm sticky top-0 z-50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="text-xl sm:text-2xl font-bold italic">NUSANTARA<span className="text-orange-500">NEWS</span></div>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm">
        <a href="#" className="hover:text-blue-600 transition">Akun</a>
        <a href="#" className="hover:text-blue-600 transition">Bookmark</a>
        {isAdmin && <button onClick={() => setView('admin')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Admin</button>}
      </div>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden"><Menu size={24} /></button>
    </div>
  </nav>
);

const Ticker = () => (
  <div className="bg-red-600 text-white py-2 px-4 flex items-center gap-3">
    <span className="flex-shrink-0 bg-red-800 px-3 py-1 rounded font-bold text-sm">Info</span>
    <div className="text-sm">Selamat datang di Nusantara News Portal</div>
  </div>
);

const HomeView = ({ activeCategory, setActiveCategory, articles, handleArticleClick }) => (
  <main className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {articles.map(article => (
          <div key={article.id} onClick={() => handleArticleClick(article)} className="flex gap-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition">
            <img src={article.image} className="w-40 h-32 object-cover rounded" />
            <div className="flex-1 p-3 flex flex-col justify-between">
              <h3 className="font-bold line-clamp-2">{article.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{article.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="bg-white rounded-lg shadow p-6 h-fit">
        <h3 className="font-bold mb-4">Terpopuler</h3>
        <div className="space-y-3">
          {articles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3).map((article, idx) => (
            <div key={article.id} className="flex gap-2 pb-3 border-b">
              <span className="text-lg font-bold text-gray-300">{idx + 1}</span>
              <div><p className="text-sm font-medium line-clamp-1">{article.title}</p></div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  </main>
);

const AdminView = ({ setView, articles, setArticles }) => {
  const [currentView, setCurrentView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', summary: '', content: '', image: '', status: 'draft' });
  const [formErrors, setFormErrors] = useState({});
  const { toasts, addToast, removeToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleNewArticle = () => {
    setForm({ title: '', category: '', summary: '', content: '', image: '', status: 'draft' });
    setEditingId(null);
    setFormErrors({});
    setCurrentView('edit');
  };

  const handleEditArticle = (article) => {
    setForm(article);
    setEditingId(article.id);
    setFormErrors({});
    setCurrentView('edit');
  };

  const handlePreviewArticle = () => {
    const errors = validateArticle(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Mohon lengkapi field wajib', 'error');
      return;
    }
    setFormErrors({});
    setPreviewArticle({ ...form, id: editingId || Math.max(0, ...articles.map(a => a.id)) + 1 });
    setCurrentView('preview');
  };

  const handleSaveArticle = () => {
    const errors = validateArticle(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Mohon lengkapi field wajib', 'error');
      return;
    }

    if (editingId) {
      const updated = articles.map(a => a.id === editingId ? { ...form, id: editingId, published: new Date().toISOString(), status: 'published' } : a);
      setArticles(updated);
      addToast('Artikel berhasil diperbarui & dipublikasikan', 'success');
    } else {
      const newArticle = { ...form, id: Math.max(0, ...articles.map(a => a.id)) + 1, published: new Date().toISOString(), author: 'Admin', views: 0, status: 'published' };
      setArticles([newArticle, ...articles]);
      addToast('Artikel berhasil diterbitkan', 'success');
    }

    setForm({ title: '', category: '', summary: '', content: '', image: '', status: 'draft' });
    setEditingId(null);
    setCurrentView('list');
  };

  const handleSaveDraft = () => {
    if (!form.title.trim()) {
      addToast('Judul tidak boleh kosong untuk menyimpan draft', 'warning');
      return;
    }

    if (editingId) {
      const updated = articles.map(a => a.id === editingId ? { ...form, id: editingId, status: 'draft' } : a);
      setArticles(updated);
      addToast('Draft berhasil disimpan', 'success');
    } else {
      const newDraft = { ...form, id: Math.max(0, ...articles.map(a => a.id)) + 1, published: new Date().toISOString(), author: 'Admin', views: 0, status: 'draft' };
      setArticles([newDraft, ...articles]);
      addToast('Draft berhasil dibuat', 'success');
    }

    setForm({ title: '', category: '', summary: '', content: '', image: '', status: 'draft' });
    setEditingId(null);
    setCurrentView('list');
  };

  const handleCancel = () => {
    setForm({ title: '', category: '', summary: '', content: '', image: '', status: 'draft' });
    setEditingId(null);
    setFormErrors({});
    setCurrentView('list');
  };

  const handleDelete = (id) => {
    setArticles(articles.filter(a => a.id !== id));
    setShowDeleteConfirm(null);
    addToast('Artikel berhasil dihapus', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">A</div>
              <h1 className="hidden sm:block font-bold text-gray-900">Panel Redaksi</h1>
            </div>
            <button onClick={() => setView('home')} className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-xs sm:text-sm px-2 py-1.5 rounded">
              <LogOut size={16} /> <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl">
        {/* LIST VIEW */}
        {currentView === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-2xl font-bold">Daftar Artikel</h2>
              <button onClick={handleNewArticle} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded font-medium text-xs hover:bg-blue-700">
                <PlusCircle size={16} /> <span className="hidden sm:inline">Tulis Baru</span>
              </button>
            </div>

            {/* Table */}
            <div className="hidden lg:block bg-white border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Judul</th>
                    <th className="px-4 py-3 font-semibold">Kategori</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {articles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 line-clamp-1">{article.title}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{article.category}</span></td>
                      <td className="px-4 py-3"><span className={\`px-2 py-1 rounded text-xs font-bold \${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}\`}>{article.status === 'published' ? 'Terbit' : 'Draft'}</span></td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button onClick={() => handleEditArticle(article)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded inline-block"><Edit3 size={16} /></button>
                        <button onClick={() => {setPreviewArticle(article); setCurrentView('preview');}} className="text-green-600 hover:bg-green-50 p-1.5 rounded inline-block"><Eye size={16} /></button>
                        <button onClick={() => setShowDeleteConfirm(article.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded inline-block"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards */}
            <div className="lg:hidden space-y-2">
              {articles.map(article => (
                <div key={article.id} className="bg-white border p-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-semibold text-sm line-clamp-2 flex-1">{article.title}</h4>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleEditArticle(article)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => {setPreviewArticle(article); setCurrentView('preview');}} className="text-green-600 p-1 hover:bg-green-50 rounded"><Eye size={14} /></button>
                      <button onClick={() => setShowDeleteConfirm(article.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">{article.category}</span>
                    <span className={\`px-2 py-0.5 rounded font-bold \${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}\`}>{article.status === 'published' ? 'Terbit' : 'Draft'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT VIEW */}
        {currentView === 'edit' && (
          <div className="bg-white border p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold mb-6">{editingId ? 'Edit Artikel' : 'Buat Artikel Baru'}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Judul *</label>
                <input type="text" maxLength="150" value={form.title} onChange={e => {setForm({...form, title: e.target.value}); if(formErrors.title) setFormErrors({...formErrors, title: null});}} className={\`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none \${formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'}\`} />
                {formErrors.title && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={12} />{formErrors.title}</div>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Kategori *</label>
                <select value={form.category} onChange={e => {setForm({...form, category: e.target.value}); if(formErrors.category) setFormErrors({...formErrors, category: null});}} className={\`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none \${formErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'}\`}>
                  <option value="">Pilih Kategori</option>
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {formErrors.category && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={12} />{formErrors.category}</div>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Ringkasan (Opsional)</label>
                <textarea maxLength="300" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} placeholder="Ringkasan singkat artikel" className="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20" />
                <p className="text-xs text-gray-500 mt-1">{form.summary.length}/300</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Isi Artikel *</label>
                <textarea maxLength="5000" value={form.content} onChange={e => {setForm({...form, content: e.target.value}); if(formErrors.content) setFormErrors({...formErrors, content: null});}} className={\`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-40 \${formErrors.content ? 'border-red-500 bg-red-50' : 'border-gray-300'}\`} />
                {formErrors.content && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={12} />{formErrors.content}</div>}
                <p className="text-xs text-gray-500 mt-1">{form.content.length}/5000</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Featured Image URL (Opsional)</label>
                <input type="url" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button onClick={handleSaveDraft} className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 text-sm">Simpan Draft</button>
                <button onClick={handlePreviewArticle} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 text-sm">Preview</button>
                <button onClick={handleSaveArticle} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-sm">Terbitkan</button>
                <button onClick={handleCancel} className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 text-sm">Batal</button>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW VIEW */}
        {currentView === 'preview' && previewArticle && (
          <div className="space-y-6">
            <article className="bg-white border p-4 sm:p-8">
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{previewArticle.category}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-3">{previewArticle.title}</h1>
                <div className="text-sm text-gray-600">
                  <p>Penulis: <strong>{previewArticle.author || 'Admin'}</strong></p>
                </div>
              </div>

              {previewArticle.image && (
                <div className="w-full aspect-video rounded mb-6 bg-gray-100 overflow-hidden">
                  <img src={previewArticle.image} alt={previewArticle.title} className="w-full h-full object-cover" />
                </div>
              )}

              {previewArticle.summary && (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 mb-6">
                  <p className="text-blue-900 text-sm"><strong>Ringkasan:</strong> {previewArticle.summary}</p>
                </div>
              )}

              <div className="prose prose-sm max-w-none text-gray-800">
                <p className="whitespace-pre-wrap leading-relaxed">{previewArticle.content}</p>
              </div>
            </article>

            <div className="flex gap-2 justify-center">
              <button onClick={() => setCurrentView('edit')} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-sm flex items-center gap-2">
                <Edit3 size={16} /> Edit
              </button>
              {editingId && form.id === editingId && (
                <button onClick={handleSaveArticle} className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} /> Terbitkan
                </button>
              )}
              <button onClick={() => setCurrentView('list')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 text-sm">Kembali</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded shadow-lg max-w-sm w-full p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <h3 className="text-lg font-bold">Hapus Artikel?</h3>
            </div>
            <p className="text-sm text-gray-600">Tindakan tidak dapat dibatalkan.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-3 py-2 bg-gray-200 rounded font-medium hover:bg-gray-300 text-sm">Batal</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 text-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN APP ====================

export default function App() {
  const [view, setView] = useState('home');
  const [articles, setArticles] = useState(INITIAL_DATA);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(INITIAL_DATA[0]);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setView('article');
  };

  return (
    <div className="bg-white">
      {view !== 'admin' && <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isAdmin={isAdmin} setView={setView} />}
      {view !== 'admin' && <Ticker />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'home' && <HomeView activeCategory="Terbaru" setActiveCategory={() => {}} articles={articles} handleArticleClick={handleArticleClick} />}
        {view === 'article' && <div className="max-w-4xl mx-auto"><h1 className="text-4xl font-bold mb-4">{selectedArticle.title}</h1><img src={selectedArticle.image} className="w-full h-96 object-cover rounded-lg mb-8" /><div className="prose max-w-none"><p className="text-gray-800 leading-relaxed">{selectedArticle.content}</p></div></div>}
        {view === 'admin' && <AdminView setView={setView} articles={articles} setArticles={setArticles} />}
      </div>

      {view !== 'admin' && (
        <footer className="bg-gray-900 text-gray-200 mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-sm">
            &copy; 2023 Nusantara News. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'App.jsx'), appCode, 'utf-8');
console.log('✓ App.jsx created successfully');
