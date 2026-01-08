import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Clear form when component mounts (after logout or page refresh)
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError(null);
    setAttempts(0);
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
        setAttempts(prev => prev + 1);
        // Clear password on failed attempt for security
        setPassword('');
        throw new Error(json.error || 'Login failed');
      }
      // Clear credentials before redirect for security
      setEmail('');
      setPassword('');
      window.location.href = '/eutianadmin';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20">
      <Head>
        <title>Admin Login — Eutian</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="max-w-md mx-auto px-4">
        <Card className="p-6">
          <h1 className="font-heading text-2xl mb-4">🔒 Admin Login</h1>
          <p className="text-sm text-muted-foreground mb-4">Secure access to admin dashboard</p>
          <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
            <div>
              <label className="text-sm block mb-1">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="admin@eutian.com"
                autoComplete="off"
                name="admin-email"
              />
            </div>
            <div>
              <label className="text-sm block mb-1">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="********"
                  autoComplete="off"
                  name="admin-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
                <p className="font-semibold">Login failed</p>
                <p>{error}</p>
                {attempts >= 3 && <p className="mt-1 text-xs">Multiple failed attempts detected. Please verify your credentials.</p>}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
