import FounderCard from '../FounderCard';

export default function FounderCardExample() {
  return (
    <div className="p-8">
      <FounderCard
        name="Alex Chen"
        role="Co-Founder & CEO"
        bio="Full-stack developer with 8 years of experience building scalable web applications. Passionate about delivering quality solutions on time."
        linkedin="https://linkedin.com"
      />
    </div>
  );
}
