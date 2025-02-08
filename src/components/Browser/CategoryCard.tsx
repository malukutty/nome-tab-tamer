
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  description?: string;
  color?: string;
  onClick: (id: string) => void;
}

const CategoryCard = ({ id, name, icon: IconComponent, description, color, onClick }: CategoryCardProps) => {
  return (
    <Card 
      className="group hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${color} text-white group-hover:scale-110 transition-transform`}>
            <IconComponent size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-nome-800">{name}</h3>
            <p className="text-nome-600 text-sm mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
