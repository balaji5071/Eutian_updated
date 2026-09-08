import { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MediaItem, Lead as LeadType, Review as ReviewType, Prototype, Employee, EmployeeRole, BlogPost } from '@/shared/schema';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Star,
  Mail,
  Settings,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Edit3,
  Sprout,
  Sparkles,
  ExternalLink,
  BookOpen,
  FileText,
  PenTool,
  Menu,
  X,
  Check,
  Copy,
  Search,
  DollarSign,
  TrendingUp,
  LogOut,
  Eye,
  Image as ImageIcon,
  Video as VideoIcon,
  Layers,
  Tag,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Globe,
  IndianRupee,
  UserCheck,
  Briefcase,
  GraduationCap,
  Code2,
  Megaphone,
  UserPlus
} from 'lucide-react';

type LeadItem = Omit<LeadType, '_id' | 'createdAt'> & { id: string; createdAt: string };
type Proto = Omit<Prototype, '_id' | 'createdAt'> & { id: string; createdAt: string };
type ReviewItem = { id: string; name: string; email?: string; rating: number; message: string; status: 'visible' | 'hidden'; createdAt: string };
type BlogAdminItem = Omit<BlogPost, '_id' | 'createdAt'> & { id: string; createdAt: string };

async function fetchLeads(): Promise<LeadItem[]> {
  const res = await fetch('/api/leads');
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to fetch leads');
  return json.items as LeadItem[];
}

const USD_TO_INR = 85;

export default function AdminPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'leads' | 'prototypes' | 'employees' | 'reviews' | 'blogs' | 'templates' | 'settings'>('leads');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed' | 'won'>('all');
  const [refreshingLeads, setRefreshingLeads] = useState(false);
  const [refreshingProtos, setRefreshingProtos] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingEmployees, setIsSeedingEmployees] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  // Queries
  const { data: leadsData, isLoading: loadingLeads, isError: errorLeads, error: leadsErr } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
    refetchOnWindowFocus: false
  });

  const { data: protos, isLoading: loadingProtos } = useQuery({
    queryKey: ['prototypes'],
    queryFn: async () => {
      const r = await fetch('/api/prototypes');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch prototypes');
      return j.items as Proto[];
    },
  });

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const r = await fetch('/api/employees');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch employees');
      return j.items as Employee[];
    },
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews-admin'],
    queryFn: async () => {
      const r = await fetch('/api/reviews?all=1');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch reviews');
      return j.items as ReviewItem[];
    }
  });

  // Mutations
  const updateStatus = useMutation({
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

  const updateLeadDetails = useMutation({
    mutationFn: async ({ id, ...details }: { id: string; notes?: string; dealValue?: number; currency?: string; paymentStatus?: string; followUpDate?: string; source?: string }) => {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...details }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to update lead details');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      setEditingLead(null);
      showToast('Lead details saved!');
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

  // Employee Mutations
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

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Employee>) => {
      const r = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to update employee');
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      showToast('Employee profile updated');
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

  const handleSeedEmployees = async () => {
    setIsSeedingEmployees(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      if (data.ok) {
        await qc.invalidateQueries({ queryKey: ['employees'] });
        showToast('🌱 Sample team members (Sales, Marketing, Intern, Developer) created!');
      } else {
        alert(data.error || 'Failed to seed employees');
      }
    } catch (err: any) {
      alert(`Seeding employees failed: ${err.message}`);
    } finally {
      setIsSeedingEmployees(false);
    }
  };

  const createProto = useMutation({
    mutationFn: async (p: Omit<Proto, 'id' | 'createdAt'>) => {
      const r = await fetch('/api/prototypes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to create prototype');
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prototypes'] });
      setShowAddProtoForm(false);
      showToast('Prototype created successfully!');
    },
  });

  const updateProto = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Proto> }) => {
      const r = await fetch('/api/prototypes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to update prototype');
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prototypes'] });
      setEditProto(null);
      showToast('Prototype updated!');
    },
  });

  const deleteProto = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/prototypes?id=${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to delete');
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prototypes'] });
      showToast('Prototype deleted');
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to delete review');
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews-admin'] });
      showToast('Review deleted');
    },
  });

  const handleSeedPrototypes = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/prototypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      if (data.ok) {
        await qc.invalidateQueries({ queryKey: ['prototypes'] });
        showToast('🌱 High-quality prototype templates seeded successfully!');
      } else {
        alert(data.error || 'Failed to seed prototypes');
      }
    } catch (err: any) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // ============= BLOG MANAGEMENT STATE & MUTATIONS =============
  const [blogSearch, setBlogSearch] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isSeedingBlogs, setIsSeedingBlogs] = useState(false);
  const [showAddBlogForm, setShowAddBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    category: 'Web Development',
    coverImage: '',
    readingTime: '5 min read',
    authorName: 'Balaji',
    authorRole: 'Founder & CEO',
    excerpt: '',
    content: '',
    tags: 'Tech, Web Dev, Engineering',
    status: 'published' as 'published' | 'draft',
  });

  const { data: blogsData, isLoading: loadingBlogs } = useQuery<BlogAdminItem[]>({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs?admin=1');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch blogs');
      return json.items as BlogAdminItem[];
    },
  });
  const blogs = useMemo(() => blogsData ?? [], [blogsData]);

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

  const saveBlogMutation = useMutation({
    mutationFn: async (data: typeof blogForm) => {
      const isEdit = !!editingBlogId;
      const url = '/api/blogs';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit ? { id: editingBlogId, ...data } : data;
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
      showToast(editingBlogId ? 'Blog post updated successfully!' : 'Blog post created successfully!');
      setShowAddBlogForm(false);
      setEditingBlogId(null);
      setBlogForm({
        title: '',
        slug: '',
        category: 'Web Development',
        coverImage: '',
        readingTime: '5 min read',
        authorName: 'Balaji',
        authorRole: 'Founder & CEO',
        excerpt: '',
        content: '',
        tags: 'Tech, Web Dev, Engineering',
        status: 'published',
      });
    },
    onError: (err: any) => {
      alert(`Error saving blog: ${err.message}`);
    },
  });

  const toggleBlogStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'published' | 'draft' }) => {
      const res = await fetch('/api/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to toggle status');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      qc.invalidateQueries({ queryKey: ['public-blogs'] });
      showToast('Blog status updated!');
    },
    onError: (err: any) => {
      alert(`Failed to update status: ${err.message}`);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to delete blog post');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      qc.invalidateQueries({ queryKey: ['public-blogs'] });
      showToast('Blog post deleted.');
    },
    onError: (err: any) => {
      alert(`Failed to delete blog: ${err.message}`);
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
        showToast('🌱 Initial blog posts seeded successfully!');
      } else {
        alert(json.error || 'Failed to seed blogs');
      }
    } catch (err: any) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setIsSeedingBlogs(false);
    }
  };

  const leads = useMemo(() => leadsData ?? [], [leadsData]);
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
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
  }, [leads, leadStatusFilter, leadSearch]);

  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const closed = leads.filter(l => l.status === 'closed').length;
    const won = leads.filter(l => l.status === 'won').length;

    const paidLeads = leads.filter(l =>
      l.status === 'won' &&
      l.dealValue &&
      (l.paymentStatus === 'completed' || l.paymentStatus === 'payment-pending')
    );

    const indiaRevenueINR = paidLeads
      .filter(l => l.region === 'India' && (!l.currency || l.currency === 'INR'))
      .reduce((sum, l) => sum + (l.dealValue || 0), 0);

    const globalRevenueUSD = paidLeads
      .filter(l => l.region === 'Global' && l.currency === 'USD')
      .reduce((sum, l) => sum + (l.dealValue || 0), 0);

    const globalRevenueINR = globalRevenueUSD * USD_TO_INR;
    const totalRevenueINR = indiaRevenueINR + globalRevenueINR;

    const pendingValue = leads.filter(l =>
      (l.status === 'new' || l.status === 'contacted' || (l.status === 'won' && l.paymentStatus === 'in-progress')) &&
      l.dealValue
    ).reduce((sum, l) => {
      const value = l.dealValue || 0;
      return sum + (l.currency === 'USD' ? value * USD_TO_INR : value);
    }, 0);

    const protoCount = protos?.length || 0;
    const empCount = employees?.length || 0;
    const reviewCount = reviews?.length || 0;
    const blogCount = blogs?.length || 0;
    const publishedBlogCount = blogs?.filter(b => b.status === 'published').length || 0;
    const draftBlogCount = blogs?.filter(b => b.status === 'draft').length || 0;
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0';

    return {
      total,
      new: newCount,
      contacted,
      closed,
      won,
      indiaRevenueINR,
      globalRevenueUSD,
      globalRevenueINR,
      totalRevenueINR,
      pendingValue,
      protoCount,
      empCount,
      reviewCount,
      blogCount,
      publishedBlogCount,
      draftBlogCount,
      conversionRate
    };
  }, [leads, protos, employees, reviews, blogs]);

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Phone', 'WhatsApp', 'Plan', 'Website Type', 'Region', 'Status', 'Deal Value', 'Currency', 'Payment Status', 'Source', 'Message'];
    const rows = filteredLeads.map(l => [
      new Date(l.createdAt).toLocaleDateString(),
      l.name,
      l.email,
      l.phone || '',
      l.whatsapp || '',
      l.plan || '',
      l.websiteType || '',
      l.region,
      l.status,
      l.dealValue || '',
      l.currency || '',
      l.paymentStatus || '',
      l.source || '',
      l.message.replace(/,/g, ';').replace(/\n/g, ' ')
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eutian-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const bulkUpdateStatus = async (status: LeadItem['status']) => {
    for (const id of selectedLeads) {
      await updateStatus.mutateAsync({ id, status });
    }
    setSelectedLeads([]);
  };

  // Prototype Form
  const [showAddProtoForm, setShowAddProtoForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    media: [{ type: 'image' as 'image' | 'video', url: '', order: 0 }],
    category: 'SaaS',
    description: '',
    techStack: '',
    features: ''
  });
  const [editProto, setEditProto] = useState<null | Proto>(null);

  // Employee Form
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales' as EmployeeRole,
    department: '',
    notes: ''
  });

  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [leadDetails, setLeadDetails] = useState<{ notes: string; dealValue: string; currency: 'INR' | 'USD'; paymentStatus: string; followUpDate: string; source: string }>({
    notes: '',
    dealValue: '',
    currency: 'INR',
    paymentStatus: 'pending',
    followUpDate: '',
    source: ''
  });

  const emailTemplates = {
    pricing: {
      subject: 'Eutian Pricing Details & Project Proposal',
      body: `Hi {{name}},\n\nThank you for reaching out to Eutian!\n\nOur web design & development plans:\n\n⚡ Express Plan: ₹4,199 / $99 (24-72 hours delivery)\n💼 Standard Plan: ₹10,499 / $249 (3-5 days delivery)\n👑 Premium Plan: ₹20,999 / $499 (5-7 days delivery)\n\nAll plans include responsive UI, SEO optimization, speed enhancement, and dedicated post-launch support.\n\nBest regards,\nEutian Team\n+91 9346163673`
    },
    availability: {
      subject: 'Project Timeline & Availability — Eutian',
      body: `Hi {{name}},\n\nThank you for contacting us!\n\nWe currently have availability for new projects starting this week. Timelines:\n- Express: 2-3 days\n- Standard: 5-7 days\n- Custom: 10-14 days\n\nBest regards,\nEutian Team`
    },
    followup: {
      subject: 'Following up on your website inquiry',
      body: `Hi {{name}},\n\nFollowing up on your inquiry for {{plan}} package. We're ready whenever you are!\n\nBest regards,\nEutian Team`
    }
  };

  const [bannerSettings, setBannerSettings] = useState({
    title: "Special Offer",
    discount: '30% OFF',
    endDate: '2026-12-31T23:59:59',
    description: 'Elevate your online presence with Eutian custom web builds'
  });

  if (isAuthChecking) {
    return (
      <section className="min-h-screen bg-slate-950 text-white flex items-center justify-center py-20">
        <Head>
          <title>Admin Dashboard — Eutian</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-medium">Verifying admin session...</p>
        </div>
      </section>
    );
  }

  const navItems: {
    id: 'leads' | 'prototypes' | 'employees' | 'reviews' | 'blogs' | 'templates' | 'settings';
    label: string;
    icon: any;
    count?: number;
  }[] = [
    { id: 'leads', label: 'Leads & Inquiries', icon: Users, count: metrics.total },
    { id: 'blogs', label: 'Blog & Articles', icon: BookOpen, count: metrics.blogCount },
    { id: 'prototypes', label: 'Prototypes Gallery', icon: FolderKanban, count: metrics.protoCount },
    { id: 'employees', label: 'Employees & Team', icon: UserCheck, count: metrics.empCount },
    { id: 'reviews', label: 'Customer Reviews', icon: Star, count: metrics.reviewCount },
    { id: 'templates', label: 'Email Templates', icon: Mail },
    { id: 'settings', label: 'Offer Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans flex flex-col md:flex-row">
      <Head>
        <title>Admin Dashboard — Eutian</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top duration-300 border border-emerald-400/40 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-sm text-black shadow-md shadow-emerald-500/20">
            E
          </div>
          <span className="font-bold text-base text-white">Eutian Console</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-lg text-black">
              E
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">Eutian Console</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-medium text-emerald-400">Superadmin Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Navigation Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/5 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                data-testid={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                      isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-900/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/employee')}
            className="w-full justify-start bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs gap-2 h-9"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            Employee Portal Demo
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full justify-start bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs gap-2 h-9"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              View Public Site
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start bg-rose-950/40 border border-rose-800/30 text-rose-300 hover:bg-rose-900/60 text-xs gap-2 h-9"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-950 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight capitalize">
              {activeTab === 'blogs'
                ? 'Blog & Insights Manager'
                : activeTab === 'leads'
                ? 'Leads & Client Inquiries'
                : activeTab === 'prototypes'
                ? 'Prototypes Gallery'
                : activeTab === 'employees'
                ? 'Employees & Staff'
                : activeTab === 'reviews'
                ? 'Customer Reviews'
                : activeTab === 'templates'
                ? 'Email Templates'
                : 'Offer & Banner Settings'}
            </h2>
            <p className="text-xs text-slate-400">
              Eutian Management Console • Live Data
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={refreshingLeads}
              onClick={async () => {
                setRefreshingLeads(true);
                await qc.invalidateQueries();
                showToast('Refreshed all data!');
                setTimeout(() => setRefreshingLeads(false), 400);
              }}
              className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs gap-1.5 h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingLeads ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Analytics Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads</span>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{metrics.total}</span>
                <span className="text-xs text-slate-400">received</span>
              </div>
              <div className="mt-2 text-xs text-indigo-400/80 font-medium">
                {metrics.new} New • {metrics.won} Won Deals
              </div>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Team Staff</span>
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-300">{metrics.empCount}</span>
                <span className="text-xs text-slate-400">employees</span>
              </div>
              <div className="mt-2 text-xs text-purple-400 font-medium">
                Sales, Marketing, Interns & Devs
              </div>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-400">₹{metrics.totalRevenueINR.toLocaleString()}</span>
              </div>
              <div className="mt-2 text-xs text-emerald-400/80">
                IN: ₹{metrics.indiaRevenueINR.toLocaleString()} • Global: ${metrics.globalRevenueUSD}
              </div>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prototypes</span>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-300">{metrics.protoCount}</span>
                <span className="text-xs text-slate-400">active gallery</span>
              </div>
              <div className="mt-2 text-xs text-amber-400/80 font-medium">
                1-Click Seed Available
              </div>
            </Card>
          </section>

        {/* ================= TAB: EMPLOYEES MANAGEMENT ================= */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  Employee Directory & Role Access
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Create team accounts for Sales, Marketing, Interns, and Developers with dedicated role dashboards</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSeedEmployees}
                  disabled={isSeedingEmployees}
                  variant="outline"
                  className="bg-emerald-950/40 border-emerald-700/50 hover:bg-emerald-900/60 text-emerald-300 text-xs gap-1.5"
                >
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  {isSeedingEmployees ? 'Seeding...' : 'Seed Sample Team'}
                </Button>

                <Button
                  onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  <UserPlus className="w-4 h-4" />
                  {showAddEmployeeForm ? 'Close Form' : 'Add Employee'}
                </Button>
              </div>
            </div>

            {/* Create Employee Form */}
            {showAddEmployeeForm && (
              <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-white">Create New Employee Account</h3>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setShowAddEmployeeForm(false)}>✕</Button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createEmployeeMutation.mutate({
                      name: employeeForm.name,
                      email: employeeForm.email,
                      password: employeeForm.password,
                      role: employeeForm.role,
                      department: employeeForm.department || `${employeeForm.role.toUpperCase()} Department`,
                      notes: employeeForm.notes,
                      status: 'active',
                    });
                  }}
                  className="space-y-4 text-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                      <Input
                        value={employeeForm.name}
                        onChange={e => setEmployeeForm(s => ({ ...s, name: e.target.value }))}
                        placeholder="e.g. Sarah Connor"
                        className="bg-slate-950 border-slate-800 text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Work Email</label>
                      <Input
                        type="email"
                        value={employeeForm.email}
                        onChange={e => setEmployeeForm(s => ({ ...s, email: e.target.value }))}
                        placeholder="e.g. sarah@eutian.com"
                        className="bg-slate-950 border-slate-800 text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Login Password</label>
                      <Input
                        type="password"
                        value={employeeForm.password}
                        onChange={e => setEmployeeForm(s => ({ ...s, password: e.target.value }))}
                        placeholder="••••••••"
                        className="bg-slate-950 border-slate-800 text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Role Permission</label>
                      <Select
                        value={employeeForm.role}
                        onValueChange={(v: EmployeeRole) => setEmployeeForm(s => ({ ...s, role: v }))}
                      >
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          <SelectItem value="sales">💼 Sales Executive</SelectItem>
                          <SelectItem value="marketing">📢 Marketing Lead</SelectItem>
                          <SelectItem value="intern">🎓 Junior Intern</SelectItem>
                          <SelectItem value="developer">🛠️ Developer</SelectItem>
                          <SelectItem value="admin">👑 Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Department</label>
                      <Input
                        value={employeeForm.department}
                        onChange={e => setEmployeeForm(s => ({ ...s, department: e.target.value }))}
                        placeholder="e.g. Business Development"
                        className="bg-slate-950 border-slate-800 text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Notes / Instructions</label>
                    <Input
                      value={employeeForm.notes}
                      onChange={e => setEmployeeForm(s => ({ ...s, notes: e.target.value }))}
                      placeholder="e.g. Responsible for high-ticket client onboarding"
                      className="bg-slate-950 border-slate-800 text-slate-100"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={createEmployeeMutation.isPending} className="bg-purple-600 hover:bg-purple-500 text-white font-medium">
                      {createEmployeeMutation.isPending ? 'Creating Account...' : 'Create Employee Account'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Employees Grid */}
            {loadingEmployees ? (
              <div className="py-12 text-center text-slate-400">Loading team members...</div>
            ) : !employees || employees.length === 0 ? (
              <Card className="bg-slate-900/60 border-slate-800 py-16 text-center text-slate-400 rounded-2xl">
                <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-base font-semibold text-slate-300">No Employees Found</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Seed sample accounts for Sales, Marketing, Intern, & Dev roles with 1 click</p>
                <Button onClick={handleSeedEmployees} disabled={isSeedingEmployees} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-2">
                  <Sprout className="w-4 h-4" />
                  Seed Sample Team Accounts
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {employees.map((emp) => (
                  <Card key={emp.id} className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-200">
                          {emp.name.charAt(0)}
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                          emp.role === 'sales' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                          emp.role === 'marketing' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                          emp.role === 'intern' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                          emp.role === 'developer' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' :
                          'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}>
                          {emp.role.toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-base">{emp.name}</h3>
                        <p className="text-xs text-indigo-400">{emp.email}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{emp.department}</p>
                      </div>

                      {emp.notes && (
                        <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          {emp.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className={`flex items-center gap-1.5 font-medium ${emp.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                        {emp.status === 'active' ? 'Active' : 'Inactive'}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300"
                          onClick={() => {
                            const newStatus = emp.status === 'active' ? 'inactive' : 'active';
                            updateEmployeeMutation.mutate({ id: emp.id!, status: newStatus });
                          }}
                        >
                          Toggle Status
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-[11px] bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:bg-rose-900"
                          onClick={() => {
                            if (confirm(`Remove employee ${emp.name}?`)) {
                              deleteEmployeeMutation.mutate(emp.id!);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <Input
                    placeholder="Search by name, email, phone or message..."
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    className="pl-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 rounded-xl"
                  />
                </div>

                <Select onValueChange={v => setLeadStatusFilter(v as any)} defaultValue={leadStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-slate-950/60 border-slate-800 text-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">🆕 New</SelectItem>
                    <SelectItem value="contacted">💬 Contacted</SelectItem>
                    <SelectItem value="won">🎉 Won Deals</SelectItem>
                    <SelectItem value="closed">❌ Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={exportToCSV} variant="outline" className="bg-slate-950/80 border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            {loadingLeads && <div className="py-12 text-center text-slate-400">Loading inquiries...</div>}

            {filteredLeads.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Plan / Type</th>
                      <th className="py-3 px-4">Region</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLeads.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                          {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-100">
                          {l.name}
                          {l.dealValue && (
                            <div className="text-xs text-emerald-400 font-mono mt-0.5">
                              {l.currency === 'USD' ? '$' : '₹'}{l.dealValue.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 space-y-1">
                          <a href={`mailto:${l.email}`} className="text-indigo-400 hover:underline block text-xs">
                            {l.email}
                          </a>
                          {l.phone && <div className="text-xs text-slate-400">{l.phone}</div>}
                        </td>
                        <td className="py-4 px-4 space-y-1">
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                            {l.plan || 'Custom'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-300">
                          {l.region === 'India' ? '🇮🇳 India' : '🌐 Global'}
                        </td>
                        <td className="py-4 px-4 max-w-[280px]">
                          <p className="text-xs text-slate-300 line-clamp-2">{l.message}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Select onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v as LeadItem['status'] })} defaultValue={l.status}>
                            <SelectTrigger className={`w-[130px] h-8 text-xs font-medium rounded-lg border-0 ${
                              l.status === 'new' ? 'bg-amber-500/20 text-amber-300' :
                              l.status === 'contacted' ? 'bg-blue-500/20 text-blue-300' :
                              l.status === 'won' ? 'bg-emerald-500/20 text-emerald-300' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                              <SelectItem value="new">🆕 New</SelectItem>
                              <SelectItem value="contacted">💬 Contacted</SelectItem>
                              <SelectItem value="won">🎉 Won</SelectItem>
                              <SelectItem value="closed">❌ Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 bg-slate-950 border-slate-700 hover:bg-slate-800 text-slate-300"
                            onClick={() => {
                              setEditingLead(l);
                              setLeadDetails({
                                notes: l.notes || '',
                                dealValue: l.dealValue?.toString() || '',
                                currency: l.currency || (l.region === 'India' ? 'INR' : 'USD'),
                                paymentStatus: l.paymentStatus || 'pending',
                                followUpDate: l.followUpDate || '',
                                source: l.source || ''
                              });
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* PROTOTYPES TAB */}
        {activeTab === 'prototypes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-indigo-400" />
                  Prototypes Showcase Gallery
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSeedPrototypes} disabled={isSeeding} variant="outline" className="bg-emerald-950/40 border-emerald-700/50 text-emerald-300 text-xs gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-400" /> Seed Sample Prototypes
                </Button>
                <Button onClick={() => setShowAddProtoForm(!showAddProtoForm)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5">
                  <Plus className="w-4 h-4" /> {showAddProtoForm ? 'Close' : 'Create Prototype'}
                </Button>
              </div>
            </div>

            {protos && protos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {protos.map((p) => (
                  <Card key={p.id} className="bg-slate-900/70 border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-base">{p.title}</h3>
                      <span className="text-xs text-indigo-400 bg-slate-950 px-2 py-0.5 rounded-full">{p.category}</span>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3">{p.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Customer Reviews</h2>
            {reviews && reviews.map(r => (
              <div key={r.id} className="py-3 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">{r.name}</span> ({r.rating}/5)
                  <p className="text-xs text-slate-400">{r.message}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteReview.mutate(r.id)}>Delete</Button>
              </div>
            ))}
          </Card>
        )}

        {/* ================= TAB: BLOGS & ARTICLES MANAGEMENT ================= */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  Blog & Insights Manager
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish articles, write drafts, edit existing posts, and control visibility.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <Button
                  onClick={handleSeedBlogs}
                  disabled={isSeedingBlogs}
                  variant="outline"
                  className="bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/50 text-xs gap-1.5"
                  data-testid="btn-seed-blogs"
                >
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  {isSeedingBlogs ? 'Seeding...' : 'Seed Sample Articles'}
                </Button>

                <Button
                  onClick={() => {
                    setEditingBlogId(null);
                    setBlogForm({
                      title: '',
                      slug: '',
                      category: 'Web Development',
                      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                      readingTime: '5 min read',
                      authorName: 'Balaji',
                      authorRole: 'Founder & CEO',
                      excerpt: '',
                      content: '',
                      tags: 'Tech, Web Dev, Engineering',
                      status: 'published',
                    });
                    setShowAddBlogForm(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
                  data-testid="btn-new-blog"
                >
                  <Plus className="w-4 h-4" />
                  Create New Article
                </Button>
              </div>
            </div>

            {/* Quick Metrics & Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 flex items-center gap-2">
                <div className="flex-1 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Posts</p>
                  <p className="text-xl font-bold text-white mt-0.5">{metrics.blogCount}</p>
                </div>
                <div className="flex-1 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
                  <p className="text-[11px] text-emerald-400 uppercase font-semibold">Published</p>
                  <p className="text-xl font-bold text-emerald-300 mt-0.5">{metrics.publishedBlogCount}</p>
                </div>
                <div className="flex-1 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
                  <p className="text-[11px] text-amber-400 uppercase font-semibold">Drafts</p>
                  <p className="text-xl font-bold text-amber-300 mt-0.5">{metrics.draftBlogCount}</p>
                </div>
              </div>

              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search articles by title, slug, excerpt, or tags..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  className="bg-slate-900/70 border-slate-800 pl-9 text-slate-200 text-xs h-11 rounded-xl"
                  data-testid="input-admin-blog-search"
                />
              </div>

              <div className="md:col-span-3">
                <Select
                  value={blogStatusFilter}
                  onValueChange={(val: any) => setBlogStatusFilter(val)}
                >
                  <SelectTrigger className="bg-slate-900/70 border-slate-800 text-slate-200 text-xs h-11 rounded-xl">
                    <SelectValue placeholder="Status: All" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="all">All Articles ({metrics.blogCount})</SelectItem>
                    <SelectItem value="published">Published Only ({metrics.publishedBlogCount})</SelectItem>
                    <SelectItem value="draft">Drafts Only ({metrics.draftBlogCount})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Create / Edit Article Modal */}
            {showAddBlogForm && (
              <Card className="bg-slate-900/90 border-slate-700/80 p-6 rounded-2xl shadow-2xl relative animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-lg text-white">
                      {editingBlogId ? 'Edit Article' : 'Write New Article'}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddBlogForm(false);
                      setEditingBlogId(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveBlogMutation.mutate(blogForm);
                  }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Title *
                      </label>
                      <Input
                        required
                        placeholder="e.g. How Generative AI is Reshaping Web Development"
                        value={blogForm.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setBlogForm((prev) => ({
                            ...prev,
                            title: newTitle,
                            slug: !editingBlogId && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/[\s\W-]+/g, '-'))
                              ? newTitle.toLowerCase().trim().replace(/[\s\W-]+/g, '-')
                              : prev.slug,
                          }));
                        }}
                        className="bg-slate-950 border-slate-800 text-white text-sm"
                        data-testid="input-blog-form-title"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Slug (URL Identifier) *
                      </label>
                      <Input
                        required
                        placeholder="e.g. how-generative-ai-reshaping-web-development"
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-slate-300 text-sm font-mono"
                        data-testid="input-blog-form-slug"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Category
                      </label>
                      <Input
                        placeholder="e.g. Web Development, AI, SaaS"
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Reading Time
                      </label>
                      <Input
                        placeholder="e.g. 5 min read"
                        value={blogForm.readingTime}
                        onChange={(e) => setBlogForm({ ...blogForm, readingTime: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Publication Status *
                      </label>
                      <Select
                        value={blogForm.status}
                        onValueChange={(val: 'published' | 'draft') => setBlogForm({ ...blogForm, status: val })}
                      >
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="published">🚀 Published (Live to Public)</SelectItem>
                          <SelectItem value="draft">📝 Draft (Hidden, In Progress)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Cover Image URL
                      </label>
                      <Input
                        placeholder="https://images.unsplash.com/photo-..."
                        value={blogForm.coverImage}
                        onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-white text-sm"
                      />
                      {blogForm.coverImage && (
                        <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-slate-800 bg-black/40">
                          <img
                            src={blogForm.coverImage}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Author Name & Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Author Name (e.g. Balaji)"
                            value={blogForm.authorName}
                            onChange={(e) => setBlogForm({ ...blogForm, authorName: e.target.value })}
                            className="bg-slate-950 border-slate-800 text-white text-xs"
                          />
                          <Input
                            placeholder="Role (e.g. Founder & CEO)"
                            value={blogForm.authorRole}
                            onChange={(e) => setBlogForm({ ...blogForm, authorRole: e.target.value })}
                            className="bg-slate-950 border-slate-800 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Tags (comma-separated)
                        </label>
                        <Input
                          placeholder="AI, Full-Stack, Next.js, Architecture"
                          value={blogForm.tags}
                          onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                          className="bg-slate-950 border-slate-800 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Excerpt / Summary *
                    </label>
                    <Textarea
                      required
                      rows={2}
                      placeholder="A short, catchy summary that appears on blog cards and search results..."
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Full Article Content (Markdown supported) *
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Supports # H1, ## H2, ### H3, ```code```, &gt; quote, - bullet list
                      </span>
                    </div>
                    <Textarea
                      required
                      rows={12}
                      placeholder="Write your article body here in markdown...&#10;&#10;## Introduction&#10;Explain the problem...&#10;&#10;```typescript&#10;const code = 'example';&#10;```"
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-sm font-mono"
                      data-testid="textarea-blog-form-content"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowAddBlogForm(false);
                        setEditingBlogId(null);
                      }}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={saveBlogMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6"
                      data-testid="btn-submit-blog"
                    >
                      {saveBlogMutation.isPending ? 'Saving...' : editingBlogId ? 'Update Article' : blogForm.status === 'published' ? 'Publish Article 🚀' : 'Save as Draft 📝'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Articles List / Grid */}
            {loadingBlogs ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-xs">Loading articles...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <Card className="bg-slate-900/60 border-slate-800 py-16 text-center text-slate-400 rounded-2xl">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
                <p className="text-base font-semibold text-slate-300">No Articles Found</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  {blogSearch ? `No posts matched "${blogSearch}"` : 'Get started by creating an article or seeding initial posts.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={handleSeedBlogs}
                    disabled={isSeedingBlogs}
                    variant="outline"
                    className="bg-emerald-950/40 border-emerald-700/50 text-emerald-300 text-xs gap-1.5"
                  >
                    <Sprout className="w-4 h-4 text-emerald-400" />
                    Seed Sample Articles
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingBlogId(null);
                      setShowAddBlogForm(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Write Article
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((post) => (
                  <Card
                    key={post.id}
                    className="bg-slate-900/70 border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl space-y-4 relative group hover:border-slate-700 transition-colors"
                    data-testid={`admin-blog-card-${post.slug}`}
                  >
                    <div className="space-y-3">
                      {/* Image Preview & Status Badge */}
                      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-md ${
                              post.status === 'published'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                post.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                            />
                            {post.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-slate-300 backdrop-blur-md">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Title & Slug */}
                      <div>
                        <h3 className="font-bold text-white text-base line-clamp-2 hover:text-indigo-400 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          /blog/{post.slug}
                        </p>
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Author & Read Time */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <span>By {post.author?.name || 'Balaji'}</span>
                        <span>{post.readingTime || '5 min read'}</span>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-7 text-[11px] px-2.5 rounded-lg ${
                            post.status === 'published'
                              ? 'bg-amber-950/40 border-amber-800/40 text-amber-300 hover:bg-amber-900/60'
                              : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60'
                          }`}
                          onClick={() => {
                            const newStatus = post.status === 'published' ? 'draft' : 'published';
                            toggleBlogStatusMutation.mutate({ id: post.id!, status: newStatus });
                          }}
                          data-testid={`btn-toggle-status-${post.slug}`}
                        >
                          {post.status === 'published' ? 'Unpublish (Draft)' : 'Publish Live'}
                        </Button>

                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 px-2 flex items-center text-[11px] bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg gap-1"
                            title="View live article"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg"
                          onClick={() => {
                            setEditingBlogId(post.id!);
                            setBlogForm({
                              title: post.title,
                              slug: post.slug,
                              category: post.category || 'Web Development',
                              coverImage: post.coverImage || '',
                              readingTime: post.readingTime || '5 min read',
                              authorName: post.author?.name || 'Balaji',
                              authorRole: post.author?.role || 'Founder & CEO',
                              excerpt: post.excerpt || '',
                              content: post.content || '',
                              tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
                              status: post.status || 'published',
                            });
                            setShowAddBlogForm(true);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          data-testid={`btn-edit-blog-${post.slug}`}
                        >
                          <Edit3 className="w-3 h-3 mr-1" /> Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 w-7 p-0 bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900 rounded-lg"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                              deleteBlogMutation.mutate(post.id!);
                            }
                          }}
                          data-testid={`btn-delete-blog-${post.slug}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(emailTemplates).map(([k, t]) => (
              <Card key={k} className="bg-slate-900/70 border-slate-800 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-white capitalize">{k} Template</h3>
                <pre className="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 whitespace-pre-wrap">{t.body}</pre>
              </Card>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Offer Banner Settings</h2>
            <Input value={bannerSettings.title} onChange={e => setBannerSettings({ ...bannerSettings, title: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" />
            <Input value={bannerSettings.discount} onChange={e => setBannerSettings({ ...bannerSettings, discount: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" />
          </Card>
        )}

        </main>
      </div>
    </div>
  );
}
