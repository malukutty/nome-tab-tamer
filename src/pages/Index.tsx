
import { useState, useEffect } from 'react';
import { Browser, BrowserOpenOptions } from '@capacitor/browser';
import { useToast } from '@/hooks/use-toast';
import { useTabOrganization } from '@/hooks/useTabOrganization';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BrowserTabs, { useBrowserTabs } from '@/components/Browser/BrowserTabs';
import BrowserControls from '@/components/Browser/BrowserControls';
import TabOrganizer from '@/components/Browser/TabOrganizer';
import TabSummary from '@/components/Browser/TabSummary';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Newspaper, 
  ShoppingCart, 
  Computer, 
  CreditCard,
  Share2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const {
    tabs,
    setTabs,
    activeTabId,
  } = useBrowserTabs();
  
  const { toast } = useToast();
  const { organizeTab } = useTabOrganization();
  const { user } = useAuth();
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

  useEffect(() => {
    let browserFinishedListener: any;
    let browserPageLoadedListener: any;

    const setupListeners = async () => {
      browserFinishedListener = await Browser.addListener('browserFinished', () => {
        console.log('Browser finished');
        toast({
          title: "Browser closed",
          description: "The browser window has been closed",
        });
      });

      browserPageLoadedListener = await Browser.addListener('browserPageLoaded', () => {
        console.log('Browser page loaded');
        toast({
          title: "Page loaded",
          description: "The web page has finished loading",
        });
      });
    };

    setupListeners();

    return () => {
      browserFinishedListener?.remove();
      browserPageLoadedListener?.remove();
    };
  }, [toast]);

  const handleNavigate = async (url: string) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const updatedTabs = tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url: formattedUrl, title: formattedUrl } 
        : tab
    );
    setTabs(updatedTabs);

    try {
      const browserOptions: BrowserOpenOptions = {
        url: formattedUrl,
        presentationStyle: 'popover',
        toolbarColor: '#ffffff',
      };

      await Browser.open(browserOptions);

      const activeTab = updatedTabs.find(tab => tab.id === activeTabId);
      if (activeTab && user) {
        const groupId = organizeTab(activeTab);
        if (groupId) {
          try {
            const { error } = await supabase
              .from('saved_tabs')
              .insert([{
                title: activeTab.title,
                url: activeTab.url,
                group_id: groupId,
                user_id: user.id
              }]);

            if (error) throw error;

            toast({
              title: "Tab organized",
              description: "Tab has been automatically organized into a group",
            });
          } catch (error) {
            console.error('Error saving tab:', error);
            toast({
              title: "Error organizing tab",
              description: "Failed to organize tab into group",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Error opening WebView:', error);
      toast({
        title: "Navigation error",
        description: "Failed to open the page",
        variant: "destructive",
      });
    }
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex flex-col h-screen bg-white animate-fade-in">
      <div className="flex flex-col flex-shrink-0">
        <BrowserTabs onNavigate={handleNavigate} />
        <BrowserControls 
          onNavigate={handleNavigate}
          activeTabUrl={activeTab?.url}
        />
      </div>
      <div className="flex-1 bg-nome-50 p-4 overflow-y-auto">
        <div className="w-full bg-white rounded-lg shadow-sm p-6 animate-slide-up space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-nome-800 mb-2">Welcome to Nome</h1>
            <p className="text-nome-600">
              Your intelligent browser for organized browsing. Start by entering a URL in the address bar above.
            </p>
          </div>
          
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

          <TabOrganizer />
        </div>
      </div>
    </div>
  );
};

export default Index;

