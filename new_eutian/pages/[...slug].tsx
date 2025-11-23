import NotFound from './not-found';

// Catch-all route: render the existing 404 page for any unknown slug
export default function CatchAll() {
  return <NotFound />;
}
