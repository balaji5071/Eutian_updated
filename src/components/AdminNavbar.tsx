import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, ExternalLink } from 'lucide-react';

export default function AdminNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 glass-dark backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/eutianadmin" className="flex items-center gap-3 group">
          <div className="p-2 rounded-full bg-green-500/20 border border-white/10 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="h-5 w-5 text-green-500" />
          </div>
          <span className="font-heading text-xl font-bold text-green-500">
            Admin Dashboard
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button 
            asChild 
            variant="outline" 
            size="sm"
            className="glass-dark border-white/10 hover:border-green-500/50 hover:scale-105 transition-all"
          >
            <Link href="/" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Site
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:scale-105 transition-all"
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin-login'; }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}