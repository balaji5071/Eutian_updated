import dynamic from 'next/dynamic';

// Load the existing SPA root from src/App as a client-only component to avoid SSR issues
const App = dynamic(() => import('../src/App'), { ssr: false });

export default function Index() {
  return <App />;
}
