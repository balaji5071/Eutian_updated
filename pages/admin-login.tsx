import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ShieldCheck, UserCheck, Sparkles, ArrowRight, Lock } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear form on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError(null);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.ok) {
        setPassword('');
        throw new Error(json.error || 'Login failed');
      }
      setEmail('');
      setPassword('');
      window.location.href = json.redirectUrl || (json.role === 'admin' ? '/eutianadmin' : '/employee');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <Head>
        <title>Portal Login — Eutian Workspace</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="max-w-md w-full space-y-6 py-12">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 font-black text-2xl text-white mx-auto border border-indigo-400/30">
            E
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Eutian Team Portal</h1>
          <p className="text-xs text-slate-400">Admin & Employee Role-Based Access Console</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-xl space-y-5">
          <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com or employee@eutian.com"
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded-xl p-3 text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> Authentication Failed
                </p>
                <p className="text-rose-300/80">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl py-2.5 shadow-lg shadow-indigo-600/30"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Demo Quick Fill Credentials
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com', 'change_me')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all hover:border-indigo-500/50"
              >
                <div className="font-semibold text-indigo-400">👑 Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sales@eutian.com', 'sales123')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all hover:border-emerald-500/50"
              >
                <div className="font-semibold text-emerald-400">💼 Sales Executive</div>
                <div className="text-[10px] text-slate-500 truncate">sales@eutian.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marketing@eutian.com', 'marketing123')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all hover:border-purple-500/50"
              >
                <div className="font-semibold text-purple-400">📢 Marketing Lead</div>
                <div className="text-[10px] text-slate-500 truncate">marketing@eutian.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('intern@eutian.com', 'intern123')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all hover:border-amber-500/50"
              >
                <div className="font-semibold text-amber-400">🎓 Junior Intern</div>
                <div className="text-[10px] text-slate-500 truncate">intern@eutian.com</div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
