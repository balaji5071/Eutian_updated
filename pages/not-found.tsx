import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-9xl text-primary mb-4 animate-pulse" data-testid="text-404">
            404
          </h1>
          <h2 className="font-heading font-bold text-3xl mb-4" data-testid="text-not-found-heading">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg" data-testid="text-not-found-message">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" data-testid="button-go-home">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            data-testid="button-go-back"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
