import dynamic from 'next/dynamic';

// Catch-all page: delegate routing to the SPA (Wouter) client-side
const App = dynamic(() => import('../src/App'), { ssr: false });

export default function CatchAll() {
  return <App />;
}
