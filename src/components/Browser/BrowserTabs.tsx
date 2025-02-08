
import { useState } from 'react';
import { v4 as uuidv4 } from '@/lib/utils';
import { TabData } from '@/types/browser';
import { useToast } from '@/hooks/use-toast';
import TabBar from './TabBar';

interface BrowserTabsProps {
  onNavigate: (url: string) => void;
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

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    handleNewTab,
    handleTabClose
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
