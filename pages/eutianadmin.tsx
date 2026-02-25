import { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MediaItem, Lead as LeadType, Review as ReviewType, Prototype } from '@/shared/schema';

// Frontend-friendly types (string id instead of ObjectId, string dates)
type LeadItem = Omit<LeadType, '_id' | 'createdAt'> & { id: string; createdAt: string };
type Proto = Omit<Prototype, '_id' | 'createdAt'> & { id: string; createdAt: string };

async function fetchLeads(): Promise<LeadItem[]> {
  const res = await fetch('/api/leads');
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to fetch leads');
  return json.items as LeadItem[];
}

const USD_TO_INR = 85; // Conversion rate

export default function AdminPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'leads' | 'prototypes' | 'reviews' | 'templates' | 'settings'>('leads');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed' | 'won'>('all');
  const [refreshingLeads, setRefreshingLeads] = useState(false);
  const [refreshingProtos, setRefreshingProtos] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Client-side authentication check
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

  const { data, isLoading, isError, error } = useQuery({ queryKey: ['leads'], queryFn: fetchLeads, refetchOnWindowFocus: false });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadItem['status'] }) => {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
    });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to update');
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
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
    },
  });

  const removeLead = useMutation({
      mutationFn: async (id: string) => {
      const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to delete');
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
});

  const leads = useMemo(() => data ?? [], [data]);
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (leadStatusFilter !== 'all' && l.status !== leadStatusFilter) return false;
      if (leadSearch) {
        const q = leadSearch.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, leadStatusFilter, leadSearch]);

  // Prototypes (load before computing metrics that depend on them)
  const { data: protos, isLoading: loadingProtos } = useQuery({
      queryKey: ['prototypes'],
      queryFn: async () => {
      const r = await fetch('/api/prototypes');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch prototypes');
      return j.items as Proto[];
    },
  });

  
  const createProto = useMutation({
      mutationFn: async (p: Omit<Proto, 'id' | 'createdAt'>) => {
      const r = await fetch('/api/prototypes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to create');
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prototypes'] }),
});
  const updateProto = useMutation({
      mutationFn: async ({ id, updates }: { id: string; updates: Partial<Proto> }) => {
      const r = await fetch('/api/prototypes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to update');
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prototypes'] }),
});
  const deleteProto = useMutation({
      mutationFn: async (id: string) => {
      const r = await fetch(`/api/prototypes?id=${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to delete');
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prototypes'] }),
  });

  // Reviews (admin)
  type ReviewItem = { id: string; name: string; email?: string; rating: number; message: string; status: 'visible'|'hidden'; createdAt: string };
  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews-admin'],
    queryFn: async () => {
      const r = await fetch('/api/reviews?all=1');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch reviews');
      return j.items as ReviewItem[];
    }
  });
  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to delete review');
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews-admin'] }),
  });

  // CSV Export
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

  // Bulk Actions
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const bulkUpdateStatus = async (status: LeadItem['status']) => {
    for (const id of selectedLeads) {
      await updateStatus.mutateAsync({ id, status });
    }
    setSelectedLeads([]);
  };

  // Metrics (moved below reviews to avoid TDZ ReferenceError)
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const closed = leads.filter(l => l.status === 'closed').length;
    const won = leads.filter(l => l.status === 'won').length;
    
    // Revenue only counts for completed or payment-pending projects
    const paidLeads = leads.filter(l => 
      l.status === 'won' && 
      l.dealValue && 
      (l.paymentStatus === 'completed' || l.paymentStatus === 'payment-pending')
    );
    
    // Separate India (INR) and Global (USD) revenue
    const indiaRevenueINR = paidLeads
      .filter(l => l.region === 'India' && (!l.currency || l.currency === 'INR'))
      .reduce((sum, l) => sum + (l.dealValue || 0), 0);
    
    const globalRevenueUSD = paidLeads
      .filter(l => l.region === 'Global' && l.currency === 'USD')
      .reduce((sum, l) => sum + (l.dealValue || 0), 0);
    
    const globalRevenueINR = globalRevenueUSD * USD_TO_INR;
    
    const totalRevenueINR = indiaRevenueINR + globalRevenueINR;
    
    // Pipeline: projects in progress or pending
    const pendingValue = leads.filter(l => 
      (l.status === 'new' || l.status === 'contacted' || (l.status === 'won' && l.paymentStatus === 'in-progress')) && 
      l.dealValue
    ).reduce((sum, l) => {
      const value = l.dealValue || 0;
      return sum + (l.currency === 'USD' ? value * USD_TO_INR : value);
    }, 0);
    
    const protoCount = protos?.length || 0;
    const reviewCount = (reviews?.length) || 0;
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
      reviewCount, 
      conversionRate 
    };
  }, [leads, protos, reviews]);

  const [form, setForm] = useState({ 
    title: '', 
    media: [{ type: 'image' as 'image' | 'video', url: '', order: 0 }], 
    category: 'SaaS', 
    description: '', 
    techStack: '', 
    features: '' 
  });
  const [editProto, setEditProto] = useState<null | Proto>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [uploadFileInfo, setUploadFileInfo] = useState<Record<number, { name: string; size: string }>>({});

  // Handle file upload to Cloudinary
  const handleFileUpload = async (file: File, index: number) => {
    setUploadingIndex(index);
    setUploadProgress(prev => ({ ...prev, [index]: 0 }));
    
    // Store file info
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadFileInfo(prev => ({ 
      ...prev, 
      [index]: { name: file.name, size: `${sizeInMB} MB` } 
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({ ...prev, [index]: percent }));
        }
      });

      const uploadPromise = new Promise<{ url: string; type: 'image' | 'video' }>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.ok) {
              resolve({ url: response.url, type: response.type });
            } else {
              reject(new Error(response.error || 'Upload failed'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      const { url, type } = await uploadPromise;
      
      setForm(s => ({
        ...s,
        media: s.media.map((m, i) => i === index ? { ...m, url, type } : m)
      }));
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingIndex(null);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[index];
        return newProgress;
      });
      setUploadFileInfo(prev => {
        const newInfo = { ...prev };
        delete newInfo[index];
        return newInfo;
      });
    }
  };

  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [leadDetails, setLeadDetails] = useState<{ notes: string; dealValue: string; currency: 'INR' | 'USD'; paymentStatus: string; followUpDate: string; source: string }>({ 
    notes: '', 
    dealValue: '', 
    currency: 'INR',
    paymentStatus: 'pending',
    followUpDate: '', 
    source: '' 
  });

  // Email Templates
  const emailTemplates = {
    pricing: {
      subject: 'Eutian Pricing Details',
      body: `Hi {{name}},\n\nThank you for your interest in Eutian!\n\nOur pricing plans:\n\n🎓 Student Capstone: ₹1,299 (perfect for academic projects)\n⚡ Express Plan: ₹4,199 (3-5 pages, 1 week delivery)\n💼 Standard Plan: ₹10,499 (5-10 pages, 2 weeks delivery)\n👑 Premium Plan: ₹20,999 (10+ pages, full features)\n\nAll plans include responsive design, SEO optimization, and 30 days support.\n\n💝 Valentine's Day Special: 30% OFF until Feb 14, 2026! Spread the love with amazing web design.\n\nLet me know if you have questions.\n\nBest regards,\nEutian Team\n+91 9515760775`
    },
    availability: {
      subject: 'Project Timeline & Availability',
      body: `Hi {{name}},\n\nThank you for reaching out!\n\nWe currently have availability for new projects starting next week. Based on your requirements, the estimated timeline would be:\n\n- Express: 5-7 days\n- Standard: 10-14 days  \n- Premium: 14-21 days\n\nShall we schedule a quick call to discuss your project in detail?\n\nBest regards,\nEutian Team`
    },
    followup: {
      subject: 'Following up on your inquiry',
      body: `Hi {{name}},\n\nI wanted to follow up on your recent inquiry about {{plan}}.\n\nDo you have any questions? I'd be happy to provide more details or schedule a call to discuss your project.\n\nLooking forward to hearing from you!\n\nBest regards,\nEutian Team\n+91 9515760775`
    }
  };

  // Banner Settings
  const [bannerSettings, setBannerSettings] = useState({
    title: "Valentine's Day Special",
    discount: '30% OFF',
    endDate: '2026-02-14T23:59:59',
    description: 'Spread the love with amazing web design'
  });

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <section className="py-20">
        <Head>
          <title>Admin — Eutian</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <Head>
        <title>Admin — Eutian</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">🔒 Secure admin panel - Track leads, prototypes & business metrics</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Logout
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4"><p className="text-sm text-muted-foreground">Total Leads</p><p className="text-2xl font-semibold">{metrics.total}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">New</p><p className="text-2xl font-semibold text-yellow-600">{metrics.new}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Contacted</p><p className="text-2xl font-semibold text-blue-600">{metrics.contacted}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Won Deals</p><p className="text-2xl font-semibold text-green-600">{metrics.won}</p></Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">India Revenue (INR)</p>
            <p className="text-2xl font-semibold text-green-600">₹{metrics.indiaRevenueINR.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Global Revenue (USD)</p>
            <p className="text-2xl font-semibold text-green-600">${metrics.globalRevenueUSD.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">@ ₹{USD_TO_INR}/$ = ₹{metrics.globalRevenueINR.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold text-green-600">₹{metrics.totalRevenueINR.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Combined (India + Global)</p>
          </Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Pipeline Value</p><p className="text-2xl font-semibold text-orange-600">₹{metrics.pendingValue.toLocaleString()}</p></Card>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          <Card className="p-4"><p className="text-sm text-muted-foreground">Conversion Rate</p><p className="text-2xl font-semibold">{metrics.conversionRate}%</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Prototypes</p><p className="text-2xl font-semibold">{metrics.protoCount}</p></Card>
        </div>
    <div className="flex flex-wrap gap-3 mb-6">
      <Button 
        variant="outline" 
        disabled={refreshingLeads}
        onClick={async () => { 
          setRefreshingLeads(true);
          await qc.invalidateQueries({ queryKey: ['leads'] });
          await qc.refetchQueries({ queryKey: ['leads'] });
          setTimeout(() => setRefreshingLeads(false), 500);
        }}
      >
        {refreshingLeads ? '🔄 Refreshing...' : 'Refresh Leads'}
      </Button>
      <Button 
        variant="outline"
        disabled={refreshingProtos}
        onClick={async () => { 
          setRefreshingProtos(true);
          await qc.invalidateQueries({ queryKey: ['prototypes'] });
          await qc.refetchQueries({ queryKey: ['prototypes'] });
          setTimeout(() => setRefreshingProtos(false), 500);
        }}
      >
        {refreshingProtos ? '🔄 Refreshing...' : 'Refresh Prototypes'}
      </Button>
      {/* <Button variant="outline" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin-login'; }}>Log out</Button> */}
    </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant={activeTab === 'leads' ? 'default' : 'outline'} onClick={() => setActiveTab('leads')}>Leads</Button>
          <Button variant={activeTab === 'prototypes' ? 'default' : 'outline'} onClick={() => setActiveTab('prototypes')}>Prototypes</Button>
          <Button variant={activeTab === 'reviews' ? 'default' : 'outline'} onClick={() => setActiveTab('reviews')}>Reviews</Button>
          <Button variant={activeTab === 'templates' ? 'default' : 'outline'} onClick={() => setActiveTab('templates')}>Email Templates</Button>
          <Button variant={activeTab === 'settings' ? 'default' : 'outline'} onClick={() => setActiveTab('settings')}>Settings</Button>
        </div>

        {activeTab === 'leads' && (
        <Card className="p-4 overflow-x-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input placeholder="Search leads..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} className="md:w-1/3" />
            <Select onValueChange={v => setLeadStatusFilter(v as any)} defaultValue={leadStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="won">Won</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">Export CSV</Button>
          </div>

          {selectedLeads.length > 0 && (
            <div className="flex gap-2 mb-4 p-3 bg-muted rounded">
              <span className="text-sm">{selectedLeads.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('contacted')}>Mark Contacted</Button>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('won')}>Mark Won</Button>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('closed')}>Mark Closed</Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedLeads([])}>Clear</Button>
            </div>
          )}

          {isLoading && <p>Loading...</p>}
          {isError && <p className="text-red-600">{(error as Error)?.message}</p>}

          {!isLoading && filteredLeads.length === 0 && (
            <p className="text-muted-foreground">No leads yet.</p>
          )}

          {filteredLeads.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.length === filteredLeads.length} 
                      onChange={(e) => setSelectedLeads(e.target.checked ? filteredLeads.map(l => l.id) : [])}
                    />
                  </th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">WhatsApp</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Website Type</th>
                  <th className="py-2 pr-4">Region</th>
                  <th className="py-2 pr-4">Message</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="border-b align-top">
                    <td className="py-2 pr-2">
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(l.id)} 
                        onChange={(e) => setSelectedLeads(prev => 
                          e.target.checked ? [...prev, l.id] : prev.filter(id => id !== l.id)
                        )}
                      />
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4">{l.name}</td>
                    <td className="py-2 pr-4"><a className="text-primary hover:underline" href={`mailto:${l.email}`}>{l.email}</a></td>
                    <td className="py-2 pr-4">{l.phone || '-'}</td>
                    <td className="py-2 pr-4">{l.whatsapp || '-'}</td>
                    <td className="py-2 pr-4"><span className="font-semibold text-primary">{l.plan || '-'}</span></td>
                    <td className="py-2 pr-4">{l.websiteType || '-'}</td>
                    <td className="py-2 pr-4">{l.region}</td>
                    <td className="py-2 pr-4 max-w-[300px]">{l.message}</td>
                    <td className="py-2 pr-4">
                      <Select onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v as LeadItem['status'] })} defaultValue={l.status}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="won">Won 🎉</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingLead(l);
                          setLeadDetails({
                            notes: l.notes || '',
                            dealValue: l.dealValue?.toString() || '',
                            currency: l.currency || (l.region === 'India' ? 'INR' : 'USD'),
                            paymentStatus: l.paymentStatus || 'pending',
                            followUpDate: l.followUpDate || '',
                            source: l.source || ''
                          });
                        }}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => removeLead.mutate(l.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Lead Details Modal */}
          {editingLead && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Edit Lead: {editingLead.name}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Lead Source</label>
                    <Input 
                      placeholder="e.g., Google, Referral, LinkedIn" 
                      value={leadDetails.source} 
                      onChange={e => setLeadDetails({...leadDetails, source: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Deal Value</label>
                      <Input 
                        type="number" 
                        placeholder="e.g., 10499" 
                        value={leadDetails.dealValue} 
                        onChange={e => setLeadDetails({...leadDetails, dealValue: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Currency</label>
                      <Select onValueChange={(v) => setLeadDetails({...leadDetails, currency: v as 'INR' | 'USD'})} value={leadDetails.currency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ INR (India)</SelectItem>
                          <SelectItem value="USD">$ USD (Global)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Project Status</label>
                    <Select onValueChange={(v) => setLeadDetails({...leadDetails, paymentStatus: v})} value={leadDetails.paymentStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending (Not Started)</SelectItem>
                        <SelectItem value="in-progress">🚧 In Progress (Working)</SelectItem>
                        <SelectItem value="payment-pending">💰 Payment Pending (Done, awaiting payment)</SelectItem>
                        <SelectItem value="completed">✅ Completed (Paid & Delivered)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Revenue only counts for "Payment Pending" or "Completed" status
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Follow-up Date</label>
                    <Input 
                      type="date" 
                      value={leadDetails.followUpDate} 
                      onChange={e => setLeadDetails({...leadDetails, followUpDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Internal Notes</label>
                    <Textarea 
                      placeholder="Add notes about this lead..." 
                      value={leadDetails.notes} 
                      onChange={e => setLeadDetails({...leadDetails, notes: e.target.value})}
                      rows={5}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditingLead(null)}>Cancel</Button>
                    <Button onClick={() => {
                      updateLeadDetails.mutate({
                        id: editingLead.id,
                        notes: leadDetails.notes,
                        dealValue: leadDetails.dealValue ? parseFloat(leadDetails.dealValue) : undefined,
                        currency: leadDetails.currency,
                        paymentStatus: leadDetails.paymentStatus,
                        followUpDate: leadDetails.followUpDate || undefined,
                        source: leadDetails.source || undefined
                      });
                    }}>Save Changes</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Card>
        )}
          {activeTab === ('reviews' as any) && (
            <Card className="p-4 overflow-x-auto">
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : !reviews || reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Rating</th>
                      <th className="py-2 pr-4">Message</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews!.map((rv) => (
                      <tr key={rv.id} className="border-b align-top">
                        <td className="py-2 pr-4 whitespace-nowrap">{new Date(rv.createdAt).toLocaleString()}</td>
                        <td className="py-2 pr-4">{rv.name}</td>
                        <td className="py-2 pr-4">{rv.rating}/5</td>
                        <td className="py-2 pr-4 max-w-[400px]">{rv.message}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => deleteReview.mutate(rv.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl mb-4">Email Templates</h2>
            <p className="text-muted-foreground mb-4">Quick copy-paste email templates for common responses. Variables: {'{{name}}'}, {'{{plan}}'}.</p>
            
            {Object.entries(emailTemplates).map(([key, template]) => (
              <Card key={key} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg capitalize">{key} Template</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(template.body);
                      alert('Template copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2"><strong>Subject:</strong> {template.subject}</p>
                <pre className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">{template.body}</pre>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl mb-4">Site Settings</h2>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Offer Banner Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Update the promotional banner shown on homepage and pricing page. Changes require code deployment.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Banner Title</label>
                  <Input 
                    value={bannerSettings.title} 
                    onChange={e => setBannerSettings({...bannerSettings, title: e.target.value})}
                    placeholder="e.g., Special Offer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Discount Text</label>
                  <Input 
                    value={bannerSettings.discount} 
                    onChange={e => setBannerSettings({...bannerSettings, discount: e.target.value})}
                    placeholder="e.g., 30% OFF"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Description</label>
                  <Input 
                    value={bannerSettings.description} 
                    onChange={e => setBannerSettings({...bannerSettings, description: e.target.value})}
                    placeholder="e.g., On all plans"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">End Date & Time</label>
                  <Input 
                    type="datetime-local" 
                    value={bannerSettings.endDate.slice(0, 16)} 
                    onChange={e => setBannerSettings({...bannerSettings, endDate: e.target.value + ':59'})}
                  />
                </div>
                <div className="bg-muted p-4 rounded">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <p className="text-lg font-bold">{bannerSettings.title} — {bannerSettings.discount}</p>
                  <p className="text-sm">{bannerSettings.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ends: {new Date(bannerSettings.endDate).toLocaleString('en-IN', { 
                      dateStyle: 'medium', 
                      timeStyle: 'short',
                      timeZone: 'Asia/Kolkata'
                    })}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ <strong>Note:</strong> These settings are for reference only. To actually update the banner, you need to modify <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">src/components/OfferBanner.tsx</code> and redeploy.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                    Copy these values and update the component file manually.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/api/leads', '_blank')}>
                  📊 View Raw Leads JSON
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/api/prototypes', '_blank')}>
                  🎨 View Raw Prototypes JSON
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://cloud.mongodb.com', '_blank')}>
                  🗄️ MongoDB Atlas Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://cloudinary.com/console', '_blank')}>
                  ☁️ Cloudinary Media Library
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'prototypes' && (
        <>
        <h2 className="font-heading font-bold text-2xl mb-4">Prototypes</h2>
        <Card className="p-4 mb-6">
          <form
            className="grid grid-cols-1 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const validMedia = form.media.filter(m => m.url.trim() !== '');
              if (validMedia.length === 0) {
                alert('Please add at least one image or video');
                return;
              }
              createProto.mutate({
                title: form.title,
                media: validMedia.map((m, idx) => ({ ...m, order: idx })),
                category: form.category,
                description: form.description,
                techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
                features: form.features.split(',').map(s => s.trim()).filter(Boolean),
              } as any);
              setForm({ title: '', media: [{ type: 'image', url: '', order: 0 }], category: 'SaaS', description: '', techStack: '', features: '' });
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm block mb-1">Title</label>
                <Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm block mb-1">Category</label>
                <Input value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))} placeholder="SaaS / E-Commerce / Landing Page / AI/ML" />
              </div>
            </div>
            
            <div>
              <label className="text-sm block mb-2 font-medium">Media (Images & Videos)</label>
              <p className="text-xs text-muted-foreground mb-3">
                📸 Upload files or paste URLs. Drag to reorder how they appear in the carousel.
              </p>
              {form.media.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-3 items-start p-3 border rounded bg-muted/30">
                  <div className="flex flex-col gap-1 items-center">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      disabled={idx === 0 || uploadingIndex === idx}
                      onClick={() => {
                        if (idx > 0) {
                          const newMedia = [...form.media];
                          [newMedia[idx], newMedia[idx-1]] = [newMedia[idx-1], newMedia[idx]];
                          setForm(s => ({ ...s, media: newMedia }));
                        }
                      }}
                      className="h-6 w-6 p-0"
                    >
                      ↑
                    </Button>
                    <span className="text-xs text-muted-foreground">{idx + 1}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      disabled={idx === form.media.length - 1 || uploadingIndex === idx}
                      onClick={() => {
                        if (idx < form.media.length - 1) {
                          const newMedia = [...form.media];
                          [newMedia[idx], newMedia[idx+1]] = [newMedia[idx+1], newMedia[idx]];
                          setForm(s => ({ ...s, media: newMedia }));
                        }
                      }}
                      className="h-6 w-6 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                  <Select 
                    value={item.type} 
                    disabled={uploadingIndex === idx}
                    onValueChange={(v: 'image' | 'video') => setForm(s => ({
                      ...s,
                      media: s.media.map((m, i) => i === idx ? { ...m, type: v } : m)
                    }))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">📸 Image</SelectItem>
                      <SelectItem value="video">🎥 Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        value={item.url} 
                        onChange={e => setForm(s => ({ 
                          ...s, 
                          media: s.media.map((m, i) => i === idx ? { ...m, url: e.target.value } : m)
                        }))} 
                        placeholder={item.type === 'video' ? 'YouTube or video URL' : 'Image URL or upload below'}
                        required={idx === 0 && !uploadingIndex}
                        disabled={uploadingIndex === idx}
                        className="flex-1"
                      />
                      <input
                        type="file"
                        id={`file-${idx}`}
                        className="hidden"
                        accept={item.type === 'video' ? 'video/*' : 'image/*'}
                        disabled={uploadingIndex === idx}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check file size
                            const sizeInMB = file.size / (1024 * 1024);
                            if (sizeInMB > 50) {
                              alert('File too large! Maximum size is 50MB. Please compress your video or use a smaller file.');
                              e.target.value = '';
                              return;
                            }
                            if (sizeInMB > 20) {
                              const proceed = confirm(`This file is ${sizeInMB.toFixed(2)}MB. Large videos may take 2-5 minutes to upload. Continue?`);
                              if (!proceed) {
                                e.target.value = '';
                                return;
                              }
                            }
                            handleFileUpload(file, idx);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingIndex === idx}
                        onClick={() => document.getElementById(`file-${idx}`)?.click()}
                      >
                        {uploadingIndex === idx ? '⏳ Uploading...' : '📤 Upload'}
                      </Button>
                    </div>
                    {uploadingIndex === idx && (
                      <div className="space-y-1">
                        {uploadFileInfo[idx] && (
                          <div className="text-xs text-muted-foreground">
                            Uploading: {uploadFileInfo[idx].name} ({uploadFileInfo[idx].size})
                          </div>
                        )}
                        {uploadProgress[idx] !== undefined && (
                          <>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${uploadProgress[idx]}%` }}
                              />
                            </div>
                            <div className="text-xs text-center text-muted-foreground">
                              {uploadProgress[idx]}% {uploadProgress[idx] < 100 ? '- Please wait, large files take time...' : '- Processing...'}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {item.url && uploadingIndex !== idx && (
                      <div className="text-xs text-green-600">✓ URL ready</div>
                    )}
                  </div>
                  {idx > 0 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      disabled={uploadingIndex === idx}
                      onClick={() => setForm(s => ({ 
                        ...s, 
                        media: s.media.filter((_, i) => i !== idx) 
                      }))}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={uploadingIndex !== null}
                  onClick={() => setForm(s => ({ ...s, media: [...s.media, { type: 'image', url: '', order: s.media.length }] }))}
                >
                  + Add Image
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={uploadingIndex !== null}
                  onClick={() => setForm(s => ({ ...s, media: [...s.media, { type: 'video', url: '', order: s.media.length }] }))}
                >
                  + Add Video
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Files are uploaded to Cloudinary. Max 50MB per file.<br/>
                📸 Images upload in seconds • 🎥 Videos may take 2-5 minutes for large files<br/>
                💾 Tip: Keep videos under 20MB for faster uploads. Use compression tools if needed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm block mb-1">Description</label>
                <Textarea value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm block mb-1">Tech Stack (comma separated)</label>
                <Input value={form.techStack} onChange={e => setForm(s => ({ ...s, techStack: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm block mb-1">Features (comma separated)</label>
                <Input value={form.features} onChange={e => setForm(s => ({ ...s, features: e.target.value }))} />
              </div>
            </div>
            <div>
              <Button type="submit" disabled={createProto.isPending}>Add Prototype</Button>
            </div>
          </form>
        </Card>

        <Card className="p-4 overflow-x-auto">
          {loadingProtos ? (
            <p>Loading prototypes...</p>
          ) : !protos || protos.length === 0 ? (
            <p className="text-muted-foreground">No prototypes yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Media</th>
                  <th className="py-2 pr-4">Updated</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {protos!.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 pr-4">{p.title}</td>
                    <td className="py-2 pr-4">{p.category}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-1">
                        {p.media && p.media.length > 0 ? (
                          <>
                            {p.media.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="relative w-12 h-12 rounded border overflow-hidden">
                                {item.type === 'image' ? (
                                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                                    🎥
                                  </div>
                                )}
                              </div>
                            ))}
                            {p.media.length > 3 && (
                              <div className="w-12 h-12 flex items-center justify-center bg-muted rounded text-xs">
                                +{p.media.length - 3}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground">No media</div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditProto(p);
                          }}
                        >Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => deleteProto.mutate(p.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Edit Prototype Modal */}
        {editProto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Prototype: {editProto.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                ⚠️ To edit media items, delete this prototype and create a new one with the desired media.
              </p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const category = formData.get('category') as string;
                const description = formData.get('description') as string;
                const techStack = (formData.get('techStack') as string).split(',').map(s => s.trim()).filter(Boolean);
                const features = (formData.get('features') as string).split(',').map(s => s.trim()).filter(Boolean);
                
                updateProto.mutate({ 
                  id: editProto.id, 
                  updates: { title, category, description, techStack, features } 
                });
                setEditProto(null);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Title</label>
                    <Input name="title" defaultValue={editProto.title} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Category</label>
                    <Input name="category" defaultValue={editProto.category} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Media Preview</label>
                    <div className="flex gap-2 flex-wrap p-3 bg-muted/30 rounded">
                      {editProto.media && editProto.media.length > 0 ? (
                        editProto.media.map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <div className="w-16 h-16 rounded border overflow-hidden">
                              {item.type === 'image' ? (
                                <img src={item.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  🎥
                                </div>
                              )}
                            </div>
                            <span className="text-xs">{idx + 1}. {item.type}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-red-500">⚠️ This prototype has no media.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Description</label>
                    <Textarea name="description" defaultValue={editProto.description} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Tech Stack (comma separated)</label>
                    <Input name="techStack" defaultValue={editProto.techStack.join(', ')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Features (comma separated)</label>
                    <Input name="features" defaultValue={editProto.features.join(', ')} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setEditProto(null)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        )}
        </>) }

      </div>
    </section>
  );
}
