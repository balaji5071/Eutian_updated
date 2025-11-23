import { useState } from 'react';
import Head from 'next/head';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!json.ok) throw new Error(json.error || 'Login failed');
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
          <h1 className="font-heading text-2xl mb-4">Admin Login</h1>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm block mb-1">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Eutian@eutian.com" />
            </div>
            <div>
              <label className="text-sm block mb-1">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="********" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
