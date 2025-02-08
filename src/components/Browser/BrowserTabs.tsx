
import { useState } from 'react';
import { v4 as uuidv4 } from '@/lib/utils';
import { TabData } from '@/types/browser';
import { useToast } from '@/hooks/use-toast';
import { Browser } from '@capacitor/browser';
import TabBar from './TabBar';

interface BrowserTabsProps {
  onNavigate: (url: string) => void;
  onTabSwitch: (tabId: string) => void;
}

export const useBrowserTabs = () => {
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

  const handleTabClose = async (id: string) => {
    if (tabs.length === 1) {
      toast({
        title: "Cannot close last tab",
        description: "At least one tab must remain open",
      });
      return;
    }

    try {
      // Always close the current browser instance when closing a tab
      await Browser.close();
      
      const newTabs = tabs.filter(tab => tab.id !== id);
      setTabs(newTabs);
      
      if (id === activeTabId) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTabId(lastTab.id);
        // Reopen the last tab's URL if it exists
        if (lastTab.url) {
          await Browser.open({
            url: lastTab.url,
            presentationStyle: 'popover',
            toolbarColor: '#ffffff',
          });
        }
      }
    } catch (error) {
      console.error('Error handling tab close:', error);
      toast({
        title: "Error",
        description: "Failed to close tab properly",
        variant: "destructive",
      });
    }
  };

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    handleNewTab,
    handleTabClose
  };
};

const BrowserTabs = ({ onNavigate, onTabSwitch }: BrowserTabsProps) => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    handleNewTab,
    handleTabClose
  } = useBrowserTabs();

  const handleTabClick = (tabId: string) => {
    onTabSwitch(tabId);
  };

  return (
    <TabBar
      tabs={tabs}
      activeTabId={activeTabId}
      onTabClick={handleTabClick}
      onTabClose={handleTabClose}
      onNewTab={handleNewTab}
    />
  );
};

export default BrowserTabs;
