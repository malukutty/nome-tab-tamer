
import { Browser, BrowserOpenOptions } from '@capacitor/browser';
import { useToast } from '@/hooks/use-toast';
import { useTabOrganization } from '@/hooks/useTabOrganization';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BrowserTabs, { useBrowserTabs } from '@/components/Browser/BrowserTabs';
import BrowserControls from '@/components/Browser/BrowserControls';
import Categories from '@/components/Browser/Categories';
import WelcomeSection from '@/components/Browser/WelcomeSection';
import { useBrowserEvents } from '@/hooks/useBrowserEvents';
import Navbar from '@/components/Layout/Navbar';

const Index = () => {
  const {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId
  } = useBrowserTabs();
  
  const { toast } = useToast();
  const { organizeTab } = useTabOrganization();
  const { user } = useAuth();

  // Set up browser event listeners
  useBrowserEvents();

  const handleNavigate = async (url: string) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Update the tab's URL first
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

      // Open new browser instance
      await Browser.open(browserOptions);

      // Save tab if user is logged in
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

  const handleTabSwitch = async (tabId: string) => {
    const targetTab = tabs.find(tab => tab.id === tabId);
    if (targetTab?.url) {
      setActiveTabId(tabId);
      try {
        // Close current browser instance
        await Browser.close();
        
        // Open the target tab's URL
        await Browser.open({
          url: targetTab.url,
          presentationStyle: 'popover',
          toolbarColor: '#ffffff',
        });
      } catch (error) {
        console.error('Error switching tabs:', error);
        toast({
          title: "Error",
          description: "Failed to switch tabs",
          variant: "destructive",
        });
      }
    }
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex flex-col h-screen bg-white animate-fade-in">
      <Navbar />
      <div className="flex flex-col flex-shrink-0">
        <BrowserTabs 
          onNavigate={handleNavigate}
          onTabSwitch={handleTabSwitch}
        />
        <BrowserControls 
          onNavigate={handleNavigate}
          activeTabUrl={activeTab?.url}
        />
      </div>
      <div className="flex-1 bg-nome-50 p-4 overflow-y-auto">
        <div className="w-full bg-white rounded-lg shadow-sm p-6 animate-slide-up space-y-6">
          <WelcomeSection />
          <Categories tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

export default Index;
