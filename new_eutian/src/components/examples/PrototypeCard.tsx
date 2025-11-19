import PrototypeCard from '../PrototypeCard';

export default function PrototypeCardExample() {
  return (
    <div className="p-8">
      <PrototypeCard
        title="E-Commerce Platform"
        image="https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80"
        category="SaaS"
        techStack={['React', 'Node.js', 'PostgreSQL', 'Stripe']}
        onClick={() => console.log('Prototype clicked')}
      />
    </div>
  );
}
