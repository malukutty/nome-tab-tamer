
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
import { Capacitor } from '@capacitor/core';

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
      // Update only essential tab information
      const updatedTabs = tabs.map(tab => 
        tab.id === tabId 
          ? { 
              id: tab.id,
              url: formattedUrl,
              title: formattedUrl,
              order_index: tab.order_index,
              is_active: tab.is_active
            } 
          : tab
      );
      setTabs(updatedTabs);

      if (Capacitor.isNativePlatform()) {
        // Dynamically import Browser plugin only in native environment
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
        await Browser.open({
          url: formattedUrl,
          presentationStyle: 'fullscreen'
        });
      } else {
        // In web environment, open in new tab
        window.open(formattedUrl, '_blank');
      }

      // Save minimal tab data if user is logged in
      const activeTab = updatedTabs.find(tab => tab.id === tabId);
      if (activeTab && user) {
        const groupId = organizeTab(activeTab);
        if (groupId) {
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
      if (Capacitor.isNativePlatform()) {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
      }
      
      setActiveTabId(tabId);
      
      // Only update the active state
      const { error } = await supabase
        .from('tab_states')
        .update({ is_active: true })
        .eq('id', tabId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Get minimal tab data and open URL
      const activeTab = tabs.find(tab => tab.id === tabId);
      if (activeTab?.url) {
        if (Capacitor.isNativePlatform()) {
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({
            url: activeTab.url,
            presentationStyle: 'fullscreen'
          });
        } else {
          window.open(activeTab.url, '_blank');
        }
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
