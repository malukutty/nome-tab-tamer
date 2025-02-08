
import { Browser, BrowserOpenOptions } from '@capacitor/browser';
import { useToast } from '@/hooks/use-toast';
import { useTabOrganization } from '@/hooks/useTabOrganization';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BrowserTabs, { useBrowserTabs } from '@/components/Browser/BrowserTabs';
import BrowserControls from '@/components/Browser/BrowserControls';
import TabOrganizer from '@/components/Browser/TabOrganizer';
import Categories from '@/components/Browser/Categories';
import WelcomeSection from '@/components/Browser/WelcomeSection';
import { useBrowserEvents } from '@/hooks/useBrowserEvents';

const Index = () => {
  const {
    tabs,
    setTabs,
    activeTabId,
  } = useBrowserTabs();
  
  const { toast } = useToast();
  const { organizeTab } = useTabOrganization();
  const { user } = useAuth();

  // Set up browser event listeners
  useBrowserEvents();

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
          <WelcomeSection />
          <Categories tabs={tabs} />
          <TabOrganizer />
        </div>
      </div>
    </div>
  );
};

export default Index;
