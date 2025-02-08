
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from '@/lib/utils';
import { TabData } from '@/types/browser';
import { useToast } from '@/hooks/use-toast';
import { WebView } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TabBar from './TabBar';

interface BrowserTabsProps {
  onNavigate: (url: string, tabId: string) => void;
  onTabSwitch: (tabId: string) => void;
}

export const useBrowserTabs = () => {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', title: 'New Tab', url: '', order_index: 0, is_active: true }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserTabs();
    }
  }, [user]);

  const loadUserTabs = async () => {
    try {
      const { data, error } = await supabase
        .from('tab_states')
        .select('*')
        .eq('user_id', user?.id)
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setTabs(data.map(tab => ({
          ...tab,
          webviewInstance: null
        })));
        const activeTab = data.find(tab => tab.is_active);
        if (activeTab) {
          setActiveTabId(activeTab.id);
        }
      }
    } catch (error) {
      console.error('Error loading tabs:', error);
      toast({
        title: "Error loading tabs",
        description: "Failed to load your saved tabs",
        variant: "destructive",
      });
    }
  };

  const handleNewTab = async () => {
    if (!user) return;

    const newTab: TabData = {
      id: uuidv4(),
      title: 'New Tab',
      url: '',
      order_index: tabs.length,
      is_active: true
    };

    try {
      // Update database
      const { error: updateError } = await supabase
        .from('tab_states')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('tab_states')
        .insert([{
          ...newTab,
          user_id: user.id
        }]);

      if (insertError) throw insertError;

      // Update local state
      setTabs(prevTabs => prevTabs.map(tab => ({
        ...tab,
        is_active: false
      })).concat(newTab));
      setActiveTabId(newTab.id);
    } catch (error) {
      console.error('Error creating new tab:', error);
      toast({
        title: "Error",
        description: "Failed to create new tab",
        variant: "destructive",
      });
    }
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
      if (user) {
        const { error } = await supabase
          .from('tab_states')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      const newTabs = tabs.filter(tab => tab.id !== id);
      setTabs(newTabs);

      if (id === activeTabId) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTabId(lastTab.id);
        if (user) {
          await supabase
            .from('tab_states')
            .update({ is_active: true })
            .eq('id', lastTab.id)
            .eq('user_id', user.id);
        }
      }
    } catch (error) {
      console.error('Error closing tab:', error);
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

  const handleTabClick = async (tabId: string) => {
    setActiveTabId(tabId);
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
