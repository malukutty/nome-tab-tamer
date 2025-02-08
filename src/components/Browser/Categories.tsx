
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Newspaper, 
  ShoppingCart, 
  Computer, 
  CreditCard,
  Share2,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import TabSummary from './TabSummary';
import { TabData } from '@/types/browser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface CategoriesProps {
  tabs: TabData[];
}

const Categories = ({ tabs }: CategoriesProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch saved tabs
  const { data: savedTabs = [] } = useQuery({
    queryKey: ['savedTabs', selectedCategory],
    queryFn: async () => {
      if (!user) return [];
      
      const query = supabase
        .from('saved_tabs')
        .select('*, tab_groups!inner(*)')
        .eq('user_id', user.id);

      if (selectedCategory) {
        query.eq('tab_groups.name', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Delete saved tab
  const deleteSavedTab = useMutation({
    mutationFn: async (tabId: string) => {
      const { error } = await supabase
        .from('saved_tabs')
        .delete()
        .eq('id', tabId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTabs'] });
      toast({
        title: "Tab deleted",
        description: "The tab has been removed from this category",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting tab",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const handleOpenTab = async (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-nome-800">Categories</h2>
        <TabSummary tabs={tabs} />
      </div>
      
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {categories.map((category) => (
          <Card 
            key={category.name} 
            className="group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCategory(category.name)}
          >
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

      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCategory}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            {savedTabs.length > 0 ? (
              <div className="space-y-4">
                {savedTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="text-sm font-medium truncate">{tab.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{tab.url}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenTab(tab.url)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSavedTab.mutate(tab.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No saved tabs in this category yet.
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
