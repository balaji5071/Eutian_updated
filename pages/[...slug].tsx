import { GetServerSideProps } from 'next';
import Custom404 from './404';

// Catch-all route: explicitly returns notFound: true so Next.js sets HTTP status 404
// This prevents Google from classifying unmatched routes as Soft 404 with HTTP 200 OK.
export default function CatchAll() {
  return <Custom404 />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    notFound: true,
  };
};
