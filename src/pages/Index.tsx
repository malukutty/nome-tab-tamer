
import { useEffect } from 'react';
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
import { Browser } from '@capacitor/browser';

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

  const handleNavigate = async (url: string, tabId: string) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      // Update the tab's URL first
      const updatedTabs = tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, url: formattedUrl, title: formattedUrl } 
          : tab
      );
      setTabs(updatedTabs);

      // Close any existing browser windows
      await Browser.close();

      // Open the URL in an in-app browser
      await Browser.open({
        url: formattedUrl,
        presentationStyle: 'fullscreen',
        toolbarColor: '#f8f9fa',
        width: window.innerWidth,
        height: window.innerHeight
      });

      // Save tab if user is logged in
      const activeTab = updatedTabs.find(tab => tab.id === tabId);
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
      console.error('Error loading webpage:', error);
      toast({
        title: "Navigation error",
        description: "Failed to load the page",
        variant: "destructive",
      });
    }
  };

  const handleTabSwitch = async (tabId: string) => {
    if (!user) return;

    try {
      // Close any existing browser windows
      await Browser.close();

      // Update active tab in state
      setActiveTabId(tabId);
      
      // Update active state in database
      const { error: updateError } = await supabase
        .from('tab_states')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      const { error: activeError } = await supabase
        .from('tab_states')
        .update({ is_active: true })
        .eq('id', tabId)
        .eq('user_id', user.id);

      if (activeError) throw activeError;

      // Get the active tab's URL and open it
      const activeTab = tabs.find(tab => tab.id === tabId);
      if (activeTab?.url) {
        await Browser.open({
          url: activeTab.url,
          presentationStyle: 'fullscreen',
          toolbarColor: '#f8f9fa',
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    } catch (error) {
      console.error('Error switching tabs:', error);
      toast({
        title: "Error",
        description: "Failed to switch tabs",
        variant: "destructive",
      });
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
          onNavigate={(url) => handleNavigate(url, activeTabId)}
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
