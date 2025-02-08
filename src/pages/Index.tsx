
import { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { useToast } from '@/hooks/use-toast';
import { useTabOrganization } from '@/hooks/useTabOrganization';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BrowserTabs, { useBrowserTabs } from '@/components/Browser/BrowserTabs';
import BrowserControls from '@/components/Browser/BrowserControls';
import TabOrganizer from '@/components/Browser/TabOrganizer';
import TabSummary from '@/components/Browser/TabSummary';

const Index = () => {
  const {
    tabs,
    setTabs,
    activeTabId,
  } = useBrowserTabs();
  
  const { toast } = useToast();
  const { organizeTab } = useTabOrganization();
  const { user } = useAuth();

  const handleNavigate = async (url: string) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const updatedTabs = tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url: formattedUrl, title: formattedUrl } 
        : tab
    );
    setTabs(updatedTabs);

    try {
      await Browser.open({
        url: formattedUrl,
        presentationStyle: 'popover',
        toolbarColor: '#ffffff',
      });

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
      
      toast({
        title: "Navigation started",
        description: "Loading page in WebView...",
      });
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
            <h1 className="text-2xl font-semibold text-nome-800 mb-4">Welcome to Nome</h1>
            <p className="text-nome-600 mb-6">
              Your intelligent browser for organized browsing. Start by entering a URL in the address bar above.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-nome-800">Tab Organization</h2>
              <TabSummary tabs={tabs} />
            </div>
            <TabOrganizer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
