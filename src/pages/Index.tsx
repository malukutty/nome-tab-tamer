
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from '@/lib/utils';
import AddressBar from '@/components/Browser/AddressBar';
import NavigationControls from '@/components/Browser/NavigationControls';
import TabBar from '@/components/Browser/TabBar';
import TabOrganizer from '@/components/Browser/TabOrganizer';
import { TabData } from '@/types/browser';
import { useToast } from '@/hooks/use-toast';
import { useTabOrganization } from '@/hooks/useTabOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface PageContent {
  title: string;
  content: string;
  textContent: string;
}

const Index = () => {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', title: 'New Tab', url: '' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { organizeTab } = useTabOrganization();
  const { user } = useAuth();

  const handleNewTab = () => {
    const newTab = {
      id: uuidv4(),
      title: 'New Tab',
      url: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabClose = (id: string) => {
    if (tabs.length === 1) {
      toast({
        title: "Cannot close last tab",
        description: "At least one tab must remain open",
      });
      return;
    }

    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    
    if (id === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleNavigate = async (url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }

    setLoading(true);
    setPageContent(null);
    setIsReaderMode(false);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-page', {
        body: { url: finalUrl }
      });

      if (error) throw error;

      const updatedTabs = tabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, url: finalUrl, title: data.title || url } 
          : tab
      );
      setTabs(updatedTabs);
      setPageContent({
        title: data.title,
        content: data.content,
        textContent: data.textContent
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
    } catch (error) {
      console.error('Error fetching page:', error);
      toast({
        title: "Error loading page",
        description: "Failed to load the webpage content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeTabs = async () => {
    if (tabs.length === 0) {
      toast({
        title: "No tabs to summarize",
        description: "Open some tabs first to get a summary",
        variant: "destructive",
      });
      return;
    }

    setSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-tabs', {
        body: { tabs }
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Tabs summarized",
        description: "Your open tabs have been summarized successfully",
      });
    } catch (error) {
      console.error('Error summarizing tabs:', error);
      toast({
        title: "Error summarizing tabs",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setSummarizing(false);
    }
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex flex-col h-screen bg-white animate-fade-in">
      <div className="flex flex-col flex-shrink-0">
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
        />
        <div className="flex items-center h-12 border-b border-nome-200">
          <NavigationControls
            onBack={() => setIsReaderMode(false)}
            onForward={() => setIsReaderMode(true)}
            onRefresh={() => activeTab?.url && handleNavigate(activeTab.url)}
            canGoBack={isReaderMode}
            canGoForward={!isReaderMode && !!pageContent}
          />
          <AddressBar onNavigate={handleNavigate} />
        </div>
      </div>
      <div className="flex-1 bg-nome-50 overflow-hidden">
        {!activeTab?.url ? (
          <div className="p-4">
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
                  <Button
                    onClick={handleSummarizeTabs}
                    disabled={summarizing}
                    className="ml-4"
                  >
                    {summarizing ? "Summarizing..." : "Summarize Tabs"}
                  </Button>
                </div>
                <TabOrganizer />
                
                {summary && (
                  <div className="mt-6 p-4 bg-nome-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-nome-800 mb-2">Tab Summary</h3>
                    <p className="text-nome-600 whitespace-pre-line">{summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-nome-600"></div>
          </div>
        ) : isReaderMode && pageContent ? (
          <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-semibold text-nome-800 mb-4">{pageContent.title}</h1>
              <div 
                className="prose prose-nome max-w-none"
                dangerouslySetInnerHTML={{ __html: pageContent.content }}
              />
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="w-full bg-white rounded-lg shadow-sm p-6">
              {pageContent ? (
                <>
                  <h2 className="text-xl font-semibold text-nome-800 mb-4">{pageContent.title}</h2>
                  <p className="text-nome-600 mb-4">
                    This website cannot be embedded directly due to security restrictions.
                  </p>
                  <p className="text-nome-600">
                    Click the forward button in the navigation bar to view the content in reader mode.
                  </p>
                </>
              ) : (
                <div className="text-center text-nome-600">
                  Failed to load content. Please try again.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
