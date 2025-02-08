
import { useState } from 'react';
import { v4 as uuidv4 } from '@/lib/utils';
import AddressBar from '@/components/Browser/AddressBar';
import NavigationControls from '@/components/Browser/NavigationControls';
import TabBar from '@/components/Browser/TabBar';
import { TabData } from '@/types/browser';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', title: 'New Tab', url: '' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const { toast } = useToast();

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

  const handleNavigate = (url: string) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, title: url } 
        : tab
    ));
    
    toast({
      title: "Navigation started",
      description: "Loading new page...",
    });
  };

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
            onBack={() => {}}
            onForward={() => {}}
            onRefresh={() => {}}
            canGoBack={false}
            canGoForward={false}
          />
          <AddressBar onNavigate={handleNavigate} />
        </div>
      </div>
      <div className="flex-1 bg-nome-50 p-4">
        <div className="w-full h-full bg-white rounded-lg shadow-sm p-6 animate-slide-up">
          <h1 className="text-2xl font-semibold text-nome-800 mb-4">Welcome to Nome</h1>
          <p className="text-nome-600">
            Your intelligent browser for organized browsing. Start by entering a URL in the address bar above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
