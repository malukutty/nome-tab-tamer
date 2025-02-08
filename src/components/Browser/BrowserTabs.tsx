
import { useState } from 'react';
import { v4 as uuidv4 } from '@/lib/utils';
import { TabData } from '@/types/browser';
import { useToast } from '@/hooks/use-toast';
import { Browser } from '@capacitor/browser';
import TabBar from './TabBar';

interface BrowserTabsProps {
  onNavigate: (url: string, tabId: string) => void;
}

export const useBrowserTabs = () => {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', title: 'New Tab', url: '', browserInstance: null }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const { toast } = useToast();

  const handleNewTab = () => {
    const newTab = {
      id: uuidv4(),
      title: 'New Tab',
      url: '',
      browserInstance: null
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabClose = async (id: string) => {
    if (tabs.length === 1) {
      toast({
        title: "Cannot close last tab",
        description: "At least one tab must remain open",
      });
      return;
    }

    const tabToClose = tabs.find(tab => tab.id === id);
    if (tabToClose?.browserInstance) {
      try {
        await Browser.close();
      } catch (error) {
        console.error('Error closing browser instance:', error);
      }
    }

    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    
    if (id === activeTabId) {
      const lastTab = newTabs[newTabs.length - 1];
      setActiveTabId(lastTab.id);
      if (lastTab.browserInstance && lastTab.url) {
        try {
          await Browser.open({
            url: lastTab.url,
            presentationStyle: 'popover',
            toolbarColor: '#ffffff',
          });
        } catch (error) {
          console.error('Error reopening tab:', error);
        }
      }
    }
  };

  const setTabBrowserInstance = (tabId: string, instance: any) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, browserInstance: instance }
          : tab
      )
    );
  };

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    handleNewTab,
    handleTabClose,
    setTabBrowserInstance
  };
};

const BrowserTabs = ({ onNavigate }: BrowserTabsProps) => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    handleNewTab,
    handleTabClose
  } = useBrowserTabs();

  return (
    <TabBar
      tabs={tabs}
      activeTabId={activeTabId}
      onTabClick={setActiveTabId}
      onTabClose={handleTabClose}
      onNewTab={handleNewTab}
    />
  );
};

export default BrowserTabs;
