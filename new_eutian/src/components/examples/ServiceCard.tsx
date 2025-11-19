import ServiceCard from '../ServiceCard';
import { Laptop } from 'lucide-react';

export default function ServiceCardExample() {
  return (
    <div className="p-8">
      <ServiceCard
        icon={Laptop}
        title="Website Development"
        description="Fast, scalable, and production-ready websites built with modern technologies. Perfect for businesses that need a professional online presence."
        onClick={() => console.log('Service clicked')}
      />
    </div>
  );
}
