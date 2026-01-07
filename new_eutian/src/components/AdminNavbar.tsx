import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ExternalLink, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminNavbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-dark rounded-full px-6 flex justify-between items-center h-14 border border-white/10 shadow-2xl shadow-primary/5">
          <Link href="/eutianadmin" className="flex items-center gap-2 group">
            <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-white">
              EUTIAN <span className="text-primary/70 font-medium">ADMIN</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5 rounded-full px-4">
                <Link href="/eutianadmin" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white group">
              <Link href="/" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span className="hidden xs:inline">View Site</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/admin-login';
              }}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}