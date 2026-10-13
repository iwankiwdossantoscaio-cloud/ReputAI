import React from 'react';
import { MapPin, MessageCircle, Star } from 'lucide-react';
import type { Company } from '@/hooks/useCompanies';

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-4 h-4 ${i <= Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
    ))}
  </div>
);

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick }) => (
  <div onClick={onClick} className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-border">
    <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-primary text-lg">
        {company.name.substring(0, 2)}
      </div>
      <div>
        <h4 className="font-semibold">{company.name}</h4>
        <p className="text-sm opacity-80 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {company.location}
        </p>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <StarDisplay rating={company.average_rating} />
        <span className="text-sm font-medium text-foreground">{company.average_rating.toFixed(1)}/5</span>
        <span className="text-xs text-muted-foreground">({company.review_count})</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {company.description || 'Empresa cadastrada na plataforma ReputAí'}
      </p>
      <div className="flex gap-2">
        <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs">{company.sector}</span>
        <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <MessageCircle className="w-3 h-3" /> {company.review_count} avaliações
        </span>
      </div>
    </div>
  </div>
);

export { StarDisplay };
export default CompanyCard;
