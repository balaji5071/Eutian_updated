import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-graysoft-100/90 backdrop-blur supports-[backdrop-filter]:bg-graysoft-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/eutianadmin" className="flex items-center gap-2">
          <span className="font-heading text-lg font-semibold tracking-wide">Admin Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">View Site</Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin-login'; }}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}