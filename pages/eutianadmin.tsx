import { useMemo, useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lead as LeadType, Review as ReviewType, Prototype, Employee, EmployeeRole, BlogPost } from '@/shared/schema';
import {
  LayoutGrid,
  Mail,
  Settings,
  BookOpen,
  FileText,
  Plus,
  Users,
  FolderKanban,
  Star,
  Download,
  Upload,
  Eye,
  LogOut,
  Globe,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Search,
  CheckCircle2,
  XCircle,
  Sprout,
  UserCheck,
  UserPlus,
  Trash2,
  Edit3,
  ExternalLink,
  Menu,
  X,
  SlidersHorizontal,
  AlignLeft,
  Lock,
  Target,
  Image as ImageIcon,
  Share2,
  Languages,
  PenTool,
  Check
} from 'lucide-react';

type LeadItem = Omit<LeadType, '_id' | 'createdAt'> & { id: string; createdAt: string };
type Proto = Omit<Prototype, '_id' | 'createdAt'> & { id: string; createdAt: string };
type ReviewItem = { id: string; name: string; email?: string; rating: number; message: string; status: 'visible' | 'hidden'; createdAt: string };
type BlogAdminItem = Omit<BlogPost, '_id' | 'createdAt'> & { id: string; createdAt: string };

const USD_TO_INR = 85;

export default function AdminPage() {
  const router = useRouter();
  const qc = useQueryClient();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inquiries' | 'posts' | 'employees' | 'prototypes' | 'reviews' | 'settings'>('posts');
  const [postsMenuExpanded, setPostsMenuExpanded] = useState(true);
  const [postsSubTab, setPostsSubTab] = useState<'all' | 'create'>('all');
  const [createPostEditorTab, setCreatePostEditorTab] = useState<'settings' | 'social' | 'i18n' | 'write'>('settings');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // General State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Verification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' });
        if (!res.ok) {
          router.replace('/admin-login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/admin-login');
        return;
      }
      setIsAuthChecking(false);
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.replace('/admin-login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.replace('/admin-login');
    }
  };

  // ================= QUERIES =================
  const { data: leadsData = [], isLoading: loadingLeads } = useQuery<LeadItem[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch leads');
      return json.items as LeadItem[];
    },
    refetchOnWindowFocus: false,
  });

  const { data: protos = [] } = useQuery<Proto[]>({
    queryKey: ['prototypes'],
    queryFn: async () => {
      const r = await fetch('/api/prototypes');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch prototypes');
      return j.items as Proto[];
    },
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const r = await fetch('/api/employees');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch employees');
      return j.items as Employee[];
    },
  });

  const { data: reviews = [] } = useQuery<ReviewItem[]>({
    queryKey: ['reviews-admin'],
    queryFn: async () => {
      const r = await fetch('/api/reviews?all=1');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch reviews');
      return j.items as ReviewItem[];
    },
  });

  const { data: blogs = [], isLoading: loadingBlogs } = useQuery<BlogAdminItem[]>({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs?admin=1');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch blogs');
      return json.items as BlogAdminItem[];
    },
  });

  // ================= POSTS & POST FORM STATE =================
  const [blogSearch, setBlogSearch] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isSeedingBlogs, setIsSeedingBlogs] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Post Editor Detailed Form State (Matching Reference)
  const [postForm, setPostForm] = useState({
    title: '',
    targetKeyword: '',
    slug: '',
    metaDescription: '',
    coverImage: '',
    altText: '',
    category: 'Engineering',
    authorName: 'Eutian Team',
    authorRole: 'Tech & Architecture',
    publishDate: new Date().toISOString().split('T')[0],
    tags: '',
    canonicalUrl: '',
    isFeatured: false,
    isNoIndex: false,
    isDraft: true,
    content: '',
    readingTime: '5 min read',
    // Social media fields
    ogTitle: '',
    ogDescription: '',
    // i18n
    locale: 'en',
  });

  // Calculate SEO metrics live based on inputs
  const seoChecklist = useMemo(() => {
    const kw = postForm.targetKeyword.trim().toLowerCase();
    const title = postForm.title.trim().toLowerCase();
    const meta = postForm.metaDescription.trim();
    const alt = postForm.altText.trim();
    const content = postForm.content.toLowerCase();

    const hasKwInTitle = kw.length > 0 && title.includes(kw);
    const metaLengthOk = meta.length >= 80 && meta.length <= 160;
    const altLengthOk = alt.length >= 20;
    const titleLengthOk = title.length >= 30 && title.length <= 70;
    const hasKwInMeta = kw.length > 0 && meta.toLowerCase().includes(kw);

    // Calculate density
    let keywordDensity = 0;
    if (kw.length > 0 && content.length > 0) {
      const words = content.split(/\s+/).filter(Boolean);
      const kwOccurrences = (content.match(new RegExp(kw, 'gi')) || []).length;
      if (words.length > 0) {
        keywordDensity = Number(((kwOccurrences / words.length) * 100).toFixed(1));
      }
    }

    let score = 0;
    if (hasKwInTitle) score += 30;
    if (metaLengthOk) score += 25;
    else if (meta.length > 0) score += 10;
    if (altLengthOk) score += 20;
    else if (alt.length > 0) score += 5;
    if (titleLengthOk) score += 15;
    if (hasKwInMeta) score += 10;

    return {
      score: Math.min(100, Math.max(0, score)),
      hasKwInTitle,
      metaLengthOk,
      metaLength: meta.length,
      altLengthOk,
      altLength: alt.length,
      keywordDensity,
      status: score >= 80 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Needs Work',
    };
  }, [postForm]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      if (blogStatusFilter !== 'all' && b.status !== blogStatusFilter) return false;
      if (blogSearch) {
        const q = blogSearch.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.slug?.toLowerCase().includes(q) ||
          b.excerpt?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [blogs, blogStatusFilter, blogSearch]);

  // Save Mutation
  const saveBlogMutation = useMutation({
    mutationFn: async (data: typeof postForm) => {
      const isEdit = !!editingBlogId;
      const url = '/api/blogs';
      const method = isEdit ? 'PATCH' : 'POST';

      const payload = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category: data.category || 'Engineering',
        coverImage: data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        readingTime: data.readingTime || '5 min read',
        authorName: data.authorName || 'Balaji',
        authorRole: data.authorRole || 'Founder & CEO',
        excerpt: data.metaDescription || data.title,
        content: data.content || `## ${data.title}\n\nStart writing your thoughts here...`,
        tags: data.tags,
        status: data.isDraft ? 'draft' : 'published',
      };

      const body = isEdit ? { id: editingBlogId, ...payload } : payload;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to save blog post');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      qc.invalidateQueries({ queryKey: ['public-blogs'] });
      showToast(editingBlogId ? 'Post updated successfully!' : 'Post published successfully!');
      setPostsSubTab('all');
      setEditingBlogId(null);
    },
    onError: (err: any) => {
      alert(`Error saving post: ${err.message}`);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to delete post');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      qc.invalidateQueries({ queryKey: ['public-blogs'] });
      showToast('Post deleted successfully');
    },
    onError: (err: any) => {
      alert(`Failed to delete: ${err.message}`);
    },
  });

  const handleSeedBlogs = async () => {
    setIsSeedingBlogs(true);
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const json = await res.json();
      if (json.ok) {
        await qc.invalidateQueries({ queryKey: ['admin-blogs'] });
        await qc.invalidateQueries({ queryKey: ['public-blogs'] });
        showToast('Sample posts loaded successfully!');
      } else {
        alert(json.error || 'Failed to seed posts');
      }
    } catch (err: any) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setIsSeedingBlogs(false);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!blogs || blogs.length === 0) {
      alert('No posts available to export.');
      return;
    }
    const cleanData = blogs.map(({ id, ...rest }) => rest);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eutian-posts-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported posts as JSON!');
  };

  // Import JSON
  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      let count = 0;
      for (const item of items) {
        if (!item.title || !item.content) continue;
        await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: item.category || 'Engineering',
            coverImage: item.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            readingTime: item.readingTime || '5 min read',
            authorName: item.authorName || item.author?.name || 'Balaji',
            authorRole: item.authorRole || item.author?.role || 'Founder & CEO',
            excerpt: item.excerpt || item.title,
            content: item.content,
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || 'Tech',
            status: item.status || 'published',
          }),
        });
        count++;
      }

      await qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      await qc.invalidateQueries({ queryKey: ['public-blogs'] });
      showToast(`Successfully imported ${count} post${count === 1 ? '' : 's'}!`);
    } catch (err: any) {
      alert(`JSON import failed: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Cover Image Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPostForm((prev) => ({ ...prev, coverImage: result }));
        showToast('Cover image loaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Create Mode
  const handleStartCreate = () => {
    setEditingBlogId(null);
    setPostForm({
      title: '',
      targetKeyword: '',
      slug: '',
      metaDescription: '',
      coverImage: '',
      altText: '',
      category: 'Artificial Intelligence',
      authorName: 'Eutian Team',
      authorRole: 'Tech & Architecture',
      publishDate: new Date().toISOString().split('T')[0],
      tags: '',
      canonicalUrl: '',
      isFeatured: false,
      isNoIndex: false,
      isDraft: true,
      content: '',
      readingTime: '5 min read',
      ogTitle: '',
      ogDescription: '',
      locale: 'en',
    });
    setPostsSubTab('create');
  };

  // Open Edit Mode
  const handleStartEdit = (post: BlogAdminItem) => {
    setEditingBlogId(post.id);
    setPostForm({
      title: post.title,
      targetKeyword: Array.isArray(post.tags) && post.tags.length > 0 ? post.tags[0] : '',
      slug: post.slug,
      metaDescription: post.excerpt || '',
      coverImage: post.coverImage || '',
      altText: post.title,
      category: post.category || 'Engineering',
      authorName: post.author?.name || 'Balaji',
      authorRole: post.author?.role || 'Founder & CEO',
      publishDate: post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      canonicalUrl: '',
      isFeatured: false,
      isNoIndex: false,
      isDraft: post.status === 'draft',
      content: post.content || '',
      readingTime: post.readingTime || '5 min read',
      ogTitle: post.title,
      ogDescription: post.excerpt || '',
      locale: 'en',
    });
    setPostsSubTab('create');
  };

  // ================= INQUIRIES STATE =================
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed' | 'won'>('all');

  const filteredLeads = useMemo(() => {
    return leadsData.filter((l) => {
      if (leadStatusFilter !== 'all' && l.status !== leadStatusFilter) return false;
      if (leadSearch) {
        const q = leadSearch.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.phone && l.phone.toLowerCase().includes(q)) ||
          (l.message && l.message.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [leadsData, leadStatusFilter, leadSearch]);

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadItem['status'] }) => {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to update lead');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      showToast('Lead status updated!');
    },
  });

  const removeLead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to delete');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      showToast('Lead deleted');
    },
  });

  // ================= EMPLOYEES STATE =================
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales' as EmployeeRole,
    department: '',
    notes: '',
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (empData: Partial<Employee>) => {
      const r = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empData),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to create employee');
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      setShowAddEmployeeForm(false);
      setEmployeeForm({ name: '', email: '', password: '', role: 'sales', department: '', notes: '' });
      showToast('Employee account created!');
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to delete employee');
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      showToast('Employee removed');
    },
  });

  const metrics = useMemo(() => {
    const total = leadsData.length;
    const newCount = leadsData.filter((l) => l.status === 'new').length;
    return {
      total,
      new: newCount,
      postCount: blogs.length,
      publishedCount: blogs.filter((b) => b.status === 'published').length,
      empCount: employees.length,
      protoCount: protos.length,
      reviewCount: reviews.length,
    };
  }, [leadsData, blogs, employees, protos, reviews]);

  if (isAuthChecking) {
    return (
      <section className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center py-20 font-sans">
        <Head>
          <title>Admin Portal — Eutian</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Verifying admin session...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      <Head>
        <title>{postsSubTab === 'create' ? 'Create New Post — Admin Portal' : 'Posts — Admin Portal'}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      <input type="file" ref={coverImageInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs font-medium animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
            EU
          </div>
          <span className="font-bold text-sm text-slate-900">Admin Portal</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 hover:text-slate-900 h-8 w-8 p-0"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* ================= LEFT SIDEBAR (Matching Reference 1:1) ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 md:sticky md:top-0 md:h-screen ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-extrabold text-xs tracking-wider shadow-sm">
              EU
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">Admin Portal</span>
          </div>

          {/* Nav List */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Dashboard */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            {/* Inquiries */}
            <button
              onClick={() => {
                setActiveTab('inquiries');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'inquiries'
                  ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Inquiries</span>
              </div>
              {metrics.new > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 text-indigo-700">
                  {metrics.new}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>

            {/* Posts (Collapsible Accordion) */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setActiveTab('posts');
                  setPostsMenuExpanded(!postsMenuExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${activeTab === 'posts' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Posts</span>
                </div>
                {postsMenuExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {postsMenuExpanded && (
                <div className="mt-1 ml-4 pl-3 border-l border-slate-200/70 space-y-1">
                  {/* All Posts */}
                  <button
                    onClick={() => {
                      setActiveTab('posts');
                      setPostsSubTab('all');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeTab === 'posts' && postsSubTab === 'all'
                        ? 'bg-indigo-50/90 text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>All Posts</span>
                  </button>

                  {/* Create Post */}
                  <button
                    onClick={() => {
                      setActiveTab('posts');
                      handleStartCreate();
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeTab === 'posts' && postsSubTab === 'create'
                        ? 'bg-indigo-50/90 text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Post</span>
                  </button>
                </div>
              )}
            </div>

            {/* Additional Modules */}
            <div className="pt-2">
              <p className="px-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Management
              </p>

              {/* Employees */}
              <button
                onClick={() => {
                  setActiveTab('employees');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'employees'
                    ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Employees</span>
              </button>

              {/* Prototypes */}
              <button
                onClick={() => {
                  setActiveTab('prototypes');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'prototypes'
                    ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <span>Prototypes</span>
              </button>

              {/* Reviews */}
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Star className="w-4 h-4 text-slate-400" />
                <span>Reviews</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Bottom: Admin Profile Card & Actions */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                <img
                  src="/images/balaji.png"
                  alt="Admin User"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">Balaji Ch</p>
                <p className="text-[11px] text-slate-400 truncate">Superadmin</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>View Blog</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 sm:px-10 py-8 max-w-7xl mx-auto w-full">
        {/* ================= POSTS: CREATE / EDIT VIEW (Matching Reference 1:1) ================= */}
        {activeTab === 'posts' && postsSubTab === 'create' && (
          <div className="space-y-6 pb-24 animate-in fade-in-50 duration-200">
            {/* Header with Back Arrow */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPostsSubTab('all')}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
                title="Back to Posts"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {editingBlogId ? 'Edit Post' : 'Create New Post'}
              </h1>
            </div>

            {/* Sub Tabs Navigation */}
            <div className="flex items-center gap-8 border-b border-slate-200/80 text-xs font-semibold text-slate-500 overflow-x-auto pb-0.5">
              <button
                onClick={() => setCreatePostEditorTab('settings')}
                className={`pb-3 transition-colors relative whitespace-nowrap ${
                  createPostEditorTab === 'settings'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                    : 'hover:text-slate-800'
                }`}
              >
                Settings & SEO
              </button>

              <button
                onClick={() => setCreatePostEditorTab('social')}
                className={`pb-3 transition-colors relative whitespace-nowrap ${
                  createPostEditorTab === 'social'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                    : 'hover:text-slate-800'
                }`}
              >
                Social Media Optimization
              </button>

              <button
                onClick={() => setCreatePostEditorTab('i18n')}
                className={`pb-3 transition-colors relative whitespace-nowrap ${
                  createPostEditorTab === 'i18n'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                    : 'hover:text-slate-800'
                }`}
              >
                Internationalization
              </button>

              <button
                onClick={() => setCreatePostEditorTab('write')}
                className={`pb-3 transition-colors relative whitespace-nowrap ${
                  createPostEditorTab === 'write'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                    : 'hover:text-slate-800'
                }`}
              >
                Write Post
              </button>
            </div>

            {/* TAB CONTENT: SETTINGS & SEO */}
            {createPostEditorTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Post Details & Cover Media (Span 7) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card 1: Post Details */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                    <h2 className="text-sm font-bold text-slate-900">Post Details</h2>

                    {/* Post Title */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Post Title *
                      </label>
                      <Input
                        placeholder="Enter an engaging title..."
                        value={postForm.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setPostForm((prev) => ({
                            ...prev,
                            title,
                            slug: !editingBlogId
                              ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                              : prev.slug,
                          }));
                        }}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
                      />
                    </div>

                    {/* Target Keyword & URL Slug */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                          <Target className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target Keyword</span>
                        </div>
                        <Input
                          placeholder="e.g. Generative AI"
                          value={postForm.targetKeyword}
                          onChange={(e) => setPostForm({ ...postForm, targetKeyword: e.target.value })}
                          className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                          <span>URL Slug *</span>
                          <Lock className="w-3 h-3 text-slate-400" />
                        </div>
                        <Input
                          placeholder="the-future-of-ai"
                          value={postForm.slug}
                          onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-700 font-mono text-xs h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                        <span>Meta Description *</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {postForm.metaDescription.length}/160
                        </span>
                      </div>
                      <Textarea
                        rows={3}
                        placeholder="A brief summary for SEO and post previews..."
                        value={postForm.metaDescription}
                        onChange={(e) => setPostForm({ ...postForm, metaDescription: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 text-xs rounded-xl resize-none"
                      />
                    </div>
                  </div>

                  {/* Card 2: Cover Media */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                    <h2 className="text-sm font-bold text-slate-900">Cover Media</h2>

                    {/* Upload / Dropzone Box */}
                    <div
                      onClick={() => coverImageInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 rounded-2xl p-6 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-5 text-center sm:text-left group"
                    >
                      {postForm.coverImage ? (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={postForm.coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                            Click to replace image
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">No file uploaded</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Click or drag an image to upload. Max 10MB. JPG, PNG, WEBP.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Direct Image URL input */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">
                        Or provide Cover Image URL:
                      </label>
                      <Input
                        placeholder="https://images.unsplash.com/..."
                        value={postForm.coverImage}
                        onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })}
                        className="bg-white border-slate-200 text-slate-700 text-xs h-8.5 rounded-lg"
                      />
                    </div>

                    {/* Alt Text */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Alt Text *
                      </label>
                      <Input
                        placeholder="Describe the image for screen readers..."
                        value={postForm.altText}
                        onChange={(e) => setPostForm({ ...postForm, altText: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
                      />
                      {postForm.altText.length < 20 && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          Alt text must be descriptive and at least 20 characters.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: SEO Assistant & Taxonomy (Span 5) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Card 1: On-Page SEO Assistant */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
                    <h2 className="text-sm font-bold text-slate-900">On-Page SEO Assistant</h2>

                    {/* Circular Score Meter */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={
                              seoChecklist.score >= 80
                                ? 'text-emerald-500'
                                : seoChecklist.score >= 50
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }
                            strokeDasharray={`${seoChecklist.score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-lg font-bold text-slate-900">
                          {seoChecklist.score}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Overall Score
                        </p>
                        <p
                          className={`text-sm font-bold ${
                            seoChecklist.score >= 80
                              ? 'text-emerald-600'
                              : seoChecklist.score >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {seoChecklist.status}
                        </p>
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Checklist
                      </p>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          {seoChecklist.hasKwInTitle ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          )}
                          <span className={seoChecklist.hasKwInTitle ? 'text-slate-700' : 'text-slate-500'}>
                            Target Keyword in Title
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {seoChecklist.metaLengthOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          )}
                          <span className={seoChecklist.metaLengthOk ? 'text-slate-700' : 'text-slate-500'}>
                            Meta Description Length ({seoChecklist.metaLength} chars)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {seoChecklist.altLengthOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          )}
                          <span className={seoChecklist.altLengthOk ? 'text-slate-700' : 'text-slate-500'}>
                            Alt Text length ({seoChecklist.altLength} chars)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Keyword Density */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Keyword Density</span>
                        <span className="font-bold text-slate-800">{seoChecklist.keywordDensity}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Aim for 1.5% - 2.5% for better ranking.</p>
                    </div>

                    {/* Google SERP Preview */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Google SERP Preview
                      </p>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                            E
                          </span>
                          <span className="truncate">https://eutian.com &gt; blog &gt; {postForm.slug || 'slug'}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-blue-700 line-clamp-1 hover:underline cursor-pointer">
                          {postForm.title || 'Post Title Preview'}
                        </h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {postForm.metaDescription || 'Meta description preview will appear here once you start typing...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Taxonomy & Settings */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                    <h2 className="text-sm font-bold text-slate-900">Taxonomy & Settings</h2>

                    {/* Category */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">Category</label>
                      <Select
                        value={postForm.category}
                        onValueChange={(val) => setPostForm({ ...postForm, category: val })}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900 text-xs">
                          <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Author */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">Author</label>
                      <Select
                        value={postForm.authorName}
                        onValueChange={(val) => setPostForm({ ...postForm, authorName: val })}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900 text-xs">
                          <SelectItem value="Balaji">Balaji (Founder & CEO)</SelectItem>
                          <SelectItem value="Srikar">Srikar (Co-Founder & COO)</SelectItem>
                          <SelectItem value="Eutian Team">Eutian Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Publish Date */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">Publish Date</label>
                      <Input
                        type="date"
                        value={postForm.publishDate}
                        onChange={(e) => setPostForm({ ...postForm, publishDate: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tags</label>
                      <Input
                        placeholder="Add a tag and press Enter..."
                        value={postForm.tags}
                        onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">Canonical URL</label>
                      <Input
                        placeholder="Leave blank to default to post URL"
                        value={postForm.canonicalUrl}
                        onChange={(e) => setPostForm({ ...postForm, canonicalUrl: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
                      />
                    </div>

                    {/* Switches */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {/* Featured Post */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Featured Post</span>
                        <button
                          type="button"
                          onClick={() => setPostForm({ ...postForm, isFeatured: !postForm.isFeatured })}
                          className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                            postForm.isFeatured ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <div
                            className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                              postForm.isFeatured ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Do Not Index */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Do Not Index (noindex)</span>
                        <button
                          type="button"
                          onClick={() => setPostForm({ ...postForm, isNoIndex: !postForm.isNoIndex })}
                          className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                            postForm.isNoIndex ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <div
                            className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                              postForm.isNoIndex ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Save as Draft */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Save as Draft</span>
                        <button
                          type="button"
                          onClick={() => setPostForm({ ...postForm, isDraft: !postForm.isDraft })}
                          className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                            postForm.isDraft ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <div
                            className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                              postForm.isDraft ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WRITE POST */}
            {createPostEditorTab === 'write' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Article Content (Markdown Supported)</h3>
                    <p className="text-xs text-slate-500">
                      Write your post using standard Markdown (# H1, ## H2, ```code```, bullet lists, blockquotes).
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {postForm.content.split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>

                <Textarea
                  rows={20}
                  placeholder={`# ${postForm.title || 'Your Engaging Title'}&#10;&#10;Write the introduction here...&#10;&#10;## Key Architecture Concepts&#10;Explain the architectural foundation...&#10;&#10;\`\`\`typescript&#10;const example = 'Next.js 14';&#10;\`\`\``}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="bg-white border-slate-200 text-slate-900 text-xs font-mono rounded-xl leading-relaxed resize-y"
                />
              </div>
            )}

            {/* TAB CONTENT: SOCIAL MEDIA */}
            {createPostEditorTab === 'social' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 max-w-3xl">
                <h3 className="font-bold text-sm text-slate-900">Social Media & OpenGraph Preview</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">OG Title</label>
                    <Input
                      placeholder={postForm.title || 'Enter social share title'}
                      value={postForm.ogTitle}
                      onChange={(e) => setPostForm({ ...postForm, ogTitle: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">OG Description</label>
                    <Textarea
                      rows={2}
                      placeholder={postForm.metaDescription || 'Enter social preview description'}
                      value={postForm.ogDescription}
                      onChange={(e) => setPostForm({ ...postForm, ogDescription: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: I18N */}
            {createPostEditorTab === 'i18n' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 max-w-xl">
                <h3 className="font-bold text-sm text-slate-900">Internationalization</h3>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Locale Language</label>
                  <Select value={postForm.locale} onValueChange={(val) => setPostForm({ ...postForm, locale: val })}>
                    <SelectTrigger className="bg-white border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-xs">
                      <SelectItem value="en">English (en-US)</SelectItem>
                      <SelectItem value="es">Spanish (es-ES)</SelectItem>
                      <SelectItem value="hi">Hindi (hi-IN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ================= FLOATING ACTION PILL (Matching Reference 1:1) ================= */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200/90 shadow-2xl rounded-full px-5 py-2 flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPostsSubTab('all')}
                className="text-slate-600 hover:text-slate-900 text-xs font-semibold h-8.5 px-4 rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={saveBlogMutation.isPending || !postForm.title}
                onClick={() => saveBlogMutation.mutate(postForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8.5 px-5 rounded-full shadow-md transition-all"
              >
                {saveBlogMutation.isPending
                  ? 'Saving...'
                  : editingBlogId
                  ? 'Save Changes'
                  : postForm.isDraft
                  ? 'Save Draft'
                  : 'Save Post'}
              </Button>
            </div>
          </div>
        )}

        {/* ================= POSTS: ALL POSTS TABLE VIEW ================= */}
        {activeTab === 'posts' && postsSubTab === 'all' && (
          <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Posts</h1>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {blogs.length === 0 && (
                  <Button
                    onClick={handleSeedBlogs}
                    disabled={isSeedingBlogs}
                    variant="outline"
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs gap-1.5 h-9"
                  >
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                    {isSeedingBlogs ? 'Seeding...' : 'Seed Sample Articles'}
                  </Button>
                )}

                <Button
                  onClick={handleImportJSONClick}
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-4 py-2 rounded-xl shadow-xs gap-1.5 h-9"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Import JSON
                </Button>

                <Button
                  onClick={handleExportJSON}
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-4 py-2 rounded-xl shadow-xs gap-1.5 h-9"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Export JSON
                </Button>

                <Button
                  onClick={handleStartCreate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm gap-1.5 h-9"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + New Post
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search posts..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  className="bg-white border-slate-200 pl-8.5 text-slate-900 text-xs h-9 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={blogStatusFilter} onValueChange={(val: any) => setBlogStatusFilter(val)}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-700 text-xs h-9 rounded-xl w-36">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800 text-xs">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {loadingBlogs ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading posts...
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600 text-sm">No posts found</p>
                  <p className="text-slate-400 mt-1">Create your first post or seed initial samples.</p>
                  <Button onClick={handleSeedBlogs} disabled={isSeedingBlogs} variant="outline" className="mt-4 text-xs font-semibold h-8 rounded-lg">
                    Seed Sample Posts
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 text-xs font-medium">
                        <th className="py-3.5 px-6 font-semibold">Title</th>
                        <th className="py-3.5 px-6 font-semibold">Status</th>
                        <th className="py-3.5 px-6 font-semibold">Category</th>
                        <th className="py-3.5 px-6 font-semibold">Date</th>
                        <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredBlogs.map((post) => {
                        const dateFormatted = post.createdAt
                          ? new Date(post.createdAt).toISOString().split('T')[0]
                          : '2026-09-08';

                        return (
                          <tr key={post.id} className="hover:bg-slate-50/70 transition-colors group">
                            <td className="py-4 px-6 max-w-md">
                              <div
                                onClick={() => handleStartEdit(post)}
                                className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1 text-sm"
                              >
                                {post.title}
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                                /blog/{post.slug}
                              </p>
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              {post.status === 'published' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200/60">
                                  Draft
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-normal">
                              {post.category || 'Engineering'}
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap text-slate-500 font-normal">
                              {dateFormatted}
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-3">
                                <a
                                  href={`/blog/${post.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-slate-600 transition-colors"
                                  title="View Live"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  onClick={() => handleStartEdit(post)}
                                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                                      deleteBlogMutation.mutate(post.id!);
                                    }
                                  }}
                                  className="text-rose-600 hover:text-rose-800 font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Total Inquiries</span>
                  <Mail className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.total}</p>
                <p className="text-xs text-indigo-600 mt-1 font-medium">{metrics.new} new</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Total Posts</span>
                  <FileText className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.postCount}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">{metrics.publishedCount} published live</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Team Staff</span>
                  <UserCheck className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.empCount}</p>
                <p className="text-xs text-slate-500 mt-1">Sales, Marketing & Devs</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Prototypes</span>
                  <FolderKanban className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.protoCount}</p>
                <p className="text-xs text-slate-500 mt-1">Active gallery</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: INQUIRIES ================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inquiries</h1>
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-xs font-medium">
                      <th className="py-3.5 px-6 font-semibold">Client Name</th>
                      <th className="py-3.5 px-6 font-semibold">Contact</th>
                      <th className="py-3.5 px-6 font-semibold">Status</th>
                      <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {lead.name}
                          <p className="text-[11px] text-slate-400 font-normal line-clamp-1">{lead.message}</p>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <p>{lead.email}</p>
                          <p className="text-[11px] text-slate-400">{lead.phone}</p>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus.mutate({ id: lead.id, status: e.target.value as any })}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="won">Won Deal</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => removeLead.mutate(lead.id)}
                            className="text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: EMPLOYEES ================= */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Employees</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-slate-100 text-slate-700">
                      {emp.role}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">{emp.name}</h4>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-medium">● Active</span>
                    <button
                      onClick={() => deleteEmployeeMutation.mutate(emp.id!)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: PROTOTYPES ================= */}
        {activeTab === 'prototypes' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prototypes</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {protos.map((proto) => (
                <div key={proto.id} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5 space-y-2">
                  <span className="text-[10px] font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {proto.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{proto.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-3">{proto.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Reviews</h1>
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {rev.name} <span className="text-amber-500 font-normal">{'★'.repeat(rev.rating)}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{rev.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Platform Settings</h3>
              <p className="text-xs text-slate-500">Configure global admin variables and notification preferences.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
