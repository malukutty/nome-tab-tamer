
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2 } from 'lucide-react';

interface SavedTab {
  id: string;
  title: string;
  url: string;
}

interface SavedTabsListProps {
  tabs: SavedTab[];
  onOpenTab: (url: string) => void;
  onDeleteTab: (id: string) => void;
}

const SavedTabsList = ({ tabs, onOpenTab, onDeleteTab }: SavedTabsListProps) => {
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      {tabs.length > 0 ? (
        <div className="space-y-4">
          {tabs.map((tab) => (
            <div key={tab.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="text-sm font-medium truncate">{tab.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{tab.url}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenTab(tab.url)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTab(tab.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No saved tabs in this category yet.
        </p>
      )}
    </ScrollArea>
  );
};

export default SavedTabsList;
