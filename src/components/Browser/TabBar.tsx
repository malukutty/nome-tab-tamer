
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Tab from './Tab';
import { TabData } from '@/types/browser';

interface TabBarProps {
  tabs: TabData[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

const TabBar = ({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }: TabBarProps) => {
  return (
    <div className="flex items-center bg-nome-50 border-b border-nome-200">
      <div className="flex-1 flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            title={tab.title}
            active={tab.id === activeTabId}
            onClose={() => onTabClose(tab.id)}
            onClick={() => onTabClick(tab.id)}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNewTab}
        className="mr-2 hover:bg-nome-100 transition-colors"
      >
        <Plus className="h-4 w-4 text-nome-600" />
      </Button>
    </div>
  );
};

export default TabBar;
