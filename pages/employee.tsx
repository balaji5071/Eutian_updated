import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmployeeRole, Lead as LeadType, Prototype, Review as ReviewType } from '@/shared/schema';
import {
  Briefcase,
  Megaphone,
  GraduationCap,
  Code2,
  Users,
  FolderKanban,
  Star,
  CheckCircle2,
  Clock,
  Send,
  LogOut,
  Sparkles,
  Search,
  Phone,
  Mail,
  Copy,
  Plus,
  RefreshCw,
  Sprout,
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';

type LeadItem = Omit<LeadType, '_id' | 'createdAt'> & { id: string; createdAt: string };
type Proto = Omit<Prototype, '_id' | 'createdAt'> & { id: string; createdAt: string };

export default function EmployeeDashboard() {
  const router = useRouter();
  const qc = useQueryClient();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: EmployeeRole } | null>(null);
  const [activeRole, setActiveRole] = useState<EmployeeRole>('sales');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Intern Daily Work Log State
  const [workLog, setWorkLog] = useState('');
  const [submittedLogs, setSubmittedLogs] = useState<{ id: string; text: string; date: string }[]>([]);

  // Task checklist state for interns/employees
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Review incoming customer website leads', completed: true },
    { id: '2', title: 'Follow up with Express Plan prospects via WhatsApp', completed: false },
    { id: '3', title: 'Test prototype video carousel playback on mobile', completed: true },
    { id: '4', title: 'Update offer banner promotional pricing', completed: false },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Verification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        const data = await res.json();
        if (data.ok && data.authenticated && data.user) {
          setCurrentUser(data.user);
          const initialRole = (router.query.role as EmployeeRole) || data.user.role || 'sales';
          setActiveRole(initialRole);
        } else {
          // If query param role is specified for previewing, set role
          if (router.query.role) {
            setActiveRole(router.query.role as EmployeeRole);
            setCurrentUser({ name: 'Guest Employee', email: 'employee@eutian.com', role: router.query.role as EmployeeRole });
          } else {
            router.replace('/admin-login');
            return;
          }
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        router.replace('/admin-login');
        return;
      }
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [router]);

  // Sync role with query param if changed
  useEffect(() => {
    if (router.query.role) {
      setActiveRole(router.query.role as EmployeeRole);
    }
  }, [router.query.role]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/admin-login');
    } catch (e) {
      router.replace('/admin-login');
    }
  };

  // Queries for role views
  const { data: leadsData, isLoading: loadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.items as LeadItem[];
    },
    enabled: activeRole === 'sales' || activeRole === 'admin'
  });

  const { data: prototypesData, isLoading: loadingProtos } = useQuery({
    queryKey: ['prototypes'],
    queryFn: async () => {
      const res = await fetch('/api/prototypes');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.items as Proto[];
    },
    enabled: activeRole === 'marketing' || activeRole === 'developer' || activeRole === 'admin'
  });

  const leads = useMemo(() => leadsData ?? [], [leadsData]);

  // Lead Mutations (Sales Role)
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadItem['status'] }) => {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      showToast('Lead status updated!');
    }
  });

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    showToast('Task status updated');
  };

  const handleAddWorkLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workLog.trim()) return;
    setSubmittedLogs(prev => [
      { id: Date.now().toString(), text: workLog, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev
    ]);
    setWorkLog('');
    showToast('Work update logged!');
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Employee Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Head>
        <title>Employee Portal — Eutian Workspace</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top duration-300 border border-emerald-400/40 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-lg text-white">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl tracking-tight text-white">Eutian Employee Portal</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full capitalize">
                  {activeRole} Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400">Logged in as {currentUser?.name || 'Employee'} ({currentUser?.email || 'Active Session'})</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Role Switcher for previewing dashboards */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 font-medium">Role View:</span>
              {(['sales', 'marketing', 'intern', 'developer'] as EmployeeRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    router.push(`/employee?role=${role}`, undefined, { shallow: true });
                  }}
                  className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                    activeRole === role
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/eutianadmin')}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              👑 Admin View
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="bg-rose-950/60 border border-rose-800/40 hover:bg-rose-900 text-rose-300 text-xs gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Welcome Role Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/30 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 z-10">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              {activeRole === 'sales' && <Briefcase className="w-6 h-6 text-emerald-400" />}
              {activeRole === 'marketing' && <Megaphone className="w-6 h-6 text-purple-400" />}
              {activeRole === 'intern' && <GraduationCap className="w-6 h-6 text-amber-400" />}
              {activeRole === 'developer' && <Code2 className="w-6 h-6 text-cyan-400" />}
              Welcome to the {activeRole.toUpperCase()} Workspace
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {activeRole === 'sales' && 'Track client inquiries, update lead pipeline statuses, calculate deals, and send instant proposals.'}
              {activeRole === 'marketing' && 'Manage prototype galleries, moderate customer reviews, update promotional offer banners, and track campaign ROI.'}
              {activeRole === 'intern' && 'Complete daily assigned onboarding tasks, log work updates to supervisors, and review client submissions.'}
              {activeRole === 'developer' && 'Monitor API health metrics, review database connection pooling, and inspect prototype technical stacks.'}
            </p>
          </div>

          <div className="flex items-center gap-2 z-10">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Dedicated {activeRole} Portal
            </span>
          </div>
        </div>

        {/* ================= ROLE 1: SALES DASHBOARD ================= */}
        {activeRole === 'sales' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">Assigned Leads</span>
                <div className="text-3xl font-extrabold text-white mt-2">{leads.length}</div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">New Inquiries</span>
                <div className="text-3xl font-extrabold text-amber-400 mt-2">
                  {leads.filter(l => l.status === 'new').length}
                </div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">Won Deals</span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                  {leads.filter(l => l.status === 'won').length}
                </div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">Pipeline Value</span>
                <div className="text-3xl font-extrabold text-purple-300 mt-2">
                  ₹{leads.filter(l => l.status === 'won' && l.dealValue).reduce((s, l) => s + (l.dealValue || 0), 0).toLocaleString()}
                </div>
              </Card>
            </div>

            {/* Sales Leads Table */}
            <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                Sales Pipeline & Inquiries
              </h3>

              {loadingLeads ? (
                <div className="py-8 text-center text-slate-400">Loading sales leads...</div>
              ) : leads.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No sales leads found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/60">
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Plan / Region</th>
                        <th className="py-3 px-4">Requirement</th>
                        <th className="py-3 px-4">Lead Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {leads.map(l => (
                        <tr key={l.id} className="hover:bg-slate-800/40">
                          <td className="py-4 px-4 font-semibold text-white">
                            {l.name}
                            {l.dealValue && (
                              <div className="text-xs text-emerald-400 font-mono mt-0.5">
                                ₹{l.dealValue.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs space-y-0.5">
                            <a href={`mailto:${l.email}`} className="text-indigo-400 hover:underline block">{l.email}</a>
                            {l.phone && <div className="text-slate-400">{l.phone}</div>}
                          </td>
                          <td className="py-4 px-4 text-xs">
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md font-medium">{l.plan || 'Standard'}</span>
                            <div className="text-slate-400 mt-1">{l.region}</div>
                          </td>
                          <td className="py-4 px-4 max-w-[250px] text-xs text-slate-300 line-clamp-2">
                            {l.message}
                          </td>
                          <td className="py-4 px-4">
                            <Select onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v as LeadItem['status'] })} defaultValue={l.status}>
                              <SelectTrigger className="w-[130px] h-8 text-xs font-medium bg-slate-950 border-slate-800 text-slate-200">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ================= ROLE 2: MARKETING DASHBOARD ================= */}
        {activeRole === 'marketing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">Live Showcase Prototypes</span>
                <div className="text-3xl font-extrabold text-purple-300 mt-2">{prototypesData?.length || 0}</div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">Active Offer Banner</span>
                <div className="text-xl font-bold text-amber-400 mt-2">Special Offer — 30% OFF</div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">Marketing Channels</span>
                <div className="text-xs text-slate-300 mt-2 space-y-1">
                  <div>• Google Search Campaigns</div>
                  <div>• Instagram / LinkedIn Reels</div>
                </div>
              </Card>
            </div>

            <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-400" />
                Marketing Prototype Showcase Control
              </h3>
              <p className="text-xs text-slate-400">Marketing team can upload new showcase cards, manage categories, and optimize conversion headlines.</p>

              {loadingProtos ? (
                <div className="py-8 text-center text-slate-400">Loading prototypes...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prototypesData?.map(p => (
                    <Card key={p.id} className="bg-slate-950 border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="font-bold text-white text-sm">{p.title}</div>
                      <span className="text-[11px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                        {p.category}
                      </span>
                      <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ================= ROLE 3: INTERN DASHBOARD ================= */}
        {activeRole === 'intern' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Checklist */}
              <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Intern Onboarding & Daily Tasks
                </h3>

                <div className="space-y-2.5">
                  {tasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        t.completed
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => {}}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-xs font-medium flex-1 ${t.completed ? 'line-through opacity-80' : ''}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Submit Work Update Logger */}
              <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Submit Daily Work Notes to Supervisor
                </h3>

                <form onSubmit={handleAddWorkLog} className="space-y-3">
                  <Textarea
                    value={workLog}
                    onChange={e => setWorkLog(e.target.value)}
                    placeholder="Log what you accomplished today (e.g. Tested lead submission form, verified mobile responsiveness)..."
                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs"
                    rows={4}
                  />
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Submit Log Update
                  </Button>
                </form>

                {submittedLogs.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Today's Logged Updates:</span>
                    {submittedLogs.map(l => (
                      <div key={l.id} className="p-2.5 bg-slate-950 rounded-xl text-xs text-slate-300 border border-slate-800">
                        <span className="text-indigo-400 font-mono text-[10px] block mb-0.5">[{l.date}]</span>
                        {l.text}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ================= ROLE 4: DEVELOPER DASHBOARD ================= */}
        {activeRole === 'developer' && (
          <div className="space-y-6">
            <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                Developer Technical Diagnostics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-semibold uppercase block">Database Connection</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    MongoDB Atlas Connected
                  </span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-semibold uppercase block">Framework Stack</span>
                  <span className="text-cyan-300 font-bold">Next.js 14 • React 18 • TypeScript</span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-semibold uppercase block">API Endpoints</span>
                  <span className="text-purple-300 font-bold">/api/leads • /api/prototypes • /api/employees</span>
                </div>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
