
import { Card, CardContent } from '@/components/ui/card';
import { 
  Newspaper, 
  ShoppingCart, 
  Computer, 
  CreditCard,
  Share2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import TabSummary from './TabSummary';
import { TabData } from '@/types/browser';

interface CategoriesProps {
  tabs: TabData[];
}

const Categories = ({ tabs }: CategoriesProps) => {
  const isMobile = useIsMobile();

  const categories = [
    {
      name: 'Banking & Finance',
      icon: CreditCard,
      description: 'Track your finances and banking activities',
      color: 'bg-blue-500'
    },
    {
      name: 'News & Media',
      icon: Newspaper,
      description: 'Stay updated with the latest news',
      color: 'bg-amber-500'
    },
    {
      name: 'Shopping',
      icon: ShoppingCart,
      description: 'Organize your shopping tabs',
      color: 'bg-green-500'
    },
    {
      name: 'Technology',
      icon: Computer,
      description: 'Keep track of tech-related content',
      color: 'bg-purple-500'
    },
    {
      name: 'Social Media',
      icon: Share2,
      description: 'Manage your social media tabs',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-nome-800">Categories</h2>
        <TabSummary tabs={tabs} />
      </div>
      
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {categories.map((category) => (
          <Card key={category.name} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${category.color} text-white group-hover:scale-110 transition-transform`}>
                  <category.icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-nome-800">{category.name}</h3>
                  <p className="text-nome-600 text-sm mt-1">{category.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Categories;
