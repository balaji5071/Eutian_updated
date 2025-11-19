import { useEffect, useMemo, useState } from 'react';
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

  // Prototypes
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
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Failed to delete');
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prototypes'] }),
  });

  const [form, setForm] = useState({ title: '', image: '', category: 'SaaS', description: '', techStack: '', features: '' });

  return (
    <section className="py-12">
      <Head>
        <title>Admin — Eutian</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-bold text-3xl mb-6">Admin — Leads</h1>
        <p className="text-muted-foreground mb-6">Manage incoming messages and bookings. This page is not authenticated yet.</p>

        <Card className="p-4 overflow-x-auto">
          {isLoading && <p>Loading...</p>}
          {isError && <p className="text-red-600">{(error as Error)?.message}</p>}

          {!isLoading && leads.length === 0 && (
            <p className="text-muted-foreground">No leads yet.</p>
          )}

          {leads.length > 0 && (
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
                {leads.map((l) => (
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

        <h2 className="font-heading font-bold text-2xl mt-12 mb-4">Prototypes</h2>
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

        <div className="mt-6">
          <Button variant="outline" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin-login'; }}>Log out</Button>
        </div>
      </div>
    </section>
  );
}
