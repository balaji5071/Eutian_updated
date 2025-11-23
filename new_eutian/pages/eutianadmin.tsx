import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  websiteType?: string;
  region: 'India' | 'Global';
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

async function fetchLeads(): Promise<LeadItem[]> {
  const res = await fetch('/api/leads');
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to fetch leads');
  return json.items as LeadItem[];
}

export default function AdminPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'leads' | 'prototypes'>('leads');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
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
  type Proto = { id: string; title: string; image: string; category: string; description: string; techStack: string[]; features: string[]; createdAt: string };
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

  // Metrics (moved below reviews to avoid TDZ ReferenceError)
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const closed = leads.filter(l => l.status === 'closed').length;
    const protoCount = protos?.length || 0;
    const reviewCount = (reviews?.length) || 0;
    return { total, new: newCount, contacted, closed, protoCount, reviewCount };
  }, [leads, protos, reviews]);

  const [form, setForm] = useState({ title: '', image: '', category: 'SaaS', description: '', techStack: '', features: '' });
  const [editProto, setEditProto] = useState<null | Proto>(null);

  return (
    <section className="py-12">
      <Head>
        <title>Admin — Eutian</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-bold text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Internal overview (demo; auth disabled). Track leads & prototypes.</p>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4"><p className="text-sm text-muted-foreground">Total Leads</p><p className="text-2xl font-semibold">{metrics.total}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">New</p><p className="text-2xl font-semibold">{metrics.new}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Contacted</p><p className="text-2xl font-semibold">{metrics.contacted}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Closed</p><p className="text-2xl font-semibold">{metrics.closed}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Prototypes</p><p className="text-2xl font-semibold">{metrics.protoCount}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Reviews</p><p className="text-2xl font-semibold">{metrics.reviewCount}</p></Card>
        </div>
    <div className="mt-10 flex gap-3">
      <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['leads'] })}>Refresh Leads</Button>
      <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['prototypes'] })}>Refresh Prototypes</Button>
      {/* <Button variant="outline" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin-login'; }}>Log out</Button> */}
    </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === 'leads' ? 'default' : 'outline'} onClick={() => setActiveTab('leads')}>Leads</Button>
          <Button variant={activeTab === 'prototypes' ? 'default' : 'outline'} onClick={() => setActiveTab('prototypes')}>Prototypes</Button>
          <Button variant={(activeTab as any) === 'reviews' ? 'default' : 'outline'} onClick={() => setActiveTab('reviews' as any)}>Reviews</Button>
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
              </SelectContent>
            </Select>
          </div>
          {isLoading && <p>Loading...</p>}
          {isError && <p className="text-red-600">{(error as Error)?.message}</p>}

          {!isLoading && filteredLeads.length === 0 && (
            <p className="text-muted-foreground">No leads yet.</p>
          )}

          {filteredLeads.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">WhatsApp</th>
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
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4">{l.name}</td>
                    <td className="py-2 pr-4"><a className="text-primary hover:underline" href={`mailto:${l.email}`}>{l.email}</a></td>
                    <td className="py-2 pr-4">{l.phone || '-'}</td>
                    <td className="py-2 pr-4">{l.whatsapp || '-'}</td>
                    <td className="py-2 pr-4">{l.websiteType || '-'}</td>
                    <td className="py-2 pr-4">{l.region}</td>
                    <td className="py-2 pr-4 max-w-[300px]">{l.message}</td>
                    <td className="py-2 pr-4">
                      <Select onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v as LeadItem['status'] })} defaultValue={l.status}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => removeLead.mutate(l.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        {activeTab === 'prototypes' && (
        <>
        <h2 className="font-heading font-bold text-2xl mb-4">Prototypes</h2>
        <Card className="p-4 mb-6">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              createProto.mutate({
                title: form.title,
                image: form.image,
                category: form.category,
                description: form.description,
                techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
                features: form.features.split(',').map(s => s.trim()).filter(Boolean),
              } as any);
              setForm({ title: '', image: '', category: 'SaaS', description: '', techStack: '', features: '' });
            }}
          >
            <div>
              <label className="text-sm block mb-1">Title</label>
              <Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm block mb-1">Image URL</label>
              <Input value={form.image} onChange={e => setForm(s => ({ ...s, image: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm block mb-1">Category</label>
              <Input value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))} placeholder="SaaS / E-Commerce / Landing Page / AI/ML" />
            </div>
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
            <div className="md:col-span-2">
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
                  <th className="py-2 pr-4">Updated</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {protos!.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 pr-4">{p.title}</td>
                    <td className="py-2 pr-4">{p.category}</td>
                    <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const title = prompt('New title', p.title) ?? p.title;
                            if (title && title !== p.title) updateProto.mutate({ id: p.id, updates: { title } });
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
        </>) }

      </div>
    </section>
  );
}
